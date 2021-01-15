export function property<T extends object, K extends keyof T, V extends T[K]>(name: K, source: T | undefined, sourcePatch: Partial<T> | undefined, value: V) {
  return sourcePatch?.hasOwnProperty(name)
    ? sourcePatch[name] as T[K]
    : source?.hasOwnProperty(name)
      ? source[name]
      : value;
}
