import * as app from '..';

export const rewrite = {
  search(context: app.Context, search: app.models.RemoteSearch, headers?: Record<string, string>) {
    return new app.models.RemoteSearch(search, {
      series: search.series.map(series => new app.models.RemoteSearchSeries(series, {
        imageUrl: context.rewrite.createEmulateUrl(series.imageUrl, headers)
      }))
    });
  },

  series(context: app.Context, series: app.models.RemoteSeries, headers?: Record<string, string>) {
    return new app.models.RemoteSeries(series, {
      imageUrl: context.rewrite.createEmulateUrl(series.imageUrl, headers),
      seasons: series.seasons.map(season => new app.models.RemoteSeriesSeason(season, {
        episodes: season.episodes.map(episode => new app.models.RemoteSeriesSeasonEpisode(episode, {
          imageUrl: context.rewrite.createEmulateUrl(episode.imageUrl, headers)
        }))
      }))
    });
  },

  stream(context: app.Context, stream: app.models.RemoteStream, headers?: Record<string, string>) {
    return new app.models.RemoteStream(stream, {
      url: context.rewrite.createHlsUrl(stream.url, headers),
      subtitles: stream.subtitles.map(subtitle => new app.models.RemoteStreamSubtitle(subtitle, {
        url: context.rewrite.createEmulateUrl(subtitle.url, headers)
      }))
    });
  }
};
