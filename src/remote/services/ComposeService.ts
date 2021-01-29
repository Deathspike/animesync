import * as app from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class ComposeService {
  private readonly _contextService: app.ContextService;

  constructor(contextService: app.ContextService) {
    this._contextService = contextService;
  }

  search(search: app.api.RemoteSearch, headers?: Record<string, string>) {
    return new app.api.RemoteSearch(search, {
      series: search.series.map(series => new app.api.RemoteSearchSeries(series, {
        imageUrl: this._contextService.emulateUrl(series.imageUrl, headers)
      }))
    });
  }

  series(series: app.api.RemoteSeries, headers?: Record<string, string>) {
    return new app.api.RemoteSeries(series, {
      imageUrl: this._contextService.emulateUrl(series.imageUrl, headers),
      seasons: series.seasons.map(season => new app.api.RemoteSeriesSeason(season, {
        episodes: season.episodes.map(episode => new app.api.RemoteSeriesSeasonEpisode(episode, {
          imageUrl: this._contextService.emulateUrl(episode.imageUrl, headers)
        }))
      }))
    });
  }

  stream(stream: app.api.RemoteStream, headers?: Record<string, string>) {
    return new app.api.RemoteStream(stream, {
      url: this._contextService.hlsUrl(stream.url, headers),
      subtitles: stream.subtitles.map(subtitle => new app.api.RemoteStreamSubtitle(subtitle, {
        url: this._contextService.emulateUrl(subtitle.url, headers)
      }))
    });
  }
}
