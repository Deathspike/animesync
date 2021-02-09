import fs from 'fs-extra';
import path from 'path';

export class Tracker {
  private readonly rootPath: string;

  constructor(libraryPath: string) {
    this.rootPath = path.join(libraryPath, '.animesync');
  }

  async existsAsync(seriesName: string, episodeName: string) {
    const directoryPath = path.join(this.rootPath, seriesName);
    if (await fs.pathExists(directoryPath)) {
      const fileNames = await fs.readdir(directoryPath);
      const lowerEpisodeName = episodeName.toLowerCase();
      return fileNames.some(x => x.toLowerCase() === lowerEpisodeName);
    } else {
      return false;
    }
  }

  async trackAsync(seriesName: string, episodeName: string) {
    await fs.ensureDir(path.join(this.rootPath, seriesName));
    await fs.writeFile(path.join(this.rootPath, seriesName, episodeName), Buffer.alloc(0));
  }
}
