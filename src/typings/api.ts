import * as api from 'class-validator';

export enum IApiProviderName {
  CrunchyRoll = 'crunchyroll',
  Funimation = 'funimation'
}

export class IApiQuerySeries {
  @api.IsNotEmpty()
  @api.IsUrl()
  imageUrl!: string;

  @api.IsNotEmpty()
  title!: string;

  @api.IsNotEmpty()
  @api.IsUrl()
  url!: string;
}

export class IApiQuery {
  @api.IsNotEmpty()
  hasMorePages!: boolean;

  @api.IsNotEmpty()
  series!: Array<IApiQuerySeries>;
}

export class IApiSeriesSeasonEpisode {
  @api.IsNotEmpty()
  imageUrl!: string;

  @api.IsNotEmpty()
  isPremium!: boolean;

  @api.IsNotEmpty()
  number!: string;

  @api.IsNotEmpty()
  title!: string;

  @api.IsNotEmpty()
  synopsis!: string;

  @api.IsNotEmpty()
  url!: string;
}

export class IApiSeriesSeason {
  @api.IsNotEmpty()
  episodes!: Array<IApiSeriesSeasonEpisode>;

  @api.IsNotEmpty()
  title!: string;
}

export class IApiSeries {
  @api.IsNotEmpty()
  genres!: Array<string>;

  @api.IsNotEmpty()
  imageUrl!: string;

  @api.IsNotEmpty()
  seasons!: Array<IApiSeriesSeason>;

  @api.IsNotEmpty()
  synopsis!: string;
  
  @api.IsNotEmpty()
  title!: string;

  @api.IsNotEmpty()
  url!: string;
}

export class IApiStreamSubtitle {
  @api.IsNotEmpty()
  language!: string;

  @api.IsNotEmpty()
  type!: string;

  @api.IsNotEmpty()
  url!: string;
}

export class IApiStream {
  @api.IsNotEmpty()
  manifestType!: 'hls';

  @api.IsNotEmpty()
  manifestUrl!: string;

  @api.IsNotEmpty()
  subtitles!: Array<IApiStreamSubtitle>;
}
