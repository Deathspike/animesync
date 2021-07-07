import * as app from '..';

export interface IProvider {
  contextAsync(): Promise<app.api.RemoteProvider>;
  isSeriesAsync(seriesUrl: string): Promise<boolean>;
  isStreamAsync(streamUrl: string): Promise<boolean>;
  pageAsync(page?: string, options?: Array<string>, pageNumber?: number): Promise<app.IComposable<app.api.RemoteSearch>>;
  searchAsync(query: string, pageNumber?: number): Promise<app.IComposable<app.api.RemoteSearch>>;
  seriesAsync(seriesUrl: string): Promise<app.IComposable<app.api.RemoteSeries>>;
  streamAsync(episodeUrl: string): Promise<app.IComposable<app.api.RemoteStream>>;
}
