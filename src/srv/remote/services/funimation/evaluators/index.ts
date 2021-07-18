export type PageSeries = {
  genres: Array<{name: string}>;
  images: Array<{key: string, path: string}>;
  longSynopsis: string;
  name: string;
  seasons: Array<{id: string, name: string}>;
};

export type PageSeriesSeason = {
  episodes: Array<PageSeriesSeasonEpisode>;
};

export type PageSeriesSeasonEpisode = {
  episodeNumber: string;
  images: Array<{key: string, path: string}>;
  name: string;
  slug: string;
  synopsis: string;
  videoList: Array<{spokenLanguages: Array<{languageCode: string}>}>;
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
