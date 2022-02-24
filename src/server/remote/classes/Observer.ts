import * as app from '..';
import playwright from 'playwright-core';

export class Observer {
  private readonly observers: Array<{expression: RegExp, future: app.Future<playwright.Response>}>;

  constructor(page: playwright.Page) {
    this.observers = [];
    page.on('request', this.onRequestAsync.bind(this));
  }

  getAsync(...expression: Array<RegExp>) {
    return expression.map(async (expression) => {
      const future = new app.Future<playwright.Response>();
      this.observers.push({expression, future});
      return await future.getAsync(app.settings.core.chromeTimeoutNavigation);
    });
  }

  private async onRequestAsync(request: playwright.Request) {
    const pathname = new URL(request.url()).pathname;
    const responseObservers = this.observers.filter(x => x.expression.test(pathname));
    const response = await request.response();
    if (response) responseObservers.forEach(x => x.future.resolve(response));
  }
}
