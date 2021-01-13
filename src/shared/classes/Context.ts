import querystring from 'querystring';

export class Context {
  private readonly _baseUrl: string;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  emulateUrl(url: string, headers?: Record<string, string>) {
    const safeQuery = querystring.stringify(headers);
    const safeUrl = encodeURIComponent(url);
    return new URL(`/api/rewrite/${safeUrl}?${safeQuery}`, this._baseUrl).toString();
  }

  hlsUrl(url: string, headers?: Record<string, string>) {
    const safeQuery = querystring.stringify(headers);
    const safeUrl = encodeURIComponent(url);
    return new URL(`/api/rewrite/hls/${safeUrl}?${safeQuery}`, this._baseUrl).toString();
  }
}
