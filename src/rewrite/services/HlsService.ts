import * as ace from '../..';
import * as acm from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class HlsService {
  private readonly _contextService: ace.shr.ContextService;

  constructor(contextService: ace.shr.ContextService) {
    this._contextService = contextService;
  }

  getBestStreamUrl(manifest: string) {
    const hls = acm.HlsManifest.from(manifest);
    const streams = hls.fetchStreams();
    if (streams.length) {
      return streams[0].url;
    } else {
      return undefined;
    }
  }

  rewrite(manifest: string, headers?: Record<string, string>) {
    const hls = acm.HlsManifest.from(manifest);
    rewrite(this._contextService, hls, headers);
    return hls.toString();
  }
}

function rewrite(contextService: ace.shr.ContextService, hls: acm.HlsManifest, headers?: Record<string, string>) {
  for (let i = 0; i < hls.length; i++) {
    if (hls[i].type === 'EXT-X-KEY' && hls[i].params['URI']) {
      hls[i].params['URI'] = contextService.emulateUrl(hls[i].params['URI'], headers);
    } else if (hls[i].type === 'EXT-X-STREAM-INF') {
      while (hls[++i].type) continue;
      hls[i].data = contextService.hlsUrl(hls[i].data, headers);
    } else if (hls[i].data && !hls[i].type) {
      hls[i].data = contextService.emulateUrl(hls[i].data, headers);
    }
  }
}
