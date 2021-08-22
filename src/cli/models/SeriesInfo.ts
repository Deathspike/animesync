import * as app from '../..';
import * as clv from 'class-validator';
import {SeriesInfoXml} from './xml/SeriesInfoXml';
import {ValidationError} from '../../srv/shared/ValidationError';

export class SeriesInfo {
  constructor(source: SeriesInfo) {
    this.seasons = source.seasons;
    this.synopsis = source.synopsis;
    this.title = source.title;
    this.url = source.url;
  }

  static create(series: app.api.RemoteSeries) {
    return new SeriesInfo({
      seasons: series.seasons.map(x => x.title),
      synopsis: series.synopsis,
      title: series.title,
      url: series.url,
    });
  }

  static async parseAsync(xml: string) {
    const seriesInfoXml = await SeriesInfoXml.parseAsync(xml);
    const seriesInfo = new SeriesInfo(seriesInfoXml);
    return await ValidationError.validateSingleAsync(SeriesInfo, seriesInfo);
  }

  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
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

  toString() {
    return SeriesInfoXml.serialize(app.api.unsafe(this));
  }
}
