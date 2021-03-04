import * as app from '..';
import * as ncm from '@nestjs/common';
import querystring from 'querystring';

@ncm.Injectable()
export class RewriteService {
  emulateUrl(baseUrl: string, relativeUrl: string, headers?: Record<string, string>) {
    const safeQuery = querystring.stringify(headers);
    const safeUrl = encodeURIComponent(new URL(relativeUrl, baseUrl).toString());
    return new URL(`/api/rewrite/${safeUrl}?${safeQuery}`, app.settings.server.url).toString();
  }

  hlsUrl(baseUrl: string, relativeUrl: string, headers?: Record<string, string>) {
    const safeQuery = querystring.stringify(headers);
    const safeUrl = encodeURIComponent(new URL(relativeUrl, baseUrl).toString());
    return new URL(`/api/rewrite/hls/${safeUrl}?${safeQuery}`, app.settings.server.url).toString();
  }
}
