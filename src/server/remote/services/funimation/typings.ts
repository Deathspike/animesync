export type Episode = {
  episodeNumber: string;
  images: Array<{key: string, path: string}>;
  name: Localized;
  slug: string;
  synopsis: Localized;
  videoOptions: {audioLanguages: Record<string, {all: Array<{languageCode: string}>}>};
};

export type Localized = {
  en: string;
}

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
  primary: {subtitles: Array<{fileExt: string, filePath: string, languageCode: 'es' | 'en' | 'pt'}>};
};
