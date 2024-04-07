/* Notes:
- By default, this will check for the HelloWorld contract at the address specified in the .env file.
- To check for a different contract, use the --address option.
*/

// Imports
import { program } from "commander";
import { ethers } from "ethers";
import fs from "fs";
import _ from "lodash";

// Local imports
import config from "#root/config";
import ethereum from "#root/src/ethereum";
import { createLogger } from "#root/lib/logging";
import validate from "#root/lib/validate";

// Environment variables
import dotenv from "dotenv";
import path from "path";
let rootDir = __dirname.substring(0, __dirname.lastIndexOf("/"));
let envFile = path.join(rootDir, config.envFileName);
dotenv.config({ path: envFile });
const { INFURA_API_KEY } = process.env;

// Logging
const { logger, log, deb } = createLogger();

// Parse arguments
program
  .option("-d, --debug", "log debug information")
  .option("--log-level <logLevel>", "Specify log level.", "error")
  .option(
    "--network <network>",
    "specify the Ethereum network to connect to",
    "local",
  )
  .option(
    "--addressName <addressName>",
    "Name of address in .env file. Overrides address or address-file.",
  )
  .option("--address <address>", "Ethereum address.")
  .option(
    "--address-file <addressFile>",
    "Path to file containing contract address.",
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
  logLevel = "debug";
}
logger.setLevel({ logLevel });

validate.networkLabel({ networkLabel });
const network = config.networkLabelToNetwork[networkLabel];

let contractAddress: string;

if (addressName) {
  if (!process.env[addressName]) {
    var msg = `Address name not found in ${config.envFileName}: ${addressName}`;
    console.error(msg);
    process.exit(1);
  }
  address = process.env[addressName];
  deb(`Address found in .env file: ${address}`);
} else {
  if ((address && addressFile) || (!address && !addressFile)) {
    var msg =
      "Exactly one of the arguments '--address' or '--address-file' must be provided.";
    console.error(msg);
    process.exit(1);
  }
  if (addressFile && !fs.existsSync(addressFile)) {
    var msg = `Address file not found: ${addressFile}`;
    console.error(msg);
    process.exit(1);
  }
  if (addressFile && fs.existsSync(addressFile)) {
    address = fs.readFileSync(addressFile).toString().trim();
    deb(`Address found in ${addressFile}: ${address}`);
  }
}
if (!ethers.isAddress(address)) {
  var msg = `Invalid Ethereum address: ${address}`;
  console.error(msg);
  process.exit(1);
}
contractAddress = address;

// Setup

let provider: ethers.Provider;

var msg: string = "Unknown error";
if (networkLabel == "local") {
  msg = `Connecting to local network at ${network}...`;
  provider = new ethers.JsonRpcProvider(network);
} else if (networkLabel == "testnet") {
  msg = `Connecting to Sepolia testnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY);
} else if (networkLabel == "mainnet") {
  msg = `Connecting to Ethereum mainnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY);
}
log(msg);

// Run main function

main({ contractAddress }).catch((error) => {
  console.error(error);
  process.exit(1);
});

// Functions

async function main({ contractAddress }: { contractAddress: string }) {
  let blockNumber = await provider.getBlockNumber();
  deb(`Current block number: ${blockNumber}`);

  let address = contractAddress;

  let check = await ethereum.contractExistsAt({ provider, address });
  if (!check) {
    console.error(`No contract found at address: ${address}`);
    process.exit(1);
  }
  console.log(`Contract found at address: ${address}`);
}
