export type ILoggerService = {
  debug: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};
