export function queryString(model: Record<string, string>) {
  return '?' + Object.entries(model)
    .filter(([_, v]) => typeof v !== 'undefined')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

export function property<T extends object, K extends keyof T, V extends T[K]>(name: K, source: T | undefined, sourcePatch: Partial<T> | undefined, value: V) {
  if (sourcePatch?.hasOwnProperty(name)) return sourcePatch[name] as T[K];
  if (source?.hasOwnProperty(name)) return source[name];
  return value;
}

export function unsafe<T>(value: T) {
  return value as any;
}
