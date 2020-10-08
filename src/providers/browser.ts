import * as app from '..';
import playwright from 'playwright-core';
let browserInstance: Promise<playwright.ChromiumBrowserContext> | undefined;
let browserPath = require('chrome-launcher/dist/chrome-finder')[process.platform]()[0];
let numberOfPages = 0;
let timeoutHandle = setTimeout(() => undefined, 0);

export async function browserAsync(handlerAsync: (page: playwright.Page) => Promise<void>) {
  let browserPromise = browserInstance || (browserInstance = launchAsync());
  let page: playwright.Page | undefined;
  try {
    numberOfPages++;
    const browserContext = await browserPromise;
    page = await browserContext.newPage();
    page.setDefaultNavigationTimeout(app.settings.chromeNavigationTimeout);
    const userAgent = await page.evaluate(() => navigator.userAgent);
    const session = await browserContext.newCDPSession(page);
    await session.send('Emulation.setUserAgentOverride', {userAgent: userAgent.replace(/Headless/, '')});
    await handlerAsync(page);
  } finally {
    numberOfPages--;
    updateTimeout();
    await page?.close().catch(() => undefined);
  }
}

async function launchAsync() {
  if (!browserPath) throw new Error('Invalid browser');
  const match = app.settings.httpProxy.match(/^(https?)\:\/\/(?:(.+)\:(.+)@)?(.+)$/i);
  return await playwright.chromium.launchPersistentContext(app.settings.chrome, { 
    args: ['--autoplay-policy=no-user-gesture-required'],
    executablePath: browserPath,
    headless: app.settings.chromeHeadless,
    proxy: match && match[1] && match[4] ? {server: `${match[1]}://${match[4]}`, username: match[2], password: match[3]} : undefined,
    viewport: app.settings.chromeHeadless ? app.settings.chromeViewport : null
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
