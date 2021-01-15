import * as app from '..';
import * as api from '@nestjs/common';

export class ServerLogger implements api.LoggerService {
  debug(message: string) {
    app.logger.debug(`[Nest] ${message}`);
  }
  
  error(message: string, trace: string) {
    app.logger.error(`[Nest] ${message}`, trace);
  }

  log(message: string) {
    app.logger.debug(`[Nest] ${message}`);
  }
  
  verbose(message: string) {
    app.logger.debug(`[Nest] ${message}`);
  }

  warn(message: string) {
    app.logger.warn(`[Nest] ${message}`);
  }
}
