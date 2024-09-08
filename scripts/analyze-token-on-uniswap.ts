// Imports
import _ from 'lodash';
import Big from 'big.js';
import { program } from 'commander';


// Local imports
import config from '#root/config';
import lib from '#root/lib';
import toolset from '#root/src/toolset';
import { createLogger } from '#root/lib/logging';


// Components
const { misc, utils, validate } = lib;
const jd = utils.jd;
const uniswapToolset = toolset.uniswapToolset;
const WETH_DECIMAL_PLACES = config.constants.WETH_DECIMAL_PLACES;
const USDC_DECIMAL_PLACES = config.constants.USDC_DECIMAL_PLACES;


// Console.log
const log2 = console.log;
const jd2 = function (x) { return JSON.stringify(x, null, 4) }
const lj2 = function (x) { log2(jd2(x)) }


// Logging
const { logger, log, lj, deb, dj } = createLogger({ filePath: __filename });


// Parse arguments
program
  .option('--network <network>', 'specify the Ethereum network to connect to', 'local')
  .option('-l, --logLevel <logLevel>', `logging level: [${logger.logLevelsString}]`, 'error')
  .option('-d, --debug', 'set logging level to debug')
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel, network: networkLabel } = options;


// Validate arguments
validate.itemInList({ item: networkLabel, name: 'networkLabel', list: config.networkLabelList });


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });


// Run


mainAsync().catch((error) => {
  misc.stop({ error });
});


async function mainAsync() {

  await toolset.setupAsync({ networkLabel });

  let poolAddress = config.constants.USDC_WETH_POOL_0_05_ADDRESS;
  let poolContract = uniswapToolset.poolAddressToContract({ poolAddress });
  let poolInfo = await uniswapToolset.getPoolInfo({ poolContract });
  lj({ poolInfo });

  const sqrtPriceX96 = BigInt(poolInfo.sqrtPriceX96);
  const price = (sqrtPriceX96 / (2n ** 96n)) ** 2n;
  log(`price: ${price}`);

  const rateUsdcToEth = Big(Number(price))
    .div(10 ** WETH_DECIMAL_PLACES)
    .mul(10 ** USDC_DECIMAL_PLACES)
    .toFixed(WETH_DECIMAL_PLACES);
  log(`Exchange rate: 1 USDC to ETH: ${rateUsdcToEth}`);

  const rateEthToUsdc = Big(1).div(rateUsdcToEth).toFixed(USDC_DECIMAL_PLACES);
  log(`Exchange rate: 1 ETH to USDC: ${rateEthToUsdc}`);

}
