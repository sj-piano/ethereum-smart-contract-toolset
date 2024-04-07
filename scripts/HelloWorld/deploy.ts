// Imports
import Big from "big.js";
import { program } from "commander";
import { ethers } from "ethers";
import _ from "lodash";

// Local imports
import { config } from "#root/config";
import ethereum from "#root/src/ethereum";
import { createLogger } from "#root/lib/logging";
import validate from "#root/lib/validate";

// Controls
const initialMessage = "Hello World!";

// Load environment variables
import dotenv from "dotenv";
import path from "path";
let rootDir = __dirname.substring(0, __dirname.lastIndexOf("/"));
let envFile = path.join(rootDir, config.envFileName);
dotenv.config({ path: envFile });
const {
  MAX_FEE_PER_TRANSACTION_USD,
  MAX_FEE_PER_GAS_GWEI,
  MAX_PRIORITY_FEE_PER_GAS_GWEI,
  INFURA_API_KEY,
  LOCAL_HARDHAT_PRIVATE_KEY,
  LOCAL_HARDHAT_ADDRESS,
  SEPOLIA_TESTNET_PRIVATE_KEY,
  SEPOLIA_TESTNET_ADDRESS,
  ETHEREUM_MAINNET_PRIVATE_KEY,
  ETHEREUM_MAINNET_ADDRESS,
} = process.env;

// Logging
const { logger, log, deb } = createLogger();

// Parse arguments
program
  .option("-d, --debug", "log debug information")
  .option("--log-level <logLevel>", "Specify log level.", "error")
  .option("--network <network>", "specify the Ethereum network to connect to", "local");
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel } = options;

// Process and validate arguments

ethereum.validatePrivateKeysSync({
  privateKeys: {
    LOCAL_HARDHAT_PRIVATE_KEY,
    SEPOLIA_TESTNET_PRIVATE_KEY,
    ETHEREUM_MAINNET_PRIVATE_KEY,
  },
});

ethereum.validateAddressesSync({
  addresses: {
    LOCAL_HARDHAT_ADDRESS,
    SEPOLIA_TESTNET_ADDRESS,
    ETHEREUM_MAINNET_ADDRESS,
  },
});

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
let DEPLOYER_PRIVATE_KEY: string | undefined;
if (networkLabel == "local") {
  msg = `Connecting to local network at ${network}...`;
  provider = new ethers.JsonRpcProvider(network);
  DEPLOYER_PRIVATE_KEY = LOCAL_HARDHAT_PRIVATE_KEY;
} else if (networkLabel == "testnet") {
  msg = `Connecting to Sepolia testnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY);
  DEPLOYER_PRIVATE_KEY = SEPOLIA_TESTNET_PRIVATE_KEY;
} else if (networkLabel == "mainnet") {
  msg = `Connecting to Ethereum mainnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY);
  DEPLOYER_PRIVATE_KEY = ETHEREUM_MAINNET_PRIVATE_KEY;
}
log(msg);
DEPLOYER_PRIVATE_KEY = DEPLOYER_PRIVATE_KEY!;
let signer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider!);
let contractFactoryHelloWorld = new ethers.ContractFactory(contract.abi, contract.bytecode, signer);

// Run main function

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Functions

async function main() {
  // Estimate fees.
  // - Stop if any fee limit is exceeded.
  let txRequest = await contractFactoryHelloWorld.getDeployTransaction(initialMessage);
  const estimatedFees = await ethereum.estimateFeesForTx({
    provider,
    txRequest,
  });
  deb(estimatedFees);
  const { gasLimit, maxFeePerGasWei, maxPriorityFeePerGasWei, feeEth, feeUsd, feeLimitChecks } =
    estimatedFees;
  log(`Estimated fee: ${feeEth} ETH (${feeUsd} USD)`);
  if (feeLimitChecks.anyLimitExceeded) {
    for (let key of feeLimitChecks.limitExceededKeys) {
      let check = feeLimitChecks[key];
      console.error(`- ${key}: ${check.msg}`);
    }
    process.exit(1);
  }
  const gasPrices = estimatedFees.gasPrices;
  const { ethToUsd } = gasPrices;

  // Get ETH balance of signer.
  // - Stop if balance is too low.
  const signerAddress = await signer.getAddress();
  const signerBalanceWei = await provider.getBalance(signerAddress);
  const signerBalanceEth = ethers.formatEther(signerBalanceWei);
  const signerBalanceUsd = Big(ethToUsd).mul(Big(signerBalanceEth)).toFixed(config.USD_DP);
  log(`Signer balance: ${signerBalanceEth} ETH (${signerBalanceUsd} USD)`);
  if (Big(signerBalanceEth).lt(Big(feeEth))) {
    console.error(
      `Sender address (${signerAddress}) has a balance that is too low (${signerBalanceEth} ETH). At least ${feeEth} ETH is needed to pay for the deployment transaction.`,
    );
    process.exit(1);
  }

  // Deploy contract.
  // - Use the estimated fee values.
  // - Wait for deployment to complete.
  const contractHelloWorld = await contractFactoryHelloWorld.deploy(initialMessage, {
    gasLimit,
    maxFeePerGas: maxFeePerGasWei,
    maxPriorityFeePerGas: maxPriorityFeePerGasWei,
  });
  await contractHelloWorld.waitForDeployment();

  // Examine the results and find out how much was spent.
  let txDeployment = contractHelloWorld.deploymentTransaction();
  deb(txDeployment);
  if (!txDeployment) {
    let msg = `Deployment transaction not found.`;
    console.error(msg);
    process.exit(1);
  }
  let txReceipt = await txDeployment.wait();
  deb(txReceipt);
  if (!txReceipt) {
    let msg = `Deployment transaction receipt not found.`;
    console.error(msg);
    process.exit(1);
  }
  const { gasUsed, gasPrice: effectiveGasPriceWei } = txReceipt;
  deb(`Gas used: ${gasUsed}`);
  deb(`Effective gas price (wei): ${effectiveGasPriceWei}`);

  const txFeeWei = txReceipt.fee;
  deb(`txFeeWei: ${txFeeWei}`);
  const txFeeEth = ethers.formatEther(txFeeWei).toString();
  const txFeeUsd = Big(ethToUsd).mul(Big(txFeeEth)).toFixed(config.USD_DP);
  log(`Final fee: ${txFeeEth} ETH (${txFeeUsd} USD)`);

  // Report the final result.
  let contractAddress = contractHelloWorld.target;
  log(`Contract deployed to address:`);
  logger.print(contractAddress);
}
