import * as ace from '../..';
import * as ncm from '@nestjs/common';
import winston from 'winston';
import 'winston-daily-rotate-file';

export class LoggerService implements ncm.LoggerService {
  private readonly _logger: winston.Logger;

  constructor() {
    this._logger = createLogger();
  }

  debug(message: string) {
    this._logger.debug(message);
  }
  
  error(message: string, trace?: string) {
    this._logger.error(message, trace);
  }

  log(message: string) {
    this._logger.info(message);
  }
  
  verbose(message: string) {
    this._logger.verbose(message);
  }

  warn(message: string) {
    this._logger.warn(message);
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
        dirname: ace.settings.logger,
        filename: '%DATE%.log',
        format: winston.format.combine(winston.format.timestamp(), winston.format.printf(x => `[${x.timestamp}] ${x.level.toUpperCase().padEnd(7)} ${x.message}`)),
        level: 'debug',
        maxFiles: 5,
        maxSize: '20MB'
      })
    ]
  });
}
