import * as app from '..';
import * as ncm from '@nestjs/common';
import crypto from 'crypto'
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

@ncm.Injectable()
export class LibraryService {
  private readonly fileService: app.FileService;
  private readonly imageService: app.ImageService;
  private readonly loggerService: app.LoggerService;
  private readonly remoteService: app.RemoteService;
  private readonly supervisor: app.Supervisor;

  constructor(fileService: app.FileService, imageService: app.ImageService, loggerService: app.LoggerService, remoteService: app.RemoteService) {
    this.fileService = fileService;
    this.imageService = imageService;
    this.loggerService = loggerService;
    this.remoteService = remoteService;
    this.supervisor = new app.Supervisor();
  }

  async contextAsync() {
    const coreInfo = await app.CoreInfo.loadAsync(this.fileService);
    const series: Array<app.api.LibraryContextSeries> = [];
    await Promise.all(coreInfo.rootPaths.map(async (rootPath) => {
      const seriesNames = await this.fileService.listAsync(rootPath).catch(() => []);
      await Promise.all(seriesNames.map(async (seriesName) => {
        const seriesPath = path.join(rootPath, seriesName);
        const seriesInfo = await app.SeriesInfo.loadAsync(this.fileService, seriesPath).catch(() => {});
        const seriesValue = createValue(seriesPath, seriesInfo);
        if (seriesInfo && seriesValue) series.push(new app.api.LibraryContextSeries(seriesValue));
      }));
    }));
    series.sort((a, b) => a.title.localeCompare(b.title));
    return new app.api.LibraryContext({...coreInfo, series});
  }

  async contextPostAsync(rootPath: string, url: string) {
    const series = await this.remoteService.seriesAsync({url});
    if (series.error) {
      throw new ncm.HttpException(series.error.message, series.statusCode);
    } else if (series.value) {
      const seriesName = sanitizeFilename(series.value.title);
      const seriesPath = path.join(rootPath ?? app.settings.path.library, seriesName);
      await app.CoreInfo.saveAsync(this.fileService, rootPath);
      await this.saveSeriesAsync(seriesPath, series.value);
    }
  }

  async seriesAsync(seriesPath: string) {
    const seasons: Array<app.api.LibrarySeriesSeason> = [];
    const seriesInfo = await app.SeriesInfo.loadAsync(this.fileService, seriesPath);
    const seriesSeasons = seriesInfo.seasons ?? [];
    const seriesValue = createValue(seriesPath, {...seriesInfo, seasons});
    await Promise.all(seriesSeasons.map(async (seasonTitle, seasonIndex) => {
      const episodes: Array<app.api.LibrarySeriesSeasonEpisode> = [];
      const seasonName = fetchSeasonName(seasonTitle);
      const seasonPath = path.join(seriesPath, seasonName);
      const seasonValue = createValue(seasonPath, {episodes, season: seasonIndex + 1, title: seasonTitle});
      const episodeNames = await this.fileService.listAsync(seasonPath).then(x => [...new Set(x.map(y => path.parse(y).name))]).catch(() => []);
      await Promise.all(episodeNames.map(async (episodeName) => {
        const episodePath = path.join(seasonPath, episodeName);
        const episodeInfo = await app.EpisodeInfo.loadAsync(this.fileService, episodePath).catch(() => {});
        const episodeValue = createValue(episodePath, episodeInfo);
        if (episodeInfo && episodeValue) {
          const active = this.supervisor.contains(episodePath);
          const available = await this.episodeAsync(episodePath).then(x => this.fileService.existsAsync(x.filePath));
          episodes.push(new app.api.LibrarySeriesSeasonEpisode({...episodeValue, active, available}));
        }
      }));
      episodes.sort((a, b) => a.episode - b.episode);
      seasons.push(new app.api.LibrarySeriesSeason(seasonValue));
    }));
    seasons.sort((a, b) => a.season - b.season);
    return new app.api.LibrarySeries(seriesValue);
  }

