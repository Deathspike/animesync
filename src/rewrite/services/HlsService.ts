import * as app from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class HlsService {
  private readonly contextService: app.ContextService;

  constructor(contextService: app.ContextService) {
    this.contextService = contextService;
  }

  rewrite(baseUrl: string, manifest: string, headers?: Record<string, string>) {
    const hls = app.HlsManifest.from(manifest);
    this.update(baseUrl, hls, headers);
    return hls.toString();
  }

  private update(baseUrl: string, hls: app.HlsManifest, headers?: Record<string, string>) {
    for (let i = 0; i < hls.length; i++) {
      if (hls[i].type === 'EXT-X-KEY' && hls[i].params['URI']) {
        hls[i].params['URI'] = this.contextService.emulateUrl(baseUrl, hls[i].params['URI'], headers);
      } else if (hls[i].type === 'EXT-X-STREAM-INF') {
        while (hls[++i].type) continue;
        hls[i].data = this.contextService.hlsUrl(baseUrl, hls[i].data, headers);
      } else if (hls[i].data && !hls[i].type) {
        hls[i].data = this.contextService.emulateUrl(baseUrl, hls[i].data, headers);
      }
    }
  }
}
