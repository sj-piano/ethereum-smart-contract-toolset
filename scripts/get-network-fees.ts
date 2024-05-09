// Imports
import _ from 'lodash';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import ethToolset from '#root/src/eth-toolset';
import { createLogger } from '#root/lib/logging';
import validate from '#root/lib/validate';


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

validate.networkLabel({ networkLabel });
const network = config.networkLabelToNetwork[networkLabel];


// Setup

let provider: ethers.Provider;

var msg: string = 'Unknown error';
if (networkLabel == 'local') {
  msg = `Connecting to local network at ${network}...`;
  provider = new ethers.JsonRpcProvider(network);
} else if (networkLabel == 'testnet') {
  msg = `Connecting to Sepolia testnet...`;
  provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
} else if (networkLabel == 'mainnet') {
  msg = `Connecting to Ethereum mainnet...`;
  provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
}
log(msg);


// Run main function

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


// Functions


async function main() {
  let blockNumber = await provider.getBlockNumber();
  deb(`Current block number: ${blockNumber}`);
  const fees = await ethToolset.getGasPricesWithFiat({ provider });
  console.log(fees);
}
