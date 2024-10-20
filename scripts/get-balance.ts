// Imports
import _ from 'lodash';
import Big from 'big.js';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import utils from '#root/utils';
import toolsetFactory from '#root/src/ToolsetFactory';


// Components
const networkLabelList = config.networkLabelList;
const { filesystem, misc, validate } = utils;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logging
import { createLogger } from '#root/utils/logging';
const { logger, log, deb, lj, dj } = createLogger();


// Arguments
program
  .option('--address <address>', 'Ethereum address.')
  .option('--address-file <addressFile>', 'Path to file containing Ethereum address.')
  .option('-n, --network <network>', `network to connect to: [${config.networkLabelList}]`, 'local')
  .option('-l, --log-level <logLevel>', `logging level: [${logger.logLevelsString}]`, 'error')
  .option('-d, --debug', 'set logging level to debug')
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { address, addressFile, network: networkLabel, logLevel, debug } = options;


// Validate arguments
validate.logLevel({ logLevel });
validate.itemInList({ item: networkLabel, name: 'networkLabel', list: networkLabelList });
let optionNames = 'address, addressFile'.split(', ');
validate.exactlyOneOption({optionNames, address, addressFile});


// Load data
if (addressFile) {
  address = filesystem.readFile(addressFile);
}


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });


// Run


mainAsync().catch((error) => {
  misc.stop(error);
});


// Functions


async function mainAsync() {

  let toolset = await toolsetFactory.createToolsetAsync({ networkLabel, logLevel, connectToNetwork: true });

  toolset.validateAddress({ address });

  let blockNumber = await toolset.getBlockNumberAsync();
  deb(`Current block number: ${blockNumber}`);

  log(`Getting balance for address ${address}...`);

  let { balance, symbol, balanceUsd } = await toolset.getBalanceInfoAsync(address);

  let msg = `${balance} ${symbol} (${balanceUsd} USD)`;
  log2(msg);

}
