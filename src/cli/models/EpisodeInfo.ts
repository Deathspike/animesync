import * as app from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import xml2js from 'xml2js';

export class EpisodeInfo {
  private constructor(source: EpisodeInfo) {
    this.animesync = source.animesync;
    this.episode = Number(source.episode);
    this.plot = source.plot;
    this.season = Number(source.season);
    this.title = source.title;
  }

  static create(seasonIndex: number, episodeIndex: number, episode: app.api.RemoteSeriesSeasonEpisode) {
    return new EpisodeInfo({
      animesync: episode.url,
      episode: episodeIndex + 1,
      plot: undefined,
      season: seasonIndex + 1,
      title: episode.title
    });
  }

  static async parseAsync(xml: string) {
    const input = await xml2js.parseStringPromise(xml, {emptyTag: undefined, explicitArray: false, explicitRoot: false});
    const value = new EpisodeInfo(input);
    await clv.validateOrReject(value);
    return value;
  }

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsUrl()
  readonly animesync?: string;

  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  readonly episode: number;

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsNotEmpty()
  readonly plot?: string;

  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  readonly season: number;
  
  @clv.IsOptional()
  @clv.IsString()
  readonly title?: string;

  toString() {
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({episodedetails: this});
    return xml;
  }
}
