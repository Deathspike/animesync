export type PageSearch = {
  data: Array<{img: string, link: string, name: string, type: string}>;
};

export type PageStream = {
  streams: Array<{audio_lang: string, format: string, hardsub_lang?: string, url: string}>;
  subtitles: Array<{format: string; language: string; url: string}>;
};
