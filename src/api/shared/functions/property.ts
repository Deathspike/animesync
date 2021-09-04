export function property<T extends object, K extends keyof T, V extends T[K]>(name: K, source: T | undefined, sourcePatch: Partial<T> | undefined, value: V) {
  if (sourcePatch?.hasOwnProperty(name)) return sourcePatch[name] as T[K];
  if (source?.hasOwnProperty(name)) return source[name];
  return value;
}
