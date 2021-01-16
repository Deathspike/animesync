import * as ace from '../..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class ComposeService {
  private readonly _contextService: ace.shr.ContextService;

  constructor(contextService: ace.shr.ContextService) {
    this._contextService = contextService;
  }

  search(search: ace.api.RemoteSearch, headers?: Record<string, string>) {
    return new ace.api.RemoteSearch(search, {
      series: search.series.map(series => new ace.api.RemoteSearchSeries(series, {
        imageUrl: this._contextService.emulateUrl(series.imageUrl, headers)
      }))
    });
  }

  series(series: ace.api.RemoteSeries, headers?: Record<string, string>) {
    return new ace.api.RemoteSeries(series, {
      imageUrl: this._contextService.emulateUrl(series.imageUrl, headers),
      seasons: series.seasons.map(season => new ace.api.RemoteSeriesSeason(season, {
        episodes: season.episodes.map(episode => new ace.api.RemoteSeriesSeasonEpisode(episode, {
          imageUrl: this._contextService.emulateUrl(episode.imageUrl, headers)
        }))
      }))
    });
  }

  stream(stream: ace.api.RemoteStream, headers?: Record<string, string>) {
    return new ace.api.RemoteStream(stream, {
      url: this._contextService.hlsUrl(stream.url, headers),
      subtitles: stream.subtitles.map(subtitle => new ace.api.RemoteStreamSubtitle(subtitle, {
        url: this._contextService.emulateUrl(subtitle.url, headers)
      }))
    });
  }
}
