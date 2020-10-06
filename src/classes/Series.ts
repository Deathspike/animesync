import fs from 'fs-extra';
import path from 'path';

export class Series {
  private readonly _filePath: string;
  private readonly _source: Record<string, string>;

  private constructor(filePath: string, source: Record<string, string>) {
    this._filePath = filePath;
    this._source = source;
  }

  static async loadAsync(seriesPath: string) {
    const filePath = path.join(seriesPath, '.series');
    const source = await fs.readJson(filePath).catch(() => undefined) || {};
    return new Series(filePath, source);
  }

  includes(episodeUrl: string) {
    return this._source.hasOwnProperty(episodeUrl)
  }

  async trackAsync(episodeName: string, episodeUrl: string) {
    this._source[episodeUrl] = episodeName;
    await fs.ensureDir(path.dirname(this._filePath));
    await fs.writeJson(`${this._filePath}.tmp`, this._source, {spaces: 2});
    await fs.move(`${this._filePath}.tmp`, this._filePath, {overwrite: true});
  }
}
