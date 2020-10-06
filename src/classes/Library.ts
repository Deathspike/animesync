import fs from 'fs-extra';
import path from 'path';

export class Library {
  private readonly _filePath: string;
  private readonly _source: Record<string, string>;

  private constructor(filePath: string, source: Record<string, string>) {
    this._filePath = filePath;
    this._source = source;
  }

  static async loadAsync(libraryPath: string) {
    const filePath = path.join(libraryPath, '.library');
    const source = await fs.readJson(filePath).catch(() => undefined) || {};
    return new Library(filePath, source);
  }

  static async listAsync(libraryPath: string) {
    const filePath = path.join(libraryPath, '.library');
    const source = await fs.readJson(filePath).catch(() => undefined) || {};
    return Object.keys(source).map(seriesUrl => ({seriesPath: source[seriesUrl], seriesUrl}));
  }
  
  async addAsync(seriesUrl: string, rootPath: string) {
    if (this._source[seriesUrl]) return false;
    this._source[seriesUrl] = rootPath;
    return await this._saveAsync(true);
  }

  async removeAsync(seriesUrl: string) {
    if (!this._source[seriesUrl]) return false;
    delete this._source[seriesUrl];
    return await this._saveAsync(true);
  }

  private async _saveAsync<T>(result: T) {
    await fs.ensureDir(path.dirname(this._filePath));
    await fs.writeJson(`${this._filePath}.tmp`, this._source, {spaces: 2});
    await fs.move(`${this._filePath}.tmp`, this._filePath, {overwrite: true});
    return result;
  }
}
