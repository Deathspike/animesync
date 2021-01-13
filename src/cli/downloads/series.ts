import * as app from '..';
import {crunchyrollAsync} from './crunchyroll';
import {funimationAsync} from './funimation';

export async function seriesAsync(api: app.api.ServerApi, rootPath: string, seriesUrl: string, options?: app.ICliOptions) {
  try {
    if (seriesUrl.toLowerCase().startsWith('https://www.crunchyroll.com/')) {
      app.logger.info(`Fetching ${seriesUrl}`);
      await crunchyrollAsync(api, rootPath, seriesUrl, options);
      app.logger.info(`Finished ${seriesUrl}`);
    } else if (seriesUrl.toLowerCase().startsWith('https://www.funimation.com/')) {
      app.logger.info(`Fetching ${seriesUrl}`);
      await funimationAsync(api, rootPath, seriesUrl, options);
      app.logger.info(`Finished ${seriesUrl}`);
    } else {
      app.logger.info(`Skipping ${seriesUrl}`);
    }
  } catch (error) {
    app.logger.info(`Rejected ${seriesUrl}`);
    app.logger.error(error);
  }
}
