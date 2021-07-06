import * as app from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class ComposeService {
  private readonly agentService: app.AgentService;
  private readonly rewriteService: app.RewriteService;

  constructor(agentService: app.AgentService, rewriteService: app.RewriteService) {
    this.agentService = agentService;
    this.rewriteService = rewriteService;
  }

  search(baseUrl: string, search: app.api.RemoteSearch, headers?: Record<string, string>) {
    return new app.api.RemoteSearch(search, {
      series: search.series.map(series => new app.api.RemoteSearchSeries(series, {
        imageUrl: this.rewriteService.emulateUrl(baseUrl, series.imageUrl, headers)
      }))
    });
  }

  series(baseUrl: string, series: app.api.RemoteSeries, headers?: Record<string, string>) {
    return new app.api.RemoteSeries(series, {
      imageUrl: series.imageUrl && this.rewriteService.emulateUrl(baseUrl, series.imageUrl, headers),
      seasons: series.seasons.map(season => new app.api.RemoteSeriesSeason(season, {
        episodes: season.episodes.map(episode => new app.api.RemoteSeriesSeasonEpisode(episode, {
          imageUrl: episode.imageUrl && this.rewriteService.emulateUrl(baseUrl, episode.imageUrl, headers)
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
        url: this.rewriteService.emulateUrl(baseUrl, subtitle.url, headers)
      }))
    });
  }

  private async sourceAsync(masterUrl: string, headers?: Record<string, string>) {
    const streams = await this.agentService
      .fetchAsync(new URL(masterUrl), {headers})
      .then(x => app.HlsManifest.from(x.toString('utf-8')))
      .then(x => x.fetchStreams());
    return streams.map(x => new app.api.RemoteStreamSource({
      bandwidth: x.bandwidth || undefined,
      resolutionX: x.resolution.x || undefined,
      resolutionY: x.resolution.y || undefined,
      type: 'hls',
      url: this.rewriteService.masterUrl(masterUrl, x.url, headers)
    }));
  }
}
