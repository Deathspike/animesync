import * as app from '../..';
import * as cli from '..';
import fs from 'fs-extra';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export async function downloadAsync(api: app.Server, seriesPath: string, series: app.api.RemoteSeries, options?: cli.IOptions) {
  const tracker = new cli.Tracker(seriesPath);
  await cli.updateSeriesAsync(seriesPath, series);
  for (let seasonIndex = 0; seasonIndex < series.seasons.length; seasonIndex++) {
    const season = series.seasons[seasonIndex];
    const seasonName = getSeasonName(season);
    const seasonPath = path.join(seriesPath, seasonName);
    for (let episodeIndex = 0; episodeIndex < season.episodes.length; episodeIndex++) {
      const elapsedTime = new cli.Timer();
      const episode = season.episodes[episodeIndex];
      const episodeName = sanitizeFilename(`${seasonName} ${episode.name.padStart(2, '0')} [AnimeSync]`);
      const episodePath = path.join(seasonPath, episodeName);
      const outputPath = `${episodePath}.mkv`;
      if (await tracker.existsAsync(seasonName, episodeName) && await fs.pathExists(outputPath)) {
        api.logger.info(`Skipping ${episodeName}`);
        await cli.updateEpisodeInfoAsync(seasonPath, episodePath, seasonIndex, episodeIndex, episode);
      } else if (await tracker.existsAsync(seasonName, episodeName)) {
        api.logger.info(`Skipping ${episodeName}`);
      } else if (options && options.skipDownload) {
        api.logger.info(`Tracking ${episodeName}`);
        await tracker.trackAsync(seasonName, episodeName);
      } else {
        api.logger.info(`Fetching ${episodeName}`);
        const stream = await api.remote.streamAsync({url: episode.url});
        const sync = new cli.Sync(api, outputPath);
        if (stream.value && sync) {
          await cli.updateEpisodeInfoAsync(seasonPath, episodePath, seasonIndex, episodeIndex, episode);
          await sync.saveAsync(stream.value);
          await tracker.trackAsync(seasonName, episodeName);
          api.logger.info(`Finished ${episodeName} (${elapsedTime})`);
        } else {
          api.logger.info(`Rejected ${episodeName}`);
        }
      }
    }
  }
}

function getSeasonName(season: app.api.RemoteSeriesSeason) {
  const match = season.title.match(/^(Season) ([0-9]+)$/);
  const name = match ? `${match[1]} ${match[2].padStart(2, '0')}` : season.title;
  return sanitizeFilename(name);
}
