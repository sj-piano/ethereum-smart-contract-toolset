// Imports
import _ from 'lodash';
import Big from 'big.js';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import toolset from '#root/src/toolset';
import { createLogger } from '#root/lib/logging';
import validate from '#root/lib/validate';


// Logging
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
  .option('--address <address>', 'Ethereum address.')
  .option(
    '--address-file <addressFile>',
    'Path to file containing Ethereum address.',
  );
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel, address, addressFile } = options;


// Process and validate arguments

validate.logLevel({ logLevel });
if (debug) {
  logLevel = 'debug';
}
logger.setLevel({ logLevel });

validate.networkLabel({ networkLabel });

address = validate.loadArgumentFromOneSource('address', address, addressFile);

if (!ethers.isAddress(address)) {
  var msg = `Invalid Ethereum address: ${address}`;
  console.error(msg);
  process.exit(1);
}


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

  msg = `${balance} ${symbol} (${balanceUsd} USD)`;
  console.log(msg);
}
