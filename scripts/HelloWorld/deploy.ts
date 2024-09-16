// Imports
import _ from 'lodash';
import Big from 'big.js';
import { program } from 'commander';
import { ethers } from 'ethers';


// Local imports
import config from '#root/config';
import lib from '#root/lib';
import { createLogger } from '#root/lib/logging';
import toolset from '#root/src/toolset';


// Contracts
import contract from '#root/artifacts/contracts/HelloWorld.sol/HelloWorld.json';


// Components
const networkLabelList = config.networkLabelList;
const { misc, utils, validate } = lib;


// Load environment variables
const {
  INFURA_API_KEY,
  LOCAL_HARDHAT_PRIVATE_KEY,
  LOCAL_HARDHAT_ADDRESS,
  SEPOLIA_TESTNET_PRIVATE_KEY,
  SEPOLIA_TESTNET_ADDRESS,
  ETHEREUM_MAINNET_PRIVATE_KEY,
  ETHEREUM_MAINNET_ADDRESS,
} = config.env;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logging
const { logger, log, deb, dj } = createLogger();


// Arguments
program
  .option('-n, --network <network>', `network to connect to: [${config.networkLabelList}]`, 'local')
  .option('-l, --log-level <logLevel>', `logging level: [${logger.logLevelsString}]`, 'error')
  .option('-d, --debug', 'set logging level to debug')
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { network: networkLabel, logLevel, debug } = options;


// Validate arguments

toolset.validatePrivateKeys({
  privateKeys: {
    LOCAL_HARDHAT_PRIVATE_KEY,
    SEPOLIA_TESTNET_PRIVATE_KEY,
    ETHEREUM_MAINNET_PRIVATE_KEY,
  },
});

toolset.validateAddresses({
  addresses: {
    LOCAL_HARDHAT_ADDRESS,
    SEPOLIA_TESTNET_ADDRESS,
    ETHEREUM_MAINNET_ADDRESS,
  },
});

validate.logLevel({ logLevel });
validate.itemInList({ item: networkLabel, name: 'networkLabel', list: networkLabelList });


// Controls
const initialMessage = 'Hello World!';


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });
let DEPLOYER_PRIVATE_KEY;
if (networkLabel == 'local') {
  DEPLOYER_PRIVATE_KEY = LOCAL_HARDHAT_PRIVATE_KEY;
} else if (networkLabel == 'testnet') {
  DEPLOYER_PRIVATE_KEY = SEPOLIA_TESTNET_PRIVATE_KEY;
} else if (networkLabel == 'mainnet') {
  DEPLOYER_PRIVATE_KEY = ETHEREUM_MAINNET_PRIVATE_KEY;
}


// Run

main().catch((error) => {
  misc.stop(error);
});


// Functions


async function main() {

  await toolset.setupAsync({ networkLabel, logLevel });
  let provider = toolset.provider;

  let signer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider!);
  let contractFactoryHelloWorld = new ethers.ContractFactory(contract.abi, contract.bytecode, signer);


  // Estimate fees.
  // - Stop if any fee limit is exceeded.
  let txRequest = await contractFactoryHelloWorld.getDeployTransaction(initialMessage);
  const estimatedFees = await toolset.estimateFeesForTxAsync(txRequest);
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
  const { priceEthInUsd } = gasPrices;
  dj({priceEthInUsd});

  // Get ETH balance of signer.
  // - Stop if balance is too low.
  const signerAddress = await signer.getAddress();
  const signerBalanceWei = await provider.getBalance(signerAddress);
  const signerBalanceEth = ethers.formatEther(signerBalanceWei);
  const signerBalanceUsd = Big(priceEthInUsd).mul(Big(signerBalanceEth)).toFixed(config.constants.USD_DECIMAL_PLACES);
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
  const txFeeUsd = Big(priceEthInUsd).mul(Big(txFeeEth)).toFixed(config.constants.USD_DECIMAL_PLACES);
  log(`Final fee: ${txFeeEth} ETH (${txFeeUsd} USD)`);

  // Report the final result.
  let contractAddress = contractHelloWorld.target;
  log(`Contract deployed to address:`);
  logger.print(contractAddress);
}
