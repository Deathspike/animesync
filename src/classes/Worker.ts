import {find} from './utilities/find';
import {httpAsync} from './utilities/http';
import childProcess from 'child_process';
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import util from 'util';

export class Worker {
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
    const joinLines = filePaths.map(parse).sort(sort).map(transform);
    await util.promisify(childProcess.exec)(`${find('mkvmerge')} -o "${this._mergePath}" ${joinLines.join(' ')}`);
    await fs.move(this._mergePath, `${episodePath}.tmp`, {overwrite: true});
    await fs.move(`${episodePath}.tmp`, episodePath, {overwrite: true});
  }

  async streamAsync(requestUrl: string) {
    const videoPath = path.join(this._basePath, '.video.mp4');
    await fs.ensureDir(this._basePath);
    await util.promisify(childProcess.exec)(`${find('ffmpeg')} -i "${requestUrl}" -codec copy "${videoPath}"`, {cwd: this._basePath});
  }

  async subtitleAsync(fileName: string, requestUrl: string) {
    const content = await httpAsync(requestUrl);
    await fs.ensureDir(this._basePath);
    await fs.writeFile(path.join(this._basePath, fileName), content, {encoding: 'utf8'});
  }
}

function parse(filePath: string) {
  const match = filePath.match(/(?:([a-z]{2}-[a-z]{2}))?\.([^.]+)$/i);
  const language = (match && match[1] || '').toLowerCase();
  const extension = (match && match[2] || '').toLowerCase();
  return {extension, language, filePath};
}

function sort(item: ReturnType<typeof parse>, otherItem: ReturnType<typeof parse>) {
  if (item.extension === 'mp4') return -1;
  if (item.language.startsWith('en')) return otherItem.extension === 'mp4' ? 1 : -1;
  return item.language.localeCompare(otherItem.language);
}

function transform(item: ReturnType<typeof parse>) {
  if (item.extension === 'mp4') return `"${item.filePath}"`;
  return `--language "0:${item.language}" "${item.filePath}"`;
}
