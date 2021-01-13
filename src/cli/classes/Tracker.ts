import fs from 'fs-extra';
import path from 'path';

export class Tracker {
  private readonly _rootPath: string;

  constructor(libraryPath: string) {
    this._rootPath = path.join(libraryPath, '.animesync');
  }

  async existsAsync(seriesName: string, episodeName: string) {
    return await fs.pathExists(path.join(this._rootPath, seriesName, episodeName));
  }

  async trackAsync(seriesName: string, episodeName: string) {
    await fs.ensureDir(path.join(this._rootPath, seriesName));
    await fs.writeFile(path.join(this._rootPath, seriesName, episodeName), Buffer.alloc(0));
  }
}
