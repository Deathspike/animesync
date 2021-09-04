import * as app from '..';
import commander from 'commander';

export function createBrowser() {
  return commander.createCommand('browser')
    .description('Launch browser.')
    .action(browserAsync);
}

async function browserAsync() {
  await app.Server.usingAsync(async (api) => {
    api.logger.info(`Listening at ${app.settings.server.url}`);
    app.settings.core = new app.api.SettingCore(app.settings.core, {chromeHeadless: false});
    await api.browser.pageAsync(async (page) => {
      const context = page.context();
      const crunchyrollPromise = page.goto('https://www.crunchyroll.com/', {waitUntil: 'domcontentloaded'});
      const funimationPromise = context.newPage().then(x => x.goto('https://www.funimation.com/', {waitUntil: 'domcontentloaded'}));
      const vrvPromise = context.newPage().then(x => x.goto('https://vrv.co/', {waitUntil: 'domcontentloaded'}));
      await Promise.all([crunchyrollPromise, funimationPromise, vrvPromise]);
      await new Promise<void>((resolve) => context.on('close', () => resolve()));
    });
  });
}
