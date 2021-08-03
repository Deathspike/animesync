import * as app from '../..';
import * as vrv from './typings';

export class VrvRemap {
  static series(seriesUrl: string, series: vrv.Series, seasons: vrv.Collection<vrv.Season>, seasonEpisodes: Array<vrv.Collection<vrv.Episode>>) {
    return new app.api.RemoteSeries({
      imageUrl: fetchImage(series.images, 'poster_tall'),
      seasons: seasons.items.map((x, i) => this.seriesSeason(seriesUrl, series, x, seasonEpisodes[i])).filter(hasJapaneseAudio),
      synopsis: series.description,
      title: series.title,
      url: seriesUrl
    });
  }

  static seriesSeason(seriesUrl: string, series: vrv.Series, season: vrv.Season, episodes: vrv.Collection<vrv.Episode>) {
    return new app.api.RemoteSeriesSeason({
      episodes: episodes.items.map(x => this.seriesSeasonEpisode(seriesUrl, series, x)),
      title: season.title
    });
  }

  static seriesSeasonEpisode(seriesUrl: string, series: vrv.Series, episode: vrv.Episode) {
    return new app.api.RemoteSeriesSeasonEpisode({
      imageUrl: fetchImage(episode.images, 'thumbnail'),
      name: episode.episode || episode.title,
      synopsis: episode.description || undefined,
      title: episode.title,
      url: new URL(`/watch/${episode.id}/${createSlug(series.title)}:${createSlug(episode.title)}`, seriesUrl).toString()
    });
  }

  static stream(streams: vrv.Streams) {
    return new app.api.RemoteStream({
      sources: [{type: 'hls', url: streams.streams['adaptive_hls'][''].url}],
      subtitles: Object.values(streams.subtitles).map(x => new app.api.RemoteStreamSubtitle({language: x.locale, type: x.format, url: x.url}))
    });
  }
}

function createSlug(value: string) {
  return value.trim()
    .replace(/[^A-Za-z0-9 -]/g, '')
    .replace(/(\s|-)+/g, '-')
}

function fetchImage(images: Record<string, Array<Array<vrv.Artwork>>>, k: string) {
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
