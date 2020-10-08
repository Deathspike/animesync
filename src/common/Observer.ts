import * as app from '..';
import playwright from 'playwright-core';
import url from 'url';

export class Observer {
  private readonly _responses: Array<{expression: RegExp, future: app.Future<playwright.Response>}>;

  constructor(page: playwright.Page) {
    page.on('response', this._onResponse.bind(this));
    this._responses = [];
  }

  getAsync(...expression: RegExp[]) {
    return expression.map((expression) => {
      const future = new app.Future<playwright.Response>(app.settings.chromeObserverTimeout);
      this._responses.push({expression, future});
      return future.getAsync();
    });
  }

  private _onResponse(response: playwright.Response) {
    for (const {expression, future} of this._responses) {
      const data = url.parse(response.url());
      if (!data.pathname || !expression.test(data.pathname)) continue;
      future.resolve(response);
    }
  }
}
