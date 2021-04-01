import * as app from '../..';

export class FunimationRegion {
  static search(search: app.api.RemoteSearch) {
    return new app.api.RemoteSearch(search, {
      series: search.series.map(series => new app.api.RemoteSearchSeries(series, {
        url: normalize(series.url)
      }))
    });
  }

  static series(series: app.api.RemoteSeries) {
    return new app.api.RemoteSeries(series, {
      url: normalize(series.url),
      seasons: series.seasons.map(season => new app.api.RemoteSeriesSeason(season, {
        episodes: season.episodes.map(episode => new app.api.RemoteSeriesSeasonEpisode(episode, {
          url: normalize(episode.url)
        }))
      }))
    });
  }
}

function normalize(url: string) {
  const result = new URL(url);
  result.pathname = result.pathname.replace(/^\/(ex-ms|pt-br)\//, '/');
  return result.toString();
}
