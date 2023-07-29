// Imports
import { program } from "commander";
import { ethers } from "ethers";
import Joi from "joi";
import _ from "lodash";

// Local imports
import { config } from "#root/config";
import ethereum from "#root/src/ethereum";
import { createLogger } from "#root/lib/logging";
import validate from "#root/lib/validate";

// Environment variables
import dotenv from "dotenv";
import path from "path";
let rootDir = __dirname.substring(0, __dirname.lastIndexOf("/"));
let envFile = path.join(rootDir, config.envFileName);
dotenv.config({ path: envFile });
const {
  MAX_FEE_PER_TRANSACTION_USD,
  MAX_FEE_PER_GAS_GWEI,
  MAX_PRIORITY_FEE_PER_GAS_GWEI,
  INFURA_API_KEY_NAME,
} = process.env;

// Logging
const { logger, log, lj, deb } = createLogger();

// Parse arguments
program
  .option("-d, --debug", "log debug information")
  .option("--log-level <logLevel>", "Specify log level.", "error")
  .option(
    "--network <network>",
    "specify the Ethereum network to connect to",
    "local",
  );
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel } = options;

// Process and validate arguments

config.update({
  MAX_FEE_PER_TRANSACTION_USD,
  MAX_FEE_PER_GAS_GWEI,
  MAX_PRIORITY_FEE_PER_GAS_GWEI,
});

validate.logLevel({ logLevel });
if (debug) {
  logLevel = "debug";
}
logger.setLevel({ logLevel });

validate.networkLabel({ networkLabel });
const network = config.mapNetworkLabelToNetwork[networkLabel];

// Setup

import contract from "#root/artifacts/contracts/HelloWorld.sol/HelloWorld.json";

let provider: ethers.Provider;

var msg: string = "Unknown error";
let DEPLOYED_CONTRACT_ADDRESS: string | undefined;
if (networkLabel == "local") {
  msg = `Connecting to local network at ${network}...`;
  provider = new ethers.JsonRpcProvider(network);
} else if (networkLabel == "testnet") {
  msg = `Connecting to Sepolia testnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY_NAME);
} else if (networkLabel == "mainnet") {
  msg = `Connecting to Ethereum mainnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY_NAME);
}
log(msg);
provider = provider!;
const contractFactoryHelloWorld = new ethers.ContractFactory(
  contract.abi,
  contract.bytecode,
  provider,
);
// We're able to use a dummy address because we're not actually calling any methods on the contract.
const contractHelloWorld = new ethers.Contract(
  config.dummyAddress,
  contract.abi,
  provider,
);

// Run main function

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Functions

async function main() {
  let blockNumber = await provider.getBlockNumber();
  deb(`Current block number: ${blockNumber}`);

  // Contract deployment
  const initialMessage = "Hello World!";
  const txRequest = await contractFactoryHelloWorld.getDeployTransaction(
    initialMessage,
  );
  const estimatedFees = await ethereum.estimateFees({
    provider,
    txRequest,
  });
  logger.print(`\nContract deployment - estimated fee:`);
  lj(estimatedFees);
  if (!estimatedFees.feeLimitChecks.anyLimitExceeded) {
    logger.print(`- feeEth: ${estimatedFees.feeEth}`);
    logger.print(`- feeUsd: ${estimatedFees.feeUsd}`);
  } else {
    for (let key of estimatedFees.feeLimitChecks.limitExceededKeys) {
      let check = estimatedFees.feeLimitChecks[key];
      logger.print(`- ${key} limit exceeded: ${check.msg}`);
    }
  }

  // Contract method call: update
  const newMessage = "Hello World! Updated.";
  const txRequest2 = await contractHelloWorld.update.populateTransaction(
    newMessage,
  );
  const estimatedFees2 = await ethereum.estimateFees({
    provider,
    txRequest: txRequest2,
  });
  logger.print(`\nContract method call: 'update' - estimated fee:`);
  lj(estimatedFees2);
  if (!estimatedFees2.feeLimitChecks.anyLimitExceeded) {
    logger.print(`- feeEth: ${estimatedFees2.feeEth}`);
    logger.print(`- feeUsd: ${estimatedFees2.feeUsd}`);
  } else {
    for (let key of estimatedFees2.feeLimitChecks.limitExceededKeys) {
      let check = estimatedFees2.feeLimitChecks[key];
      logger.print(`- ${key} limit exceeded: ${check.msg}`);
    }
  }

  console.log();
}
