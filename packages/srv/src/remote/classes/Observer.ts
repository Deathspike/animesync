import * as app from '..';
import playwright from 'playwright-core';

export class Observer {
  private readonly observers: Array<{expression: RegExp, future: app.Future<playwright.Response>}>;
  private readonly responses: Array<playwright.Response>;

  constructor(page: playwright.Page) {
    this.observers = [];
    this.responses = [];
    page.on('response', this.onResponse.bind(this));
  }

  getAsync(...expression: Array<RegExp>) {
    return expression.map(async (expression) => {
      const future = new app.Future<playwright.Response>();
      this.observers.push({expression, future});
      this.responses.forEach(x => this.resolveResponse(x));
      return await future.getAsync(app.settings.core.chromeTimeoutNavigation);
    });
  }

  private onResponse(response: playwright.Response) {
    this.responses.push(response);
    this.resolveResponse(response);
  }

  private resolveResponse(response: playwright.Response) {
    const pathname = new URL(response.url()).pathname;
    for (const {expression, future} of this.observers) {
      if (!expression.test(pathname)) continue;
      future.resolve(response);
    }
  }
}
