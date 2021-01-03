import * as app from '..';

export async function browserAsync() {
  app.logger.info(`Launching browser ...`);
  app.settings.chromeHeadless = false;
  await app.browserAsync(async (page) => {
    const context = page.context();
    const pages = context.pages();
    if (pages.length > 0) pages[0].goto('https://www.crunchyroll.com/');
    if (pages.length > 1) pages[1].goto('https://www.funimation.com/');
    await new Promise((resolve) => context.on('close', resolve))
  });
}
