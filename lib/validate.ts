// Imports
import Joi from "joi";

// Local imports
import { config } from "#root/config";

// Functions

function logLevel({ logLevel }: { logLevel: string }) {
  const logLevelSchema = Joi.string().valid(...config.logLevelList);
  let logLevelResult = logLevelSchema.validate(logLevel);
  if (logLevelResult.error) {
    let msg = `Invalid log level "${logLevel}". Valid options are: [${config.logLevelList.join(
      ", ",
    )}]`;
    console.error(msg);
    process.exit(1);
  }
}

export default { logLevel };
