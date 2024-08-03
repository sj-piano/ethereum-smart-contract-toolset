// Imports
import _ from 'lodash';
import assert from 'assert';
import { program } from 'commander';
import { ethers, keccak256, toUtf8Bytes } from 'ethers';


// Local imports
import config from '#root/config';
import ethToolset from '#root/src/eth-toolset';
import { createLogger } from '#root/lib/logging';
import validate from '#root/lib/validate';
import utils, { jd } from '#root/lib/utils';


// Constants
import { USDC_DECIMAL_PLACES, USDC_CONTRACT_ABI, USDC_CONTRACT_ADDRESS_MAINNET, USDC_CONTRACT_ADDRESS_MAINNET_POLYGON } from '#root/lib/constants';


// Logging
const { logger, log, deb } = createLogger();


// Parse arguments
program
  .option('-d, --debug', 'log debug information')
  .option('--log-level <logLevel>', 'Specify log level.', 'error')
  .option('--network <network>', 'specify the Ethereum network to connect to', 'local')
  .option('--start-block <startBlock>', 'block number at which to start looking for transfers', '17000000');
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel, startBlock } = options;


// Process and validate arguments

validate.logLevel({ logLevel });
if (debug) {
  logLevel = 'debug';
}
logger.setLevel({ logLevel });

validate.networkLabel({ networkLabel });
const network = config.networkLabelToNetwork[networkLabel];

validate.numericString({ name: 'blockNumber', value: startBlock });
startBlock = parseInt(startBlock);


// Setup

const provider: ethers.Provider = config.getProvider({ networkLabel });

// Create a ethers.Contract instance for interaction with the USDC token contract.
const USDC_CONTRACT_ADDRESS = config.getUsdcContractAddress();
const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_CONTRACT_ABI, provider);


// Run main function

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


// Functions


async function main() {

  // Test connection to the network.
  let currentBlockNumber = await provider.getBlockNumber();
  log(`Current block number: ${currentBlockNumber}`);

  log(`Start block: ${startBlock}`);

  //await listenForUsdcTransfers();

  //await getERC20TransfersFromTransactionHistory(USDC_CONTRACT_ADDRESS, startBlock);

  //return;

  const transfers = await getUsdcTransfers(startBlock);
  log(`- USDC Transfers: ${transfers.length}`);

  const logTransfers = true;
  if (logTransfers) {
    for (const transfer of transfers) {
      log(`- From: ${transfer.from}, To: ${transfer.to}, Value: ${ethers.formatUnits(transfer.value, USDC_DECIMAL_PLACES)}`);
    }
  }

}


async function getUsdcTransfers(blockNumber: number): Promise<Array<Transfer>> {
  // We retrieve USDC transfers from two sources: event history and transaction history.
  const block = await provider.getBlock(blockNumber);
  assert(block, 'Block not found');
  const t1 = await getTransfersFromEventHistory(blockNumber, usdcContract);
  const t2 = await getERC20TransfersFromTransactionHistory(USDC_CONTRACT_ADDRESS, blockNumber);
  // We confirm that the two sources yield the same results.
  if (t1.length !== t2.length) {
    let msg = `Number of transfers from event history (${t1.length}) does not match number of transfers from transaction history (${t2.length})`;
    msg += `- ${jd(t1)}`;
    msg += `- ${jd(t2)}`;
    throw new Error(msg);
  }
  // Iterate over the lists and compare each transfer.
  for (const [i, transfer1] of t1.entries()) {
    const transfer2 = t2[i];
    if (!transfersAreEqual(transfer1, transfer2)) {
      let msg = `Transfers do not match: ${jd(transfer1)} vs ${jd(transfer2)}`;
      throw new Error(msg);
    }
  }
  return t1;
}


function transfersAreEqual(transfer1: Transfer, transfer2: Transfer): boolean {
  // Compare each property of the Transfer objects
  return (
      transfer1.blockNumber === transfer2.blockNumber &&
      transfer1.txHash === transfer2.txHash &&
      transfer1.from === transfer2.from &&
      transfer1.to === transfer2.to &&
      BigInt(transfer1.value) === BigInt(transfer2.value)
  );
}


type Transfer = {
  blockNumber: number
  txHash: string
  from: string
  to: string
  value: bigint
}


async function getTransfersFromEventHistory(blockNumber: number, contract: ethers.Contract): Promise<Array<Transfer>> {
  const eventName = 'Transfer';
  const transfers = await getEventHistory(contract, eventName, blockNumber);
  return transfers;
}


