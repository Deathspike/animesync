import * as app from '..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import {EpisodeSerializer} from './serializers/EpisodeSerializer';

export class EpisodeInfo {
  constructor(source: EpisodeInfo) {
    this.episode = source.episode;
    this.season = source.season;
    this.synopsis = source.synopsis;
    this.title = source.title;
    this.url = source.url;
  }

  static from(seasonIndex: number, episodeIndex: number, source: app.api.RemoteSeriesSeasonEpisode) {
    const episode = episodeIndex + 1;
    const synopsis = source.synopsis;
    const season = seasonIndex + 1;
    const title = source.title;
    const url = source.url;
    return new EpisodeInfo({episode, synopsis, season, title, url});
  }

  static async loadAsync(fileService: app.FileService, episodePath: string) {
    const filePath = `${episodePath}.nfo`;
    const value = await fileService.readAsync(filePath).then(EpisodeSerializer.parseAsync);
    return await app.ValidationError.validateSingleAsync(EpisodeInfo, new EpisodeInfo(value));
  }

  static async saveAsync(fileService: app.FileService, episodePath: string, episode: EpisodeInfo) {
    const filePath = `${episodePath}.nfo`;
    const value = EpisodeSerializer.serialize(app.api.unsafe(episode));
    await fileService.writeAsync(filePath, value);
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

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsUrl()
  readonly url?: string;
}
