import * as app from '../..';
import * as subtitle from 'subtitle';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';
import scraper from './scraper';

export async function funimationAsync(rootPath: string, seriesUrl: string, options?: app.ISeriesOptions) {
  await app.browserAsync(async (page) => {
    const [metadataPromise] = new app.Observer(page).getAsync(/\/api\/episodes\//i);
    await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
    const metadata = await metadataPromise.then(x => x.response()).then(x => x?.json()) as SeriesMetadata;
    const seasons = [metadata];
    while (!page.isClosed()) {
      const [seasonPromise] = new app.Observer(page).getAsync(/\/api\/episodes\//i);
      if (!await page.evaluate(scraper.nextSeason)) {
        seasonPromise.catch(() => undefined);
        await page.close();
        await seasons.reduce((p, x) => p.then(() => seasonAsync(rootPath, x, options)), Promise.resolve());
      } else {
        seasons.push(await seasonPromise.then(x => x.response()).then(x => x?.json()) as SeriesMetadata);
      }
    }
  });
}

async function seasonAsync(rootPath: string, metadata: SeriesMetadata, options?: app.ISeriesOptions) {
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
        console.log(`Skipping ${episodeName}`);
      } else if (options && options.skipDownload) {
        console.log(`Tracking ${episodeName}`);
        await series.trackAsync(seriesName, episodeName);
      } else try {
        console.log(`Fetching ${episodeName}`);
        await episodeAsync(episodePath, episodeUrl);
        await series.trackAsync(seriesName, episodeName);
        console.log(`Finished ${episodeName} (${elapsedTime})`);
      } catch (err) {
        console.log(`Rejected ${episodeName} (${elapsedTime})`);
        console.error(err);
      }
    }
  }
}

async function episodeAsync(episodePath: string, episodeUrl: string) {
  const sync = new app.Sync(episodePath, 'srt');
  await app.browserAsync(async (page, options) => {
    const [metadataPromise, vttSubtitlePromise] = new app.Observer(page).getAsync(/\/api\/showexperience\//i, /\.vtt$/i);
    await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
    const m3u8 = await metadataPromise.then(x => x.response()).then(x => x?.json()).then(extractAsync);
    const vttSubtitle = await vttSubtitlePromise.then(x => x.response()).then(x => x?.text());
    await page.close();
    if (m3u8 && vttSubtitle) try {
      const srtSubtitle = subtitle.stringifySync(subtitle.parseSync(vttSubtitle), {format: 'SRT'});
      await sync.saveAsync(m3u8, srtSubtitle, options);
    } finally { 
      await sync.disposeAsync();
    } else {
      throw new Error(`Invalid episode: ${episodeUrl}`);
    }
  });
}

async function extractAsync(json: any) {
  const metadata = json as EpisodeMetadata;
  const stream = metadata.items.find(x => x.videoType === 'm3u8');
  return stream?.src;
}

type SeriesMetadata = {
  items: Array<{audio: Array<string>, item: {episodeNum: string, episodeSlug: string, seasonNum: string, titleName: string, titleSlug: string}}>;
};

type EpisodeMetadata = {
  items: Array<{src: string, videoType: string}>
};
