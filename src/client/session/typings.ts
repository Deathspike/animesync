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

export interface ISubtitle {
  readonly displayNames?: Array<string>,
  readonly language: string;
  readonly type: 'ass' | 'vtt';
  readonly url: string;
};
