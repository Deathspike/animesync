import * as app from '../..';
import fetch from 'node-fetch';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';
import scraper from './scraper';

export async function crunchyrollAsync(context: app.Context, rootPath: string, seriesUrl: string, options?: app.ISeriesOptions) {
  const series = new app.Series(app.settings.library);
  await app.browserAsync(context, async (page) => {
    await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
    const seasons = await page.evaluate(scraper.seasons);
    await page.close();
    for (const season of seasons) {
      if (/\(.+\)/.test(season.title)) continue;
      const seriesName = sanitizeFilename(season.title);
      const seriesPath = path.join(rootPath, seriesName);
      for (const episode of season.episodes) {
        const numberMatch = episode.title.match(/([0-9]+(?:\.[0-9])?)/);
        const number = numberMatch ? parseFloat(numberMatch[1]) : -1;
        if (number >= 0) {
          const elapsedTime = new app.Timer();
          const episodeName = `${seriesName} ${String(number).padStart(2, '0')} [CrunchyRoll]`;
          const episodePath = `${path.join(seriesPath, episodeName)}.mkv`;
          if (await series.existsAsync(seriesName, episodeName)) {
            app.logger.info(`Skipping ${episodeName}`);
          } else if (options && options.skipDownload) {
            app.logger.info(`Tracking ${episodeName}`);
            await series.trackAsync(seriesName, episodeName);
          } else try {
            app.logger.info(`Fetching ${episodeName}`);
            await episodeAsync(context, episodePath, episode.url);
            await series.trackAsync(seriesName, episodeName);
            app.logger.info(`Finished ${episodeName} (${elapsedTime})`);
          } catch (error) {
            app.logger.info(`Rejected ${episodeName} (${elapsedTime})`);
            app.logger.error(error);
          }
        }
      }
    }
  });
}

async function episodeAsync(context: app.Context, episodePath: string, episodeUrl: string) {
  const sync = new app.Sync(episodePath, 'ass', app.settings.sync);
  await app.browserAsync(context, async (page, userAgent) => {
    const [assSubtitlePromise] = new app.Observer(page).getAsync(/\.txt$/i);
    await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
    const manifestSrc = await page.content().then(extractAsync);
    const assSubtitleSrc = await assSubtitlePromise.then(x => x.url());
    await page.close();
    if (manifestSrc && assSubtitleSrc) try {
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const manifestUrl = context.rewrite.createHlsUrl(manifestSrc, headers);
      const assSubtitleUrl = context.rewrite.createEmulateUrl(assSubtitleSrc, headers);
      const assSubtitle = await fetch(assSubtitleUrl).then(x => x.text());
      await sync.saveAsync(manifestUrl, assSubtitle);
    } finally {
      await sync.disposeAsync();
    } else {
      throw new Error(`Invalid episode: ${episodeUrl}`);
    }
  });
}

async function extractAsync(content: string) {
  const metadataMatch = content.match(/vilos\.config\.media\s*=\s*({.+});/);
  const metadata = metadataMatch && JSON.parse(metadataMatch[1]) as EpisodeMetadata;
  const stream = metadata?.streams.find(x => x.format === 'adaptive_hls' && !x.hardsub_lang);
  return stream?.url;
}

const defaultHeaders = {
  origin: 'https://static.crunchyroll.com',
  referer: 'https://static.crunchyroll.com/vilos-v2/web/vilos/player.html'
};

type EpisodeMetadata = {
  streams: Array<{format: string, hardsub_lang: string | null, url: string}>;
};
