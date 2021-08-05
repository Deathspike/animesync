export type Episode = {
  episodeNumber: string;
  images: Array<{key: string, path: string}>;
  name: string;
  slug: string;
  synopsis: string;
  videoList: Array<{spokenLanguages?: Array<{languageCode: string}>}>;
};

export type Season = {
  episodes: Array<Episode>;
  name: string;
};

export type Series = {
  images: Array<{key: string, path: string}>;
  longSynopsis: string;
  name: string;
  seasons: Array<{id: string, name: string}>;
  slug: string;
};
