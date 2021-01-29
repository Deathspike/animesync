export type PageSeries = {
  children: Array<{mediaCategory: string, number: string, title: string}>;
  genres: Array<{name: string}>;
  id: number;
  poster: string;
  synopsis: string;
  title: string;
}

export type PageSeriesSeason = {
  items: Array<PageSeriesSeasonEpisode>;
}

export type PageSeriesSeasonEpisode = {
  audio: Array<string>;
  item: {episodeName: string, episodeNum: string, episodeSlug: string};
  mostRecentSvod: {subscriptionRequired?: boolean};
  poster: string;
  synopsis: string;
}
