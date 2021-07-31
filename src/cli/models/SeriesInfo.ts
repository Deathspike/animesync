import * as app from '../..';
import * as clv from 'class-validator';
import {ValidationError} from '../../srv/shared/ValidationError';
import xml2js from 'xml2js';

export class SeriesInfo {
  constructor(source: SeriesInfo) {
    this.genres = source.genres;
    this.synopsis = source.synopsis;
    this.title = source.title;
    this.url = source.url;
  }

  static create(series: app.api.RemoteSeries) {
    return new SeriesInfo({
      genres: series.genres,
      synopsis: series.synopsis,
      title: series.title,
      url: series.url,
    });
  }

  static async parseAsync(xml: string) {
    const parsedXml: ParsedSeriesInfo = await xml2js.parseStringPromise(xml, {
      emptyTag: undefined,
      explicitRoot: false
    });
    return await ValidationError.validateSingleAsync(SeriesInfo, new SeriesInfo({
      genres: parsedXml.genre ?? [],
      synopsis: parsedXml.plot?.[0],
      title: parsedXml.title?.[0] ?? '',
      url: parsedXml.uniqueid
        ?.filter(x => typeof x !== 'string' && x.$.type.includes('animesync'))
        ?.map(x => typeof x !== 'string' ? x._ : '')
        ?.[0] ?? ''
    }));
  }

  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
  readonly genres: Array<string>;

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
    return new xml2js.Builder().buildObject({tvshow: {
      genre: this.genres,
      plot: this.synopsis && [this.synopsis],
      title: [this.title],
      uniqueid: [{$: {type: ['animesync']}, _: this.url}]
    } as ParsedSeriesInfo});
  }
}

type ParsedSeriesInfo = {
  genre?: Array<string>;
  plot?: Array<string>;
  title?: Array<string>;
  uniqueid?: Array<string | {$: {type: Array<string>}, _: string}>
};
