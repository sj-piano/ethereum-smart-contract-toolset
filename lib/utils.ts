/* Important:
- This file cannot import config.ts, because config.ts imports utils.ts.
*/


function getMethods(obj: any): string[] {
  const properties = new Set<string>();
  let currentObj = obj;
  do {
    Object.getOwnPropertyNames(currentObj).forEach((item) => properties.add(item));
  } while ((currentObj = Object.getPrototypeOf(currentObj)));
  let methods = [...properties].filter((item) => typeof obj[item] === 'function');
  return methods.sort();
}


function isBigInt(value: any): boolean {
  return typeof value === 'bigint';
}


// Move to string.ts
function isString(value: any): boolean {
  return typeof value === 'string' || value instanceof String;
}


function isNumber(value: any): boolean {
  return typeof value === 'number' && isFinite(value);
}


// Move to string.ts
function isNumericString(value: string): boolean {
  value = value.trim();
  return !isNaN(value as any) && !isNaN(parseFloat(value));
}


const sleep = ({ seconds }: { seconds: number }) =>
  new Promise((r) => setTimeout(r, seconds * 1000));


function jd(obj: any): string {
  return JSON.stringify(obj, null, 2);
}


// Can optionally provide the object name for better error messages.
function getValueOrThrow<T, K extends keyof T>(obj: T, key: K, varName?: string): T[K] {
  const value = obj[key];
  const location = varName ? ` in object "${varName}"` : '';
  let msg = `Value for key "${String(key)}"${location} is undefined`;
  if (value === undefined) {
      throw new Error(msg);
  }
  return value;
}


export const utils = {
  getMethods,
  isBigInt,
  isString,
  isNumber,
  isNumericString,
  sleep,
  jd,
  getValueOrThrow,
};


export default utils;

