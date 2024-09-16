// Imports
import _ from 'lodash';
import { program } from 'commander';
import { ethers } from 'ethers';
import fs from 'fs';


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
  HELLO_WORLD_LOCAL_ADDRESS,
  HELLO_WORLD_TESTNET_ADDRESS,
  HELLO_WORLD_MAINNET_ADDRESS,
} = process.env;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logging
const { logger, log, deb } = createLogger();


// Arguments
program
  .option('-d, --debug', 'log debug information')
  .option('--log-level <logLevel>', 'Specify log level.', 'error')
  .option('--network <network>', 'specify the Ethereum network to connect to', 'local')
  .option('--address-file <addressFile>', 'Path to file containing contract address.');
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { network: networkLabel, addressFile, logLevel, debug } = options;


// Validate arguments

toolset.validateAddresses({
  addresses: {
    HELLO_WORLD_LOCAL_ADDRESS,
    HELLO_WORLD_TESTNET_ADDRESS,
    HELLO_WORLD_MAINNET_ADDRESS,
  },
});

validate.logLevel({ logLevel });
validate.itemInList({ item: networkLabel, name: 'networkLabel', list: networkLabelList });


// Load data
let address = addressFile ? filesystem.readFile(addressFile) : null;


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });
let DEPLOYED_CONTRACT_ADDRESS;
if (networkLabel == 'local') {
  DEPLOYED_CONTRACT_ADDRESS = HELLO_WORLD_LOCAL_ADDRESS;
} else if (networkLabel == 'testnet') {
  DEPLOYED_CONTRACT_ADDRESS = HELLO_WORLD_TESTNET_ADDRESS;
} else if (networkLabel == 'mainnet') {
  DEPLOYED_CONTRACT_ADDRESS = HELLO_WORLD_MAINNET_ADDRESS;
}

// A supplied contract file takes precedence over shell environment variable.
if (addressFile) {
  DEPLOYED_CONTRACT_ADDRESS = address;
}
if (! ethers.isAddress(DEPLOYED_CONTRACT_ADDRESS)) {
  logger.error(`Invalid contract address: ${DEPLOYED_CONTRACT_ADDRESS}`);
  process.exit(1);
}


// Run


main().catch((error) => {
  misc.stop(error);
});


// Functions


async function main() {

  await toolset.setupAsync({ networkLabel, logLevel });
  let provider = toolset.provider;

  const contractHelloWorld = new ethers.Contract(DEPLOYED_CONTRACT_ADDRESS, contract.abi, provider);

  let blockNumber = await toolset.getBlockNumberAsync();
  deb(`Current block number: ${blockNumber}`);

  let address = await contractHelloWorld.getAddress();
  let check = await toolset.contractExistsAtAsync(address);
  if (! check) {
    logger.error(`No contract found at address ${address}.`);
    process.exit(1);
  }
  log(`Contract found at address: ${address}`);

  const message = await contractHelloWorld.message();

  log('Message stored in HelloWorld contract: ');
  logger.print(message);
}
