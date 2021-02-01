import * as cli from '..';
import fs from 'fs-extra';
import path from 'path';

export class Library {
  private readonly filePath: string;
  private readonly source: cli.ILibrary;

  private constructor(filePath: string, source: cli.ILibrary) {
    this.filePath = filePath;
    this.source = source;
  }

  static async loadAsync(libraryPath: string) {
    const filePath = path.join(libraryPath, '.animesync', 'library.json');
    const source = await fs.readJson(filePath).catch(() => ({version: 1, entries: {}}));
    return new Library(filePath, source);
  }

  static async listAsync(libraryPath: string) {
    const library = await this.loadAsync(libraryPath);
    const entries = library.source.entries;
    return Object.keys(entries).map((seriesUrl) => Object.assign({}, entries[seriesUrl], {seriesUrl}));
  }
  
  async addAsync(seriesUrl: string, rootPath?: string) {
    if (this.source.entries[seriesUrl]) return false;
    this.source.entries[seriesUrl] = {rootPath};
    return await this.saveAsync(true);
  }

  async removeAsync(seriesUrl: string) {
    if (!this.source.entries[seriesUrl]) return false;
    delete this.source.entries[seriesUrl];
    return await this.saveAsync(true);
  }

  private async saveAsync<T>(result: T) {
    await fs.ensureDir(path.dirname(this.filePath));
    await fs.writeJson(`${this.filePath}.tmp`, this.source, {spaces: 2});
    await fs.move(`${this.filePath}.tmp`, this.filePath, {overwrite: true});
    return result;
  }
}
