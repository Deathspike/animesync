import * as app from '..';
import * as chromeLauncher from 'chrome-launcher';
import playwright from 'playwright-core';
let browserInstance: Promise<playwright.ChromiumBrowserContext> | undefined;
let numberOfPages = 0;
let timeoutHandle = setTimeout(() => undefined, 0);

export async function browserAsync<T>(handlerAsync: (page: playwright.Page, userAgent: string) => Promise<T>) {
  let page: playwright.Page | undefined;
  try {
    numberOfPages++;
    const browser = await (browserInstance ?? (browserInstance = launchAsync()));
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(app.settings.chromeNavigationTimeout);
    const userAgent = await page.evaluate(() => navigator.userAgent).then(x => x.replace(/Headless/, ''));
    const session = await browser.newCDPSession(page);
    await session.send('Emulation.setUserAgentOverride', {userAgent});
    return await handlerAsync(page, userAgent);
  } finally {
    numberOfPages--;
    updateTimeout();
    await page?.close().catch(() => undefined);
  }
}

async function launchAsync() {
  const cv = app.settings.chromeViewport.match(/^([0-9]+)x([0-9]+)$/);
  return await playwright.chromium.launchPersistentContext(app.settings.chrome, { 
    args: ['--autoplay-policy=no-user-gesture-required'],
    executablePath: chromeLauncher.Launcher.getFirstInstallation(),
    headless: app.settings.chromeHeadless,
    proxy: {server: app.settings.serverUrl},
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
