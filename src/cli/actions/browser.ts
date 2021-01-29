import * as app from '../..';

export async function browserAsync() {
  console.info(`Starting ${app.settings.serverUrl}`);
  await app.Server.usingAsync(async (api) => {
    app.settings.chromeHeadless = false;
    console.info('Spawning browser ...');
    await api.browser.pageAsync(async (page) => {
      const context = page.context();
      const pages = context.pages();
      if (pages.length > 0) pages[0].goto('https://www.crunchyroll.com/').catch(() => undefined);
      if (pages.length > 1) pages[1].goto('https://www.funimation.com/').catch(() => undefined);
      await new Promise<void>((resolve) => context.on('close', resolve));
    });
  });
}
