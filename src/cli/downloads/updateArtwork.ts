import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';

export async function updateArtworkAsync(episodePath: string, imageUrl?: string) {
  if (imageUrl) {
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    const extension = detectImageExtension(buffer);
    if (extension && response.status >= 200 && response.status < 300) {
      await Promise.all(['.gif', '.jpg', '.png', '.webp'].map(x => fs.remove(episodePath + x)));
      await fs.ensureDir(path.dirname(episodePath));
      await fs.writeFile(episodePath + extension, buffer);
    }
  }
}

function detectImageExtension(image: Buffer) {
  if (image.slice(0, 3).toString('hex') === '474946') return '.gif';
  if (image.slice(0, 2).toString('hex') === 'ffd8') return '.jpg';
  if (image.slice(0, 4).toString('hex') === '89504e47') return '.png';
  if (image.slice(0, 4).toString('hex') === '52494646') return '.webp';
  return;
}
