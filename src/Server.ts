import * as ace from '.';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import * as npe from '@nestjs/platform-express';
import * as nsg from '@nestjs/swagger';

export class Server extends ace.api.ServerApi {
  private readonly _app: npe.NestExpressApplication;

  private constructor(app: npe.NestExpressApplication) {
    super(ace.settings.serverUrl);
    this._app = app;
    this._app.disable('x-powered-by');
    this._app.useLogger(this.logger);
  }

  static async usingAsync(handlerAsync: (server: Server) => Promise<void>) {
    const app = await ncr.NestFactory.create<npe.NestExpressApplication>(ace.ServerModule, {bodyParser: false, logger: false});
    const server = new Server(app);
    attachDocumentation(app);
    attachRequestValidation(app);
    await app.listen(ace.settings.serverPort);
    await handlerAsync(server).finally(() => server.disposeAsync());
  }

  get logger() {
    return this.get(ace.shr.LoggerService);
  }

  get<T>(cls: ncm.Type<T>) {
    return this._app.get(cls);
  }

  async disposeAsync() {
    await this._app.close();
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
