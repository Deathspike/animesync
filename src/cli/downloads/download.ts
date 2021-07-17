import * as app from '../..';
import * as cli from '..';

export async function downloadAsync(api: app.Server, seriesPath: string, series: app.api.RemoteSeries, options?: cli.IOptions) {
  const tracker = new cli.Tracker(seriesPath);
  const workQueue = await cli.updateAsync(seriesPath, series);
  for (const {seasonName, episodeName, episodePath, episodeUrl} of workQueue) {
    const elapsedTime = new cli.Timer();
    const outputPath = `${episodePath}.mkv`;
    if (await tracker.existsAsync(seasonName, episodeName)) {
      api.logger.info(`Skipping ${episodeName}`);
    } else if (options && options.skipDownload) {
      api.logger.info(`Tracking ${episodeName}`);
      await tracker.trackAsync(seasonName, episodeName);
    } else {
      api.logger.info(`Fetching ${episodeName}`);
      const stream = await api.remote.streamAsync({url: episodeUrl});
      const sync = new cli.Sync(api, outputPath);
      if (stream.value && sync) {
        await sync.saveAsync(stream.value);
        await tracker.trackAsync(seasonName, episodeName);
        api.logger.info(`Finished ${episodeName} (${elapsedTime})`);
      } else {
        api.logger.info(`Rejected ${episodeName}`);
      }
    }
  }
}
