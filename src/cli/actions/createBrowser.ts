import * as app from '../..';
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
      const pages = context.pages();
      if (pages.length > 0) pages[0].goto('https://www.crunchyroll.com/').catch(() => {});
      if (pages.length > 1) pages[1].goto('https://www.funimation.com/').catch(() => {});
      await new Promise<void>((resolve) => context.on('close', resolve));
    });
  });
}
