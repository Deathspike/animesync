import * as app from '../..';
import fs from 'fs-extra';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';
import scraper from './scraper';

export async function crunchyrollAsync(rootPath: string, seriesUrl: string) {
  await app.browserAsync(async (page) => {
    await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
    for (const season of await page.evaluate(scraper.seasons)) {
      if (/\(.+\)/.test(season.title)) continue;
      const seriesPath = path.join(rootPath, sanitizeFilename(season.title));
      const seriesReport = await app.Series.loadAsync(seriesPath);
      for (const episode of season.episodes) {
        const numberMatch = episode.title.match(/([0-9]+(?:\.[0-9])?)/);
        const number = numberMatch ? parseInt(numberMatch[1], 10) : -1;
        if (number >= 0) {
          const elapsedTime = new app.Timer();
          const episodeName = `${sanitizeFilename(season.title)} ${String(number).padStart(2, '0')} [CrunchyRoll].mkv`;
          const episodePath = path.join(seriesPath, episodeName);
          if (seriesReport.includes(episode.url)) {
            console.log(`Skipping ${episodeName}`);
          } else if (await fs.pathExists(episodePath)) {
            console.log(`Skipping ${episodeName}`);
            await seriesReport.trackAsync(episodeName, episode.url);
          } else try {
            console.log(`Fetching ${episodeName}`);
            await episodeAsync(episodePath, episode.url);
            await seriesReport.trackAsync(episodeName, episode.url);
            console.log(`Finished ${episodeName} (${elapsedTime})`);
          } catch (err) {
            console.log(`Rejected ${episodeName} (${elapsedTime})`);
            console.log(err);
          }
        }
      }
    }
  });
}

async function episodeAsync(episodePath: string, episodeUrl: string) {
  return await app.browserAsync(async (page) => {
    await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
    const content = await page.content();
    const metadataMatch = content.match(/vilos\.config\.media\s*=\s*({.+?});/);
    const metadata = metadataMatch && JSON.parse(metadataMatch[1]) as Metadata;
    const stream = metadata?.streams.find(x => x.format === 'adaptive_hls' && !x.hardsub_lang);
    const worker = new app.Worker(app.settings.sync);
    if (metadata && stream) try {
      await Promise.all(metadata.subtitles.map(x => worker.subtitleAsync(`${x.language.replace(/([a-z])([A-Z])/g, '$1-$2')}.${x.format}`, x.url)));
      await worker.streamAsync(stream.url);
      await worker.mergeAsync(episodePath);
    } finally {
      await worker.disposeAsync();
    } else {
      throw new Error(`Invalid episode: ${episodeUrl}`);
    }
  });
}

type Metadata = {
  streams: Array<{format: string, hardsub_lang: string | null, url: string}>,
  subtitles: Array<{format: string, language: string, url: string}>
};
