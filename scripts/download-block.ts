// Imports
import _ from 'lodash';
import assert from 'assert';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import lib from '#root/lib';
import toolset from '#root/src/toolset';
import { createLogger } from '#root/lib/logging';


// Components
const networkLabelList = config.networkLabelList;
const { misc, utils, validate } = lib;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logging
const { logger, log, deb } = createLogger();


// Arguments
program
  .requiredOption('--block-number <blockNumber>', 'block number to download', '17000000')
  .option('-n, --network <network>', `network to connect to: [${config.networkLabelList}]`, 'local')
  .option('-l, --log-level <logLevel>', `logging level: [${logger.logLevelsString}]`, 'error')
  .option('-d, --debug', 'set logging level to debug')
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel, blockNumber } = options;


// Validate arguments
validate.logLevel({ logLevel });
validate.itemInList({ item: networkLabel, name: 'networkLabel', list: networkLabelList });
validate.numericString({ name: 'blockNumber', value: blockNumber });


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });
let provider: ethers.Provider;
blockNumber = parseInt(blockNumber);


// Run
main().catch((error) => {
  misc.stop(error);
});


// Functions


async function main() {
  provider = await toolset.setupAsync({ networkLabel, logLevel });
  await validateBlockNumberAsync({ blockNumber });
  await downloadBlockAsync({ blockNumber });
}


async function validateBlockNumberAsync({ blockNumber }: { blockNumber: number }) {
  let currentBlockNumber = await provider.getBlockNumber();
  log(`Current block number: ${currentBlockNumber}`);
  if (blockNumber > currentBlockNumber) {
    throw new Error(`Block number ${blockNumber} is greater than current block number ${currentBlockNumber}`);
  }
}


async function downloadBlockAsync({ blockNumber }: { blockNumber: number } ) {
  log(`Downloading block ${blockNumber}...`);
  let block = await provider.getBlock(blockNumber, true);
  assert(block, 'Block not found');
  log(`Block ${blockNumber} downloaded.`);
  let txData = utils.jd(block.prefetchedTransactions);
  let blockData = utils.jd(block);
  log2(`Transaction data: ${txData}`)
  log2(`Block data: ${blockData}`);
}
