// Imports
import winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');


// Validate log level
enum LogLevelEnum {
  'error',
  'warn',
  'info',
  'debug',
}
type LogLevel = keyof typeof LogLevelEnum;


function validateLogLevel(logLevel: string): LogLevel {
  if (logLevel in LogLevelEnum) {
    return logLevel as LogLevel;
  }
  throw new Error(`Invalid log level: ${logLevel}`);
}


function isString(myVar: any): boolean {
  return typeof myVar === 'string' || myVar instanceof String;
}


function isObject(myVar: any): boolean {
  return typeof myVar === 'object' && myVar !== null;
}


function jd(obj: any): string {
  return JSON.stringify(obj, null, 2);
}


let log2 = console.log;


interface StackTraceLine {
  functionName: string;
  filePath: string;
  lineNumber: number;
  columnNumber: number;
}


function parseStackTraceLine(stackTraceLine: string): StackTraceLine {
  // https://github.com/felixge/node-stack-trace/blob/master/index.js
  /* Example lines:
  at captureFunctionAndLine (/app/lib/logging.ts:33:19)
  at Logger.info (/app/lib/logging.ts:167:20)
  at processTicksAndRejections (node:internal/process/task_queues:95:5)
  at Object.onceWrapper (node:events:628:28)
  at /Users/admin/Desktop/stuff/WORK_PERSONAL/smart_contracts/contract-toolset/test/UpgradeableCounter.test.ts:159:7
  */
  // Replace multiple spaces with a single space
  stackTraceLine = stackTraceLine.replace(/\s+/g, ' ');
  let sections = stackTraceLine.trim().split(' ');
  let result;
  let functionName;
  let location;
  if (sections.length == 2) {
    location = sections[1];
  } else if (sections.length == 3) {
    functionName = sections[1];
    location = sections[2];
    location = location.slice(1, -1); // Remove parentheses
  } else {
    throw new Error(`Invalid stack trace line: ${stackTraceLine}`);
  }
  let items = location.split(':');
  let filePath = items.slice(0, -2).join(':'); // Collect all but the last two items
  let lineNumber = items[items.length - 2];
  let columnNumber = items[items.length - 1];
  result = {
    functionName,
    filePath,
    lineNumber: parseInt(lineNumber, 10),
    columnNumber: parseInt(columnNumber, 10),
  };
  return result;
}


function captureFunctionAndLine(index: number = 2) {
  try {
    throw new Error();
  } catch (e) {
    let stack = (e as Error).stack!;
    //log2(stack)
    let lines = stack.split('\n').slice(1);
    // Use index = 2 to move up through:
    // - captureFunctionAndLine
    // - Logger.info
    // and arrive at the caller.
    // Logger.log needs to pass in index = 3 so that we move up an extra level.
    if (index > lines.length) {
      index = lines.length - 1;
    }
    let line = lines[index];
    let result = parseStackTraceLine(line);
    return `[${result.functionName} : ${result.lineNumber}]`;
  }
}



class Logger {
  logger: winston.Logger;

