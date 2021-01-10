import * as app from '..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSeriesSeason {
  constructor(source: RemoteSeriesSeason, sourcePatch?: Partial<RemoteSeriesSeason>) {
    this.episodes = sourcePatch?.episodes ?? source.episodes;
    this.title = sourcePatch?.title ?? source.title;
  }

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @swg.ApiProperty({type: [app.RemoteSeriesSeasonEpisode]})
  readonly episodes: Array<app.RemoteSeriesSeasonEpisode>;

  @clv.IsString()
  @clv.IsNotEmpty()
  @swg.ApiProperty()
  readonly title: string;
}
