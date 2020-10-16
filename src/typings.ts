export interface ILibraryData {
  version: number;
  entries: Record<string, ILibraryDataItem>;
}

export interface ILibraryDataItem {
  rootPath?: string;
}

export interface ISeriesOptions {
  skipDownload?: true;
};
