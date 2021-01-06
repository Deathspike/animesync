export type ISeries = {
  children: Array<{number: string, title: string}>;
  genres: Array<{name: string}>;
  id: number;
  poster: string;
  synopsis: string;
  title: string;
}

export type ISeriesSeason = {
  items: Array<ISeriesSeasonEpisode>;
}

export type ISeriesSeasonEpisode = {
  audio: Array<string>;
  item: {episodeName: string, episodeNum: string, episodeSlug: string};
  mostRecentSvod: {subscriptionRequired: boolean};
  poster: string;
  synopsis: string;
}
