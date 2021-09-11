export interface INavigator {
  readonly current: INavigatorEpisode;
  readonly episodes: Array<INavigatorEpisode>;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  openNext: (manualRequest: boolean) => void;
  openPrevious: (manualRequest: boolean) => void;
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
  readonly type: 'hls' | 'src';
}

export interface ISubtitle {
  readonly displayNames?: Array<string>,
  readonly language: string;
  readonly size?: 'tiny'| 'small' | 'normal' | 'large' | 'huge';
  readonly type: 'ass' | 'vtt';
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
  {type: 'loadSource', source: ISource} |
  {type: 'loadSubtitle', subtitle: ISubtitle} |
  {type: 'pause'} |
  {type: 'play'} |
  {type: 'seek', time: number} |
  {type: 'subtitles', subtitles: Array<ISubtitle>};
