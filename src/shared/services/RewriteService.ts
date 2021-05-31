import * as app from '..';
import * as ncm from '@nestjs/common';
import querystring from 'querystring';

@ncm.Injectable()
export class RewriteService {
  emulateUrl(emulateUrl: string, relativeUrl: string, headers?: Record<string, string>) {
    const safeEmulateUrl = encodeURIComponent(new URL(relativeUrl, emulateUrl).toString());
    const safeQuery = querystring.stringify(headers);
    return new URL(`/api/rewrite/${safeEmulateUrl}?${safeQuery}`, app.settings.server.url).toString();
  }

  masterUrl(masterUrl: string, relativeMediaUrl: string, headers?: Record<string, string>) {
    const safeMasterUrl = encodeURIComponent(masterUrl);
    const safeMediaUrl = encodeURIComponent(new URL(relativeMediaUrl, masterUrl).toString());
    const safeQuery = querystring.stringify(headers);
    return new URL(`/api/rewrite/master/${safeMasterUrl}/${safeMediaUrl}?${safeQuery}`, app.settings.server.url).toString();
  }

  mediaUrl(masterOrMediaUrl: string, relativeMediaUrl: string, headers?: Record<string, string>) {
    const safeMediaUrl = encodeURIComponent(new URL(relativeMediaUrl, masterOrMediaUrl).toString());
    const safeQuery = querystring.stringify(headers);
    return new URL(`/api/rewrite/media/${safeMediaUrl}?${safeQuery}`, app.settings.server.url).toString();
  }
}
