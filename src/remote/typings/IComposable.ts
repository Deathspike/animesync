export interface IComposable<T> {
  headers?: Record<string, string>;
  url: string;
  value: T;
}
