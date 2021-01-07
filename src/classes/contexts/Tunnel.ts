import * as app from '../..';
import {SocksClient, SocksProxy, SocksRemoteHost} from 'socks';
import dns from 'dns';
import http from 'http';
import net from 'net';
import url from 'url';
import tls from 'tls';
import util from 'util';

export class Tunnel {
  private readonly _http: http.Server;
  
  constructor(http: http.Server) {
    this._http = http;
    this._http.on('connect', this._onConnect.bind(this));
  }

  connect(clientSocket: net.Socket, clientUrl: string) {
    const client = url.parse(clientUrl);
    const server = url.parse(app.settings.proxyServer);
    if (server.protocol === 'http:') {
      this._httpProxy(client, clientSocket, server);
    } else if (server.protocol === 'https:') {
      this._httpsProxy(client, clientSocket, server);
    } else if (server.protocol === 'socks4:') {
      this._socksProxyAsync(client, clientSocket, server, true).catch(() => clientSocket.end());
    } else if (server.protocol === 'socks5:' || server.protocol === 'socks:') {
      this._socksProxyAsync(client, clientSocket, server, false).catch(() => clientSocket.end());
    } else {
      this._noProxy(client, clientSocket);
    }
  }

  private _httpProxy(client: url.UrlWithStringQuery, clientSocket: net.Socket, server: url.UrlWithStringQuery) {
    const serverPort = Number(server.port ?? 80);
    const serverSocket = net.connect(serverPort, String(server.hostname));
    const serverTunnel = tunnel(clientSocket, serverSocket);
    serverSocket.on('connect', () => serverSocket.write(connectHeader(client, server), serverTunnel));
  }

  private _httpsProxy(client: url.UrlWithStringQuery, clientSocket: net.Socket, server: url.UrlWithStringQuery) {
    const serverPort = Number(server.port ?? 443);
    const serverSocket = tls.connect(serverPort, String(server.hostname));
    const serverTunnel = tunnel(clientSocket, serverSocket);
    serverSocket.on('secureConnect', () => serverSocket.write(connectHeader(client, server), serverTunnel));
  }
  
  private _noProxy(client: url.UrlWithStringQuery, clientSocket: net.Socket) {
    const serverPort = Number(client.port ?? 80);
    const serverSocket = net.connect(serverPort, String(client.hostname));
    const serverTunnel = tunnel(clientSocket, serverSocket);
    serverSocket.on('connect', () => clientSocket.write(statusHeader(200, 'OK'), serverTunnel));
  }

  private async _socksProxyAsync(client: url.UrlWithStringQuery, clientSocket: net.Socket, server: url.UrlWithStringQuery, socks4: boolean) {
    // Initialize the destination.
    const destination: SocksRemoteHost = {host: String(client.hostname), port: Number(client.port ?? 80)};
    const proxy: SocksProxy = {host: String(server.hostname), port: Number(server.port ?? 1080), type: socks4 ? 4 :5};
    
    // Initialize the options.
    if (server.auth) [proxy.userId, proxy.password] = server.auth.split(':', 2);
    if (socks4) destination.host = (await util.promisify(dns.lookup)(destination.host)).address;

    // Initialize the tunnel.
    const serverInfo = await SocksClient.createConnection({command: 'connect', destination, proxy});
    const serverSocket = serverInfo.socket;
    const serverTunnel = tunnel(clientSocket, serverSocket);
    clientSocket.write(statusHeader(200, 'OK'), serverTunnel);
  }

  private _onConnect(request: http.IncomingMessage, socket: net.Socket) {
    if (request.url) {
      const clientSocket = socket;
      const clientUrl = `http://${request.url}`;
      this.connect(clientSocket, clientUrl);
    } else {
      socket.end();
    }
  }
}

function connectHeader(client: url.UrlWithStringQuery, server: url.UrlWithStringQuery) {
  if (server.auth) {
    const auth = Buffer.from(server.auth).toString('base64');
    return [`CONNECT ${client.host} HTTP/1.1`, `Proxy-Authorization: Basic ${auth}`, '', ''].join('\r\n');
  } else {
    return [`CONNECT ${client.host} HTTP/1.1`, '', ''].join('\r\n');
  }
}

function statusHeader(statusCode: number, statusText: string) {
  return [`HTTP/1.1 ${statusCode} ${statusText}`, '', ''] .join('\r\n');
}

function tunnel(clientSocket: net.Socket, serverSocket: net.Socket) {
  clientSocket.on('error', () => clientSocket.end());
  clientSocket.on('end', () => serverSocket.end());
  serverSocket.on('error', () => serverSocket.end());
  serverSocket.on('end', () => clientSocket.end());
  return () => clientSocket.pipe(serverSocket) && serverSocket.pipe(clientSocket);
}
