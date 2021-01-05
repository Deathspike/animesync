import * as app from '..';
import {crunchyrollAsync} from './crunchyroll';
import {funimationAsync} from './funimation';

export async function seriesAsync(context: app.Context, rootPath: string, seriesUrl: string, options?: app.ISeriesOptions) {
  if (seriesUrl.toLowerCase().startsWith('https://www.crunchyroll.com/')) {
    app.logger.info(`Fetching ${seriesUrl}`);
    await crunchyrollAsync(context, rootPath, seriesUrl, options);
    app.logger.info(`Finished ${seriesUrl}`);
  } else if (seriesUrl.toLowerCase().startsWith('https://www.funimation.com/')) {
    app.logger.info(`Fetching ${seriesUrl}`);
    await funimationAsync(context, rootPath, seriesUrl, options);
    app.logger.info(`Finished ${seriesUrl}`);
  } else {
    app.logger.info(`Skipping ${seriesUrl}`);
  }
}
