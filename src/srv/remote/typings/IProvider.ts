import * as app from '..';

export interface IProvider {
  isSeriesAsync(seriesUrl: string): Promise<boolean>;
  isStreamAsync(streamUrl: string): Promise<boolean>;
  seriesAsync(seriesUrl: string): Promise<app.IComposable<app.api.RemoteSeries>>;
  streamAsync(episodeUrl: string): Promise<app.IComposable<app.api.RemoteStream>>;
}
