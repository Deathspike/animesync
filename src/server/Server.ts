import * as app from '..';
import * as api from '@nestjs/common';
import * as swg from '@nestjs/swagger';
import {NestExpressApplication} from '@nestjs/platform-express';
import {NestFactory} from '@nestjs/core';
import {ServerLogger} from './ServerLogger';
import {ServerModule} from './ServerModule';

export class Server {
  private readonly _server: NestExpressApplication;

  private constructor(server: NestExpressApplication) {
    this._server = server;
    this._server.disable('x-powered-by');
  }

  static async createAsync() {
    const logger = new ServerLogger();
    const server = new Server(await NestFactory.create(ServerModule, {bodyParser: false, logger}));
    await server.startAsync();
    return server;
  }

  static async usingAsync(handlerAsync: (api: app.api.ServerApi) => Promise<void>) {
    const api = new app.api.ServerApi(app.settings.serverUrl);
    const server = await this.createAsync();
    await handlerAsync(api).finally(() => server.disposeAsync());
  }

  async disposeAsync() {
    await this._server.close();
  }

  async startAsync() {
    this._attachDocumentation();
    this._attachRequestValidation();
    await this._server.listen(app.settings.serverPort);
  }

  private _attachDocumentation() {
    swg.SwaggerModule.setup('api', this._server, swg.SwaggerModule.createDocument(this._server, new swg.DocumentBuilder()
      .setDescription(require('../../package').description)
      .setTitle(require('../../package').name)
      .setVersion(require('../../package').version)
      .build()));
  }

  private _attachRequestValidation() {
    this._server.useGlobalPipes(new api.ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true
    }));
  }
}
