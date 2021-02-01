import * as app from '..';
import * as sks from 'socks';
import dns from 'dns';
import net from 'net';
import url from 'url';
import tls from 'tls';
import util from 'util';

export class HttpTunnelService {
  private nordvpn?: app.NordVpn;

  connect(clientSocket: net.Socket, clientUrl: string) {
    const client = url.parse(clientUrl);
    const server = url.parse(app.settings.proxyServer);
    if (server.protocol === 'nordvpn:') {
      (this.nordvpn ?? (this.nordvpn = new app.NordVpn())).getAsync(server)
        .then(x => this.connectTo(client, clientSocket, x))
        .catch(() => clientSocket.destroy());
    } else {
      this.connectTo(client, clientSocket, server);
    }
  }

  private connectTo(client: url.UrlWithStringQuery, clientSocket: net.Socket, server: url.UrlWithStringQuery) {
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

  private httpProxy(client: url.UrlWithStringQuery, clientSocket: net.Socket, server: url.UrlWithStringQuery) {
    const serverPort = Number(server.port ?? 80);
    const serverSocket = net.connect(serverPort, String(server.hostname));
    const serverTunnel = tunnel(clientSocket, serverSocket);
    serverSocket.on('connect', () => serverSocket.write(connectHeader(client, server), serverTunnel));
  }

  private httpsProxy(client: url.UrlWithStringQuery, clientSocket: net.Socket, server: url.UrlWithStringQuery) {
    const serverPort = Number(server.port ?? 443);
    const serverSocket = tls.connect(serverPort, String(server.hostname));
    const serverTunnel = tunnel(clientSocket, serverSocket);
    serverSocket.on('secureConnect', () => serverSocket.write(connectHeader(client, server), serverTunnel));
  }
  
  private noProxy(client: url.UrlWithStringQuery, clientSocket: net.Socket) {
    const serverPort = Number(client.port ?? 80);
    const serverSocket = net.connect(serverPort, String(client.hostname));
    const serverTunnel = tunnel(clientSocket, serverSocket);
    serverSocket.on('connect', () => clientSocket.write(statusHeader(200, 'OK'), serverTunnel));
  } 

  private async socksProxyAsync(client: url.UrlWithStringQuery, clientSocket: net.Socket, server: url.UrlWithStringQuery, socks4: boolean) {
    // Initialize the destination.
    const destination: sks.SocksRemoteHost = {host: String(client.hostname), port: Number(client.port ?? 80)};
    const proxy: sks.SocksProxy = {host: String(server.hostname), port: Number(server.port ?? 1080), type: socks4 ? 4 :5};
    
    // Initialize the options.
    if (server.auth) [proxy.userId, proxy.password] = server.auth.split(':', 2);
    if (socks4) destination.host = (await util.promisify(dns.lookup)(destination.host)).address;

    // Initialize the tunnel.
    const serverInfo = await sks.SocksClient.createConnection({command: 'connect', destination, proxy});
    const serverSocket = serverInfo.socket;
    const serverTunnel = tunnel(clientSocket, serverSocket);
    clientSocket.write(statusHeader(200, 'OK'), serverTunnel);
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
  clientSocket.on('error', () => serverSocket.destroy());
  clientSocket.on('end', () => serverSocket.destroy());
  serverSocket.on('error', () => clientSocket.destroy());
  serverSocket.on('end', () => clientSocket.destroy());
  return () => clientSocket.pipe(serverSocket) && serverSocket.pipe(clientSocket);
}
