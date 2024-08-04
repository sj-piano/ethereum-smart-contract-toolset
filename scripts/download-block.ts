// Imports
import _ from 'lodash';
import assert from 'assert';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import toolset from '#root/src/toolset';
import { createLogger } from '#root/lib/logging';
import validate from '#root/lib/validate';
import utils from '#root/lib/utils';


// Logging
const log2 = console.log;
const { logger, log, deb } = createLogger();


// Parse arguments
program
  .option('-d, --debug', 'log debug information')
  .option('--log-level <logLevel>', 'Specify log level.', 'error')
  .option('--network <network>', 'specify the Ethereum network to connect to', 'local')
  .requiredOption('--block-number <blockNumber>', 'block number to download', '17000000');
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel, blockNumber } = options;


// Process and validate arguments

validate.logLevel({ logLevel });
if (debug) {
  logLevel = 'debug';
}
logger.setLevel({ logLevel });

validate.networkLabel({ networkLabel });

validate.numericString({ name: 'blockNumber', value: blockNumber });
blockNumber = parseInt(blockNumber);


// Setup

let provider: ethers.Provider;


// Run main function

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


// Functions


async function main() {
  provider = await toolset.setupAsync({ networkLabel });
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
