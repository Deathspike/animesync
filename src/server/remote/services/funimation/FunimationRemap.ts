import * as app from '../..';
import * as fun from './typings';

export class FunimationRemap {
  static series(seriesUrl: string, series: fun.Series, seasonEpisodes: Array<fun.Season>, locale?: string) {
    return new app.api.RemoteSeries({
      imageUrl: series.images.find(x => x.key === 'Show Keyart')?.path,
      seasons: series.seasons.map((_, i) => this.seriesSeason(seriesUrl, series, seasonEpisodes[i], locale)),
      synopsis: series.longSynopsis.en || undefined,
      title: series.name.en,
      url: new URL(`/shows/${series.slug}/`, seriesUrl).toString()
    });
  }

  static seriesSeason(seriesUrl: string, series: fun.Series, season: fun.Season, locale?: string) {
    return new app.api.RemoteSeriesSeason({
      episodes: season.episodes.filter(hasJapaneseAudio).map(x => this.seriesSeasonEpisode(seriesUrl, series, x, locale)),
      title: season.name.en
    });
  }

  static seriesSeasonEpisode(seriesUrl: string, series: fun.Series, episode: fun.Episode, locale?: string) {
    return new app.api.RemoteSeriesSeasonEpisode({
      imageUrl: episode.images.find(x => x.key === 'Episode Thumbnail')?.path,
      name: episode.episodeNumber,
      synopsis: episode.synopsis.en || undefined,
      title: episode.name.en || undefined,
      url: new URL(`/${locale}/shows/${series.slug}/${episode.slug}/`, seriesUrl).toString()
    });
  }

  static stream(player: fun.PlayerAlpha, stream: fun.Stream) {
    checkOrThrowError(stream);
    const sources = stream.items
      .filter(x => x.videoType === 'm3u8')
      .map(x => new app.api.RemoteStreamSource({type: 'hls', url: x.src}));
    const subtitles = player.sources
      .filter(x => x.type === 'application/x-mpegURL')
      .flatMap(x => x.textTracks)
      .filter(x => x.src.endsWith('.srt') && x.type.toLowerCase() === 'full')
      .map(x => new app.api.RemoteStreamSubtitle({language: languages[x.language], type: 'srt', url: x.src}));
    return new app.api.RemoteStream({sources, subtitles});
  }
}

function checkOrThrowError(stream: fun.Stream) {
  const details = stream.errors?.map(x => x.detail);
  const message = details?.shift();
  if (message) throw new Error(message);
}

function hasJapaneseAudio(episode: fun.Episode) {
  return episode.videoOptions
    .audioLanguages
    .some(x => x && x.languageCode === 'ja');
}

const languages = app.api.unsafe({
  'es': 'spa-419',
  'en': 'eng',
  'pt': 'por'
});
