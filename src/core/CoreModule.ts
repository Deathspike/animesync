import * as app from '.';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import http from 'http';
import net from 'net';

@ncm.Module({
  controllers: [app.CoreController],
  providers: [app.HttpTunnelService]})
export class CoreModule implements ncm.OnApplicationBootstrap, ncm.NestModule {
  private readonly _adapterHost: ncr.HttpAdapterHost;
  private readonly _tunnelService: app.HttpTunnelService;

  constructor(adapterHost: ncr.HttpAdapterHost, tunnelService: app.HttpTunnelService) {
    this._adapterHost = adapterHost;
    this._tunnelService = tunnelService;
  }

  configure(consumer: ncm.MiddlewareConsumer) {
    consumer.apply(app.HttpProxyMiddleware).forRoutes({path: '*', method: ncm.RequestMethod.ALL});
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
      socket.destroy();
    }
  }
}
