import * as app from '..';
import * as ncm from '@nestjs/common';
import winston from 'winston';
import 'winston-daily-rotate-file';

export class LoggerService implements ncm.LoggerService {
  private readonly _logger: winston.Logger;

  constructor() {
    this._logger = createLogger();
  }

  debug(value: string) {
    this._logger.debug(value);
  }
  
  error(value: Error | string, trace?: string) {
    if (value instanceof Error) {
      this._logger.error(formatError(value.stack ?? value.message));
    } else if (trace) {
      this._logger.error(formatError(trace));
    } else {
      this._logger.error(formatError(value));
    }
  }

  info(value: string) {
    this._logger.info(value);
  }

  log(value: string) {
    this._logger.debug(value);
  }
  
  verbose(value: string) {
    this._logger.debug(value);
  }

  warn(value: string) {
    this._logger.debug(value);
  }
}

function createLogger() {
  return winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.printf(x => x.message),
        level: 'info'
      }),
      new winston.transports.DailyRotateFile({
        dirname: app.settings.logger,
        filename: '%DATE%.log',
        format: winston.format.combine(winston.format.timestamp(), winston.format.printf(x => `[${x.timestamp}] ${x.level.toUpperCase().padEnd(5)} ${x.message}`)),
        level: 'debug',
        maxFiles: 5,
        maxSize: '20MB'
      })
    ]
  });
}

function formatError(value: string) {
  if (/^Error:\s/i.test(value)) {
    return value;
  } else {
    return `Error: ${value}`;
  }
}
