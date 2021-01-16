import * as app from '.';
import * as api from '@nestjs/common';
import * as swg from '@nestjs/swagger';
import {NestExpressApplication} from '@nestjs/platform-express';
import {NestFactory} from '@nestjs/core';
import {ServerModule} from './ServerModule';

export class Server extends app.api.ServerApi {
  private readonly _browserService: app.shared.BrowserService;
  private readonly _loggerService: app.shared.LoggerService;
  private readonly _server: NestExpressApplication;

  private constructor(server: NestExpressApplication) {
    super(app.settings.serverUrl);
    this._browserService = server.get(app.shared.BrowserService);
    this._loggerService = server.get(app.shared.LoggerService);
    this._server = server;
    this._server.disable('x-powered-by');
    this._server.useLogger(this._loggerService);
  }

  static async createAsync() {
    const server = await NestFactory.create<NestExpressApplication>(ServerModule, {bodyParser: false, logger: false});
    attachDocumentation(server);
    attachRequestValidation(server);
    await server.listen(app.settings.serverPort);
    return new Server(server);
  }

  static async usingAsync(handlerAsync: (server: Server) => Promise<void>) {
    const server = await this.createAsync();
    await handlerAsync(server).finally(() => server.disposeAsync());
  }

  get browser() {
    return this._browserService;
  }

  get logger() {
    return this._loggerService;
  }

  async disposeAsync() {
    await this._server.close();
  }
}

function attachDocumentation(server: api.INestApplication) {
  swg.SwaggerModule.setup('api', server, swg.SwaggerModule.createDocument(server, new swg.DocumentBuilder()
    .setDescription(require('../package').description)
    .setTitle(require('../package').name)
    .setVersion(require('../package').version)
    .build()));
}

function attachRequestValidation(server: api.INestApplication) {
  server.useGlobalPipes(new api.ValidationPipe({
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true
  }));
}
