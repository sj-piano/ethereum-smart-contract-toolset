// Imports
import { program } from "commander";


// Local imports
import { createLogger } from "#lib/logging";
import validate from "#lib/validate";


// Logging
let log2 = console.log;
const { logger, log, deb } = createLogger();


// Parse arguments
program
  .option("-d, --debug", "log debug information")
  .option("--log-level <logLevel>", "Specify log level.", "error")
  .allowUnknownOption();
program.parse();
const options = program.opts();
if (options.debug) console.log(options);
let { debug, logLevel } = options;


// Validate arguments
validate.logLevel({ logLevel });


// Setup
if (debug) {
  logLevel = "debug";
}
logger.setLevel({ logLevel });


// Export
export { options, logger, log, deb };
