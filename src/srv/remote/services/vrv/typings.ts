export type Artwork = {
  height: number;
  width: number;
  source: string;
};

export type Collection<T> = {
  items: Array<T>;
};

export type Episode = {
  description?: string;
  episode?: string;
  id: string;
  images: Record<string, Array<Array<Artwork>>>;
  title: string;
};

export type Season = {
  id: string;
  title: string;
}

export type Series = {
  description?: string;
  images: Record<string, Array<Array<Artwork>>>;
  title: string;
};

export type Streams = {
  streams: Record<string, Record<string, {hardsub_locale: string, url: string}>>;
  subtitles: Record<string, {format: any, locale: any, url: string}>;
};
