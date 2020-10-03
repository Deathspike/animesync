import * as app from '..';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export async function episodeAsync(episodeUrl: string, outputPath: string) {
  for (var i = 1; Boolean(i); i++) {
    const directoryPath = path.join(os.tmpdir(), app.createUniqueId());
    const options = `--all-subs --ffmpeg-location ${app.settings.binaries.ffmpeg}`;
    try {
      await app.promisify(cb => fs.mkdir(directoryPath, cb));
      await app.promisify(cb => childProcess.exec(`${app.settings.binaries.youtubedl} ${options} "${episodeUrl}"`, {cwd: directoryPath}, cb));
      const fileNames = await app.promisify<string[]>(cb => fs.readdir(directoryPath, cb));
      const filePaths = fileNames.map(fileName => path.join(directoryPath, fileName));
      const joinLines = filePaths.map(parse).sort(sort).map(transform);
      await app.promisify(cb => childProcess.exec(`${app.settings.binaries.mkvmerge} -o "${outputPath}" ${joinLines.join(' ')}`, cb));
      break;
    } catch (err) {
      if (i >= app.settings.episode.retryCount) throw err;
      await app.promisify(cb => setTimeout(cb, app.settings.episode.retryTimeout));
    } finally {
      const stats = await app.promisify<fs.Stats>(cb => fs.stat(directoryPath, cb));
      if (stats.isDirectory()) await app.promisify(cb => fs.rmdir(directoryPath, {recursive: true}, cb));
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
