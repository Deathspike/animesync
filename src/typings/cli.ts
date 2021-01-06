export type ICliOptions = {
  skipDownload?: true;
};

export type ILibrarySource = {
  version: number;
  entries: Record<string, {rootPath?: string}>;
}

export type ILoggerService = {
  debug: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};
