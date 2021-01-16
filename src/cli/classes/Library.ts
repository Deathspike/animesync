import * as acm from '..';
import fs from 'fs-extra';
import path from 'path';

export class Library {
  private readonly _filePath: string;
  private readonly _source: acm.ILibrary;

  private constructor(filePath: string, source: acm.ILibrary) {
    this._filePath = filePath;
    this._source = source;
  }

  static async loadAsync(libraryPath: string) {
    const filePath = path.join(libraryPath, '.animesync', 'library.json');
    const source = await fs.readJson(filePath).catch(() => ({version: 1, entries: {}}));
    return new Library(filePath, source);
  }

  static async listAsync(libraryPath: string) {
    const library = await this.loadAsync(libraryPath);
    const entries = library._source.entries;
    return Object.keys(entries).map((seriesUrl) => Object.assign({}, entries[seriesUrl], {seriesUrl}));
  }
  
  async addAsync(seriesUrl: string, rootPath?: string) {
    if (this._source.entries[seriesUrl]) return false;
    this._source.entries[seriesUrl] = {rootPath};
    return await this._saveAsync(true);
  }

  async removeAsync(seriesUrl: string) {
    if (!this._source.entries[seriesUrl]) return false;
    delete this._source.entries[seriesUrl];
    return await this._saveAsync(true);
  }

  private async _saveAsync<T>(result: T) {
    await fs.ensureDir(path.dirname(this._filePath));
    await fs.writeJson(`${this._filePath}.tmp`, this._source, {spaces: 2});
    await fs.move(`${this._filePath}.tmp`, this._filePath, {overwrite: true});
    return result;
  }
}
