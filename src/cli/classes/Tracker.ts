import childProcess from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export class Tracker {
  private readonly seriesPath: string;

  constructor(seriesPath: string) {
    this.seriesPath = path.join(seriesPath, '.animesync');
  }

  async existsAsync(seasonName: string, episodeName: string) {
    return await fs.pathExists(path.join(this.seriesPath, seasonName, episodeName));
  }

  async trackAsync(seasonName: string, episodeName: string) {
    await fs.ensureDir(path.join(this.seriesPath, seasonName));
    await fs.writeFile(path.join(this.seriesPath, seasonName, episodeName), Buffer.alloc(0));
    await ensureHiddenAsync(this.seriesPath);
  }
}

async function ensureHiddenAsync(seriesPath: string) {
  if (process.platform === 'win32') {
    await new Promise((resolve, reject) => {
      const process = childProcess.spawn('attrib', ['+H', seriesPath]);
      process.on('error', reject);
      process.on('exit', resolve);
    });
  }
}
