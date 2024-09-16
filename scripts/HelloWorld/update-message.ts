// Imports
import _ from 'lodash';
import Ajv, { JSONSchemaType } from 'ajv';
import Big from 'big.js';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import lib from '#root/lib';
import { createLogger } from '#root/lib/logging';
import toolset from '#root/src/toolset';


// Contracts
import contract from '#root/artifacts/contracts/HelloWorld.sol/HelloWorld.json';


// Components
const networkLabelList = config.networkLabelList;
const { filesystem, misc, utils, validate } = lib;


// Load environment variables
const {
  INFURA_API_KEY,
  LOCAL_HARDHAT_PRIVATE_KEY,
  LOCAL_HARDHAT_ADDRESS,
  SEPOLIA_TESTNET_PRIVATE_KEY,
  SEPOLIA_TESTNET_ADDRESS,
  ETHEREUM_MAINNET_PRIVATE_KEY,
  ETHEREUM_MAINNET_ADDRESS,
  HELLO_WORLD_LOCAL_ADDRESS,
  HELLO_WORLD_TESTNET_ADDRESS,
  HELLO_WORLD_MAINNET_ADDRESS,
} = config.env;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logging
const { logger, log, deb } = createLogger();


// Parse arguments
program
  .requiredOption('--input-file-json <inputFileJson>', 'Path to JSON file containing input data.')
  .option('-n, --network <network>', `network to connect to: [${config.networkLabelList}]`, 'local')
  .option('-l, --log-level <logLevel>', `logging level: [${logger.logLevelsString}]`, 'error')
  .option('-d, --debug', 'set logging level to debug')
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { inputFileJson, network: networkLabel, logLevel, debug } = options;


// Validate arguments

toolset.validatePrivateKeys({
  privateKeys: {
    LOCAL_HARDHAT_PRIVATE_KEY,
    SEPOLIA_TESTNET_PRIVATE_KEY,
    ETHEREUM_MAINNET_PRIVATE_KEY,
  },
});

toolset.validateAddresses({
  addresses: {
    LOCAL_HARDHAT_ADDRESS,
    SEPOLIA_TESTNET_ADDRESS,
    ETHEREUM_MAINNET_ADDRESS,
    HELLO_WORLD_LOCAL_ADDRESS,
    HELLO_WORLD_TESTNET_ADDRESS,
    HELLO_WORLD_MAINNET_ADDRESS,
  },
});

validate.logLevel({ logLevel });
validate.itemInList({ item: networkLabel, name: 'networkLabel', list: networkLabelList });

if (! filesystem.fileExists(inputFileJson)) {
  console.error(`File "${inputFileJson}" not found.`);
  process.exit(1);
}
let inputData = filesystem.readFileJson(inputFileJson);

const ajv = new Ajv();
const inputJsonSchema: JSONSchemaType<{ newMessage: string }> = {
  type: 'object',
  properties: {
    newMessage: { type: 'string' },
  },
  required: ['newMessage'],
  additionalProperties: false,
};
const validateInputJson = ajv.compile(inputJsonSchema);
const validInputData = validateInputJson(inputData);
if (! validInputData) {
  console.error(validateInputJson.errors);
  process.exit(1);
}
let { newMessage }: { newMessage: string } = inputData;




// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });
let provider: ethers.Provider;
let signer: ethers.Wallet;
let contractHelloWorld: ethers.Contract;

let DEPLOYER_PRIVATE_KEY;
let DEPLOYED_CONTRACT_ADDRESS;
if (networkLabel == 'local') {
  DEPLOYER_PRIVATE_KEY = LOCAL_HARDHAT_PRIVATE_KEY;
  DEPLOYED_CONTRACT_ADDRESS = HELLO_WORLD_LOCAL_ADDRESS;
} else if (networkLabel == 'testnet') {
  DEPLOYER_PRIVATE_KEY = SEPOLIA_TESTNET_PRIVATE_KEY;
  DEPLOYED_CONTRACT_ADDRESS = HELLO_WORLD_TESTNET_ADDRESS;
} else if (networkLabel == 'mainnet') {
  DEPLOYER_PRIVATE_KEY = ETHEREUM_MAINNET_PRIVATE_KEY;
  DEPLOYED_CONTRACT_ADDRESS = HELLO_WORLD_MAINNET_ADDRESS;
}

if (! ethers.isAddress(DEPLOYED_CONTRACT_ADDRESS)) {
  logger.error(`Invalid contract address: ${DEPLOYED_CONTRACT_ADDRESS}`);
  process.exit(1);
}



// Run


main({ newMessage, DEPLOYED_CONTRACT_ADDRESS }).catch((error) => {
  misc.stop(error);
});


// Functions


