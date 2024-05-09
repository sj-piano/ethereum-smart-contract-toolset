/*
mocha will import all files in the test directory and run them.
The following code will handle any command line arguments passed to the tests e.g. --debug.
*/


// Imports
import _ from 'lodash';
import { program } from 'commander';


// Local imports
import { createLogger } from '#lib/logging';
import validate from '#lib/validate';


// Logging
let log2 = console.log;
const { logger, log, deb } = createLogger();


// Parse arguments
program
  .option('-d, --debug', 'log debug information')
  .option('--log-level <logLevel>', 'Specify log level.', 'error')
  .allowUnknownOption();
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel } = options;


// Validate arguments
validate.logLevel({ logLevel });


// Setup
if (debug) {
  logLevel = 'debug';
}
logger.setLevel({ logLevel });


// Export
export { options, logger, log, deb };
