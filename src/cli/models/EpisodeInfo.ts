import * as app from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import {EpisodeInfoXml} from './xml/EpisodeInfoXml';
import {ValidationError} from '../../srv/shared/ValidationError';

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
    const episodeInfoXml = await EpisodeInfoXml.parseAsync(xml);
    const episodeInfo = new EpisodeInfo(episodeInfoXml);
    return await ValidationError.validateSingleAsync(EpisodeInfo, episodeInfo);
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
    return EpisodeInfoXml.serialize(app.api.unsafe(this));
  }
}
