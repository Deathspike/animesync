import childProcess from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import util from 'util';

export class Sync {
  private readonly _episodePath: string;
  private readonly _subtitlePath: string;

  constructor(episodePath: string, subtitleFormat: string) {
    this._episodePath = episodePath;
    this._subtitlePath = `${this._episodePath}.${subtitleFormat}`;
  }

  async disposeAsync() {
    await fs.remove(this._subtitlePath);
  }

  async saveAsync(streamUrl: string, subtitle: string, options?: {proxyServer?: string, userAgent?: string}) {
    // Initialize the options.
    const cli: string[] = [];
    if (options && options.proxyServer) cli.push(`-http_proxy "${options.proxyServer}"`);
    if (options && options.userAgent) cli.push(`-user_agent "${options.userAgent}"`);

    // Initialize the stream.
    await fs.ensureDir(path.dirname(this._episodePath));
    await fs.writeFile(this._subtitlePath, subtitle);
    await util.promisify(childProcess.exec)(`${ffmpeg()} ${cli.join(' ')} -y -i "${streamUrl}" -i "${this._subtitlePath}" -c copy "${this._episodePath}"`);
  }
}

function ffmpeg() {
  if (os.platform() !== 'win32') return 'ffmpeg';
  return path.join(__dirname, `../../dep/ffmpeg.exe`)
}
