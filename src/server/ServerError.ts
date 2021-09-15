import * as app from './shared';
import * as ncm from '@nestjs/common';
import express from 'express';

@ncm.Catch()
export class ServerError implements ncm.ExceptionFilter {
  private readonly loggerService: app.LoggerService;

  constructor(loggerService: app.LoggerService) {
    this.loggerService = loggerService;
  }

  catch(error: Error, host: ncm.ArgumentsHost) {
    const request: express.Request = host.switchToHttp().getRequest();
    const response: express.Response = host.switchToHttp().getResponse();
    if (error instanceof app.ValidationError) {
      const message = error.stack ?? error.message;
      const statusCode = 500;
      const value = {...error.data, statusCode, message};
      this.loggerService.debug(app.ResponseLoggerInterceptor.forResponse(request, response, value));
      response.status(statusCode).json(value);
    } else if (error instanceof ncm.HttpException) {
      const message = error.stack ?? error.message;
      const statusCode = error.getStatus();
      const value = {statusCode, message};
      this.loggerService.debug(app.ResponseLoggerInterceptor.forResponse(request, response, value));
      response.status(statusCode).json(value);
    } else {
      const message = error && (error.stack ?? error.message);
      const statusCode = 500;
      const value = {statusCode, message};
      this.loggerService.debug(app.ResponseLoggerInterceptor.forResponse(request, response, value));
      this.loggerService.error(message);
      response.status(statusCode).json(value);
    }
  }
}
