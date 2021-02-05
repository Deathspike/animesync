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
    const valueOrPath = this.values[key];
    if (valueOrPath instanceof Promise) {
      const continueWith = () => this.expireAsync(key).catch((error) => this.loggerService.error(error));
      valueOrPath.then(continueWith, continueWith);
    } else if (valueOrPath) {
      clearTimeout(this.timeoutHandles[key]);
      delete this.timeoutHandles[key];
      delete this.values[key];
      await fs.remove(valueOrPath);
    }
  }

  async getAsync<T>(key: string, timeout: number, valueFactory: () => Promise<T>) {
    const valueOrPath = this.values[key];
    if (valueOrPath instanceof Promise) {
      return await valueOrPath as T;
    } else if (valueOrPath) {
      return await fs.readJson(valueOrPath) as T;
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
      const value = await valuePromise;
      const valuePath = path.join(app.settings.path.cache, `${Date.now().toString(16) + crypto.randomBytes(24).toString('hex')}.json`);
      await fs.ensureDir(app.settings.path.cache);
      await fs.writeJson(valuePath, value, {spaces: 2});
      this.timeoutHandles[key] = setTimeout(() => this.expireAsync(key).catch((error) => this.loggerService.error(error)), timeout);
      this.values[key] = valuePath;
      return value;
    } catch (error) {
      delete this.values[key];
      throw error;
    }
  }
}
