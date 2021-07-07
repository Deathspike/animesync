import * as app from '.';
import * as ash from './shared';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import * as npe from '@nestjs/platform-express';
import * as nsg from '@nestjs/swagger';

export class Server extends app.api.ServerApi {
  private readonly server: npe.NestExpressApplication;

  private constructor(server: npe.NestExpressApplication, serverUrl: string) {
    super(serverUrl);
    this.server = server;
    this.server.disable('x-powered-by');
    this.server.useLogger(this.logger);
    this.traceVersion();
  }

  static async usingAsync<T>(handlerAsync: (server: Server) => Promise<T>, serverPort?: number) {
    const server = await ncr.NestFactory.create<npe.NestExpressApplication>(app.ServerModule, {bodyParser: false, logger: false});
    attachDocumentation(server);
    attachErrorFilter(server);
    attachRequestValidation(server);
    await server.listen(serverPort ?? 0);
    return await handlerAsync(new Server(server, await server.getUrl())).finally(() => server.close());
  }

  get browser() {
    return this.server.get(ash.BrowserService);
  }

  get context() {
    return this.server.get(ash.ContextService);
  }
  
  get logger() {
    return this.server.get(ash.LoggerService);
  }

  private traceVersion() {
    const name = require('../package').name;
    const version = require('../package').version;
    this.logger.debug(`Running ${name} (${version})`);
  }
}

function attachDocumentation(server: ncm.INestApplication) {
  nsg.SwaggerModule.setup('api', server, nsg.SwaggerModule.createDocument(server, new nsg.DocumentBuilder()
    .setDescription(require('../package').description)
    .setTitle(require('../package').name)
    .setVersion(require('../package').version)
    .build()));
}

function attachErrorFilter(server: ncm.INestApplication) {
  const logger = server.get(ash.LoggerService);
  server.useGlobalFilters(new app.ServerError(logger));
}

function attachRequestValidation(server: ncm.INestApplication) {
  server.useGlobalPipes(new ncm.ValidationPipe({
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true
  }));
}
