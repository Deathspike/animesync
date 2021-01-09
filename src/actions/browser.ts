import * as app from '..';

export async function browserAsync() {
  await app.Context.usingAsync(async (context) => {
    app.logger.info(`Launching browser ...`);
    app.settings.chromeHeadless = false;
    await app.browserAsync(context, async (page) => {
      const context = page.context();
      const pages = context.pages();
      if (pages.length > 0) pages[0].goto('https://www.crunchyroll.com/');
      if (pages.length > 1) pages[1].goto('https://www.funimation.com/');
      await new Promise<void>((resolve) => context.on('close', resolve))
    });
  });
}
