import http from 'http';
import https from 'https';

export function httpAsync(url: string) {
  return new Promise<string>((resolve, reject) => {
    const get = url.startsWith('https:')
      ? https.get
      : http.get;
    get(url, (res) => {
      let chunk = '';
      res.on('data', (x) => chunk += x);
      res.on('end', () => resolve(chunk));
      res.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  })
}
