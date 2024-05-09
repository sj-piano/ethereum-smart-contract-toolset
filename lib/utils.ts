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

function isString(value: any): boolean {
  return typeof value === 'string' || value instanceof String;
}

function isNumber(value: any): boolean {
  return typeof value === 'number' && isFinite(value);
}

function isNumericString(value: string): boolean {
  value = value.trim();
  return !isNaN(value as any) && !isNaN(parseFloat(value));
}

const sleep = ({ seconds }: { seconds: number }) =>
  new Promise((r) => setTimeout(r, seconds * 1000));

function jd(obj: any): string {
  return JSON.stringify(obj, null, 2);
}

export { getMethods, isNumericString, sleep, jd };

export default {
  getMethods,
  isBigInt,
  isString,
  isNumber,
  isNumericString,
  sleep,
  jd,
};
