import * as app from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import {ValidationError} from '../../srv/shared/ValidationError';
import xml2js from 'xml2js';

export class EpisodeInfo {
  constructor(source: EpisodeInfo) {
    this.episode = source.episode;
    this.season = source.season;
    this.synopsis = source.synopsis;
    this.title = source.title;
    this.url = source.url;
  }

  static create(seasonIndex: number, episodeIndex: number, episode: app.api.RemoteSeriesSeasonEpisode) {
    return new EpisodeInfo({
      episode: episodeIndex + 1,
      synopsis: episode.synopsis,
      season: seasonIndex + 1,
      title: episode.title,
      url: episode.url
    });
  }

  static async parseAsync(xml: string) {
    const parsedXml: ParsedEpisodeInfo = await xml2js.parseStringPromise(xml, {
      emptyTag: undefined, 
      explicitRoot: false
    });
    return await ValidationError.validateSingleAsync(EpisodeInfo, new EpisodeInfo({
      episode: Number(parsedXml.episode?.[0]),
      season: Number(parsedXml.season?.[0]),
      synopsis: parsedXml.plot?.[0],
      title: parsedXml.title?.[0],
      url: parsedXml.uniqueid
        ?.filter(x => typeof x !== 'string' && x.$.type.includes('animesync'))
        ?.map(x => typeof x !== 'string' ? x._ : '')
        ?.[0] ?? ''
    }));
  }

  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  readonly episode: number;

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsNotEmpty()
  readonly synopsis?: string;

  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  readonly season: number;
  
  @clv.IsOptional()
  @clv.IsString()
  readonly title?: string;

  @clv.IsString()
  @clv.IsUrl()
  readonly url: string;

  toString() {
    return new xml2js.Builder().buildObject({episodedetails: {
      episode: [String(this.episode)],
      plot: this.synopsis && [this.synopsis],
      season: [String(this.season)],
      title: this.title && [this.title],
      uniqueid: [{$: {type: ['animesync']}, _: this.url}]
    } as ParsedEpisodeInfo});
  }
}

type ParsedEpisodeInfo = {
  episode?: Array<string>;
  plot?: Array<string>;
  season?: Array<string>;
  title?: Array<string>;
  uniqueid?: Array<string | {$: {type: Array<string>}, _: string}>
};
