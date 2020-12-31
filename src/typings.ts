export interface ILibraryData {
  version: number;
  entries: Record<string, {rootPath?: string}>;
}

export interface ISeriesOptions {
  skipDownload?: true;
};
