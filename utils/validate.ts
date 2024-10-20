/* Important:
- This file cannot import config.ts, because config.ts imports utils.ts.
*/


// Imports
import _ from 'lodash';
import Joi from 'joi';


// Local imports
import misc from './misc';


// Console.log
const log2 = console.log;


// Logging
import { createLogger } from '#root/utils/logging';
const { logger, log, deb } = createLogger();


// Delete ?
function logLevel({ logLevel }: { logLevel: string }) {
  const logLevelSchema = Joi.string().valid(...logger.logLevels);
  let logLevelResult = logLevelSchema.validate(logLevel);
  if (logLevelResult.error) {
    let msg = `Invalid log level "${logLevel}". Valid options are: [${logger.logLevelsString}]`;
    console.error(msg);
    process.exit(1);
  }
}


function itemInList({ item, name, list }: { item: any, name: string, list: any[] }) {
  if (! list.includes(item)) {
    let msg = `Invalid ${name} '${item}'. Valid options are: [${list.join(', ')}]`;
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
  if (! misc.isNumericString(trimmedValue)) {
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
  if (! misc.isString(value)) {
    throw new Error(`Received non-string for ${name}: ${value}`);
  }
  return value;
}


function exactlyOneOption(args) {
  let { optionNames, ...options } = args;
  let msg = `Exactly one of the arguments [${optionNames.join(', ')}] is required.`;

  let truthyOptionsCount = optionNames.reduce((count, option) => {
    return count + (options[option] ? 1 : 0);
  }, 0);

  if (truthyOptionsCount !== 1) {
    throw new Error(msg);
  }
}



export const validate ={
  logLevel,
  itemInList,
  numericString,
  number,
  string,
  exactlyOneOption,
}


export default validate;
