import * as app from '../..';
import * as fun from './typings';

export class FunimationRemap {
  static series(seriesUrl: string, series: fun.Series, seasonEpisodes: Array<fun.Season>, locale?: string) {
    return new app.api.RemoteSeries({
      imageUrl: series.images.find(x => x.key === 'showKeyart')?.path,
      seasons: series.seasons.map((_, i) => this.seriesSeason(seriesUrl, series, seasonEpisodes[i], locale)),
      synopsis: series.longSynopsis || undefined,
      title: series.name,
      url: new URL(`/shows/${series.slug}/`, seriesUrl).toString()
    });
  }

  static seriesSeason(seriesUrl: string, series: fun.Series, season: fun.Season, locale?: string) {
    return new app.api.RemoteSeriesSeason({
      episodes: season.episodes.filter(hasJapaneseAudio).map(x => this.seriesSeasonEpisode(seriesUrl, series, x, locale)),
      title: season.name
    });
  }

  static seriesSeasonEpisode(seriesUrl: string, series: fun.Series, episode: fun.Episode, locale?: string) {
    return new app.api.RemoteSeriesSeasonEpisode({
      imageUrl: episode.images.find(x => x.key === 'episodeThumbnail')?.path,
      name: episode.episodeNumber,
      synopsis: episode.synopsis || undefined,
      title: episode.name || undefined,
      url: new URL(`/${locale}/shows/${series.slug}/${episode.slug}/`, seriesUrl).toString()
    });
  }
}

function hasJapaneseAudio(episode: fun.Episode) {
  return episode.videoList
    .flatMap(x => x.spokenLanguages)
    .some(x => x && x.languageCode === 'ja');
}
