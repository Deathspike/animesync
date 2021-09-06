export interface INavigator {
  readonly current: INavigatorEpisode;
  readonly episodes: Array<INavigatorEpisode>;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  openNext: (shouldDelay: boolean) => void;
  openPrevious: (shouldDelay: boolean) => void;
  preloadNext: () => void;
}

export interface INavigatorEpisode {
  readonly seriesName: string;
  readonly seasonName: string;
  readonly episodeName: string;
  readonly episodeTitle?: string;
}

export interface ISource {
  readonly displayName?: string;
  readonly bandwidth?: number;
  readonly resolutionX?: number;
  readonly resolutionY?: number;
  readonly urls: Array<string>;
  readonly type: 'hls' | 'mkv';
}

export interface ISubtitle {
  readonly displayNames?: Array<string>,
  readonly language: 'ar-ME' | 'de-DE' | 'en-US' | 'es-ES' | 'es-LA' | 'fr-FR' | 'it-IT' | 'pt-BR' | 'ru-RU' | 'tr-TR';
  readonly size?: 'tiny'| 'small' | 'normal' | 'large' | 'huge';
  readonly type: 'ass' | 'srt';
  readonly url: string;
};

export interface IVideoHandler {
  onVideoEvent?(event: VideoEvent): void;
  onVideoRequest?(event: VideoRequest): void;
}

export type VideoEvent =
  {type: 'create'} |
  {type: 'ended'} |
  {type: 'error'} & {time: number} |
  {type: 'loadedmetadata'} & {duration: number} |
  {type: 'playing'} & {time: number} |
  {type: 'progress'} & {buffer: number} |
  {type: 'pause'} & {time: number} |
  {type: 'seeked'} & {time: number} |
  {type: 'seeking'} & {time: number} |
  {type: 'timeupdate'} & {duration: number, time: number} |
  {type: 'waiting'} & {time: number} |
  {type: 'warning'} & {time: number};
  
export type VideoRequest =
  {type: 'clearSubtitle'} |
  {type: 'loadSource', source: ISource, sourceType: 'hls' | 'mkv'} |
  {type: 'loadSubtitle', subtitle: ISubtitle} |
  {type: 'pause'} |
  {type: 'play'} |
  {type: 'seek', time: number} |
  {type: 'sources', sources: Array<ISource>, time?: number} |
  {type: 'subtitles', subtitles: Array<ISubtitle>};
