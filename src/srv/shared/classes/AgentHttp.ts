import * as app from '..';
import http from 'http';
import net from 'net';

export class AgentHttp extends http.Agent {
  private readonly contextService: app.ContextService;

  constructor(contextService: app.ContextService, options?: http.AgentOptions) {
    options = options || {};
    super(options);
    this.contextService = contextService;
  }

  createConnection(options: net.TcpSocketConnectOpts, callback: (error?: Error, socket?: net.Socket) => void) {
    app.AgentConnector.createAsync(this.contextService, String(options.host), options.port)
      .then((socket) => callback(undefined, this.superCreateConnection(options, socket)))
      .catch((error) => callback(error))
  }

  private superCreateConnection(options: net.TcpSocketConnectOpts, socket: net.Socket) {
    const unsafeAgent = app.api.unsafe(http.Agent.prototype);
    const unsafeOptions = Object.assign(options, {socket});
    return unsafeAgent.createConnection.call(this, unsafeOptions);
  }
}
