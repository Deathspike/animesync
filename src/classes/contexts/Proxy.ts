import * as app from '../..';
import http from 'http';
import net from 'net';
import url from 'url';
import tls from 'tls';

export class Proxy {
  private readonly _http: http.Server;
  
  constructor(http: http.Server) {
    this._http = http;
    this._http.on('connect', this._onConnect.bind(this));
  }

  connect(clientSocket: net.Socket, clientUrl: string) {
    const server = url.parse(app.settings.proxyServer);
    if (server.protocol === 'http:') {
      this._httpProxy(clientSocket, clientUrl, server);
    } else if (server.protocol === 'https:') {
      this._httpsProxy(clientSocket, clientUrl, server);
    } else {
      this._noProxy(clientSocket, clientUrl);
    }
  }

  private _httpProxy(clientSocket: net.Socket, clientUrl: string, server: url.UrlWithStringQuery) {
    // Initialize the connection.
    const serverPort = Number(server.port) || 80;
    const serverSocket = net.connect(serverPort, server.hostname || '');

    // Initialize the connection handlers.
    clientSocket.on('error', () => serverSocket.end());
    clientSocket.on('end', () => serverSocket.end());
    clientSocket.on('timeout', () => clientSocket.end());
    serverSocket.on('error', () => clientSocket.end());
    serverSocket.on('end', () => clientSocket.end());
    serverSocket.on('timeout', () => serverSocket.end());

    // Initialize the socket timeouts.
    clientSocket.setTimeout(app.settings.brokerTimeout);
    serverSocket.setTimeout(app.settings.brokerTimeout);

    // Initialize the socket.
    serverSocket.on('connect', () => {
      serverSocket.write(connectHeader(clientUrl, server), () => {
        clientSocket.pipe(serverSocket);
        serverSocket.pipe(clientSocket);
      });
    });
  }

  private _httpsProxy(clientSocket: net.Socket, clientUrl: string, server: url.UrlWithStringQuery) {
    // Initialize the connection.
    const serverPort = Number(server.port) || 443;
    const serverSocket = tls.connect(serverPort, server.hostname || '');
    
    // Initialize the connection handlers.
    clientSocket.on('error', () => serverSocket.end());
    clientSocket.on('end', () => serverSocket.end());
    clientSocket.on('timeout', () => clientSocket.end());
    serverSocket.on('error', () => clientSocket.end());
    serverSocket.on('end', () => clientSocket.end());
    serverSocket.on('timeout', () => serverSocket.end());

    // Initialize the socket timeouts.
    clientSocket.setTimeout(app.settings.brokerTimeout);
    serverSocket.setTimeout(app.settings.brokerTimeout);

    // Initialize the socket.
    serverSocket.on('secureConnect', () => {
      serverSocket.write(connectHeader(clientUrl, server), () => {
        clientSocket.pipe(serverSocket);
        serverSocket.pipe(clientSocket);
      });
    });
  }
  
  private _noProxy(clientSocket: net.Socket, clientUrl: string) {
    // Initialize the connection.
    const server = url.parse(`http://${clientUrl}`);
    const serverPort = Number(server.port) || 80;
    const serverSocket = net.connect(serverPort, server.hostname || '');

    // Initialize the connection handlers.
    clientSocket.on('error', () => clientSocket.end());
    clientSocket.on('end', () => serverSocket.end());
    serverSocket.on('error', () => serverSocket.end());
    serverSocket.on('end', () => clientSocket.end());

    // Initialize the socket timeouts.
    clientSocket.setTimeout(app.settings.brokerTimeout);
    serverSocket.setTimeout(app.settings.brokerTimeout);

    // Initialize the socket.
    serverSocket.on('connect', () => {
      clientSocket.write(statusHeader(200, 'OK'), () => {
        clientSocket.pipe(serverSocket);
        serverSocket.pipe(clientSocket);
      });
    });
  }

  private _onConnect(request: http.IncomingMessage, socket: net.Socket) {
    if (request.url) {
      const clientSocket = socket;
      const clientUrl = request.url;
      this.connect(clientSocket, clientUrl);
    } else {
      socket.end();
    }
  }
}

function connectHeader(clientUrl: string, server: url.UrlWithStringQuery) {
  if (server.auth) {
    const auth = Buffer.from(server.auth).toString('base64');
    return [`CONNECT ${clientUrl} HTTP/1.1`, `Proxy-Authorization: Basic ${auth}`, '', ''].join('\r\n');
  } else {
    return [`CONNECT ${clientUrl} HTTP/1.1`, '', ''].join('\r\n');
  }
}

function statusHeader(statusCode: number, statusText: string) {
  return [`HTTP/1.1 ${statusCode} ${statusText}`, '', ''] .join('\r\n');
}
