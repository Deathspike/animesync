import * as app from '..';
import fs from 'fs-extra';
import path from 'path';

export class Trace {
  private readonly _filePath: string;
  private readonly _items: Record<string, string>;

  private constructor(filePath: string, items: Record<string, string>) {
    this._filePath = filePath;
    this._items = items;
  }

  static async loadAsync(seriesPath: string) {
    const filePath = path.join(seriesPath, app.settings.seriesTrace);
    const items = await fs.readJson(filePath).catch(() => undefined) || {};
    return new Trace(filePath, items);
  }

  includes(episodeUrl: string) {
    return this._items.hasOwnProperty(episodeUrl)
  }

  async traceAsync(episodeUrl: string, filePath: string) {
    this._items[episodeUrl] = filePath;
    await fs.writeJson(this._filePath, this._items, {spaces: 2});
  }
}