function isEventLog(pet: ethers.EventLog | ethers.Log): pet is ethers.EventLog {
  return (pet as ethers.EventLog).args !== undefined;
}


async function getEventHistory(
  contract: ethers.Contract,
  eventName: string,
  blockNumber: number,
): Promise<Array<Transfer>> {
  const endBlockNumber = blockNumber;
  const events = await contract.queryFilter(eventName, blockNumber, endBlockNumber);
  let transfers: Transfer[] = [];
  for (const event_ of events) {
    // event_: ethers.EventLog | ethers.Log
    if (! isEventLog(event_)) {
      const logData = JSON.stringify(event_);
      const errorMessage = `Unexpected log type encountered. Log data: ${logData}`;
      throw new Error(errorMessage);
    }
    const { from, to, value } = event_.args;
    const transfer: Transfer = { blockNumber, txHash: event_.transactionHash, from, to, value };
    transfers.push(transfer);
  }
  return sortTransfers(transfers);
}


async function getERC20TransfersFromTransactionHistory(contractAddress: string, blockNumber: number): Promise<Array<Transfer>> {
  const logHere = false;
  const log3 = (msg: string) => { if (logHere) { log(msg) } }
  const block = await provider.getBlock(blockNumber, true);
  assert(block, 'Block not found');
  //log3(`- Block ${blockNumber}: hash = ${block.hash}`)
  const nTransactions = block.length;
  //log3(`-- Block ${blockNumber} has ${nTransactions} transactions`);
  let transfers: Transfer[] = [];
  for (const [i, txHash] of block.transactions.entries()) {
    const tx = await provider.getTransaction(txHash);
    assert(tx, 'Transaction not found');
    //log(`-- Transaction ${i}: hash = ${txHash}`);
    if (tx.to && tx.to.toLowerCase() === contractAddress.toLowerCase()) {
      const txReceipt = await provider.getTransactionReceipt(txHash);
      assert(txReceipt, 'Transaction receipt not found');
      const logs = txReceipt.logs;
      for (const [j, log_] of logs.entries()) {
        // Confirm ERC20 Transfer event by analyzing the signature.
        const signature = 'Transfer(address indexed _from, address indexed _to, uint256 _value)'
        let canonicalSig = ethToolset.getCanonicalSignature(signature)
        let hashSig = keccak256(toUtf8Bytes(canonicalSig))
        let logSig = log_.topics[0];
        let isTransferEvent = logSig.toLowerCase() === hashSig.toLowerCase();
        let arg1 = log_.topics[1];
        let arg2 = log_.topics[2];
        let from = ethers.getAddress(arg1.substring(26));
        let to = ethers.getAddress(arg2.substring(26));
        let data = log_.data;
        const dataLength = log_.data.length;
        const dataItems = (dataLength - 2) / 64;
        log(`- Transaction ${i}: Log ${j} of ${logs.length}: Transfer event detected. From: ${arg1}, To: ${arg2}, Value: ${data}`);
        if (isTransferEvent) {
          if (dataItems !== 1) {
            let msg = `Unexpected number of data items: ${dataItems}`;
            msg += `\n - from: ${from}`;
            msg += `\n - to: ${to}`;
            msg += `\n - data: ${data}`;
            throw new Error(msg);
          }
          const value = BigInt(parseInt(data, 16));
          //log3(`- Transaction ${i}: Log ${j} of ${logs.length}: Transfer event detected. From: ${arg1}, To: ${arg2}, Value: ${parseInt(argsRemaining)}`);
          transfers.push({ blockNumber, txHash, from, to, value });
        }
      }
    }
  }
  return sortTransfers(transfers);
}


function sortTransfers(transfers: Transfer[]): Transfer[] {
  return transfers.sort((a, b) => {
      // Sort by blockNumber
      if (a.blockNumber !== b.blockNumber) {
          return a.blockNumber - b.blockNumber;
      }

      // Sort by txHash
      if (a.txHash !== b.txHash) {
          return a.txHash.localeCompare(b.txHash);
      }

      // Sort by from address
      if (a.from !== b.from) {
          return a.from.localeCompare(b.from);
      }

      // Sort by to address
      if (a.to !== b.to) {
          return a.to.localeCompare(b.to);
      }

      // Sort by value (assuming BigInt values)
      return a.value > b.value ? 1 : a.value < b.value ? -1 : 0;
  });
}