  async seriesDeleteAsync(seriesPath: string) {
    if (this.supervisor.contains(seriesPath)) return false;
    await this.fileService.deleteAsync(seriesPath);
    return true;
  }

  async seriesPutAsync(seriesPath: string) {
    const seriesInfo = await app.SeriesInfo.loadAsync(this.fileService, seriesPath);
    const series = await this.remoteService.seriesAsync(seriesInfo);
    if (series.error) {
      throw new ncm.HttpException(series.error.message, series.statusCode);
    } else if (series.value) {
      await this.saveSeriesAsync(seriesPath, series.value);
    }
  }

  async seriesImageAsync(seriesPath: string) {
    return await app.SeriesImage
      .findAsync(this.imageService, seriesPath)
      .catch(() => {});
  }

  episodeAsync(episodePath: string) {
    const filePath = `${episodePath}.mkv`;
    return Promise.resolve({filePath});
  }

  async episodeDeleteAsync(episodePath: string) {
    const value = await this.episodeAsync(episodePath);
    await this.fileService.deleteAsync(value.filePath);
  }

  async episodePutAsync(episodePath: string) {
    const episodeInfo = await app.EpisodeInfo.loadAsync(this.fileService, episodePath);
    const value = await this.episodeAsync(episodePath);
    return await this.saveEpisodeAsync(episodePath, value.filePath, episodeInfo.url);
  }

  async episodeImageAsync(episodePath: string) {
    return await app.EpisodeImage
      .findAsync(this.imageService, episodePath)
      .catch(() => {});
  }

  private async saveEpisodeAsync(episodePath: string, filePath: string, url: string) {
    const incompletePath = `${episodePath}.incomplete`;
    return await this.supervisor.createOrAttachAsync(filePath, async () => {
      const runner = new app.Runner(this.fileService, this.loggerService, this.remoteService);
      await runner.runAsync(filePath, incompletePath, url);
    });
  }

  private async saveSeriesAsync(seriesPath: string, series: app.api.RemoteSeries) {
    await this.supervisor.createOrAttachAsync(seriesPath, async () => {
      await app.SeriesInfo.saveAsync(this.fileService, seriesPath, app.SeriesInfo.from(series));
      await app.SeriesImage.saveAsync(this.imageService, seriesPath, series).catch(() => {});
      await Promise.all(series.seasons.map(async (season, seasonIndex) => {
        const seasonName = fetchSeasonName(season.title);
        const seasonPath = path.join(seriesPath, seasonName);
        await Promise.all(season.episodes.map(async (episode, episodeIndex) => {
          const episodeName = fetchSeasonEpisodeName(series, season, episode);
          const episodePath = path.join(seasonPath, episodeName);
          await app.EpisodeInfo.saveAsync(this.fileService, episodePath, app.EpisodeInfo.from(seasonIndex, episodeIndex, episode));
          await app.EpisodeImage.saveAsync(this.imageService, episodePath, episode).catch(() => {});
        }));
      }));
    });
  }
}

function createValue<T>(resourcePath: string, value: T) {
  const id = crypto.createHash('sha1').update(resourcePath, 'binary').digest('hex');
  const path = createValuePath(resourcePath);
  return {...value, id, path};
}

function createValuePath(resourcePath: string) {
  const resource = path.parse(resourcePath);
  return path.join(resource.dir, resource.name);
}

function fetchSeasonName(seasonTitle: string) {
  const match = seasonTitle.match(/^(Season) ([0-9]+)$/);
  const name = match ? `${match[1]} ${match[2].padStart(2, '0')}` : seasonTitle;
  return sanitizeFilename(name);
}

function fetchSeasonEpisodeName(series: app.api.RemoteSeries, season: app.api.RemoteSeriesSeason, episode: app.api.RemoteSeriesSeasonEpisode) {
  const match = season.title.match(/^(Season) ([0-9]+)$/);
  const name = match ? `${series.title} S${parseInt(match[2], 10)}` : season.title;
  return sanitizeFilename(`${name} ${episode.name.padStart(2, '0')} [AnimeSync]`)
}
