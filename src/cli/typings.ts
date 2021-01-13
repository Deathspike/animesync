export type ICliOptions = {
  skipDownload?: true;
};

export type ILibrarySource = {
  version: number;
  entries: Record<string, {rootPath?: string}>;
}
