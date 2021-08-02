import * as app from '../..';
import * as playwright from 'playwright-core';
import commander from 'commander';

export function createBrowser() {
  return commander.createCommand('browser')
    .description('Launch browser.')
    .action(browserAsync);
}

async function browserAsync() {
  await app.Server.usingAsync(async (api) => {
    api.logger.info(`Listening at ${api.context.serverUrl}`);
    app.settings.core = new app.api.SettingCore(app.settings.core, {chromeHeadless: false});
    await api.browser.pageAsync(async (page) => {
      const context = page.context();
      const crunchyrollPromise = navigateAsync(context, 0, 'https://www.crunchyroll.com/');
      const funimationPromise = navigateAsync(context, 1, 'https://www.funimation.com/');
      const vrvPromise = navigateAsync(context, 2, 'https://vrv.co/');
      await Promise.all([crunchyrollPromise, funimationPromise, vrvPromise]);
      await new Promise<void>((resolve) => context.on('close', resolve));
    });
  });
}

async function navigateAsync(context: playwright.BrowserContext, index: number, url: string) {
  const pages = context.pages();
  const page = pages.length > index ? pages[index] : await context.newPage();
  await page.goto(url, {waitUntil: 'domcontentloaded'});
}
