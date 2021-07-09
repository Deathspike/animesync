export interface IComposable<T> {
  baseUrl: string;
  headers?: Record<string, string>;
  value: T;
}
