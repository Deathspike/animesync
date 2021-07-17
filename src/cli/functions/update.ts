import * as app from '../..';
import * as cli from '..';
import {updateEpisodeAsync} from './update/updateEpisode';
import {updateSeriesAsync} from './update/updateSeries';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export async function updateAsync(api: app.Server, seriesPath: string, series: app.api.RemoteSeries) {
  const workQueue: Array<cli.IUpdate> = [];
  await checkAsync(api, seriesPath, series, workQueue);
  return workQueue;
}

async function checkAsync(api: app.Server, seriesPath: string, series: app.api.RemoteSeries, workQueue: Array<cli.IUpdate>) {
  await updateSeriesAsync(seriesPath, series);
  for (let seasonIndex = 0; seasonIndex < series.seasons.length; seasonIndex++) {
    const season = series.seasons[seasonIndex];
    const seasonName = fetchSeasonName(season);
    const seasonPath = path.join(seriesPath, seasonName);
    for (let episodeIndex = 0; episodeIndex < season.episodes.length; episodeIndex++) {
      const episode = season.episodes[episodeIndex];
      const episodeName = fetchEpisodeName(series, season, episode);
      const episodePath = path.join(seasonPath, episodeName);
      const episodeUrl = episode.url;
      api.logger.info(`Updating ${episodeName}`);
      await updateEpisodeAsync(seasonPath, episodePath, seasonIndex, episodeIndex, episode);
      workQueue.push({seasonName, seasonPath, episodeName, episodePath, episodeUrl});
    }
  }
}

function fetchSeasonName(season: app.api.RemoteSeriesSeason) {
  const match = season.title.match(/^(Season) ([0-9]+)$/);
  const name = match ? `${match[1]} ${match[2].padStart(2, '0')}` : season.title;
  return sanitizeFilename(name);
}

function fetchEpisodeName(series: app.api.RemoteSeries, season: app.api.RemoteSeriesSeason, episode: app.api.RemoteSeriesSeasonEpisode) {
  const match = season.title.match(/^(Season) ([0-9]+)$/);
  const name = match ? `${series.title} S${parseInt(match[2], 10)}` : season.title;
  return sanitizeFilename(`${name} ${episode.name.padStart(2, '0')} [AnimeSync]`)
}
