// Imports
import _ from 'lodash';
import { ethers } from 'ethers';
import hre from 'hardhat';
import { program } from 'commander';

// Local imports
import config from '#root/config';
import amounts from '#root/src/amounts';
import ethereum from '#root/src/eth-toolset';
import { createLogger } from '#root/lib/logging';
import validate from '#root/lib/validate';

// Types from typechain
import { UpgradeableCounter, UpgradeableCounterV2 } from '#root/typechain-types';

// Environment variables
import dotenv from 'dotenv';
import path from 'path';
let rootDir = __dirname.substring(0, __dirname.lastIndexOf('/'));
let envFile = path.join(rootDir, config.envFileName);
dotenv.config({ path: envFile });
const {
  MAX_FEE_PER_TRANSACTION_USD,
  MAX_FEE_PER_GAS_GWEI,
  MAX_PRIORITY_FEE_PER_GAS_GWEI,
  INFURA_API_KEY,
} = process.env;

// Logging
const { logger, log, deb } = createLogger();

// Parse arguments
program
  .option('-d, --debug', 'log debug information')
  .option('--log-level <logLevel>', 'Specify log level.', 'error')
  .option('--network <network>', 'specify the Ethereum network to connect to', 'local');
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
  logLevel = 'debug';
}
logger.setLevel({ logLevel });
ethereum.setLogLevel({ logLevel });

validate.networkLabel({ networkLabel });
const network = config.networkLabelToNetwork[networkLabel];

// Setup

import contractJson from '#root/artifacts/contracts/UpgradeableCounter.sol/UpgradeableCounter.json';

let providerDev = hre.ethers.provider;

