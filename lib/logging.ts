// Imports
import winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");

// Local imports
import validate from "#root/lib/validate";
import _ = require("lodash");
import utils from "./utils";

// Setup
const { combine, printf, colorize, align, json } = winston.format;

// Classes

class Logger {
  logger: winston.Logger;

  constructor({
    fileName,
    logLevel,
    logTimestamp,
    logToFile,
  }: {
    fileName: string;
    logLevel: string;
    logTimestamp: boolean;
    logToFile: boolean;
  }) {
    if (fileName) {
      fileName = fileName.replace(process.cwd() + "/", "");
    }
    const logFormatConsole = (metadata: any) => {
      let { level, message, timestamp } = metadata;
      if (metadata.messageOnly) {
        // Return only the message without the log level and additional info
        message = message.replace(/\x1B\[\d+m/g, ""); // Remove color codes from the message
        message = message.trimStart(); // Remove effect of align().
        return message;
      }
      let s = `${level}: ${message}`;
      if (fileName) {
        s = `${fileName}: ` + s;
      }
      if (logTimestamp) {
        s = `${timestamp} ` + s;
      }
      return s;
    };
    // We always include the timestamp in log file output.
    const logFormatFile = (metadata: any) => {
      let { level, message, timestamp } = metadata;
      let s = `${level}: ${message}`;
      if (fileName) {
        s = `${fileName}: ` + s;
      }
      s = `${timestamp} ` + s;
      return s;
    };
    let transports: winston.transport[] = [
      new winston.transports.Console({
        format: combine(
          colorize({ all: true }),
          winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss.SSS",
          }),
          align(),
          printf(logFormatConsole),
        ),
      }),
    ];
    if (logToFile) {
      transports.push(
        new DailyRotateFile({
          dirname: "logs",
          filename: "%DATE%.log",
          datePattern: "YYYY-MM-DD", // Use this pattern to rotate logs every day
          //datePattern: "YYYY-MM-DD-HH", // Use this pattern to rotate logs every hour
          //datePattern: "YYYY-MM-DD-HH-mm", // Use this pattern to rotate logs every minute (useful for testing)
          zippedArchive: false,
          maxSize: "20m", // Maximum log file size (optional)
          maxFiles: "30d", // Keep logs for 30 days (optional)
          format: combine(
            winston.format.timestamp({
              format: "YYYY-MM-DD HH:mm:ss.SSS",
            }),
            align(),
            printf(logFormatFile),
          ),
        }),
      );
    }
    this.logger = winston.createLogger({
      level: logLevel,
      transports,
    });
  }

  setLevel({ logLevel }: { logLevel: string }) {
    validate.logLevel({ logLevel });
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
    let higherLogLevels = "warn error".split(" ");
    if (higherLogLevels.includes(this.logger.level)) {
      console.log(arg);
    }
  }

  debug(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.logger.debug(arg);
  }

  info(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.logger.info(arg);
  }

  warn(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.logger.warn(arg);
  }

  error(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.logger.error(arg);
  }

  deb(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.debug(arg);
  }

  dj(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.deb(JSON.stringify(arg, null, 2));
  }

  log(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.info(arg);
  }

  lj(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.log(JSON.stringify(arg, null, 2));
  }
}

// Functions

function createLogger({
  fileName = "",
  logLevel = "error",
  logTimestamp = false,
  logToFile = false,
} = {}) {
  validate.logLevel({ logLevel });
  const logger = new Logger({
    fileName,
    logLevel: logLevel,
    logTimestamp,
    logToFile,
  });
  const log = logger.log.bind(logger);
  const lj = logger.lj.bind(logger);
  const deb = logger.deb.bind(logger);
  return { logger, log, lj, deb };
}

// Exports

export { Logger, createLogger };
