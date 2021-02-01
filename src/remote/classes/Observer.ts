import * as app from '..';
import playwright from 'playwright-core';
import url from 'url';

export class Observer {
  private readonly requests: Array<{expression: RegExp, future: app.Future<playwright.Request>}>;

  constructor(page: playwright.Page) {
    page.on('request', this.onRequest.bind(this));
    this.requests = [];
  }

  getAsync(...expression: Array<RegExp>) {
    return expression.map((expression) => {
      const future = new app.Future<playwright.Request>(app.settings.chromeObserverTimeout);
      this.requests.push({expression, future});
      return future.getAsync();
    });
  }

  private onRequest(request: playwright.Request) {
    for (const {expression, future} of this.requests) {
      const data = url.parse(request.url());
      if (!data.pathname || !expression.test(data.pathname)) continue;
      future.resolve(request);
    }
  }
}
