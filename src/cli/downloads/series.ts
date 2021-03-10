import * as app from '../..';
import * as cli from '..';

export async function seriesAsync(api: app.Server, rootPath: string, url: string, options?: cli.IOptions) {
  try {
    api.logger.info(`Fetching ${url}`);
    const providers = await api.remote.contextAsync({url});
    const provider = providers.value && providers.value.shift();
    const series = await api.remote.seriesAsync({url});
    if (provider && series.value) {
      await cli.downloadAsync(api, rootPath, provider, series.value, options);
      api.logger.info(`Finished ${url}`);
    } else {
      api.logger.info(`Skipping ${url}`);
    }
  } catch (error) {
    api.logger.error(error);
    api.logger.info(`Rejected ${url}`);
  }
}
