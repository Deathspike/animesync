export type IApiQuery = {
  hasMorePages: boolean;
  series: Array<IApiQuerySeries>;
}

export type IApiQuerySeries = {
  imageUrl: string;
  title: string;
  url: string;
}

export type IApiSeries = {
  genres: Array<string>;
  imageUrl: string;
  seasons: Array<IApiSeriesSeason>;
  synopsis: string;
  title: string;
  url: string;
}

export type IApiSeriesSeason = {
  episodes: Array<IApiSeriesSeasonEpisode>;
  title: string;
}

export type IApiSeriesSeasonEpisode = {
  imageUrl: string;
  isPremium: boolean;
  number: string;
  title: string;
  synopsis: string;
  url: string;
}

export type IApiStream = {
  manifestType: 'hls';
  manifestUrl: string;
  subtitles: Array<IApiStreamSubtitle>;
}

export type IApiStreamSubtitle = {
  language: string;
  type: string;
  url: string;
}
