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

  search(search: app.api.RemoteSearch, headers?: Record<string, string>) {
    return new app.api.RemoteSearch(search, {
      series: search.series.map(series => new app.api.RemoteSearchSeries(series, {
        imageUrl: this.contextService.emulateUrl(series.imageUrl, headers)
      }))
    });
  }

  series(series: app.api.RemoteSeries, headers?: Record<string, string>) {
    return new app.api.RemoteSeries(series, {
      imageUrl: this.contextService.emulateUrl(series.imageUrl, headers),
      seasons: series.seasons.map(season => new app.api.RemoteSeriesSeason(season, {
        episodes: season.episodes.map(episode => new app.api.RemoteSeriesSeasonEpisode(episode, {
          imageUrl: this.contextService.emulateUrl(episode.imageUrl, headers)
        }))
      }))
    });
  }

  async streamAsync(stream: app.api.RemoteStream, headers?: Record<string, string>) {
    const manifests = await Promise.all(stream.sources.map(x => this.agentService
      .fetchAsync(new URL(x.url), {headers})
      .then(x => x.text())
      .then(x => app.HlsManifest.from(x))));
    const streams = manifests.map(x => x.fetchStreams())
      .reduce((p, c) => p.concat(c), [])
      .sort(app.HlsManifestLineStream.compareFn);
    return new app.api.RemoteStream(stream, {
      sources: streams.map(x => new app.api.RemoteStreamSource({
        bandwidth: x.bandwidth || undefined,
        resolutionX: x.resolution.x || undefined,
        resolutionY: x.resolution.y || undefined,
        type: stream.sources[0].type,
        url: this.contextService.hlsUrl(x.url, headers)
      })),
      subtitles: stream.subtitles.map(subtitle => new app.api.RemoteStreamSubtitle(subtitle, {
        url: this.contextService.emulateUrl(subtitle.url, headers)
      }))
    });
  }
}
