import * as app from '../../..';
import * as cli from '../..';
import {updateArtworkAsync} from './updateArtwork'
import fs from 'fs-extra';
import path from 'path';

export async function updateSeriesAsync(seriesPath: string, series: app.api.RemoteSeries) {
  const seriesInfo = cli.SeriesInfo.create(series);
  await fs.ensureDir(seriesPath);
  await fs.writeFile(path.join(seriesPath, 'tvshow.nfo'), String(seriesInfo));
  await updateArtworkAsync(path.join(seriesPath, 'poster'), series.imageUrl, true);
}
