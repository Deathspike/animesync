import * as app from '../../..';
import {HttpsProxyAgent} from 'https-proxy-agent';
import https from 'https';
import url from 'url';

// TODO: Deprecate `httpAsync` and use Chrome. And remove `https-proxy-agent` module.
export function httpAsync(requestUrl: string) {
  const agent = app.settings.httpProxy
    ? new HttpsProxyAgent(app.settings.httpProxy)
    : undefined;
  return new Promise<string>((resolve, reject) => {
    const options = url.parse(requestUrl);
    https.get(Object.assign(options as https.RequestOptions, {agent}), (res) => {
      let chunk = '';
      res.on('data', (x) => chunk += x);
      res.on('end', () => resolve(chunk));
      res.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
}
