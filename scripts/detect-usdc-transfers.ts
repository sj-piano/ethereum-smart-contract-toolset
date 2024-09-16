// Imports
import _ from 'lodash';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import lib from '#root/lib';
import toolset from '#root/src/toolset';
import { createLogger } from '#root/lib/logging';



// Constants
import {
  USDC_DECIMAL_PLACES, USDC_CONTRACT_ABI,
} from '#root/lib/constants';


// Components
const { misc, utils, validate } = lib;
const jd = utils.jd;
const networkLabelList = config.networkLabelList;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logging
const { logger, log, lj, deb } = createLogger({ filePath: __filename });


// Parse arguments
program
  .option('--start-block <startBlock>', 'block number at which to start looking for transfers', '17000000')
  .option('-n, --network <network>', `network to connect to: [${config.networkLabelList}]`, 'local')
  .option('-l, --logLevel <logLevel>', `logging level: [${logger.logLevelsString}]`, 'error')
  .option('-d, --debug', 'set logging level to debug')
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { startBlock, network: networkLabel, logLevel, debug, } = options;


// Validate arguments
validate.logLevel({ logLevel });
validate.itemInList({ item: networkLabel, name: 'networkLabel', list: networkLabelList });
validate.numericString({ name: 'blockNumber', value: startBlock });


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });
let USDC_CONTRACT_ADDRESS;
let usdcContract: ethers.Contract;
startBlock = parseInt(startBlock);


// Run


main().catch((error) => {
  misc.stop(error);
});


// Functions


async function main() {

  await toolset.setupAsync({ networkLabel, logLevel });

  // Test connection to the network.
  let currentBlockNumber = await toolset.getBlockNumberAsync();
  log(`Current block number: ${currentBlockNumber}`);

  USDC_CONTRACT_ADDRESS = toolset.getUsdcContractAddress();
  usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_CONTRACT_ABI, toolset.provider);

  log(`Start block: ${startBlock}`);

  const transfers = await getUsdcTransfersAsync(startBlock);
  log(`- USDC Transfers: ${transfers.length}`);

  const logTransfers = true;
  if (logTransfers) {
    for (const transfer of transfers) {
      log(`- From: ${transfer.from}, To: ${transfer.to}, Value: ${ethers.formatUnits(transfer.value, USDC_DECIMAL_PLACES)}`);
    }
  }

}


async function getUsdcTransfersAsync(blockNumber: number): Promise<Array<Transfer>> {
  const transfers = await toolset.getERC20TransfersFromEventsAsync(blockNumber, usdcContract);
  return transfers;
}

