import * as app from '..';
import playwright from 'playwright-core';
let browserInstance: Promise<playwright.ChromiumBrowserContext> | undefined;
let browserPath = require('chrome-launcher/dist/chrome-finder')[process.platform]()[0];
let numberOfPages = 0;
let timeoutHandle = setTimeout(() => undefined, 0);

export async function browserAsync<T>(handlerAsync: (page: playwright.Page, userAgent: string) => Promise<T>) {
  let browserPromise = browserInstance || (browserInstance = launchAsync());
  let page: playwright.Page | undefined;
  try {
    numberOfPages++;
    const browserContext = await browserPromise;
    page = await browserContext.newPage();
    page.setDefaultNavigationTimeout(app.settings.chromeNavigationTimeout);
    const userAgent = await page.evaluate(() => navigator.userAgent).then(x => x.replace(/Headless/, ''));
    const session = await browserContext.newCDPSession(page);
    await session.send('Emulation.setUserAgentOverride', {userAgent});
    return await handlerAsync(page, userAgent);
  } finally {
    numberOfPages--;
    updateTimeout();
    await page?.close().catch(() => undefined);
  }
}

async function launchAsync() {
  if (!browserPath) throw new Error('Invalid browser');
  const cv = app.settings.chromeViewport.match(/^([0-9]+)x([0-9]+)$/);
  const ps = app.settings.proxyServer.match(/^(https?)\:\/\/(?:(.+)\:(.+)@)?((?:.+)\.(?:.+))$/i);
  return await playwright.chromium.launchPersistentContext(app.settings.chrome, { 
    args: ['--autoplay-policy=no-user-gesture-required'],
    executablePath: browserPath,
    headless: app.settings.chromeHeadless,
    proxy: ps && ps[1] && ps[4] ? {server: `${ps[1]}://${ps[4]}`, username: ps[2], password: ps[3]} : undefined,
    viewport: app.settings.chromeHeadless && cv ? {width: parseInt(cv[1]), height: parseInt(cv[2])} : null
  }) as playwright.ChromiumBrowserContext;
}

function updateTimeout() {
  clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(async () => {
    const browser = await browserInstance;
    if (numberOfPages) return;
    browserInstance = undefined;
    browser?.close().catch(() => undefined);
  }, app.settings.chromeInactiveTimeout);
}
