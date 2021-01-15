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
  try {
    const args = ['--autoplay-policy=no-user-gesture-required'];
    const executablePath = chromeLauncher.Launcher.getFirstInstallation();
    const headless = app.settings.chromeHeadless;
    const proxy = {server: app.settings.serverUrl};
    const viewport = app.settings.chromeHeadless ? parseResolution(app.settings.chromeViewport) : undefined;
    browserInstance = playwright.chromium.launchPersistentContext(app.settings.chrome, {args, executablePath, headless, proxy, viewport}) as Promise<playwright.ChromiumBrowserContext>;
    return await browserInstance;
  } catch (error) {
    browserInstance = undefined;
    throw error;
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

function updateTimeout() {
  clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(async () => {
    const browser = await browserInstance;
    if (numberOfPages) return;
    browserInstance = undefined;
    browser?.close().catch(() => undefined);
  }, app.settings.chromeInactiveTimeout);
}
