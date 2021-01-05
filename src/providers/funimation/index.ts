import * as app from '../..';
import * as subtitle from 'subtitle';
import fetch from 'node-fetch';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';
import scraper from './scraper';

export async function funimationAsync(context: app.Context, rootPath: string, seriesUrl: string, options?: app.ISeriesOptions) {
  await app.browserAsync(context, async (page) => {
    const [metadataPromise] = new app.Observer(page).getAsync(/\/api\/episodes\//i);
    await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
    const metadata = await metadataPromise.then(x => x.response()).then(x => x?.json()) as SeriesMetadata;
    const seasons = [metadata];
    while (!page.isClosed()) {
      const [seasonPromise] = new app.Observer(page).getAsync(/\/api\/episodes\//i);
      if (!await page.evaluate(scraper.nextSeason)) {
        seasonPromise.catch(() => undefined);
        await page.close();
        await seasons.reduce((p, x) => p.then(() => seasonAsync(context, rootPath, x, options)), Promise.resolve());
      } else {
        seasons.push(await seasonPromise.then(x => x.response()).then(x => x?.json()) as SeriesMetadata);
      }
    }
  });
}

async function seasonAsync(context: app.Context, rootPath: string, metadata: SeriesMetadata, options?: app.ISeriesOptions) {
  const series = new app.Series(app.settings.library);
  for (const episode of metadata.items.filter(x => x.audio.includes('Japanese'))) {
    const episodeNumber = parseFloat(episode.item.episodeNum);
    const seasonNumber = parseFloat(episode.item.seasonNum);
    if (episodeNumber >= 0 && seasonNumber >= 0) {
      const elapsedTime = new app.Timer();
      const seriesName = sanitizeFilename(episode.item.titleName);
      const seriesPath = path.join(rootPath, seriesName);
      const episodeName = `${seriesName} ${String(seasonNumber).padStart(2, '0')}x${String(episodeNumber).padStart(2, '0')} [Funimation]`;
      const episodePath = `${path.join(seriesPath, episodeName)}.mkv`;
      const episodeUrl = `https://www.funimation.com/shows/${episode.item.titleSlug}/${episode.item.episodeSlug}/?qid=&lang=japanese`;
      if (await series.existsAsync(seriesName, episodeName)) {
        app.logger.info(`Skipping ${episodeName}`);
      } else if (options && options.skipDownload) {
        app.logger.info(`Tracking ${episodeName}`);
        await series.trackAsync(seriesName, episodeName);
      } else try {
        app.logger.info(`Fetching ${episodeName}`);
        await episodeAsync(context, episodePath, episodeUrl);
        await series.trackAsync(seriesName, episodeName);
        app.logger.info(`Finished ${episodeName} (${elapsedTime})`);
      } catch (error) {
        app.logger.info(`Rejected ${episodeName} (${elapsedTime})`);
        app.logger.error(error);
      }
    }
  }
}

async function episodeAsync(context: app.Context, episodePath: string, episodeUrl: string) {
  const sync = new app.Sync(episodePath, 'srt', app.settings.sync);
  await app.browserAsync(context, async (page, userAgent) => {
    const [manifestPromise, vttSubtitlePromise] = new app.Observer(page).getAsync(/\.m3u8$/i, /\.vtt$/i);
    await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
    const manifestSrc = await manifestPromise.then(x => x.url());
    const vttSubtitleSrc = await vttSubtitlePromise.then(x => x.url());
    await page.close();
    if (manifestSrc && vttSubtitleSrc) try {
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const manifestUrl = context.rewrite.createHlsUrl(manifestSrc, headers);
      const vttSubtitleUrl = context.rewrite.createEmulateUrl(vttSubtitleSrc, headers);
      const vttSubtitle = await fetch(vttSubtitleUrl).then(x => x.text());
      const srtSubtitle = subtitle.stringifySync(subtitle.parseSync(vttSubtitle), {format: 'SRT'});
      await sync.saveAsync(manifestUrl, srtSubtitle);
    } finally {
      await sync.disposeAsync();
    } else {
      throw new Error(`Invalid episode: ${episodeUrl}`);
    }
  });
}

const defaultHeaders = {
  origin: 'https://www.funimation.com',
  referer: 'https://www.funimation.com/'
};

type SeriesMetadata = {
  items: Array<{audio: Array<string>, item: {episodeNum: string, episodeSlug: string, seasonNum: string, titleName: string, titleSlug: string}}>;
};
