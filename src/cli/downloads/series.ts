import * as ace from '../..';
import * as acm from '..';
import {crunchyrollAsync} from './crunchyroll';
import {funimationAsync} from './funimation';

export async function seriesAsync(api: ace.Server, rootPath: string, seriesUrl: string, options?: acm.IOptions) {
  try {
    if (seriesUrl.toLowerCase().startsWith('https://www.crunchyroll.com/')) {
      api.logger.info(`Fetching ${seriesUrl}`);
      await crunchyrollAsync(api, rootPath, seriesUrl, options);
      api.logger.info(`Finished ${seriesUrl}`);
    } else if (seriesUrl.toLowerCase().startsWith('https://www.funimation.com/')) {
      api.logger.info(`Fetching ${seriesUrl}`);
      await funimationAsync(api, rootPath, seriesUrl, options);
      api.logger.info(`Finished ${seriesUrl}`);
    } else {
      api.logger.info(`Skipping ${seriesUrl}`);
    }
  } catch (error) {
    api.logger.error(error);
    api.logger.info(`Rejected ${seriesUrl}`);
  }
}
