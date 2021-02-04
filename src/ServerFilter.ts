import * as ncm from '@nestjs/common';
import express from 'express';

@ncm.Catch()
export class ServerFilter implements ncm.ExceptionFilter {
  catch(error: Error, host: ncm.ArgumentsHost) {
    const message = error.message;
    const response: express.Response = host.switchToHttp().getResponse();
    const stack = error.stack;
    const statusCode = 500;
    response.status(500).json({statusCode, message, stack});
  }
}
