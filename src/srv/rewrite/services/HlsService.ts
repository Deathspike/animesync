import * as app from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class HlsService {
  private readonly rewriteService: app.RewriteService;

  constructor(rewriteService: app.RewriteService) {
    this.rewriteService = rewriteService;
  }

  rewrite(baseUrl: string, hls: app.HlsManifest, headers?: Record<string, string>) {
    for (let i = 0; i < hls.length; i++) {
      if ((hls[i].type === 'EXT-X-KEY' || hls[i].type === 'EXT-X-SESSION-KEY') && hls[i].params['URI']) {
        hls[i].params['URI'] = this.rewriteService.emulateUrl(baseUrl, hls[i].params['URI'], headers);
      } else if (hls[i].type === 'EXT-X-MEDIA' && hls[i].params['URI']) {
        hls[i].params['URI'] = this.rewriteService.mediaUrl(baseUrl, hls[i].params['URI'], headers);
      } else if (hls[i].type === 'EXT-X-STREAM-INF') {
        while (hls[++i].type) continue;
        hls[i].data = this.rewriteService.mediaUrl(baseUrl, hls[i].data, headers);
      } else if (hls[i].data && !hls[i].type) {
        hls[i].data = this.rewriteService.emulateUrl(baseUrl, hls[i].data, headers);
      }
    }
  }

  stream(mediaUrl: string, hls: app.HlsManifest) {
    for (let i = 0; i < hls.length; i++) {
      if (hls[i].type !== 'EXT-X-STREAM-INF') continue;
      for (let j = i; j < hls.length; j++) {
        if (hls[j].type) continue;
        if (hls[j].data.split('?')[0] === mediaUrl.split('?')[0]) mediaUrl = '';
        else hls.splice(i, j - --i);
        break;
      }
    }
  }
}
