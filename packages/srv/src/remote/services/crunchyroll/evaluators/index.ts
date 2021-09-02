export type PageStream = {
  streams: Array<{format: string, hardsub_lang?: string, url: string}>;
  subtitles: Array<{format: string; language: string; url: string}>;
};
