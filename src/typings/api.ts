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
  subtitleType: 'ass' | 'vtt';
  subtitleUrl: string;
}
