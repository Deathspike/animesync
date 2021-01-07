import * as app from '../..';
import {HttpsProxyAgent} from 'https-proxy-agent';
import {Response} from 'node-fetch';
import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';
import querystring from 'querystring';
import url from 'url';
const enableCors = cors();
const proxyInfo = {compress: false, redirect: <'manual'> 'manual'};

export class Rewrite {
  private readonly _context: app.Context;
  private readonly _server: express.Express;
  
  constructor(context: app.Context, server: express.Express) {
    this._context = context;
    this._server = server;
    this._server.all('*', (req, res, next) => this._onAccessAsync(req, res, next).catch(next));
    this._server.get('/p/:url', enableCors, (req, res, next) => this._onEmulateAsync(req, res).catch(next));
    this._server.get('/p/hls/:url', enableCors, (req, res, next) => this._onHlsAsync(req, res).catch(next));
  }

  createEmulateUrl(url: string, headers?: Record<string, string>) {
    const safeQuery = querystring.stringify(headers);
    const safeUrl = encodeURIComponent(url);
    return new URL(`/p/${safeUrl}?${safeQuery}`, this._context.address).toString();
  }

  createHlsUrl(url: string, headers?: Record<string, string>) {
    const safeQuery = querystring.stringify(headers);
    const safeUrl = encodeURIComponent(url);
    return new URL(`/p/hls/${safeUrl}?${safeQuery}`, this._context.address).toString();
  }

  private async _onAccessAsync(request: express.Request, response: express.Response, next: express.NextFunction) {
    if (request.url.startsWith('/')) return next();
    const agent = new HttpsProxyAgent(this._context.address) as any;
    const headers = getRequestHeaders(request);
    const result = await fetch(request.url, Object.assign({agent, headers}, proxyInfo, request));
    sendHeaders(response, result);
    result.body.pipe(response);
  }

  private async _onEmulateAsync(request: express.Request, response: express.Response) {
    const agent = new HttpsProxyAgent(this._context.address) as any;
    const headers = emulateRequestHeaders(request);
    const result = await fetch(request.params.url, Object.assign({agent, headers}, proxyInfo));
    sendHeaders(response, result);
    result.body.pipe(response);
  }

  private async _onHlsAsync(request: express.Request, response: express.Response) {
    const agent = new HttpsProxyAgent(this._context.address) as any;
    const headers = emulateRequestHeaders(request);
    const result = await fetch(request.params.url, {agent, headers});
    if (result.status >= 200 && result.status < 300) {
      const hls = app.HlsManifest.from(await result.text());
      this._rewriteHls(hls, getQueryHeaders(request));
      response.send(hls.toString());
    } else {
      response.sendStatus(500);
    }
  }

  private _rewriteHls(hls: app.HlsManifest, headers?: Record<string, string>) {
    for (let i = 0; i < hls.length; i++) {
      if (hls[i].type === 'EXT-X-KEY' && hls[i].params['URI']) {
        hls[i].params['URI'] = this.createEmulateUrl(hls[i].params['URI'], headers);
      } else if (hls[i].type === 'EXT-X-STREAM-INF') {
        while (hls[++i].type) continue;
        hls[i].data = this.createHlsUrl(hls[i].data, headers);
      } else if (hls[i].data && !hls[i].type) {
        hls[i].data = this.createEmulateUrl(hls[i].data, headers);
      }
    }
  }
}

function emulateRequestHeaders(request: express.Request) {
  const headers = getRequestHeaders(request);
  const host = url.parse(request.params.url).host;
  const query = getQueryHeaders(request);
  return Object.assign(headers, query, {host});
}

function getRequestHeaders(request: express.Request) {
  const result: Record<string, string> = {};
  Object.entries(request.headers).forEach(([k, v]) => result[k] = String(v));
  return result;
}

function getQueryHeaders(request: express.Request) {
  const result: Record<string, string> = {};
  Object.entries(request.query).forEach(([k, v]) => result[k] = String(v));
  return result;
}

function sendHeaders(response: express.Response, result: Response) {
  response.status(result.status);
  Array.from(result.headers).forEach(([k, v]) => response.header(k, v));
}
