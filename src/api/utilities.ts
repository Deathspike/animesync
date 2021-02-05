import {RequestInit} from 'node-fetch';
import fetch from 'node-fetch';

export async function jsonAsync<T>(url: URL, init?: RequestInit) {
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

export function property<T extends object, K extends keyof T, V extends T[K]>(name: K, source: T | undefined, sourcePatch: Partial<T> | undefined, value: V) {
  return sourcePatch?.hasOwnProperty(name)
    ? sourcePatch[name] as T[K]
    : source?.hasOwnProperty(name)
      ? source[name]
      : value;
}
