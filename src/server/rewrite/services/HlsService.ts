import * as app from '..';
import * as api from '@nestjs/common';

@api.Injectable()
export class HlsService {
  private readonly _contextService: app.ContextService;

  constructor(contextService: app.ContextService) {
    this._contextService = contextService;
  }

  getBestStreamUrl(manifest: string) {
    const hls = app.HlsManifest.from(manifest);
    const streams = hls.fetchStreams();
    if (streams.length) {
      return streams[0].url;
    } else {
      return undefined;
    }
  }

  rewrite(manifest: string, headers?: Record<string, string>) {
    const context = this._contextService.get();
    const hls = app.HlsManifest.from(manifest);
    rewrite(context, hls, headers);
    return hls.toString();
  }
}

function rewrite(context: app.Context, hls: app.HlsManifest, headers?: Record<string, string>) {
  for (let i = 0; i < hls.length; i++) {
    if (hls[i].type === 'EXT-X-KEY' && hls[i].params['URI']) {
      hls[i].params['URI'] = context.emulateUrl(hls[i].params['URI'], headers);
    } else if (hls[i].type === 'EXT-X-STREAM-INF') {
      while (hls[++i].type) continue;
      hls[i].data = context.hlsUrl(hls[i].data, headers);
    } else if (hls[i].data && !hls[i].type) {
      hls[i].data = context.emulateUrl(hls[i].data, headers);
    }
  }
}
