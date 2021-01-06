export type IStreamData = {
  streams: Array<{audio_lang: string, format: string, hardsub_lang?: string, url: string}>;
  subtitles: Array<{format: string; language: string; url: string}>;
};
