// Imports
import _ from 'lodash';
import { program } from 'commander';


// Local imports
import config from '#root/config';
import lib from '#root/lib';
import toolset from '#root/src/toolset';
import { createLogger } from '#root/lib/logging';


// Components
const { misc, utils, validate } = lib;
const jd = utils.jd;
const networkLabelList = config.networkLabelList;
const uniswapToolset = toolset.uniswapToolset;


// Logging
const log2 = console.log;
const { logger, log, lj, deb } = createLogger({ filePath: __filename });


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
validate.networkLabel({ networkLabel, networkLabelList });


// Setup
if (debug) logLevel = 'debug';
logger.setLevel({ logLevel });


// Run


mainAsync().catch((error) => {
  misc.stop({ error });
});


async function mainAsync() {

  await toolset.setupAsync({ networkLabel });

  let poolAddress = config.constants.USDC_WETH_POOL_ADDRESS;
  let poolContract = uniswapToolset.poolAddressToContract({ poolAddress });
  let poolInfo = await uniswapToolset.getPoolInfo({ poolContract });
  lj({ poolInfo });

}
