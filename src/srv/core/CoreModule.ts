import * as app from '.';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import * as nss from '@nestjs/serve-static';
import http from 'http';
import net from 'net';
import path from 'path';
const rootPath = path.join(__dirname, '../../../public');

@ncm.Module({
  imports: [nss.ServeStaticModule.forRoot({rootPath})],
  providers: [app.HttpTunnelService]})
export class CoreModule implements ncm.OnApplicationBootstrap, ncm.NestModule {
  private readonly adapterHost: ncr.HttpAdapterHost;
  private readonly tunnelService: app.HttpTunnelService;

  constructor(adapterHost: ncr.HttpAdapterHost, tunnelService: app.HttpTunnelService) {
    this.adapterHost = adapterHost;
    this.tunnelService = tunnelService;
  }

  configure(consumer: ncm.MiddlewareConsumer) {
    consumer.apply(app.HttpProxyMiddleware).forRoutes({path: '*', method: ncm.RequestMethod.ALL});
  }

  onApplicationBootstrap() {
    const adapter = this.adapterHost.httpAdapter;
    const http: http.Server = adapter.getHttpServer();
    http.on('connect', this.onConnect.bind(this));
  }

  private onConnect(request: http.IncomingMessage, socket: net.Socket) {
    if (socket.localAddress === socket.remoteAddress && request.url) {
      const client = new URL(`http://${request.url}`);
      const clientSocket = socket;
      this.tunnelService.connect(client, clientSocket);
    } else {
      socket.destroy();
    }
  }
}
