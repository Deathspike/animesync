import * as app from '..';

export interface IPlugin {
  readonly providers?: Array<new (...args: any[]) => app.IProvider>;
  readonly version: 2;
}
