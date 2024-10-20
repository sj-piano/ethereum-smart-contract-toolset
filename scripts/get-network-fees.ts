// Imports
import _ from 'lodash';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import utils from '#root/utils';
import toolsetFactory from '#root/src/ToolsetFactory';


// Components
const networkLabelList = config.networkLabelList;
const { misc, validate } = utils;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logger
import { createLogger } from '#root/utils/logging';
const { logger, log, deb, lj, dj } = createLogger();


// Arguments
program
  .option('-n, --network <network>', `network to connect to: [${config.networkLabelList}]`, 'local')
  .option('-l, --log-level <logLevel>', `logging level: [${logger.logLevelsString}]`, 'error')
  .option('-d, --debug', 'set logging level to debug')
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { network: networkLabel, logLevel, debug } = options;


// Validate arguments
validate.logLevel({ logLevel });
validate.itemInList({ item: networkLabel, name: 'networkLabel', list: networkLabelList });


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });


// Run


main().catch((error) => {
  misc.stop(error);
});


// Functions


async function main() {
  let toolset = await toolsetFactory.createToolsetAsync({ networkLabel, logLevel, connectToNetwork: true });
  deb(`Connected to ${networkLabel} network.`);
  let blockNumber = await toolset.getBlockNumberAsync();
  deb(`Current block number: ${blockNumber}`);
  //const fees = await toolset.getGasPricesAsync();
  const fees = await toolset.getGasPricesWithFiatAsync();
  log2(fees);
}

