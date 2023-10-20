// Utilities for working with shell variables.

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not defined.`);
  }
  return value;
}

function getEnvVars(names: string[]): Record<string, string> {
  const envVariables: Record<string, string> = {};
  for (const name of names) {
    envVariables[name] = getEnvVar(name);
  }
  return envVariables;
}


export { getEnvVar, getEnvVars };
