import * as app from '..';
import childProcess from 'child_process';
import cookieAsync from './services/cookie';
import crypto from 'crypto';
import find from './services/find';
import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer-core';
import util from 'util';

export async function episodeAsync(page: puppeteer.Page, episodePath: string, episodeUrl: string) {
  for (var i = 1; Boolean(i); i++) {
    const basePath = path.join(app.settings.episodeSync, Date.now().toString(16) + crypto.randomBytes(24).toString('hex'));
    const cookiePath = path.join(basePath, '.cookies');
    const outputPath = path.join(basePath, '.episode');
    const tempPath = `${episodePath}.tmp`;
    try {
      await fs.ensureDir(basePath);
      await cookieAsync(page, cookiePath);
      const userAgent = await page.evaluate(() => window.navigator.userAgent);
      await util.promisify(childProcess.exec)(`${find('youtube-dl')} --all-subs --cookies "${cookiePath}" --ffmpeg-location "${find('ffmpeg')}" --user-agent "${userAgent}" "${episodeUrl}"`, {cwd: basePath});
      const fileNames = await fs.readdir(basePath);
      const filePaths = fileNames.map(fileName => path.join(basePath, fileName)).filter(filePath => filePath !== cookiePath);
      const joinLines = filePaths.map(parse).sort(sort).map(transform);
      await util.promisify(childProcess.exec)(`${find('mkvmerge')} -o "${outputPath}" ${joinLines.join(' ')}`);
      await fs.move(outputPath, tempPath, {overwrite: true});
      await fs.move(tempPath, episodePath, {overwrite: true});
      break;
    } catch (err) {
      if (i >= app.settings.episodeRetryCount) throw err;
      await util.promisify(setTimeout)(app.settings.episodeRetryTimeout);
    } finally {
      await fs.remove(basePath);
    }
  }
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
