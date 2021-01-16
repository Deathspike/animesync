import * as ace from '../..';
import playwright from 'playwright-core';
import url from 'url';

export class Observer {
  private readonly _responses: Array<{expression: RegExp, future: ace.shr.Future<playwright.Request>}>;

  constructor(page: playwright.Page) {
    page.on('request', this._onRequest.bind(this));
    this._responses = [];
  }

  getAsync(...expression: Array<RegExp>) {
    return expression.map((expression) => {
      const future = new ace.shr.Future<playwright.Request>(ace.settings.chromeObserverTimeout);
      this._responses.push({expression, future});
      return future.getAsync();
    });
  }

  private _onRequest(request: playwright.Request) {
    for (const {expression, future} of this._responses) {
      const data = url.parse(request.url());
      if (!data.pathname || !expression.test(data.pathname)) continue;
      future.resolve(request);
    }
  }
}
