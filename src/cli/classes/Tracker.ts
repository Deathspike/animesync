import fs from 'fs-extra';
import path from 'path';

export class Tracker {
  private readonly rootPath: string;

  constructor(libraryPath: string) {
    this.rootPath = path.join(libraryPath, '.animesync');
  }

  async existsAsync(seriesName: string, episodeName: string) {
    return await fs.pathExists(path.join(this.rootPath, seriesName, episodeName));
  }

  async trackAsync(seriesName: string, episodeName: string) {
    await fs.ensureDir(path.join(this.rootPath, seriesName));
    await fs.writeFile(path.join(this.rootPath, seriesName, episodeName), Buffer.alloc(0));
  }
}
