import * as app from '../..';
import * as cli from '..';
type Worker = (series: app.api.LibraryContextSeries, sourceUrl?: string) => Promise<void>;

export async function checkAsync(api: app.Server, urls: Array<string>, workAsync: Worker, options?: cli.Options) {
  return urls && urls.length
    ? await urlAsync(api, urls, workAsync, options)
    : await contextAsync(api, workAsync);
}

async function contextAsync(api: app.Server, workAsync: Worker) {
  const context = await api.library.contextAsync();
  const series = context.value ? context.value.series : [];
  await series.reduce((p, c) => p.then(async () => workAsync(c)), Promise.resolve());
}

async function urlAsync(api: app.Server, urls: Array<string>, workAsync: Worker, options?: cli.Options) {
  for (const url of urls) {
    api.logger.info(`Checking ${url}`);
    const rootPath = options && options.rootPath;
    const response = await api.library.contextPostAsync({rootPath, url});
    if (response.success) {
      const context = await api.library.contextAsync();
      const series = context.value?.series.find(x => x.url === url);
      if (series) await workAsync(series, url);
    } else {
      api.logger.info(`Rejected ${url}`);
    }
  }
}
