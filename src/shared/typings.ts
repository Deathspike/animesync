export type ILoggerService = {
  debug: (message: string) => void;
  error: (message: string, trace?: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
};
