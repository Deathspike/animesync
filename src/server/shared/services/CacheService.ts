import * as app from '..';
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';

export class CacheService {
  private readonly _timeoutHandles: {[key: string]: NodeJS.Timeout};
  private readonly _values: {[key: string]: Promise<any> | string};

  constructor() {
    this._timeoutHandles = {};
    this._values = {};
  }

  async expireAsync(key: string) {
    const value = this._values[key];
    if (value instanceof Promise) {
      const continueWith = () => this.expireAsync(key).catch((error) => app.logger.error(error));
      value.then(continueWith, continueWith);
    } else if (value) {
      delete this._timeoutHandles[key];
      delete this._values[key];
      await fs.remove(path.join(app.settings.cache, value));
    }
  }

  async getAsync<T>(key: string, timeout: number, valueFactory: () => Promise<T>) {
    const value = this._values[key];
    if (value instanceof Promise) {
      return await value as T;
    } else if (value) {
      return await fs.readJson(path.join(app.settings.cache, value)) as T;
    } else {
      return await this._addAsync(key, timeout, valueFactory());
    }
  }

  private async _addAsync<T>(key: string, timeout: number, valuePromise: Promise<T>) {
    try {
      this._values[key] = valuePromise;
      const id = `${Date.now().toString(16) + crypto.randomBytes(24).toString('hex')}.json`;
      const value = await valuePromise;
      await fs.ensureDir(app.settings.cache);
      await fs.writeJson(path.join(app.settings.cache, id), value, {spaces: 2});
      this._timeoutHandles[key] = setTimeout(() => this.expireAsync(key).catch((error) => app.logger.error(error)), timeout);
      this._values[key] = id;
      return value;
    } catch (error) {
      delete this._values[key];
      throw error;
    }
  }
}
