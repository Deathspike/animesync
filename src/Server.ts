import * as ace from '.';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import * as npe from '@nestjs/platform-express';
import * as nsg from '@nestjs/swagger';

export class Server extends ace.api.ServerApi {
  private readonly _server: npe.NestExpressApplication;

  private constructor(server: npe.NestExpressApplication) {
    super(ace.settings.serverUrl);
    this._server = server;
    this._server.disable('x-powered-by');
    this._server.useLogger(this.get(ace.shr.LoggerService));
  }

  static async createAsync() {
    const server = await ncr.NestFactory.create<npe.NestExpressApplication>(ace.ServerModule, {bodyParser: false, logger: false});
    attachDocumentation(server);
    attachRequestValidation(server);
    await server.listen(ace.settings.serverPort);
    return new Server(server);
  }

  static async usingAsync(handlerAsync: (server: Server) => Promise<void>) {
    const server = await this.createAsync();
    await handlerAsync(server).finally(() => server.disposeAsync());
  }

  get logger() {
    return this.get(ace.shr.LoggerService);
  }

  get<T>(cls: ncm.Type<T>) {
    return this._server.get(cls);
  }

  async disposeAsync() {
    await this._server.close();
  }
}

function attachDocumentation(server: ncm.INestApplication) {
  nsg.SwaggerModule.setup('api', server, nsg.SwaggerModule.createDocument(server, new nsg.DocumentBuilder()
    .setDescription(require('../package').description)
    .setTitle(require('../package').name)
    .setVersion(require('../package').version)
    .build()));
}

function attachRequestValidation(server: ncm.INestApplication) {
  server.useGlobalPipes(new ncm.ValidationPipe({
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true
  }));
}
