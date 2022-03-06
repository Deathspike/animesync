import * as app from '..';
import commander from 'commander';
const packageData = require('../../../package');

export function createBrowser() {
  return commander.createCommand('browser')
    .description('Launch browser.')
    .action(browserAsync);
}

async function browserAsync() {
  await app.Server.usingAsync(async (api) => {
    api.logger.info(`Listening at ${app.settings.server.url} (${packageData.version})`);
    app.settings.core = new app.api.SettingCore(app.settings.core, {chromeHeadless: false});
    await api.browser.pageAsync(async (page) => {
      await page.goto('https://www.crunchyroll.com/', {waitUntil: 'domcontentloaded'});
      await new Promise<void>((resolve) => page.on('close', () => resolve()));
    });
  });
}

