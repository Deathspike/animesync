import * as app from '..';
import https from 'https';
import net from 'net';

export class AgentHttps extends https.Agent {
  constructor(options?: https.AgentOptions) {
    options = options || {};
    super(options);
  }

  createConnection(options: net.TcpSocketConnectOpts, callback: (error?: Error, socket?: net.Socket) => void) {
    app.AgentConnector.createAsync(String(options.host), options.port)
      .then((socket) => callback(undefined, this.superCreateConnection(options, socket)))
      .catch((error) => callback(error))
  }

  private superCreateConnection(options: net.TcpSocketConnectOpts, socket: net.Socket) {
    const unsafeAgent: any = https.Agent.prototype;
    const unsafeOptions = Object.assign(options, {socket});
    return unsafeAgent.createConnection.call(this, unsafeOptions);
  }
}
