import * as app from '..';
import net from 'net';

export class AgentConnector {
  private readonly chunks: Buffer[];
  private readonly endListener: () => void;
  private readonly errorListener: (error: Error) => void;
  private readonly dataListener: (chunk: Buffer) => void;
  private readonly resolver: app.Future<net.Socket>;
  private readonly socket: net.Socket;
  
  constructor(socket: net.Socket) {
    this.chunks = [];
    this.endListener = this.onSocketEnd.bind(this);
    this.errorListener = this.onSocketError.bind(this);
    this.dataListener = this.onSocketData.bind(this);
    this.resolver = new app.Future();
    this.socket = socket;
  }
  
  static async createAsync(hostname: string, port: number) {
    const socket = net.connect(app.settings.serverPort, '127.0.0.1');
    return await new AgentConnector(socket).getAsync(hostname, port);
  }

  async getAsync(hostname: string, port: number) {
    this.socket.on('end', this.endListener);
    this.socket.on('error', this.errorListener);
    this.socket.on('data', this.dataListener);
    this.socket.write([`CONNECT ${hostname}:${port} HTTP/1.1`, '', ''].join('\r\n'));
    return this.resolver.getAsync();
  }

  private onSocketEnd() {
    const data = Buffer.concat(this.chunks).toString();
    const match = data.match(/^HTTP\/1\.1 (\d*)/);
    if (!match || match[1] !== '200') {
      this.resolver.reject(new Error(data));
      this.socket.destroy();
    } else {
      this.resolver.resolve(this.socket);
    }
  }

  private onSocketError(error: Error) {
    this.resolver.reject(error);
    this.socket.destroy();
  }

  private onSocketData(chunk: Buffer) {
    this.chunks.push(chunk);
    if (!Buffer.concat(this.chunks).toString().endsWith('\r\n\r\n')) return;
    this.socket.removeListener('end', this.endListener);
    this.socket.removeListener('error', this.errorListener);
    this.socket.removeListener('data', this.dataListener);
    this.onSocketEnd();
  }
}
