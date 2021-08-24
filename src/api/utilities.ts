import * as fch from 'node-fetch';
import fetch from 'node-fetch';
import querystring from 'querystring';

export async function jsonAsync<T>(url: string, init?: fch.RequestInit) {
  try {
    const response = await fetch(url, init);
    if (response.status === 200) {
      const statusCode: 200 = 200;
      const value = await response.json() as T;
      return {statusCode, value};
    } else {
      const statusCode = response.status;
      const error = await response.json();
      return {statusCode, error};
    }
  } catch (error) {
    const statusCode = 0;
    return {statusCode};
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
