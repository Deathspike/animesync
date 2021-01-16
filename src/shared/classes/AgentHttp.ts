import * as acm from '..';
import http from 'http';
import net from 'net';

export class AgentHttp extends http.Agent {
  constructor(options?: http.AgentOptions) {
    options = options || {};
    super(options);
  }

  createConnection(options: net.TcpSocketConnectOpts, callback: (error?: Error, socket?: net.Socket) => void) {
    acm.AgentConnector.createAsync(String(options.host), options.port)
      .then((socket) => callback(undefined, this._createConnection(options, socket)))
      .catch((error) => callback(error))
  }

  private _createConnection(options: net.TcpSocketConnectOpts, socket: net.Socket) {
    const unsafeAgent: any = http.Agent.prototype;
    const unsafeOptions = Object.assign(options, {socket});
    return unsafeAgent.createConnection.call(this, unsafeOptions);
  }
}
