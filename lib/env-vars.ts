// Utilities for working with shell variables.

import { createLogger } from "#lib/logging";
import { env } from "process";

// Logging
const log2 = console.log;
const { logger, log, deb } = createLogger();

function getEnvVar(name: string, envFileName?: string): string {
  const value = process.env[name];
  //log(`getEnvVar(${name}) = ${value}`);
  let location = envFileName ? ` in ${envFileName}` : '';
  if (value === undefined) {
    let msg = `Environment variable ${name} is not defined${location}.`;
    stop(msg);
    return 'failure'
  }
  if (value === '') {
    let msg = `Environment variable ${name} is empty${location}.`;
    stop(msg);
    return 'failure'
  }
  if (value === "'") {
    let msg = `Environment variable ${name} is only a single quote${location}.`;
    stop(msg);
    return 'failure'
  }
  if (value === '"') {
    let msg = `Environment variable ${name} is only a double quote${location}.`;
    stop(msg);
    return 'failure'
  }
  return value;
}

function getEnvVars(names: string[], envFileName?: string): Record<string, string> {
  const envVariables: Record<string, string> = {};
  for (const name of names) {
    envVariables[name] = getEnvVar(name, envFileName);
  }
  return envVariables;
}

function stop(msg) {
  if (msg) {
    log2('');
    logger.error(msg);
    log2('');
  }
  process.exit();
}

export { getEnvVar, getEnvVars };
