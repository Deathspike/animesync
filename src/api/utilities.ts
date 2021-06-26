import * as fch from 'node-fetch';
import fetch from 'node-fetch';
import querystring from 'querystring';

export async function jsonAsync<T>(url: URL, init?: fch.RequestInit) {
  try {
    const response = await fetch(url, init);
    if (response.status === 200) {
      const statusCode: 200 = 200;
      const value: T = await response.json();
      return {statusCode, value};
    } else {
      const statusCode = response.status;
      const value = undefined;
      return {statusCode, value};
    }
  } catch (error) {
    const statusCode = 0;
    const value = undefined;
    return {statusCode, value};
  }
}

export function queryString(model?: Record<string, string>) {
  if (!model) return querystring.stringify();
  const result: Record<string, string> = {};
  Object.entries(model).filter(([_, v]) => typeof v !== 'undefined').forEach(([k, v]) => result[k] = v);
  return '?' + querystring.stringify(result);
}

export function property<T extends object, K extends keyof T, V extends T[K]>(name: K, source: T | undefined, sourcePatch: Partial<T> | undefined, value: V) {
  if (sourcePatch?.hasOwnProperty(name)) return sourcePatch[name] as T[K];
  if (source?.hasOwnProperty(name)) return source[name];
  return value;
}

export function unsafe<T>(value: T) {
  return value as any;
}
