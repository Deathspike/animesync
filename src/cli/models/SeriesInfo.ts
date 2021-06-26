import * as app from '../..';
import * as clv from 'class-validator';
import xml2js from 'xml2js';

export class SeriesInfo {
  private constructor(source: SeriesInfo) {
    this.animesync = source.animesync;
    this.genre = new Array<string>().concat(source.genre);
    this.plot = source.plot;
    this.title = source.title;
  }

  static create(series: app.api.RemoteSeries) {
    return new SeriesInfo({
      animesync: series.url,
      genre: series.genres,
      plot: series.synopsis,
      title: series.title
    });
  }

  static async parseAsync(xml: string) {
    const input = await xml2js.parseStringPromise(xml, {emptyTag: undefined, explicitArray: false, explicitRoot: false});
    const value = new SeriesInfo(input);
    await clv.validateOrReject(value);
    return value;
  }

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsUrl()
  readonly animesync?: string;

  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
  readonly genre: Array<string>;

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsNotEmpty()
  readonly plot?: string;
  
  @clv.IsString()
  @clv.IsNotEmpty()
  readonly title: string;

  toString() {
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({tvshow: this});
    return xml;
  }
}
