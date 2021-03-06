import * as app from '../..';

export async function browserAsync() {
  console.info(`Starting ${app.settings.server.url}`);
  await app.Server.usingAsync(async (api) => {
    app.settings.core = new app.api.SettingCore(app.settings.core, {chromeHeadless: false});
    console.info('Spawning browser ...');
    await api.browser.pageAsync(async (page) => {
      const context = page.context();
      const pages = context.pages();
      if (pages.length > 0) pages[0].goto('https://www.crunchyroll.com/').catch(() => {});
      if (pages.length > 1) pages[1].goto('https://www.funimation.com/').catch(() => {});
      await new Promise<void>((resolve) => context.on('close', resolve));
    });
  });
}
