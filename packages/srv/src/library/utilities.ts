import * as app from '.';
import * as ncm from '@nestjs/common';
import childProcess from 'child_process';
import path from 'path';
import which from 'which';

export async function ffmpegAsync(loggerService: app.LoggerService, args: Array<string>, data?: (chunk: Buffer) => void) {
  const ffmpeg = await findAsync();
  const zoneId = Date.now().toString(16).substr(-7);
  loggerService.debug(`${ffmpeg} (${zoneId}): ${JSON.stringify(args)}`);
  return await new Promise<number>((resolve, reject) => {
    const process = childProcess.spawn(ffmpeg, args);
    process.stdout.on('data', (chunk: Buffer) => data ? data(chunk) : loggerService.debug(chunk.toString(), zoneId));
    process.stderr.on('data', (chunk: Buffer) => data ? data(chunk) : loggerService.debug(chunk.toString(), zoneId));
    process.on('error', reject);
    process.on('exit', resolve);
  });
}

export function throwNotFound(): never {
  throw new ncm.NotFoundException();
}

async function findAsync() {
  return await Promise.resolve(app.settings.core.ffmpeg)
    .then(x => x ?? which('ffmpeg'))
    .catch(() => path.join(__dirname, '../../static/ffmpeg'))
}
