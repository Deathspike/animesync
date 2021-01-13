import * as app from '..';
import * as api from '@nestjs/common';
import {REQUEST} from '@nestjs/core';
import express from 'express';

@api.Injectable()
export class ContextService {
  private readonly _request: express.Request;

  constructor(@api.Inject(REQUEST) request: express.Request) {
    this._request = request;
  }

  get() {
    const host = this._request.headers['host'] ?? this._request.hostname;
    const protocol = this._request.headers['x-forwarded-proto'] ?? this._request.protocol;
    return new app.Context(`${protocol}://${host}/`);
  }
}
