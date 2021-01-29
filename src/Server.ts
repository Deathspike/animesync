import * as app from '.';
import * as ash from './shared';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import * as npe from '@nestjs/platform-express';
import * as nsg from '@nestjs/swagger';

export class Server extends app.api.ServerApi {
  private readonly server: npe.NestExpressApplication;

  private constructor(server: npe.NestExpressApplication) {
    super(app.settings.serverUrl);
    this.server = server;
    this.server.disable('x-powered-by');
    this.server.useLogger(this.logger);
  }

  static async usingAsync(handlerAsync: (server: Server) => Promise<void>, module?: ncm.NestModule) {
    const server = await ncr.NestFactory.create<npe.NestExpressApplication>(module ?? app.ServerModule, {bodyParser: false, logger: false});
    attachDocumentation(server);
    attachRequestValidation(server);
    await server.listen(app.settings.serverPort);
    await handlerAsync(new Server(server)).finally(() => server.close());
  }

  get browser() {
    return this.server.get(ash.BrowserService);
  }
  
  get logger() {
    return this.server.get(ash.LoggerService);
  }
}

function attachDocumentation(serverApp: ncm.INestApplication) {
  nsg.SwaggerModule.setup('api', serverApp, nsg.SwaggerModule.createDocument(serverApp, new nsg.DocumentBuilder()
    .setDescription(require('../package').description)
    .setTitle(require('../package').name)
    .setVersion(require('../package').version)
    .build()));
}

function attachRequestValidation(serverApp: ncm.INestApplication) {
  serverApp.useGlobalPipes(new ncm.ValidationPipe({
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true
  }));
}
