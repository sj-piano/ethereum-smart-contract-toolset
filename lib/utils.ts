/* Important:
- This file cannot import config.ts, because config.ts imports utils.ts.
*/

function getEnvVar({ name }: { name: string }) {
  let value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable "${name}" is not defined`);
  }
  return { [name]: value };
}

function getMethods(obj: any): string[] {
  const properties = new Set<string>();
  let currentObj = obj;
  do {
    Object.getOwnPropertyNames(currentObj).forEach((item) =>
      properties.add(item),
    );
  } while ((currentObj = Object.getPrototypeOf(currentObj)));
  let methods = [...properties].filter(
    (item) => typeof obj[item] === "function",
  );
  return methods.sort();
}

function isNumericString(value: string): boolean {
  value = value.trim();
  return !isNaN(value as any) && !isNaN(parseFloat(value));
}

function validateNumericString(options: {
  name: string;
  value: string;
}): string {
  const { name, value } = options;
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    throw new Error(`Received empty or whitespace-only string for ${name}`);
  }
  if (!isNumericString(trimmedValue)) {
    let msg = `Received non-numeric string for ${name}: ${trimmedValue}`;
    msg +=
      `, !isNaN(value)=${!isNaN(trimmedValue as any)}, ` +
      `!isNaN(parseFloat(value))=${!isNaN(parseFloat(trimmedValue))}`;
    throw new Error(msg);
  }
  return trimmedValue;
}

const sleep = ({ seconds }: { seconds: number }) =>
  new Promise((r) => setTimeout(r, seconds * 1000));

function jd(obj: any): string {
  return JSON.stringify(obj, null, 2);
}

export {
  getEnvVar,
  getMethods,
  isNumericString,
  validateNumericString,
  sleep,
  jd,
};

export default {
  getEnvVar,
  getMethods,
  isNumericString,
  validateNumericString,
  sleep,
  jd,
};
