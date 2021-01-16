import * as app from '../..';
import * as apx from '..';
import {crunchyrollAsync} from './crunchyroll';
import {funimationAsync} from './funimation';

export async function seriesAsync(api: app.Server, rootPath: string, seriesUrl: string, options?: apx.IOptions) {
  try {
    if (seriesUrl.toLowerCase().startsWith('https://www.crunchyroll.com/')) {
      api.logger.log(`Fetching ${seriesUrl}`);
      await crunchyrollAsync(api, rootPath, seriesUrl, options);
      api.logger.log(`Finished ${seriesUrl}`);
    } else if (seriesUrl.toLowerCase().startsWith('https://www.funimation.com/')) {
      api.logger.log(`Fetching ${seriesUrl}`);
      await funimationAsync(api, rootPath, seriesUrl, options);
      api.logger.log(`Finished ${seriesUrl}`);
    } else {
      api.logger.log(`Skipping ${seriesUrl}`);
    }
  } catch (error) {
    api.logger.log(`Rejected ${seriesUrl}`);
    api.logger.error(error);
  }
}
