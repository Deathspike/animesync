import * as app from '..';
import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer-core';
let browserInstance: Promise<puppeteer.Browser> | undefined;
let numberOfPages = 0;
let timeoutHandle = setTimeout(() => undefined, 0);

export async function browserAsync(handlerAsync: (page: puppeteer.Page) => Promise<void>) {
  let browserPromise = browserInstance || launchAsync();
  let page: puppeteer.Page | undefined;
  try {
    numberOfPages++;
    const browser = await browserPromise;
    const userAgent = await browser.userAgent();
    page = await browser.newPage();
    page.setDefaultTimeout(app.settings.browser.chromeNavigationTimeout);
    await page.setUserAgent(userAgent.replace(/HeadlessChrome/g, 'Chrome'));
    await page.setViewport(app.settings.browser.chromeViewport);
    return await handlerAsync(page);
  } finally {
    browserInstance = browserPromise;
    numberOfPages--;
    updateTimeout();
    await page?.close();
  }
}

async function launchAsync() {
  await fs.ensureDir(app.settings.browser.chrome);
  const chromiumRevision = String(require('puppeteer-core/package').puppeteer.chromium_revision);
  const fetcher = puppeteer.createBrowserFetcher({path: app.settings.browser.chrome});
  await fetcher.localRevisions().then(x => Promise.all(x.filter((revision) => chromiumRevision !== revision).map((revision) => fetcher.remove(revision))));
  const downloadInfo = await fetcher.download(chromiumRevision);
  return puppeteer.launch({executablePath: downloadInfo.executablePath, headless: app.settings.browser.chromeHeadless, userDataDir: path.join(downloadInfo.folderPath, 'user-data')});
}

function updateTimeout() {
  clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(async () => {
    const browser = await browserInstance;
    if (!browser || numberOfPages) return;
    browserInstance = undefined;
    browser.close().catch(console.log.bind(console));
  }, app.settings.browser.chromeExitTimeout);
}
