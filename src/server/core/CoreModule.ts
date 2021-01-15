import * as api from '@nestjs/common';
import * as app from '.';
import {HttpAdapterHost} from '@nestjs/core';
import http from 'http';
import net from 'net';

@api.Module({
  controllers: [app.CoreController],
  providers: [app.AgentService, app.HttpTunnelService]})
export class CoreModule implements api.OnApplicationBootstrap, api.NestModule {
  private readonly _adapterHost: HttpAdapterHost;
  private readonly _tunnelService: app.HttpTunnelService;

  constructor(adapterHost: HttpAdapterHost, tunnelService: app.HttpTunnelService) {
    this._adapterHost = adapterHost;
    this._tunnelService = tunnelService;
  }

  configure(consumer: api.MiddlewareConsumer) {
    consumer.apply(app.HttpProxyMiddleware).forRoutes({path: '*', method: api.RequestMethod.ALL});
  }

  onApplicationBootstrap() {
    const adapter = this._adapterHost.httpAdapter;
    const http = adapter.getHttpServer() as http.Server;
    http.on('connect', this._onConnect.bind(this));
  }

  private _onConnect(request: http.IncomingMessage, socket: net.Socket) {
    if (socket.localAddress === socket.remoteAddress && request.url) {
      const clientSocket = socket;
      const clientUrl = `http://${request.url}`;
      this._tunnelService.connect(clientSocket, clientUrl);
    } else {
      socket.end();
    }
  }
}
