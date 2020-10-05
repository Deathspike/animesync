import fs from 'fs-extra';
import path from 'path';

export class Series {
  private readonly _filePath: string;
  private readonly _source: Record<string, string>;
  private readonly _tempPath: string;

  private constructor(filePath: string, source: Record<string, string>) {
    this._filePath = filePath;
    this._source = source;
    this._tempPath = `${filePath}.tmp`;
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
    await fs.ensureDir(path.dirname(this._tempPath));
    await fs.writeJson(this._tempPath, this._source, {spaces: 2});
    await fs.move(this._tempPath, this._filePath, {overwrite: true});
  }
}
