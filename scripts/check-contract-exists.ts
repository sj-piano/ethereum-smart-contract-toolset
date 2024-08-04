// Imports
import _ from 'lodash';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import toolset from '#root/src/toolset';
import { createLogger } from '#root/lib/logging';
import utils from '#root/lib/utils';
import validate from '#root/lib/validate';


// Logging
const log2 = console.log;
const { logger, log, deb } = createLogger();


// Parse arguments
program
  .option('-d, --debug', 'log debug information')
  .option('--log-level <logLevel>', 'Specify log level.', 'error')
  .option(
    '--network <network>',
    'specify the Ethereum network to connect to',
    'local',
  )
  .option(
    '--address-name <addressName>',
    'Name of address in .env file. Overrides address or address-file.',
  )
  .option('--address <address>', 'Ethereum address.')
  .option(
    '--address-file <addressFile>',
    'Path to file containing contract address.',
  );
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


// Process and validate arguments

validate.logLevel({ logLevel });
if (debug) {
  logLevel = 'debug';
}
logger.setLevel({ logLevel });

validate.networkLabel({ networkLabel });

let contractAddress: string;

if (addressName) {
  address = utils.getValueOrThrow(config.env, addressName, 'config.env');
  deb(`Address ${addressName} found in .env file: ${address}`);
} else {
  address = validate.loadArgumentFromOneSource('address', address, addressFile);
}
if (!ethers.isAddress(address)) {
  var msg = `Invalid Ethereum address: ${address}`;
  console.error(msg);
  process.exit(1);
}
contractAddress = address;


// Setup

let provider: ethers.Provider;


// Run main function


main({ contractAddress }).catch((error) => {
  console.error(error);
  process.exit(1);
});


// Functions


async function main({ contractAddress }: { contractAddress: string }) {
  toolset.setupAsync({ networkLabel });
  let blockNumber = await toolset.provider.getBlockNumber();
  deb(`Current block number: ${blockNumber}`);

  let address = contractAddress;

  let check = await toolset.contractExistsAtAsync(address);
  if (!check) {
    console.error(`No contract found at address: ${address}`);
    process.exit(1);
  }
  console.log(`Contract found at address: ${address}`);
}
