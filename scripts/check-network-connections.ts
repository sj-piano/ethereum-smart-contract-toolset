// Imports
import _ from "lodash";
import { program } from "commander";
import { ethers } from "ethers";


// Local imports
import config from "#root/config";
import { createLogger } from "#root/lib/logging";
import validate from "#root/lib/validate";


// Controls
let networkConnectionsToCheck = [
  "local",
  "testnet",
  "mainnet",
];


// Logging
const log2 = console.log;
const { logger, log, deb } = createLogger();


// Parse arguments
program
  .option("-d, --debug", "log debug information")
  .option("--log-level <logLevel>", "Specify log level.", "error");
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel } = options;

// Process and validate arguments

validate.logLevel({ logLevel });
if (debug) {
  logLevel = "debug";
}
logger.setLevel({ logLevel });

// Run main function

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Functions

async function checkConnection({provider, connections, networkLabel, network}) {
  let msg = `Connecting to ${networkLabel} network: ${network}...`;
  log(msg);
  try {
    // _detectNetwork() will throw an error if the connection fails. It won't retry.
    let detected = await provider._detectNetwork();
    let blockNumber = await provider.getBlockNumber();
    log(`- ${networkLabel} network: current block number = ${blockNumber}`);
    connections[networkLabel].connected = true;
  } catch (error) {
    provider.destroy();
    logger.error(`Could not connect to ${networkLabel} network: ${network}.`);
    logger.error(error);
  }
}

async function main() {
  let connections = {
    local: {
      description: "local Hardhat network",
      connected: false,
    },
    testnet: {
      description: "Sepolia testnet",
      connected: false,
    },
    mainnet: {
      description: "Ethereum mainnet",
      connected: false,
    },
  };

  // Check local Hardhat network connection
  let networkLabel = "local";
  let network = config.networkLabelToNetwork[networkLabel];
  let provider = new ethers.JsonRpcProvider(network);

  if (networkConnectionsToCheck.includes(networkLabel)) {
    await checkConnection({provider, connections, networkLabel, network});
  }

  // Check Sepolia testnet network connection (via Infura)
  networkLabel = "testnet";
  network = config.networkLabelToNetwork[networkLabel];
  provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
  if (networkConnectionsToCheck.includes(networkLabel)) {
    await checkConnection({provider, connections, networkLabel, network});
  }

  // Check Ethereum Mainnet network connection (via Infura)
  networkLabel = "mainnet";
  network = config.networkLabelToNetwork[networkLabel];
  provider = new ethers.InfuraProvider(network, config.env.INFURA_API_KEY);
  if (networkConnectionsToCheck.includes(networkLabel)) {
    await checkConnection({provider, connections, networkLabel, network});
  }

  // Display results
  log2(`Network connections:`);
  _.forEach(connections, (connection, networkLabel) => {
    if (networkConnectionsToCheck.includes(networkLabel)) {
      let { description, connected } = connection;
      let msg = `- ${networkLabel}: ${description} - ${
        connected ? "connected" : "not connected"
      }`;
      log2(msg);
    }
  });

}
