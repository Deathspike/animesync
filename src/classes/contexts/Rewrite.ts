import * as app from '../..';
import {HttpsProxyAgent} from 'https-proxy-agent';
import {Response} from 'node-fetch';
import express from 'express';
import fetch from 'node-fetch';
import querystring from 'querystring';
import url from 'url';

export class Rewrite {
  private readonly _context: app.Context;
  private readonly _server: express.Express;
  
  constructor(context: app.Context, server: express.Express) {
    this._context = context;
    this._server = server;
    this._server.get('/r/:url', (req, res, next) => this._onEmulateAsync(req, res).catch(next));
    this._server.get('/r/hls/:url', (req, res, next) => this._onHlsAsync(req, res).catch(next));
  }

  createEmulateUrl(url: string, headers?: Record<string, string>) {
    const safeQuery = querystring.stringify(headers);
    const safeUrl = encodeURIComponent(url);
    return new URL(`/r/${safeUrl}?${safeQuery}`, this._context.address).toString();
  }

  createHlsUrl(url: string, headers?: Record<string, string>) {
    const safeQuery = querystring.stringify(headers);
    const safeUrl = encodeURIComponent(url);
    return new URL(`/r/hls/${safeUrl}?${safeQuery}`, this._context.address).toString();
  }

  private async _onEmulateAsync(request: express.Request, response: express.Response) {
    const agent = new HttpsProxyAgent(this._context.address) as any;
    const headers = emulateHeaders(request);
    const server = await fetch(request.params.url, {agent, headers});
    attachResponse(response, server);
    server.body.pipe(response);
  }

  private async _onHlsAsync(request: express.Request, response: express.Response) {
    const agent = new HttpsProxyAgent(this._context.address) as any;
    const headers = emulateHeaders(request);
    const server = await fetch(request.params.url, {agent, headers});
    if (server.status >= 200 && server.status < 300) {
      const hls = app.HlsManifest.from(await server.text());
      this._rewriteHls(hls, extractHeaders(request));
      attachResponse(response, server);
      response.send(hls.toString());
    } else {
      attachResponse(response, server);
      server.body.pipe(response);
    }
  }

  private _rewriteHls(hls: app.HlsManifest, queryHeaders: Record<string, string>) {
    for (let i = 0; i < hls.length; i++) {
      if (hls[i].type === 'EXT-X-KEY' && hls[i].params['URI']) {
        hls[i].params['URI'] = this.createEmulateUrl(hls[i].params['URI'], queryHeaders);
      } else if (hls[i].type === 'EXT-X-STREAM-INF') {
        while (hls[++i].type) continue;
        hls[i].data = this.createHlsUrl(hls[i].data, queryHeaders);
      } else if (hls[i].data && !hls[i].type) {
        hls[i].data = this.createEmulateUrl(hls[i].data, queryHeaders);
      }
    }
  }
}

function attachResponse(response: express.Response, server: Response) {
  response.status(server.status);
  response.setHeader('access-control-allow-origin', '*');
  Object.entries(server.headers).forEach(([k, v]) => response.setHeader(k, v));
}

function emulateHeaders(request: express.Request) {
  const host = url.parse(request.params.url).host;
  const result: Record<string, string> = {};
  Object.entries(request.headers).forEach(([k, v]) => result[k] = String(v));
  Object.entries(request.query).forEach(([k, v]) => result[k] = String(v));
  result['host'] = host ?? result['host'];
  return result;
}

function extractHeaders(request: express.Request) {
  const result: Record<string, string> = {};
  Object.entries(request.query).forEach(([k, v]) => result[k] = String(v));
  return result;
}
