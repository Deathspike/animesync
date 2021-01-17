import * as ace from '../..';
import * as acm from '..';
import net from 'net';

export class AgentConnector {
  private readonly _chunks: Buffer[];
  private readonly _endListener: () => void;
  private readonly _errorListener: (error: Error) => void;
  private readonly _dataListener: (chunk: Buffer) => void;
  private readonly _resolver: acm.Future<net.Socket>;
  private readonly _socket: net.Socket;
  
  constructor(socket: net.Socket) {
    this._chunks = [];
    this._endListener = this._onSocketEnd.bind(this);
    this._errorListener = this._onSocketError.bind(this);
    this._dataListener = this._onSocketData.bind(this);
    this._resolver = new acm.Future();
    this._socket = socket;
  }
  
  static async createAsync(hostname: string, port: number) {
    const socket = net.connect(ace.settings.serverPort, '127.0.0.1');
    return await new AgentConnector(socket).getAsync(hostname, port);
  }

  async getAsync(hostname: string, port: number) {
    this._socket.on('end', this._endListener);
    this._socket.on('error', this._errorListener);
    this._socket.on('data', this._dataListener);
    this._socket.write([`CONNECT ${hostname}:${port} HTTP/1.1`, '', ''].join('\r\n'));
    return this._resolver.getAsync();
  }

  private _onSocketEnd() {
    const data = Buffer.concat(this._chunks).toString();
    const match = data.match(/^HTTP\/1\.1 (\d*)/);
    if (!match || match[1] !== '200') {
      this._resolver.reject(new Error(data));
      this._socket.end();
      this._socket.destroy();
    } else {
      this._resolver.resolve(this._socket);
    }
  }

  private _onSocketError(error: Error) {
    this._resolver.reject(error);
    this._socket.end();
    this._socket.destroy();
  }

  private _onSocketData(chunk: Buffer) {
    this._chunks.push(chunk);
    if (!Buffer.concat(this._chunks).toString().endsWith('\r\n\r\n')) return;
    this._socket.removeListener('end', this._endListener);
    this._socket.removeListener('error', this._errorListener);
    this._socket.removeListener('data', this._dataListener);
    this._onSocketEnd();
  }
}
