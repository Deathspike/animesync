export type Episode = {
  episodeNumber: string;
  images: Array<{key: string, path: string}>;
  name: string;
  slug: string;
  synopsis: string;
  videoList: Array<{spokenLanguages?: Array<{languageCode: string}>}>;
};

export type Player = {
  seasons: Array<{
    episodes: Array<{
      languages: Record<string, {
        alpha: Record<string, PlayerAlpha>
      }>
    }>;
  }>;
};

export type PlayerAlpha = {
  experienceId: number;
  sources: Array<{
    type: string;
    textTracks: Array<{
      language: 'es' | 'en' | 'pt';
      src: string;
      type: string;
    }>;
  }>;
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

export type Stream = {
  items: Array<{src: string, videoType: string}>;
};
