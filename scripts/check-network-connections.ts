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
const { misc, utils, validate } = lib;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logger
const { logger, log, deb } = createLogger();


// Arguments
program
  .option('-l, --log-level <logLevel>', `logging level: [${logger.logLevelsString}]`, 'error')
  .option('-d, --debug', 'set logging level to debug')
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
  misc.stop({ error });
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

  for (let networkLabel of networkConnectionsToCheck) {
    if (networkConnectionsToCheck.includes(networkLabel)) {
      let success = false
      try {
        let provider = await toolset.getProviderAsync({ networkLabel });
        success = true;
      } catch (error) {
        deb(`Error connecting to ${networkLabel}: ${error}`);
      }
      connections[networkLabel].connected = success;
    }
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


