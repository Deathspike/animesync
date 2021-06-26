import * as app from '..';
import * as ncm from '@nestjs/common';
import winston from 'winston';
import 'winston-daily-rotate-file';

export class LoggerService implements ncm.LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = createLogger();
  }

  debug(value: string) {
    this.logger.debug(extract(value));
  }
  
  error(value: Error | string, trace?: string) {
    this.logger.error(extract(value, trace));
  }

  info(value: string) {
    this.logger.info(extract(value));
  }

  log(value: string) {
    this.logger.debug(extract(value));
  }
  
  verbose(value: string) {
    this.logger.debug(extract(value));
  }

  warn(value: string) {
    this.logger.debug(extract(value));
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
        dirname: app.settings.path.logger,
        filename: '%DATE%.log',
        format: winston.format.combine(winston.format.timestamp(), winston.format.printf(x => `[${x.timestamp}] ${x.level.toUpperCase().padEnd(5)} ${x.message}`)),
        level: 'debug',
        maxFiles: 5,
        maxSize: '20MB'
      })
    ]
  });
}

function extract(value: any, trace?: any) {
  return value instanceof Error
    ? value.stack ?? value.message
    : trace ?? value;
}