async function main({ newMessage, DEPLOYED_CONTRACT_ADDRESS }: { newMessage: string, DEPLOYED_CONTRACT_ADDRESS: string }) {

  await toolset.setupAsync({ networkLabel, logLevel });
  provider = toolset.provider;
  signer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
  contractHelloWorld = new ethers.Contract(DEPLOYED_CONTRACT_ADDRESS, contract.abi, signer);

  let blockNumber = await toolset.getBlockNumberAsync();
  deb(`Current block number: ${blockNumber}`);

  let address = await contractHelloWorld.getAddress();
  let check = await toolset.contractExistsAtAsync(address);
  if (!check) {
    logger.error(`No contract found at address ${address}.`);
    process.exit(1);
  }
  log(`Contract found at address: ${address}`);

  // Interact with contract.
  await updateMessage({ newMessage });
}


async function updateMessage({ newMessage }: { newMessage: string }) {
  const message = await contractHelloWorld.message();
  log('Message stored in HelloWorld contract: ' + message);

  // Estimate fees.
  // - Stop if any fee limit is exceeded.
  const txRequest = await contractHelloWorld.update.populateTransaction(newMessage);
  const estimatedFees = await toolset.estimateFeesForTxAsync(txRequest);
  deb(estimatedFees);
  const { gasLimit, maxFeePerGasWei, maxPriorityFeePerGasWei, feeEth, feeUsd, feeLimitChecks } =
    estimatedFees;
  log(`Estimated fee: ${feeEth} ETH (${feeUsd} USD)`);
  if (feeLimitChecks.anyLimitExceeded) {
    for (let key of feeLimitChecks.limitExceededKeys) {
      let check = feeLimitChecks[key];
      console.error(`- ${key}: ${check.msg}`);
    }
    process.exit(1);
  }
  const gasPrices = estimatedFees.gasPrices;
  const { priceEthInUsd } = gasPrices;

  // Get ETH balance of signer.
  // - Stop if balance is too low.
  const signerAddress = await signer.getAddress();
  const signerBalanceWei = await provider.getBalance(signerAddress);
  const signerBalanceEth = ethers.formatEther(signerBalanceWei);
  const signerBalanceUsd = Big(priceEthInUsd).mul(Big(signerBalanceEth)).toFixed(config.constants.USD_DECIMAL_PLACES);
  log(`Signer balance: ${signerBalanceEth} ETH (${signerBalanceUsd} USD)`);
  if (Big(signerBalanceEth).lt(Big(feeEth))) {
    console.error(
      `Sender address (${signerAddress}) has a balance that is too low (${signerBalanceEth} ETH). At least ${feeEth} ETH is needed to pay for the deployment transaction.`,
    );
    process.exit(1);
  }

  // Deploy contract.
  // - Use the estimated fee values.
  // - Wait for deployment to complete.
  log('Updating the message...');
  try {
    var tx = await contractHelloWorld.update(newMessage, {
      gasLimit,
      maxFeePerGas: maxFeePerGasWei,
      maxPriorityFeePerGas: maxPriorityFeePerGasWei,
    });
  } catch (error) {
    logger.error(error);
    if (error instanceof Error) {
      logger.error(_.keys(error));
      /*
      let errorName = error.code; // e.g. UNKNOWN_ERROR
      let errorMessage = error.message;
      // Example errorMessage: Transaction maxFeePerGas (200000000) is too low for the next block, which has a baseFeePerGas of 264952691
      let errorStackTrace = error.stack;
      //logger.error(errorStackTrace);
      */
    }
  }

  deb(tx);

  const txReceipt = await tx.wait();

  if (txReceipt.status !== 1) {
    console.error(txReceipt);
    process.exit(1);
  }

  deb(txReceipt);

  // Examine the results and find out how much was spent.

  let {
    accessList,
    chainId,
    data,
    from,
    gasLimit: txReceiptGasLimit,
    hash,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    signature,
    to,
    type,
    value,
  } = tx;
  let {
    blockNumber,
    blockHash,
    contractAddress: newContractAddress,
    index,
    logsBloom,
    gasUsed,
    cumulativeGasUsed,
    gasPrice: effectiveGasPrice,
    status,
  } = txReceipt;

  deb(tx);
  deb(txReceipt);

  deb(`gasLimit: ${txReceiptGasLimit}`);
  deb(`maxPriorityFeePerGas: ${maxPriorityFeePerGas}`);
  deb(`maxFeePerGas: ${maxFeePerGas}`);
  deb(`gasUsed: ${gasUsed}`);
  deb(`effectiveGasPrice: ${effectiveGasPrice}`);

  const txFeeWeiCalculated = gasUsed * effectiveGasPrice;
  deb(`txFeeWeiCalculated: ${txFeeWeiCalculated}`);

  const txFeeWei = txReceipt.fee;
  deb(`txFeeWei: ${txFeeWei}`);
  const txFeeEth = ethers.formatEther(txFeeWei).toString();
  const txFeeUsd = Big(priceEthInUsd).mul(Big(txFeeEth)).toFixed(config.constants.USD_DECIMAL_PLACES);
  log(`Final fee: ${txFeeEth} ETH (${txFeeUsd} USD)`);

  // Report the final result.
  const message2 = await contractHelloWorld.message();
  logger.print('The new message is: ');
  logger.print(message2);
}
