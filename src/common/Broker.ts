import * as app from '..';
import http from 'http';
import net from 'net';
import url from 'url';
import stream from 'stream';
import tls from 'tls';

export class Broker {
  private readonly _http: http.Server;
  private readonly _settings: url.UrlWithStringQuery;
  
  private constructor(settings: string) {
    this._http = http.createServer();
    this._settings = url.parse(settings);
  }

  static createAsync(settings: string) {
    if (!settings) return;
    return new Broker(settings)._startAsync();
  }

  get address() {
    const result = this._http.address();
    if (typeof result === 'string') {
      return result;
    } else if (result) {
      return `http://${result.address}:${result.port}/`;
    } else {
      throw new Error();
    }
  }

  async disposeAsync() {
    const future = new app.Future<void>();
    this._http.close(() => future.resolve());
    return await future.getAsync();
  }

  private _forwardHttp(req: http.IncomingMessage, clientSocket: stream.Duplex) {
    // Initialize the connection.
    const port = Number(this._settings.port) || 80;
    const serverSocket = net.connect(port, this._settings.hostname || '');

    // Initialize the handlers.
    clientSocket.on('error', () => serverSocket.end());
    clientSocket.on('end', () => serverSocket.end());
    serverSocket.on('error', () => clientSocket.end());
    serverSocket.on('end', () => clientSocket.end());

    // Initialize the socket.
    serverSocket.on('connect', () => {
      serverSocket.write(this._makeConnectHeader(req), () => {
        clientSocket.pipe(serverSocket);
        serverSocket.pipe(clientSocket);
      });
    });
  }

  private _forwardHttps(req: http.IncomingMessage, clientSocket: stream.Duplex) {
    // Initialize the connection.
    const port = Number(this._settings.port) || 443;
    const serverSocket = tls.connect(port, this._settings.hostname || '');

    // Initialize the handlers.
    clientSocket.on('error', () => serverSocket.end());
    clientSocket.on('end', () => serverSocket.end());
    serverSocket.on('error', () => clientSocket.end());
    serverSocket.on('end', () => clientSocket.end());

    // Initialize the socket.
    serverSocket.on('secureConnect', () => {
      serverSocket.write(this._makeConnectHeader(req), () => {
        clientSocket.pipe(serverSocket);
        serverSocket.pipe(clientSocket);
      });
    });
  }

  private _makeConnectHeader(req: http.IncomingMessage) {
    const lines = [`CONNECT ${req.url} HTTP/1.1`];
    if (this._settings.auth) lines.push(`Proxy-Authorization: Basic ${Buffer.from(this._settings.auth).toString('base64')}`);
    return lines.concat(['', '']).join('\r\n');
  }

  private _onConnect(req: http.IncomingMessage, socket: stream.Duplex) {
    switch (this._settings.protocol) {
      case 'http:':
        this._forwardHttp(req, socket);
        break;
      case 'https:':
        this._forwardHttps(req, socket);
        break;
      default:
        socket.end();
        break;
    }
  }

  private async _startAsync() {
    const future = new app.Future<Broker>();
    this._http.on('connect', this._onConnect.bind(this));
    this._http.listen(0, '127.0.0.1', () => future.resolve(this));
    return await future.getAsync();
  }
}
