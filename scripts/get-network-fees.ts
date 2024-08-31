// Imports
import _ from 'lodash';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import lib from '#root/lib';
import { createLogger } from '#root/lib/logging';
import toolset from '#root/src/toolset';


// Components
const networkLabelList = config.networkLabelList;
const { utils, validate } = lib;


// Logging
const { logger, log, deb } = createLogger();


// Parse arguments
program
  .option('-d, --debug', 'log debug information')
  .option('--log-level <logLevel>', 'Specify log level.', 'error')
  .option('--network <network>', 'specify the Ethereum network to connect to', 'local')
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel } = options;


// Process and validate arguments

validate.logLevel({ logLevel });
if (debug) {
  logLevel = 'debug';
}
logger.setLevel({ logLevel });

validate.networkLabel({ networkLabel, networkLabelList });


// Setup

let provider: ethers.Provider;


// Run main function

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


// Functions


async function main() {
  await toolset.setupAsync({ networkLabel });
  deb(`Connected to ${networkLabel} network.`);
  let blockNumber = await toolset.getBlockNumberAsync();
  deb(`Current block number: ${blockNumber}`);
  //const fees = await toolset.getGasPricesAsync();
  const fees = await toolset.getGasPricesWithFiatAsync();
  console.log(fees);
}

