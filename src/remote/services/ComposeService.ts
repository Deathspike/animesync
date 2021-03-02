import * as app from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class ComposeService {
  private readonly agentService: app.AgentService;
  private readonly contextService: app.ContextService;

  constructor(agentService: app.AgentService, contextService: app.ContextService) {
    this.agentService = agentService;
    this.contextService = contextService;
  }

  search(baseUrl: string, search: app.api.RemoteSearch, headers?: Record<string, string>) {
    return new app.api.RemoteSearch(search, {
      series: search.series.map(series => new app.api.RemoteSearchSeries(series, {
        imageUrl: this.contextService.emulateUrl(baseUrl, series.imageUrl, headers)
      }))
    });
  }

  series(baseUrl: string, series: app.api.RemoteSeries, headers?: Record<string, string>) {
    return new app.api.RemoteSeries(series, {
      imageUrl: this.contextService.emulateUrl(baseUrl, series.imageUrl, headers),
      seasons: series.seasons.map(season => new app.api.RemoteSeriesSeason(season, {
        episodes: season.episodes.map(episode => new app.api.RemoteSeriesSeasonEpisode(episode, {
          imageUrl: this.contextService.emulateUrl(baseUrl, episode.imageUrl, headers)
        }))
      }))
    });
  }

  async streamAsync(baseUrl: string, stream: app.api.RemoteStream, headers?: Record<string, string>) {
    return new app.api.RemoteStream(stream, {
      sources: await Promise.all(stream.sources.map(x => this.sourceAsync(x.url, headers)))
        .then(x => x.reduce((p, c) => p.concat(c), []))
        .then(x => x.sort(app.api.RemoteStreamSource.compareFn)),
      subtitles: stream.subtitles.map(subtitle => new app.api.RemoteStreamSubtitle(subtitle, {
        url: this.contextService.emulateUrl(baseUrl, subtitle.url, headers)
      }))
    });
  }

  private async sourceAsync(manifestUrl: string, headers?: Record<string, string>) {
    const streams = await this.agentService
      .fetchAsync(new URL(manifestUrl), {headers})
      .then(x => x.text())
      .then(x => app.HlsManifest.from(x).fetchStreams());
    return streams.map(x => new app.api.RemoteStreamSource({
      bandwidth: x.bandwidth || undefined,
      resolutionX: x.resolution.x || undefined,
      resolutionY: x.resolution.y || undefined,
      type: 'hls',
      url: this.contextService.hlsUrl(manifestUrl, x.url, headers)
    }));
  }
}