  constructor({
    filePath,
    logLevel,
    logTimestamp,
    logToFile,
  }: {
    filePath: string;
    logLevel: LogLevel;
    logTimestamp: boolean;
    logToFile: boolean;
  }) {
    if (filePath) {
      filePath = filePath.replace(process.cwd() + '/', '');
    }
    const logFormatterConsole = (metadata: any) => {
      let { level, message, stack, timestamp } = metadata;
      //log2(metadata);
      // An error object will have a stack property, and we'll use this instead of the message.
      message = stack || message;
      const removeColorCodes = (text: string) => {
        /* eslint-disable no-control-regex */
        return text.replace(/\x1B\[\d+m/g, '');
        /* eslint-enable */
      };
      if (metadata.messageOnly) {
        /*
        - Return only the message without the log level and additional info
        - This allows us to use logger.print instead of console.log.
        - This means that we can use logger.print in the code and it will still log the message to the other transports e.g. a file.
        */
        message = removeColorCodes(message);
        message = message.trim();
        return message;
      }
      // Add spaces to align log levels.
      const n = removeColorCodes(level).length;
      const m = 6;
      const spacing = n < m ? m - n : 0;
      const spaces = ' '.repeat(spacing);
      let s = `${level}${spaces}: `;
      if (filePath) {
        s += `${filePath} `;
      }
      s += `${message}`;
      if (logTimestamp) {
        s = `${timestamp} ` + s;
      }
      return s;
    };
    let transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS',
          }),
          winston.format.printf(logFormatterConsole),
        ),
      }),
    ];
    const logFormatterFile = (metadata: any) => {
      let { level, message, stack, timestamp } = metadata;
      // An error object will have a stack property, and we'll use this instead of the message.
      message = stack || message;
      //log2(metadata);
      let data: {
        timestamp?: any;
        filePath?: any;
        level: any;
        message: any;
        messageOnly?: boolean;
      } = {
        level,
        message,
      };
      if (logTimestamp) {
        data['timestamp'] = timestamp;
      }
      if (filePath) {
        data['filePath'] = filePath;
      }
      if (metadata.messageOnly) {
        data['messageOnly'] = true;
      }
      const replacer = ['timestamp', 'level', 'filePath', 'message', 'messageOnly'];
      return JSON.stringify(data, replacer);
    }
    if (logToFile) {
      // Note: When logging to file, the timestamp is always included.
      transports.push(
        new DailyRotateFile({
          dirname: 'logs',
          filename: '%DATE%.log',
          //datePattern: "YYYY-MM", // Use this pattern to rotate logs every month
          datePattern: 'YYYY-MM-DD', // Use this pattern to rotate logs every day
          //datePattern: "YYYY-MM-DD-HH", // Use this pattern to rotate logs every hour
          //datePattern: "YYYY-MM-DD-HH-mm", // Use this pattern to rotate logs every minute (useful for testing)
          zippedArchive: false,
          maxSize: '20m', // Maximum log file size (optional)
          maxFiles: '30d', // Keep logs for 30 days (optional)
          format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss.SSS',
            }),
            //winston.format.json(), // Use the JSON formatter to write logs in JSON format
            winston.format.printf(logFormatterFile),
          ),
        }),
      );
    }
    this.logger = winston.createLogger({
      level: logLevel as string,
      format: winston.format.errors({ stack: true }),
      transports,
    });
  }

  setLevel({ logLevel }: { logLevel: string }) {
    validateLogLevel(logLevel);
    this.logger.transports.forEach((t) => (t.level = logLevel));
    this.logger.level = logLevel;
  }

  print(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    let metadata = { messageOnly: true };
    this.logger.info(arg, metadata);
    // At higher log levels, nothing will have been logged.
    // But: We still need console output for the user to see.
    // So: We log to the console here.
    let higherLogLevels = 'warn error'.split(' ');
    if (higherLogLevels.includes(this.logger.level)) {
      console.log(arg);
    }
  }

  stringifyMessageAndPrefixLocation(message: any, location: string) {
    if (! isString(message)) {
      message = JSON.stringify(message);
    }
    message = `${location} ${message}`;
    return message;
  }

  debug(message: any, meta?: { index: number}) {
    let index = 2;
    if (meta) {
      index = meta.index;
    }
    let location = captureFunctionAndLine(index);
    message = this.stringifyMessageAndPrefixLocation(message, location);
    this.logger.debug(message);
  }

  info(message: any, meta?: { isMeta: boolean, index: number}) {
    let index = 2;
    if (meta) {
      index = meta.index;
    }
    const location = captureFunctionAndLine(index);
    message = this.stringifyMessageAndPrefixLocation(message, location);
    this.logger.info(message);
  }

  warn(message: any) {
    const index = 2;
    const location = captureFunctionAndLine(index);
    message = this.stringifyMessageAndPrefixLocation(message, location);
    this.logger.warn(message);
  }

  error(message: any) {
    const index = 2;
    const location = captureFunctionAndLine(index);
    message = this.stringifyMessageAndPrefixLocation(message, location);
    this.logger.error(message);
  }

  deb(message: any, meta?: { isMeta: boolean, index: number}) {
    if (meta && ! meta.isMeta) {
      throw new Error(`Invalid meta: ${meta}`);
    }
    if (! meta) {
      meta = { isMeta: true, index: 3 };
    }
    this.debug(message, meta);
  }

  log(message: any, meta?: { isMeta: boolean, index: number}) {
    if (meta && ! meta.isMeta) {
      throw new Error(`Invalid meta: ${meta}`);
    }
    if (! meta) {
      meta = { isMeta: true, index: 3 };
    }
    this.info(message, meta);
  }

  lj(message: any, meta?: { isMeta: boolean, index: number}) {
    if (meta && ! meta.isMeta) {
      throw new Error(`Invalid meta: ${meta}`);
    }
    if (! meta) {
      meta = { isMeta: true, index: 4 };
    }
    this.log(jd(message), meta);
  }

  get logLevels() {
    // Return an array.
    return Object.values(LogLevelEnum).filter(value => typeof value === 'string')
  }

  get logLevelsString() {
    return this.logLevels.join(', ');
  }

}


function createLogger({
  filePath = '',
  logLevel = 'info',
  logTimestamp = false,
  logToFile = false,
} = {}) {
  const logger = new Logger({
    filePath,
    logLevel: validateLogLevel(logLevel),
    logTimestamp,
    logToFile,
  });
  const warn = logger.warn.bind(logger);
  const deb = logger.deb.bind(logger);
  const log = logger.log.bind(logger);
  const lj = logger.lj.bind(logger);
  return { logger, warn, deb, log, lj };
}


export { Logger, createLogger };
