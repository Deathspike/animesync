import * as api from './typings';
import * as app from '../..';

export class CrunchyrollBetaRemap {
  static series(seriesUrl: string, series: api.Series, seasons: api.Collection<api.Season>, seasonEpisodes: Array<api.Collection<api.Episode>>) {
    return new app.api.RemoteSeries({
      imageUrl: fetchImage(series.images, 'poster_tall'),
      seasons: seasons.items.map((x, i) => this.seriesSeason(seriesUrl, series, x, seasonEpisodes[i])).filter(hasJapaneseAudio),
      synopsis: series.description || undefined,
      title: series.title,
      url: seriesUrl
    });
  }

  static seriesSeason(seriesUrl: string, series: api.Series, season: api.Season, episodes: api.Collection<api.Episode>) {
    return new app.api.RemoteSeriesSeason({
      episodes: episodes.items.map(x => this.seriesSeasonEpisode(seriesUrl, series, x)),
      title: season.title
    });
  }

  static seriesSeasonEpisode(seriesUrl: string, series: api.Series, episode: api.Episode) {
    return new app.api.RemoteSeriesSeasonEpisode({
      imageUrl: fetchImage(episode.images, 'thumbnail'),
      name: episode.episode || episode.title,
      synopsis: episode.description || undefined,
      title: episode.title || undefined,
      url: new URL(`/watch/${episode.id}/${createSlug(series.title)}:${createSlug(episode.title)}`, seriesUrl).toString()
    });
  }

  static stream(streams: api.Streams) {
    return new app.api.RemoteStream({
      sources: [{type: 'hls', url: streams.streams['adaptive_hls'][''].url}],
      subtitles: Object.entries(streams.subtitles)
        .filter(([k]) => Boolean(k))
        .map(([_, v]) => new app.api.RemoteStreamSubtitle({language: languages[v.locale], type: v.format, url: v.url}))
    });
  }
}

function createSlug(value: string) {
  return value.trim()
    .replace(/[^A-Za-z0-9 -]/g, '')
    .replace(/(\s|-)+/g, '-')
}

function fetchImage(images: Record<string, Array<Array<api.Artwork>>>, k: string) {
  return images[k]
    ?.find(Boolean)
    ?.slice()?.sort((a, b) => b.width - a.width)
    ?.shift()?.source;
}

function hasJapaneseAudio(season: app.api.RemoteSeriesSeason) {
  if (/\((Arabic|English|French|German|Italian|Portuguese|Russian|Spanish)(\s+Dub)?\)$/.test(season.title)) return false;
  if (/\((Dub|Dubbed)\)$/.test(season.title)) return false;
  return true;
}

const languages = app.api.unsafe({
  'ar-SA' : 'ara',
  'fr-FR' : 'fre',
  'de-DE' : 'ger',
  'en-US' : 'eng',
  'es-419': 'spa-419',
  'es-ES' : 'spa',
  'it-IT' : 'ita',
  'pt-BR' : 'por',
  'ru-RU' : 'rus',
  'tr-TR' : 'tur'
});
