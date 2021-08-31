import * as app from '..';
import * as clr from 'chrome-launcher';
import * as ncm from '@nestjs/common';
import playwright from 'playwright-core';

@ncm.Injectable()
export class BrowserService implements ncm.OnModuleDestroy {
  private browser?: Promise<playwright.ChromiumBrowserContext>;
  private numberOfPages: number;
  private timeoutHandle: NodeJS.Timeout;
  
  constructor() {
    this.numberOfPages = 0;
    this.timeoutHandle = setTimeout(() => {}, 0);
  }

  async pageAsync<T>(handlerAsync: (page: playwright.Page, userAgent: string) => Promise<T>) {
    let page: playwright.Page | undefined;
    try {
      this.numberOfPages++;
      const browser = await (this.browser ?? this.launchAsync());
      page = await browser.newPage();
      page.setDefaultNavigationTimeout(app.settings.core.chromeTimeoutNavigation);
      page.setDefaultTimeout(app.settings.core.chromeTimeoutAction);
      const userAgent = await page.evaluate(() => navigator.userAgent).then(x => x.replace(/Headless/, ''));
      const session = await browser.newCDPSession(page);
      await session.send('Emulation.setUserAgentOverride', {userAgent});
      return await handlerAsync(page, userAgent);
    } finally {
      this.numberOfPages--;
      this.updateTimeout();
      await page?.close().catch(() => {});
    }
  }

  async onModuleDestroy() {
    const browser = await this.browser;
    clearTimeout(this.timeoutHandle);
    delete this.browser;
    await browser?.close().catch(() => {});
  }

  private async launchAsync() {
    try {
      const args = ['--autoplay-policy=no-user-gesture-required', '--lang=en-US'];
      const executablePath = clr.Launcher.getFirstInstallation();
      const headless = app.settings.core.chromeHeadless;
      const proxy = {server: app.settings.server.url};
      const viewport = app.settings.core.chromeHeadless ? parseResolution(app.settings.core.chromeViewport) : undefined;
      this.browser = playwright.chromium.launchPersistentContext(app.settings.path.chrome, {args, executablePath, headless, proxy, viewport}) as Promise<playwright.ChromiumBrowserContext>;
      return await this.browser;
    } catch (error) {
      delete this.browser;
      throw error;
    }
  }
  
  private updateTimeout() {
    clearTimeout(this.timeoutHandle);
    this.timeoutHandle = setTimeout(async () => {
      const browser = await this.browser;
      if (this.numberOfPages) return;
      delete this.browser;
      browser?.close().catch(() => {});
    }, app.settings.core.chromeTimeout);
  }
}

function parseResolution(value?: string) {
  const match = value?.match(/^([0-9]+)x([0-9]+)$/);
  if (match) {
    const width = parseFloat(match[1]);
    const height = parseFloat(match[2]);
    return {width, height};
  } else {
    return;
  }
}
