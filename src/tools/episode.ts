import * as app from '..';
import childProcess from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

export async function episodeAsync(episodeUrl: string, episodePath: string) {
  for (var i = 1; Boolean(i); i++) {
    const directoryPath = path.join(os.tmpdir(), app.createUniqueId());
    const options = `--all-subs --ffmpeg-location ${app.settings.binaries.ffmpeg}`;
    try {
      await fs.ensureDir(directoryPath);
      await app.promisify(cb => childProcess.exec(`${app.settings.binaries.youtubedl} ${options} "${episodeUrl}"`, {cwd: directoryPath}, cb));
      const fileNames = await fs.readdir(directoryPath);
      const filePaths = fileNames.map(fileName => path.join(directoryPath, fileName));
      const joinLines = filePaths.map(parse).sort(sort).map(transform);
      await app.promisify(cb => childProcess.exec(`${app.settings.binaries.mkvmerge} -o "${episodePath}" ${joinLines.join(' ')}`, cb));
      break;
    } catch (err) {
      if (i >= app.settings.episode.retryCount) throw err;
      await app.promisify(cb => setTimeout(cb, app.settings.episode.retryTimeout));
    } finally {
      await fs.remove(directoryPath);
    }
  }
}

function parse(filePath: string) {
  const match = filePath.match(/(?:\.([a-z]{2})[a-z]*)?\.(.*)$/i);
  const language = (match && match[1] || '').toLowerCase();
  const extension = (match && match[2] || '').toLowerCase();
  return {extension, language, filePath};
}

function sort(item: ReturnType<typeof parse>, otherItem: ReturnType<typeof parse>) {
  if (item.extension === 'mp4') return -1;
  if (item.language === 'en') return -1;
  return item.language.localeCompare(otherItem.language);
}

function transform(item: ReturnType<typeof parse>) {
  if (item.extension === 'mp4') return `"${item.filePath}"`;
  return `--language "0:${item.language}" "${item.filePath}"`;
}
