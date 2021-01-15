import * as app from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSeriesSeason {
  constructor(source?: RemoteSeriesSeason, sourcePatch?: Partial<RemoteSeriesSeason>) {
    this.episodes = app.property('episodes', source, sourcePatch, []);
    this.title = app.property('title', source, sourcePatch, '');
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
