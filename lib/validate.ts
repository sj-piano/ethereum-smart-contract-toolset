// Imports
import Joi from "joi";

// Local imports
import config from "#root/config";
import utils from "#lib/utils";

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

function networkLabel({ networkLabel }: { networkLabel: string }) {
  const networkLabelSchema = Joi.string().valid(...config.networkLabelList);
  let networkLabelResult = networkLabelSchema.validate(networkLabel);
  if (networkLabelResult.error) {
    let msg = `Invalid network "${networkLabel}". Valid options are: [${config.networkLabelList.join(
      ", ",
    )}]`;
    console.error(msg);
    process.exit(1);
  }
}

function numericString(options: { name: string; value: string }): string {
  const { name, value } = options;
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    throw new Error(`Received empty or whitespace-only string for ${name}`);
  }
  if (!utils.isNumericString(trimmedValue)) {
    let msg = `Received non-numeric string for ${name}: ${trimmedValue}`;
    msg +=
      `, !isNaN(value)=${!isNaN(trimmedValue as any)}, ` +
      `!isNaN(parseFloat(value))=${!isNaN(parseFloat(trimmedValue))}`;
    throw new Error(msg);
  }
  return trimmedValue;
}

function number(options: { name: string; value: number }): number {
  const { name, value } = options;
  if (isNaN(value)) {
    throw new Error(`Received NaN for ${name}`);
  }
  return value;
}

function string(options: { name: string; value: string }): string {
  const { name, value } = options;
  if (!utils.isString(value)) {
    throw new Error(`Received non-string for ${name}: ${value}`);
  }
  return value;
}

export default { logLevel, networkLabel, numericString, number, string };
