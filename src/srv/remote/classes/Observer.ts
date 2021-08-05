import * as app from '..';
import playwright from 'playwright-core';

export class Observer {
  private readonly responses: Array<{expression: RegExp, future: app.Future<playwright.Response>}>;

  constructor(page: playwright.Page) {
    page.on('response', this.onResponse.bind(this));
    this.responses = [];
  }

  getAsync(...expression: Array<RegExp>) {
    return expression.map((expression) => {
      const future = new app.Future<playwright.Response>(app.settings.core.chromeTimeoutNavigation);
      this.responses.push({expression, future});
      return future.getAsync();
    });
  }

  private onResponse(response: playwright.Response) {
    const pathname = new URL(response.url()).pathname;
    for (const {expression, future} of this.responses) {
      if (!expression.test(pathname)) continue;
      future.resolve(response);
    }
  }
}
