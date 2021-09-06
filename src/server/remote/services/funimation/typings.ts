export type Episode = {
  episodeNumber: string;
  images: Array<{key: string, path: string}>;
  name: Localized;
  slug: string;
  synopsis: Localized;
  videoOptions: {audioLanguages: Array<{languageCode: string}>};
};

export type Localized = {
  en: string;
}

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
  name: Localized;
};

export type Series = {
  images: Array<{key: string, path: string}>;
  longSynopsis: Localized;
  name: Localized;
  seasons: Array<{id: string, name: string}>;
  slug: string;
};

export type Stream = {
  errors?: Array<{detail: string}>;
  items: Array<{src: string, videoType: string}>;
};
