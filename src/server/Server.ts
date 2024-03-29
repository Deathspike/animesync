import * as app from './shared';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import * as npe from '@nestjs/platform-express';
import * as nsg from '@nestjs/swagger';
import {ServerError} from './ServerError';
import {ServerModule} from './ServerModule';
const packageData = require('../../package');

export class Server extends app.api.ServerApi {
  private readonly server: npe.NestExpressApplication;

  private constructor(server: npe.NestExpressApplication) {
    super(app.settings.server.url);
    this.server = server;
    this.server.disable('x-powered-by');
    this.logger.debug(`Running ${packageData.name} (${packageData.version})`);
  }

  static async usingAsync<T>(handlerAsync: (server: Server) => Promise<T>) {
    const server = await ncr.NestFactory.create<npe.NestExpressApplication>(ServerModule, {bodyParser: false, logger: false});
    attachDocumentation(server);
    attachErrorFilter(server);
    attachRequestValidation(server);
    await server.listen(app.settings.server.port);
    return await handlerAsync(new Server(server)).finally(() => server.close());
  }

  get browser() {
    return this.server.get(app.BrowserService);
  }

  get logger() {
    return this.server.get(app.LoggerService);
  }
}

function attachDocumentation(server: ncm.INestApplication) {
  nsg.SwaggerModule.setup('api', server, nsg.SwaggerModule.createDocument(server, new nsg.DocumentBuilder()
    .setDescription(packageData.description)
    .setTitle(packageData.name)
    .setVersion(packageData.version)
    .build()));
}

function attachErrorFilter(server: ncm.INestApplication) {
  const logger = server.get(app.LoggerService);
  server.useGlobalFilters(new ServerError(logger));
}

function attachRequestValidation(server: ncm.INestApplication) {
  const options = {forbidNonWhitelisted: true, forbidUnknownValues: true, transform: true}
  server.useGlobalPipes(new ncm.ValidationPipe(options));
}
