import * as app from '../..';
import {httpAsync} from './utilities/http';
import fs from 'fs-extra';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';
import scraper from './scraper';

export async function crunchyrollAsync(rootPath: string, seriesUrl: string) {
  await app.browserAsync(async (page) => {
    await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
    const seasons = await page.evaluate(scraper.seasons);
    await page.close();
    for (const season of seasons) {
      if (/\(.+\)/.test(season.title)) continue;
      const seriesName = sanitizeFilename(season.title);
      const seriesPath = path.join(rootPath, seriesName);
      const seriesReport = await app.Series.loadAsync(seriesPath);
      for (const episode of season.episodes) {
        const numberMatch = episode.title.match(/([0-9]+(?:\.[0-9])?)/);
        const number = numberMatch ? parseFloat(numberMatch[1]) : -1;
        if (number >= 0) {
          const elapsedTime = new app.Timer();
          const episodeName = `${seriesName} ${String(number).padStart(2, '0')} [CrunchyRoll].mkv`;
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
            console.error(err);
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
    await page.close();
    const metadataMatch = content.match(/vilos\.config\.media\s*=\s*({.+?});/);
    const metadata = metadataMatch && JSON.parse(metadataMatch[1]) as EpisodeMetadata;
    const stream = metadata?.streams.find(x => x.format === 'adaptive_hls' && !x.hardsub_lang);
    const sync = new app.Sync(app.settings.sync);
    if (metadata && stream) try {
      await Promise.all(metadata.subtitles.map(s => httpAsync(s.url).then(d => sync.writeAsync(`${s.language.replace(/([a-z])([A-Z])/g, '$1-$2')}.${s.format}`, d))));
      await sync.streamAsync(app.settings.proxyServer, stream.url);
      await sync.mergeAsync(episodePath);
    } finally {
      await sync.disposeAsync();
    } else {
      throw new Error(`Invalid episode: ${episodeUrl}`);
    }
  });
}

type EpisodeMetadata = {
  streams: Array<{format: string, hardsub_lang: string | null, url: string}>,
  subtitles: Array<{format: string, language: string, url: string}>
};
