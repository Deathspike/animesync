import * as app from '.';
import * as ncm from '@nestjs/common';
import childProcess from 'child_process';
import path from 'path';
import which from 'which';

export async function ffmpegAsync(args: Array<string>, data: (chunk: Buffer) => void) {
  const ffmpeg = await Promise.resolve(app.settings.core.ffmpeg)
    .then(x => x ?? which('ffmpeg'))
    .catch(() => path.join(__dirname, '../../../static/ffmpeg'));
  return await new Promise<number>((resolve, reject) => {
    const process = childProcess.spawn(ffmpeg, args);
    process.stdout.on('data', (chunk: Buffer) => data(chunk));
    process.stderr.on('data', (chunk: Buffer) => data(chunk));
    process.on('error', reject);
    process.on('exit', resolve);
  });
}

export function throwNotFound(): never {
  throw new ncm.NotFoundException();
}
