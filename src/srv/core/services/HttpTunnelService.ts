import * as app from '..';
import * as sks from 'socks';
import dns from 'dns';
import net from 'net';
import tls from 'tls';
import util from 'util';

export class HttpTunnelService {
  connect(client: URL, clientSocket: net.Socket) {
    if (app.settings.core.proxyServer) {
      this.connectTo(client, clientSocket, new URL(app.settings.core.proxyServer));
    } else {
      this.noProxy(client, clientSocket);
    }
  }

  private connectTo(client: URL, clientSocket: net.Socket, server: URL) {
    if (server.protocol === 'http:') {
      this.httpProxy(client, clientSocket, server);
    } else if (server.protocol === 'https:') {
      this.httpsProxy(client, clientSocket, server);
    } else if (server.protocol === 'socks4:') {
      this.socksProxyAsync(client, clientSocket, server, true).catch(() => clientSocket.destroy());
    } else if (server.protocol === 'socks5:' || server.protocol === 'socks:') {
      this.socksProxyAsync(client, clientSocket, server, false).catch(() => clientSocket.destroy());
    } else {
      this.noProxy(client, clientSocket);
    }
  }

  private httpProxy(client: URL, clientSocket: net.Socket, server: URL) {
    const serverPort = Number(server.port ?? 80);
    const serverSocket = net.connect(serverPort, String(server.hostname));
    const serverTunnel = tunnel(clientSocket, serverSocket);
    serverSocket.on('connect', () => serverSocket.write(connectHeader(client, server), serverTunnel));
  }

  private httpsProxy(client: URL, clientSocket: net.Socket, server: URL) {
    const serverPort = Number(server.port ?? 443);
    const serverSocket = tls.connect(serverPort, String(server.hostname));
    const serverTunnel = tunnel(clientSocket, serverSocket);
    serverSocket.on('secureConnect', () => serverSocket.write(connectHeader(client, server), serverTunnel));
  }
  
  private noProxy(client: URL, clientSocket: net.Socket) {
    const serverPort = Number(client.port ?? 80);
    const serverSocket = net.connect(serverPort, String(client.hostname));
    const serverTunnel = tunnel(clientSocket, serverSocket);
    serverSocket.on('connect', () => clientSocket.write(statusHeader(200, 'OK'), serverTunnel));
  } 

  private async socksProxyAsync(client: URL, clientSocket: net.Socket, server: URL, socks4: boolean) {
    // Initialize the destination.
    const destination: sks.SocksRemoteHost = {host: String(client.hostname), port: Number(client.port ?? 80)};
    const proxy: sks.SocksProxy = {host: String(server.hostname), port: Number(server.port ?? 1080), type: socks4 ? 4 :5};
    
    // Initialize the options.
    if (server.username) [proxy.userId, proxy.password] = [server.username, server.password];
    if (socks4) destination.host = (await util.promisify(dns.lookup)(destination.host)).address;

    // Initialize the tunnel.
    const serverInfo = await sks.SocksClient.createConnection({command: 'connect', destination, proxy});
    const serverSocket = serverInfo.socket;
    const serverTunnel = tunnel(clientSocket, serverSocket);
    clientSocket.write(statusHeader(200, 'OK'), serverTunnel);
  }
}

function connectHeader(client: URL, server: URL) {
  if (server.username) {
    const auth = Buffer.from(`${server.username}:${server.password}`).toString('base64');
    return [`CONNECT ${client.host} HTTP/1.1`, `Proxy-Authorization: Basic ${auth}`, '', ''].join('\r\n');
  } else {
    return [`CONNECT ${client.host} HTTP/1.1`, '', ''].join('\r\n');
  }
}

function statusHeader(statusCode: number, statusText: string) {
  return [`HTTP/1.1 ${statusCode} ${statusText}`, '', ''] .join('\r\n');
}

function tunnel(clientSocket: net.Socket, serverSocket: net.Socket) {
  clientSocket.on('error', () => serverSocket.destroy());
  clientSocket.on('end', () => serverSocket.destroy());
  serverSocket.on('error', () => clientSocket.destroy());
  serverSocket.on('end', () => clientSocket.destroy());
  return () => clientSocket.pipe(serverSocket) && serverSocket.pipe(clientSocket);
}
