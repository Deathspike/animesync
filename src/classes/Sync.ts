import childProcess from 'child_process';
import crypto from 'crypto';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import util from 'util';

export class Sync {
  private readonly _basePath: string;
  private readonly _mergePath: string;

  constructor(rootPath: string) {
    this._basePath = path.join(rootPath, Date.now().toString(16) + crypto.randomBytes(24).toString('hex'));
    this._mergePath = path.join(this._basePath, '.merge.mkv');
  }

  async disposeAsync() {
    await fs.remove(this._basePath);
  }

  async mergeAsync(episodePath: string) {
    await fs.ensureDir(this._basePath);
    const fileNames = await fs.readdir(this._basePath);
    const filePaths = fileNames.map(fileName => path.join(this._basePath, fileName));
    const execLines = transform(filePaths.map(parse).sort(sort));
    await util.promisify(childProcess.exec)(`${ffmpeg()} ${execLines} -c copy "${this._mergePath}"`);
    await fs.move(this._mergePath, `${episodePath}.tmp`, {overwrite: true});
    await fs.move(`${episodePath}.tmp`, episodePath, {overwrite: true});
  }

  async streamAsync(proxyServer: string, streamUrl: string) {
    const filePath = path.join(this._basePath, '.video.mp4');
    await fs.ensureDir(this._basePath);
    await util.promisify(childProcess.exec)(`${ffmpeg()} -http_proxy "${proxyServer}" -i "${streamUrl}" -codec copy "${filePath}"`, {cwd: this._basePath});
  }

  async writeAsync(fileName: string, content: string) {
    const filePath = path.join(this._basePath, fileName);
    await fs.ensureDir(this._basePath);
    await fs.writeFile(filePath, content);
  }
}

function ffmpeg() {
  if (os.platform() !== 'win32') return 'ffmpeg';
  return path.join(__dirname, `../../dep/ffmpeg.exe`)
}

function parse(filePath: string) {
  const match = filePath.match(/(?:(?:\\|\/|\.)([a-z]{3}))?\.([^.]+)$/i);
  const language = (match && match[1] || '').toLowerCase();
  const extension = (match && match[2] || '').toLowerCase();
  return {extension, language, filePath};
}

function sort(item: ReturnType<typeof parse>, otherItem: ReturnType<typeof parse>) {
  if (item.extension === 'mp4') return -1;
  if (item.language === 'eng') return -1;
  return item.language.localeCompare(otherItem.language);
}

function transform(items: Array<ReturnType<typeof parse>>) {
  const input = items.map((x) => `-i "${x.filePath}"`);
  const map = items.map((_, i) => `-map ${i}`)
  const metadata = items.filter(x => x.language).map((x, i) => `-metadata:s:s:${i} language="${x.language}"`);
  return input.concat(map).concat(metadata).join(' ');
}
