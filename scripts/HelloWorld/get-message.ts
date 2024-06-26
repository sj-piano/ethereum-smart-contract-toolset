// Imports
import _ from 'lodash';
import { program } from 'commander';
import { ethers } from 'ethers';
import fs from 'fs';


// Local imports
import config from '#root/config';
import ethToolset from '#root/src/eth-toolset';
import { createLogger } from '#root/lib/logging';
import validate from '#root/lib/validate';


// Load environment variables
const {
  INFURA_API_KEY,
  HELLO_WORLD_LOCAL_ADDRESS,
  HELLO_WORLD_TESTNET_ADDRESS,
  HELLO_WORLD_MAINNET_ADDRESS,
} = process.env;


// Logging
const { logger, log, deb } = createLogger();


// Parse arguments
program
  .option('-d, --debug', 'log debug information')
  .option('--log-level <logLevel>', 'Specify log level.', 'error')
  .option('--network <network>', 'specify the Ethereum network to connect to', 'local')
  .option('--address-file <addressFile>', 'Path to file containing contract address.');
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel, addressFile } = options;


// Process and validate arguments

ethToolset.validateAddressesSync({
  addresses: {
    HELLO_WORLD_LOCAL_ADDRESS,
    HELLO_WORLD_TESTNET_ADDRESS,
    HELLO_WORLD_MAINNET_ADDRESS,
  },
});

validate.logLevel({ logLevel });
if (debug) {
  logLevel = 'debug';
}
logger.setLevel({ logLevel });

validate.networkLabel({ networkLabel });
const network = config.networkLabelToNetwork[networkLabel];

let contractAddress;
if (fs.existsSync(addressFile)) {
  let contractAddress = fs.readFileSync(addressFile).toString().trim();
  deb(`Address found in ${addressFile}: ${contractAddress}`);
}


// Setup

import contract from '#root/artifacts/contracts/HelloWorld.sol/HelloWorld.json';

let provider: ethers.Provider;

var msg: string = 'Unknown error';
let DEPLOYED_CONTRACT_ADDRESS: string | undefined;
if (networkLabel == 'local') {
  msg = `Connecting to local network at ${network}...`;
  provider = new ethers.JsonRpcProvider(network);
  DEPLOYED_CONTRACT_ADDRESS = HELLO_WORLD_LOCAL_ADDRESS;
} else if (networkLabel == 'testnet') {
  msg = `Connecting to Sepolia testnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY);
  DEPLOYED_CONTRACT_ADDRESS = HELLO_WORLD_TESTNET_ADDRESS;
} else if (networkLabel == 'mainnet') {
  msg = `Connecting to Ethereum mainnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY);
  DEPLOYED_CONTRACT_ADDRESS = HELLO_WORLD_MAINNET_ADDRESS;
}
log(msg);
provider = provider!;
// Supplied contract file takes precedence over shell environment variable.
if (contractAddress) {
  DEPLOYED_CONTRACT_ADDRESS = contractAddress;
}
if (!ethers.isAddress(DEPLOYED_CONTRACT_ADDRESS)) {
  logger.error(`Invalid contract address: ${DEPLOYED_CONTRACT_ADDRESS}`);
  process.exit(1);
}
const contractHelloWorld = new ethers.Contract(DEPLOYED_CONTRACT_ADDRESS, contract.abi, provider);


// Run main function

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


// Functions


async function main() {
  let blockNumber = await provider.getBlockNumber();
  deb(`Current block number: ${blockNumber}`);

  let address = await contractHelloWorld.getAddress();
  let check = await ethToolset.contractExistsAt({ provider, address });
  if (!check) {
    logger.error(`No contract found at address ${address}.`);
    process.exit(1);
  }
  log(`Contract found at address: ${address}`);

  const message = await contractHelloWorld.message();

  log('Message stored in HelloWorld contract: ');
  logger.print(message);
}
