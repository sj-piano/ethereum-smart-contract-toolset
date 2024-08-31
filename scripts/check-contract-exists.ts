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
const { filesystem, utils, validate } = lib;


// Logging
const log2 = console.log;
const { logger, log, deb } = createLogger();


// Parse arguments
program
  .option(
    '--network <network>',
    'specify the Ethereum network to connect to', 'local',
  )
  .option(
    '--address-name <addressName>',
    'Name of address in .env file. Overrides address or address-file.',
  )
  .option('--address <address>', 'Ethereum address.')
  .option(
    '--address-file <addressFile>',
    'Path to file containing contract address.',
  )
  .option('-l, --logLevel <logLevel>', `logging level: [${logger.logLevelsString}]`, 'error')
  .option('-d, --debug', 'set logging level to debug')
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let {
  debug,
  logLevel,
  network: networkLabel,
  addressName,
  address,
  addressFile,
} = options;


// Validate arguments

validate.logLevel({ logLevel });
validate.networkLabel({ networkLabel, networkLabelList });
if (! addressName) {
  let optionNames = 'address, addressFile'.split(', ');
  validate.exactlyOneOfTwoOptions({optionNames, address, addressFile});
}


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });
let provider: ethers.Provider;
let contractAddress: string;


// Load data

if (addressName) {
  contractAddress = utils.getValueOrThrow(config.env, addressName, 'config.env');
  deb(`Address ${addressName} found in .env file: ${address}`);
} else if (address) {
  contractAddress = address;
} else {
  contractAddress = filesystem.readFile(addressFile);
}


// Run main function


mainAsync({ contractAddress }).catch((error) => {
  stop(error)
});


function stop(msg) {
  if (msg) console.error(msg);
  process.exit(1);
}


async function mainAsync({ contractAddress }: { contractAddress: string }) {
  toolset.setupAsync({ networkLabel });
  let blockNumber = await toolset.getBlockNumberAsync();
  deb(`Current block number: ${blockNumber}`);

  let address = contractAddress;

  if (! ethers.isAddress(contractAddress)) {
    let msg = `Invalid Ethereum address: ${address}`;
    stop(msg);
  }

  let check = await toolset.contractExistsAtAsync(address);
  if (!check) {
    let msg = `No contract found at address: ${address}`;
    stop(msg);
  }
  console.log(`Contract found at address: ${address}`);
}
