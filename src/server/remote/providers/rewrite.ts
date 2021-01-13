import * as app from '..';

export const rewrite = {
  search(context: app.Context, search: app.api.RemoteSearch, headers?: Record<string, string>) {
    return new app.api.RemoteSearch(search, {
      series: search.series.map(series => new app.api.RemoteSearchSeries(series, {
        imageUrl: context.emulateUrl(series.imageUrl, headers)
      }))
    });
  },

  series(context: app.Context, series: app.api.RemoteSeries, headers?: Record<string, string>) {
    return new app.api.RemoteSeries(series, {
      imageUrl: context.emulateUrl(series.imageUrl, headers),
      seasons: series.seasons.map(season => new app.api.RemoteSeriesSeason(season, {
        episodes: season.episodes.map(episode => new app.api.RemoteSeriesSeasonEpisode(episode, {
          imageUrl: context.emulateUrl(episode.imageUrl, headers)
        }))
      }))
    });
  },

  stream(context: app.Context, stream: app.api.RemoteStream, headers?: Record<string, string>) {
    return new app.api.RemoteStream(stream, {
      url: context.hlsUrl(stream.url, headers),
      subtitles: stream.subtitles.map(subtitle => new app.api.RemoteStreamSubtitle(subtitle, {
        url: context.emulateUrl(subtitle.url, headers)
      }))
    });
  }
};
