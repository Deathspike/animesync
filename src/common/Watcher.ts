import * as app from '..';
import puppeteer from 'puppeteer-core';

export class Watcher {
  private readonly _responses: Array<{expression: RegExp, future: app.Future<puppeteer.Response>}>;

  constructor(page: puppeteer.Page) {
    page.on('response', this._onResponse.bind(this));
    this._responses = [];
  }

  getAsync(...expression: RegExp[]) {
    return expression.map((expression) => {
      const future = new app.Future<puppeteer.Response>(app.settings.chromeNavigationTimeout);
      this._responses.push({expression, future});
      return future.getAsync();
    });
  }

  private _onResponse(response: puppeteer.Response) {
    for (const {expression, future} of this._responses) {
      if (!expression.test(response.url())) continue;
      future.resolve(response);
    }
  }
}
