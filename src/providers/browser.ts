import * as app from '..';
import puppeteer from 'puppeteer-core';
let browserInstance: Promise<puppeteer.Browser> | undefined;
let numberOfPages = 0;
let timeoutHandle = setTimeout(() => undefined, 0);

export async function browserAsync(handlerAsync: (page: puppeteer.Page) => Promise<void>) {
  let browserPromise = browserInstance || (browserInstance = launchAsync());
  let page: puppeteer.Page | undefined;
  try {
    numberOfPages++;
    const browser = await browserPromise;
    const userAgent = await browser.userAgent();
    page = await browser.newPage();
    page.setDefaultTimeout(app.settings.chromeNavigationTimeout);
    await page.setUserAgent(userAgent.replace(/HeadlessChrome/g, 'Chrome'));
    await page.setViewport(app.settings.chromeViewport);
    await handlerAsync(page);
  } finally {
    numberOfPages--;
    updateTimeout();
    await page?.close();
  }
}

async function launchAsync() {
  const executableFinder = require('chrome-launcher/dist/chrome-finder')[process.platform]
  const executablePath = executableFinder()[0];
  if (executablePath) return puppeteer.launch({executablePath, headless: app.settings.chromeHeadless, userDataDir: app.settings.chrome});
  throw new Error('Invalid browser');
}

function updateTimeout() {
  clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(async () => {
    const browser = await browserInstance;
    if (numberOfPages) return;
    browserInstance = undefined;
    browser?.close().catch(() => undefined);
  }, app.settings.chromeExitTimeout);
}
