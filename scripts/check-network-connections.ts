// Imports
import _ from 'lodash';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import lib from '#root/lib';
import { createLogger } from '#root/lib/logging';


// Components
const { utils, validate } = lib;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logger
const { logger, log, deb } = createLogger();


// Arguments
program
  .option('-d, --debug', 'log debug information')
  .option('--log-level <logLevel>', 'specify log level', 'error');
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel } = options;


// Validate arguments
validate.logLevel({ logLevel });


// Controls
let networkConnectionsToCheck = [
  'local',
  'testnet',
  'mainnet',
  'testnetPolygon',
  'mainnetPolygon',
];


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });


// Run


main().catch((error) => {
  console.error(error);
  process.exit(1);
});


// Functions


async function main() {
  let connections = {
    local: {
      description: 'local Hardhat network',
      connected: false,
    },
    testnet: {
      description: 'Sepolia testnet',
      connected: false,
    },
    mainnet: {
      description: 'Ethereum mainnet',
      connected: false,
    },
    testnetPolygon: {
      description: 'Polygon testnet',
      connected: false,
    },
    mainnetPolygon: {
      description: 'Polygon mainnet',
      connected: false,
    },
  };

  let networkLabel: string;
  let network: string;
  let provider: ethers.Provider;

  // Check local Hardhat network connection
  networkLabel = 'local';
  network = config.networkLabelToNetwork[networkLabel];
  provider = new ethers.JsonRpcProvider(network);

  if (networkConnectionsToCheck.includes(networkLabel)) {
    await checkConnection({provider, connections, networkLabel, network});
  }

  // Check Sepolia testnet network connection (via Infura)
  networkLabel = 'testnet';
  network = config.networkLabelToNetwork[networkLabel];
  provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
  if (networkConnectionsToCheck.includes(networkLabel)) {
    await checkConnection({provider, connections, networkLabel, network});
  }

  // Check Ethereum Mainnet network connection (via Infura)
  networkLabel = 'mainnet';
  network = config.networkLabelToNetwork[networkLabel];
  provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
  if (networkConnectionsToCheck.includes(networkLabel)) {
    await checkConnection({provider, connections, networkLabel, network});
  }

  // Check Polygon testnet network connection
  networkLabel = 'testnetPolygon';
  network = config.networkLabelToNetwork[networkLabel];
  provider = new ethers.JsonRpcProvider(
    `${config.alchemyAPIPolygonTestnetUrlBase}/${config.env.ALCHEMY_API_KEY_POLYGON_POS}`
  );
  if (networkConnectionsToCheck.includes(networkLabel)) {
    await checkConnection({provider, connections, networkLabel, network});
  }

  // Check Polygon network connection
  networkLabel = 'mainnetPolygon';
  network = config.networkLabelToNetwork[networkLabel];
  provider = new ethers.JsonRpcProvider(
    `${config.alchemyAPIPolygonMainnetUrlBase}/${config.env.ALCHEMY_API_KEY_POLYGON_POS}`
  );
  if (networkConnectionsToCheck.includes(networkLabel)) {
    await checkConnection({provider, connections, networkLabel, network});
  }

  // Display results
  log2(`Network connections:`);
  _.forEach(connections, (connection, networkLabel) => {
    if (networkConnectionsToCheck.includes(networkLabel)) {
      let { description, connected } = connection;
      let msg = `- ${networkLabel}: ${description} - ${
        connected ? 'connected' : 'not connected'
      }`;
      log2(msg);
    }
  });

}


async function checkConnection({provider, connections, networkLabel, network}) {
  let msg = `Connecting to ${networkLabel} network: ${network} ...`;
  log(msg);
  try {
    // _detectNetwork() will throw an error if the connection fails. It won't retry.
    let detected = await provider._detectNetwork();
    let blockNumber = await provider.getBlockNumber();
    log(`- ${networkLabel} network: current block number = ${blockNumber}`);
    if (! _.keys(connections).includes(networkLabel)) {
      throw new Error(`Unexpected networkLabel: ${networkLabel}`);
    }
    connections[networkLabel].connected = true;
  } catch (error) {
    provider.destroy();
    logger.error(`Could not connect to ${networkLabel} network: ${network}.`);
    logger.error(error);
  }
}

