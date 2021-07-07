import * as app from '..';
import net from 'net';

export class AgentConnector {
  private readonly chunks: Array<Buffer>;
  private readonly dataListener: (chunk: Buffer) => void;
  private readonly endListener: () => void;
  private readonly errorListener: (error: Error) => void;
  private readonly reject: (error: Error) => void;
  private readonly resolve: (socket: net.Socket) => void;
  private readonly socket: net.Socket;
  
  private constructor(reject: (error: Error) => void, resolve: (socket: net.Socket) => void, socket: net.Socket) {
    this.chunks = [];
    this.dataListener = this.onSocketData.bind(this);
    this.endListener = this.onSocketEnd.bind(this);
    this.errorListener = this.onSocketError.bind(this);
    this.reject = reject;
    this.resolve = resolve;
    this.socket = socket;
  }
  
  static async createAsync(contextService: app.ContextService, hostname: string, port: number) {
    return await new Promise<net.Socket>((resolve, reject) => {
      const socket = net.connect(contextService.serverPort, contextService.serverIp);
      const agent = new AgentConnector(reject, resolve, socket);
      agent.connect(hostname, port);
    });
  }

  connect(hostname: string, port: number) {
    this.socket.on('end', this.endListener);
    this.socket.on('error', this.errorListener);
    this.socket.on('data', this.dataListener);
    this.socket.write([`CONNECT ${hostname}:${port} HTTP/1.1`, '', ''].join('\r\n'));
  }

  private onSocketEnd() {
    const data = Buffer.concat(this.chunks).toString();
    const match = data.match(/^HTTP\/1\.1 (\d*)/);
    if (!match || match[1] !== '200') {
      this.reject(new Error(data));
      this.socket.destroy();
    } else {
      this.resolve(this.socket);
    }
  }

  private onSocketError(error: Error) {
    this.reject(error);
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