let provider: ethers.Provider;
var msg: string = 'Unknown error';
let DEPLOYED_CONTRACT_ADDRESS: string | undefined;
if (networkLabel == 'local') {
  msg = `Connecting to local network at ${network}...`;
  provider = new ethers.JsonRpcProvider(network);
} else if (networkLabel == 'testnet') {
  msg = `Connecting to Sepolia testnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY);
} else if (networkLabel == 'mainnet') {
  msg = `Connecting to Ethereum mainnet...`;
  provider = new ethers.InfuraProvider(network, INFURA_API_KEY);
}
log(msg);
provider = provider!;

// Run main function

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Functions

async function main() {
  let blockNumber = await provider.getBlockNumber();
  deb(`Block number ${networkLabel}: ${blockNumber}`);

  //log(`Compiling...`);
  //await hre.run("compile");

  const [admin, acc1, acc2] = await hre.ethers.getSigners();

  const contractFactory = await hre.ethers.getContractFactory('UpgradeableCounter');

  // Approach: Run a dev network and deploy the contract to it.
  // Then: Measure the gas used by the contract deployment.
  // Finally: Multiply the gas used by the gas price on the target network to get the fee.

  let blockNumberDev = await providerDev.getBlockNumber();
  deb(`Block number (dev): ${blockNumberDev}`);

  // Contract deployment
  const contractCounter = (await hre.upgrades.deployProxy(contractFactory, [], {
    initializer: 'initialize',
    kind: 'uups',
  })) as unknown as UpgradeableCounter;
  await contractCounter.waitForDeployment();

  let blockNumberDev2 = await providerDev.getBlockNumber();
  deb(`Block number (dev): ${blockNumberDev2}`);

  let totalGasUsed = BigInt(0);
  let totalSpentEth = amounts.zeroEth;
  for (let i = blockNumberDev; i <= blockNumberDev2; i++) {
    let block = await providerDev.getBlock(i);
    block = block!;

    deb(`Block ${i}:`);
    for (let j = 0; j <= block.transactions.length - 1; j++) {
      let txHash = block.transactions[j];
      deb(`- tx ${j}: ${txHash}`);
      let tx = await providerDev.getTransaction(txHash);
      let txReceipt = await providerDev.getTransactionReceipt(txHash);
      let gasUsed = txReceipt!.gasUsed;
      totalGasUsed += gasUsed;
      let gasPriceWei = txReceipt!.gasPrice.toString();
      let spentWei = amounts.multiplyAmountWei({ amountWei: gasPriceWei, multiplier: gasUsed });
      let spentEth = amounts.weiToEth({ amountWei: spentWei });
      deb(`- spentEth: ${spentEth}`);
      totalSpentEth = amounts.addAmountsEth([totalSpentEth, spentEth]);
    }
  }
  deb(`Total gas used: ${totalGasUsed}`);
  deb(`Total spentEth: ${totalSpentEth}`);

  let estimatedFees = await ethereum.estimateFeesFromGas({ provider, estimatedGas: totalGasUsed });

  logger.print(`\nContract deployment - estimated fee:`);

  //lj(estimatedFees);
  if (!estimatedFees.feeLimitChecks.anyLimitExceeded) {
    logger.print(`- feeEth: ${estimatedFees.feeEth}`);
    logger.print(`- feeUsd: ${estimatedFees.feeUsd}`);
  } else {
    for (let key of estimatedFees.feeLimitChecks.limitExceededKeys) {
      let check = estimatedFees.feeLimitChecks[key];
      logger.print(`- ${key} limit exceeded: ${check.msg}`);
    }
  }

  // Estimate fee for upgrading the proxy.
  // Same approach.

  const contractAddress = await contractCounter.getAddress();
  deb(`contractAddress: ${contractAddress}`);
  const implAddress = await contractCounter.connect(acc1).getImplementationAddress();
  deb(`implAddress: ${implAddress}`);
  const contractFactoryV2 = await hre.ethers.getContractFactory('UpgradeableCounterV2');
  const contractCounterV2 = (await hre.upgrades.upgradeProxy(
    contractAddress,
    contractFactoryV2,
  )) as unknown as UpgradeableCounter;
  const counterAddress2 = await contractCounterV2.getAddress();
  deb(`counterAddress2: ${counterAddress2}`);
  const implAddress2 = await contractCounterV2.connect(acc1).getImplementationAddress();
  deb(`implAddress2: ${implAddress2}`);

  let blockNumberDev3 = await providerDev.getBlockNumber();
  deb(`Block number (dev): ${blockNumberDev3}`);

  let totalGasUsedUpgrade = BigInt(0);
  let totalSpentEthUpgrade = amounts.zeroEth;
  for (let i = blockNumberDev2 + 1; i <= blockNumberDev3; i++) {
    let block = await providerDev.getBlock(i);
    block = block!;

    deb(`Block ${i}:`);
    for (let j = 0; j <= block.transactions.length - 1; j++) {
      let txHash = block.transactions[j];
      deb(`- tx ${j}: ${txHash}`);
      let tx = await providerDev.getTransaction(txHash);
      let txReceipt = await providerDev.getTransactionReceipt(txHash);
      let gasUsed = txReceipt!.gasUsed;
      totalGasUsedUpgrade += gasUsed;
      let gasPriceWei = txReceipt!.gasPrice.toString();
      let spentWei = amounts.multiplyAmountWei({ amountWei: gasPriceWei, multiplier: gasUsed });
      let spentEth = amounts.weiToEth({ amountWei: spentWei });
      deb(`- spentEth: ${spentEth}`);
      totalSpentEthUpgrade = amounts.addAmountsEth([totalSpentEthUpgrade, spentEth]);
    }
  }
  deb(`Total gas used: ${totalGasUsedUpgrade}`);
  deb(`Total spentEth: ${totalSpentEthUpgrade}`);

  let estimatedFees2 = await ethereum.estimateFeesFromGas({
    provider,
    estimatedGas: totalGasUsedUpgrade,
  });

  logger.print(`\nContract upgrade - estimated fee:`);

  //lj(estimatedFees2);
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
