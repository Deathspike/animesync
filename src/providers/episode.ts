import * as app from '..';
import childProcess from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import util from 'util';

export async function episodeAsync(episodeUrl: string, episodePath: string) {
  for (var i = 1; Boolean(i); i++) {
    const directoryPath = path.join(app.settings.episode, app.createUniqueId());
    const outputPath = path.join(directoryPath, app.createUniqueId());
    const tempPath = `${episodePath}.tmp`;
    try {
      await fs.ensureDir(directoryPath);
      await util.promisify(childProcess.exec)(`${app.binaries.youtubedl} --all-subs --ffmpeg-location ${app.binaries.ffmpeg} "${episodeUrl}"`, {cwd: directoryPath});
      const fileNames = await fs.readdir(directoryPath);
      const filePaths = fileNames.map(fileName => path.join(directoryPath, fileName));
      const joinLines = filePaths.map(parse).sort(sort).map(transform);
      await util.promisify(childProcess.exec)(`${app.binaries.mkvmerge} -o "${outputPath}" ${joinLines.join(' ')}`);
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
