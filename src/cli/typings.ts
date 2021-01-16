export type ILibrary = {
  version: number;
  entries: Record<string, {rootPath?: string}>;
};

export type IOptions = {
  skipDownload?: true;
};
