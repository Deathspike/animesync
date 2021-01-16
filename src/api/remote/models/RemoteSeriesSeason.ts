import * as acm from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteSeriesSeason {
  constructor(source?: RemoteSeriesSeason, sourcePatch?: Partial<RemoteSeriesSeason>) {
    this.episodes = acm.property('episodes', source, sourcePatch, []);
    this.title = acm.property('title', source, sourcePatch, '');
  }

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @nsg.ApiProperty({type: [acm.RemoteSeriesSeasonEpisode]})
  readonly episodes: Array<acm.RemoteSeriesSeasonEpisode>;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly title: string;
}
