import * as app from '..';
import childProcess from 'child_process';
import crypto from 'crypto';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import util from 'util';

export async function episodeAsync(episodeUrl: string, episodePath: string) {
  for (var i = 1; Boolean(i); i++) {
    const currentId = Date.now().toString(16) + crypto.randomBytes(24).toString('hex');
    const directoryPath = path.join(app.settings.episode, currentId);
    const outputPath = path.join(directoryPath, currentId);
    const tempPath = `${episodePath}.tmp`;
    try {
      await fs.ensureDir(directoryPath);
      await util.promisify(childProcess.exec)(`${fetch('youtube-dl')} --all-subs --ffmpeg-location "${fetch('ffmpeg')}" "${episodeUrl}"`, {cwd: directoryPath});
      const fileNames = await fs.readdir(directoryPath);
      const filePaths = fileNames.map(fileName => path.join(directoryPath, fileName));
      const joinLines = filePaths.map(parse).sort(sort).map(transform);
      await util.promisify(childProcess.exec)(`${fetch('mkvmerge')} -o "${outputPath}" ${joinLines.join(' ')}`);
      await fs.move(outputPath, tempPath, {overwrite: true});
      await fs.move(tempPath, episodePath, {overwrite: true});
      break;
    } catch (err) {
      if (i >= app.settings.episodeRetryCount) throw err;
      await util.promisify(setTimeout)(app.settings.episodeRetryTimeout);
    } finally {
      await fs.remove(directoryPath);
    }
  }
}

function fetch(name: string) {
  if (os.platform() !== 'win32') return name;
  return path.join(__dirname, `../../dep/${name}.exe`);
}

function parse(filePath: string) {
  const match = filePath.match(/(?:\.([a-z]{4}))?\.(.*)$/i);
  const language = (match && match[1] || '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const extension = (match && match[2] || '').toLowerCase();
  return {extension, language, filePath};
}

function sort(item: ReturnType<typeof parse>, otherItem: ReturnType<typeof parse>) {
  if (item.extension === 'mp4') return -1;
  if (item.language.startsWith('en')) return -1;
  return item.language.localeCompare(otherItem.language);
}

function transform(item: ReturnType<typeof parse>) {
  if (item.extension === 'mp4') return `"${item.filePath}"`;
  return `--language "0:${item.language}" "${item.filePath}"`;
}
