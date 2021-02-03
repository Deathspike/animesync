export type PageSeries = {
  children: Array<{mediaCategory: string, number: string, title: string}>;
  genres: Array<{name: string}>;
  id: number;
  poster: string;
  synopsis: string;
  title: string;
};

export type PageSeriesSeason = {
  items: Array<PageSeriesSeasonEpisode>;
};

export type PageSeriesSeasonEpisode = {
  audio: Array<string>;
  item: {episodeName: string, episodeNum: string, episodeSlug: string};
  mostRecentSvod: {subscriptionRequired?: boolean};
  poster: string;
  synopsis: string;
};

export type PageStream = {
  id: string;
};

export type PageStreamExperience = {
  seasons: Array<{
    episodes: Array<{
      languages: Record<string, {
        alpha: Record<string, {
          experienceId: number;
          sources: Array<{
            textTracks: Array<PageStreamExperienceTrack>;
            type: string;
          }>;
        }>
      }>
    }>;
  }>;
};

export type PageStreamExperienceTrack = {
  language: string;
  src: string;
  type: string;
}

export type PageStreamShowExperience = {
  items: Array<{src: string, videoType: string}>
};
