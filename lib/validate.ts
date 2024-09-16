/* Important:
- This file cannot import config.ts, because config.ts imports utils.ts.
*/


// Imports
import _ from 'lodash';
import Joi from 'joi';


// Local imports
import { createLogger } from '#root/lib/logging';
import utils from '#lib/utils';


// Logging
const log2 = console.log;
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
  if (! utils.isNumericString(trimmedValue)) {
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
  if (! utils.isString(value)) {
    throw new Error(`Received non-string for ${name}: ${value}`);
  }
  return value;
}


function exactlyOneOfTwoOptions(args) {
  let {optionNames, ...options} = args;
  let msg = `Exactly one of the arguments [${optionNames.join(', ')}] is required.`;
  let n = optionNames.length;
  if (n !== 2) {
      throw Error('This function supports exactly two option names.');
  }
  let name1 = options[optionNames[0]];
  let name2 = options[optionNames[1]];
  if ( (name1 && name2) ||
       (! name1 && ! name2) ) {
      throw Error(msg);
  }
}


export const validate ={
  logLevel,
  itemInList,
  numericString,
  number,
  string,
  exactlyOneOfTwoOptions,
}


export default validate;
