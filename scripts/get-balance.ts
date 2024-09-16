// Imports
import _ from 'lodash';
import Big from 'big.js';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import lib from '#root/lib';
import toolset from '#root/src/toolset';
import { createLogger } from '#root/lib/logging';


// Components
const networkLabelList = config.networkLabelList;
const { filesystem, misc, validate } = lib;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logging
const { logger, log, deb } = createLogger();


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
validate.exactlyOneOfTwoOptions({optionNames, address, addressFile});


// Load data
if (addressFile) {
  address = filesystem.readFile(addressFile);
}


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });


// Run

main().catch((error) => {
  misc.stop(error);
});


// Functions


async function main() {

  if (! ethers.isAddress(address)) {
    let msg = `Invalid Ethereum address: ${address}`;
    misc.stop(({ error: msg }));
  }

  await toolset.setupAsync({ networkLabel, logLevel });
  let blockNumber = await toolset.provider.getBlockNumber();
  deb(`Current block number: ${blockNumber}`);

  log(`Getting balance for address ${address}...`);

  let balanceUsd = await toolset.getBalanceUsdAsync(address);

  let balance;
  let symbol;
  if (config.ethereumNetworkLabels.includes(networkLabel)) {
    balance = await toolset.getBalanceEthAsync(address);
    symbol = 'ETH';
  } else {
    balance = await toolset.getBalanceMaticAsync(address);
    symbol = 'MATIC';
  }

  let msg = `${balance} ${symbol} (${balanceUsd} USD)`;
  log2(msg);
}
