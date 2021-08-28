import * as app from '..';
import * as clv from 'class-validator';
import {SeriesSerializer} from './serializers/SeriesSerializer';
import path from 'path';

export class SeriesInfo {
  constructor(source: SeriesInfo) {
    this.seasons = source.seasons;
    this.synopsis = source.synopsis;
    this.title = source.title;
    this.url = source.url;
  }

  static from(source: app.api.RemoteSeries) {
    const seasons = source.seasons.map(x => x.title);
    const synopsis = source.synopsis;
    const title = source.title;
    const url = source.url;
    return new SeriesInfo({seasons, synopsis, title, url});
  }

  static async loadAsync(fileService: app.FileService, seriesPath: string) {
    const filePath = path.join(seriesPath, 'tvshow.nfo');
    const value = await fileService.readAsync(filePath).then(SeriesSerializer.parseAsync);
    return await app.ValidationError.validateSingleAsync(SeriesInfo, new SeriesInfo(value));
  }

  static async saveAsync(fileService: app.FileService, seriesPath: string, series: SeriesInfo) {
    const filePath = path.join(seriesPath, 'tvshow.nfo');
    const value = SeriesSerializer.serialize(app.api.unsafe(series));
    await fileService.writeAsync(filePath, value);
  }

  @clv.IsOptional()
  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
  @clv.ArrayNotEmpty()
  readonly seasons?: Array<string>;

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsNotEmpty()
  readonly synopsis?: string;
  
  @clv.IsString()
  @clv.IsNotEmpty()
  readonly title: string;

  @clv.IsString()
  @clv.IsUrl()
  readonly url: string;
}
