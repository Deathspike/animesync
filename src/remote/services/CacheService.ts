import * as app from '..';
import * as ncm from '@nestjs/common';
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';

@ncm.Injectable()
export class CacheService implements ncm.OnModuleDestroy {
  private readonly loggerService: app.LoggerService;
  private readonly timeoutHandles: {[key: string]: NodeJS.Timeout};
  private readonly values: {[key: string]: Promise<any> | string};

  constructor(loggerService: app.LoggerService) {
    this.loggerService = loggerService;
    this.timeoutHandles = {};
    this.values = {};
  }

  async expireAsync(key: string) {
    const value = this.values[key];
    if (value instanceof Promise) {
      const continueWith = () => this.expireAsync(key).catch((error) => this.loggerService.error(error));
      value.then(continueWith, continueWith);
    } else if (value) {
      clearTimeout(this.timeoutHandles[key]);
      delete this.timeoutHandles[key];
      delete this.values[key];
      await fs.remove(path.join(app.settings.cache, value));
    }
  }

  async getAsync<T>(key: string, timeout: number, valueFactory: () => Promise<T>) {
    const value = this.values[key];
    if (value instanceof Promise) {
      return await value as T;
    } else if (value) {
      return await fs.readJson(path.join(app.settings.cache, value)) as T;
    } else {
      return await this.addAsync(key, timeout, valueFactory());
    }
  }

  async onModuleDestroy() {
    const keys = Object.keys(this.timeoutHandles);
    const expires = keys.map(x => this.expireAsync(x));
    await Promise.all(expires);
  }

  private async addAsync<T>(key: string, timeout: number, valuePromise: Promise<T>) {
    try {
      this.values[key] = valuePromise;
      const id = `${Date.now().toString(16) + crypto.randomBytes(24).toString('hex')}.json`;
      const value = await valuePromise;
      await fs.ensureDir(app.settings.cache);
      await fs.writeJson(path.join(app.settings.cache, id), value, {spaces: 2});
      this.timeoutHandles[key] = setTimeout(() => this.expireAsync(key).catch((error) => this.loggerService.error(error)), timeout);
      this.values[key] = id;
      return value;
    } catch (error) {
      delete this.values[key];
      throw error;
    }
  }
}
