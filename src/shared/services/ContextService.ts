import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import * as npe from '@nestjs/platform-express';
import http from 'http';

@ncm.Injectable()
export class ContextService {
  private readonly adapterHost: ncr.HttpAdapterHost;

  constructor(adapterHost: ncr.HttpAdapterHost) {
    this.adapterHost = adapterHost;
  }

  get serverIp() {
    return '127.0.0.1';
  }

  get serverPort() {
    const adapter = this.adapterHost.httpAdapter as npe.ExpressAdapter;
    const server = adapter.getHttpServer() as http.Server;
    const address = server.address();
    return address && typeof address === 'object' ? address.port : 0;
  }

  get serverUrl() {
    const serverIp = this.serverIp;
    const serverPort = this.serverPort;
    return `http://${serverIp}:${serverPort}`;
  }
}
