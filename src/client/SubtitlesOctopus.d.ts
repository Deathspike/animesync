declare class SubtitlesOctopus {
  constructor(options: SubtitlesOctopusOptions);
  dispose(): void;
}

type SubtitlesOctopusOptions = {
  subContent: string;
  workerUrl: string;
  fonts?: Array<string>;
  video?: HTMLVideoElement;
};

type SubtitlesOctopusEvent = {
  data: {target: 'canvas', op: string} | {target: 'get-styles', styles: Array<SubtitlesOctopusStyle>};
};

type SubtitlesOctopusStyle = {
  FontSize: number;
  Name: string;
};
