import * as app from '..';

export async function browserAsync() {
  console.log(`Starting ${app.settings.serverUrl}`);
  await app.Server.usingAsync(async (api) => {
    app.settings.chromeHeadless = false;
    console.log('Spawning browser ...');
    await api.browser.pageAsync(async (page) => {
      const context = page.context();
      const pages = context.pages();
      if (pages.length > 0) pages[0].goto('https://www.crunchyroll.com/');
      if (pages.length > 1) pages[1].goto('https://www.funimation.com/');
      await new Promise<void>((resolve) => context.on('close', resolve))
    });
  });
}
