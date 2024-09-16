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
const networkLabelList = config.networkLabelList;
const { misc, utils, validate } = lib;


// Contracts
import contract from '#root/artifacts/contracts/HelloWorld.sol/HelloWorld.json';


// Environment variables
const {
  INFURA_API_KEY,
} = config.env;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Logging
const { logger, log, lj, deb } = createLogger();


// Arguments
program
  .option('-n, --network <network>', `network to connect to: [${config.networkLabelList}]`, 'local')
  .option('-l, --log-level <logLevel>', `logging level: [${logger.logLevelsString}]`, 'error')
  .option('-d, --debug', 'set logging level to debug')
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel } = options;


// Validate arguments
validate.logLevel({ logLevel });
validate.itemInList({ item: networkLabel, name: 'networkLabel', list: networkLabelList });


const network = config.networkLabelToNetwork[networkLabel];


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });


// Run


main().catch((error) => {
  misc.stop(error);
});


// Functions


async function main() {

  await toolset.setupAsync({ networkLabel, logLevel });
  let provider = toolset.provider;

  const contractFactoryHelloWorld = new ethers.ContractFactory(
    contract.abi,
    contract.bytecode,
    provider,
  );
  // We're able to use a dummy address because we're not actually calling any methods on the contract.
  const contractHelloWorld = new ethers.Contract(config.dummyAddress, contract.abi, provider);

  let blockNumber = await toolset.getBlockNumberAsync();
  deb(`Current block number: ${blockNumber}`);

  // Contract deployment
  const initialMessage = 'Hello World!';
  const txRequest = await contractFactoryHelloWorld.getDeployTransaction(initialMessage);
  const estimatedFees = await toolset.estimateFeesForTxAsync({
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
  const newMessage = 'Hello World! Updated.';
  const txRequest2 = await contractHelloWorld.update.populateTransaction(newMessage);
  const estimatedFees2 = await toolset.estimateFeesForTxAsync({
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
