import * as app from '..';
import * as clv from 'class-validator';
import fetch from 'node-fetch';
import path from 'path';

export class SeriesImage {
  constructor(source: SeriesImage) {
    this.filePath = source.filePath;
  }

  static async findAsync(imageService: app.ImageService, seriesPath: string) {
    const filePath = path.join(seriesPath, 'poster');
    const value = await imageService.findAsync(filePath);
    return await app.ValidationError.validateSingleAsync(SeriesImage, new SeriesImage(value));
  }

  static async saveAsync(imageService: app.ImageService, seriesPath: string, series: app.api.RemoteSeries) {
    if (!series.imageUrl) return;
    const filePath = path.join(seriesPath, 'poster');
    const value = await fetch(series.imageUrl).then(x => x.buffer());
    await imageService.saveAsync(filePath, value);
  }

  @clv.IsString()
  @clv.IsNotEmpty()
  readonly filePath: string;
}
