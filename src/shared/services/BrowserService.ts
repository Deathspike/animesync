import * as app from '../..';
import * as chromeLauncher from 'chrome-launcher';
import playwright from 'playwright-core';

export class BrowserService {
  private _browser?: Promise<playwright.ChromiumBrowserContext>;
  private _numberOfPages: number;
  private _timeoutHandle: NodeJS.Timeout;
  
  constructor() {
    this._numberOfPages = 0;
    this._timeoutHandle = setTimeout(() => undefined, 0);
  }

  async pageAsync<T>(handlerAsync: (page: playwright.Page, userAgent: string) => Promise<T>) {
    let page: playwright.Page | undefined;
    try {
      this._numberOfPages++;
      const browser = await (this._browser ?? this._launchAsync());
      page = await browser.newPage();
      page.setDefaultNavigationTimeout(app.settings.chromeNavigationTimeout);
      const userAgent = await page.evaluate(() => navigator.userAgent).then(x => x.replace(/Headless/, ''));
      const session = await browser.newCDPSession(page);
      await session.send('Emulation.setUserAgentOverride', {userAgent});
      return await handlerAsync(page, userAgent);
    } finally {
      this._numberOfPages--;
      this._updateTimeout();
      await page?.close().catch(() => undefined);
    }
  }
  
  private async _launchAsync() {
    try {
      const args = ['--autoplay-policy=no-user-gesture-required'];
      const executablePath = chromeLauncher.Launcher.getFirstInstallation();
      const headless = app.settings.chromeHeadless;
      const proxy = {server: app.settings.serverUrl};
      const viewport = app.settings.chromeHeadless ? parseResolution(app.settings.chromeViewport) : undefined;
      this._browser = playwright.chromium.launchPersistentContext(app.settings.chrome, {args, executablePath, headless, proxy, viewport}) as Promise<playwright.ChromiumBrowserContext>;
      return await this._browser;
    } catch (error) {
      delete this._browser;
      throw error;
    }
  }
  
  private _updateTimeout() {
    clearTimeout(this._timeoutHandle);
    this._timeoutHandle = setTimeout(async () => {
      const browser = await this._browser;
      if (this._numberOfPages) return;
      delete this._browser;
      browser?.close().catch(() => undefined);
    }, app.settings.chromeInactiveTimeout);
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
