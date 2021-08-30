import * as app from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class ImageService {
  private readonly fileService: app.FileService;

  constructor(fileService: app.FileService) {
    this.fileService = fileService;
  }

  async findAsync(imagePath: string) {
    const values = await Promise.all(Object.keys(extensions).map(x => this.fileService.existsAsync(imagePath + x).then(y => y ? imagePath + x : undefined)));
    const filePath = values.find(Boolean) ?? app.throwNotFound();
    return {filePath};
  }

  async saveAsync(imagePath: string, value: Buffer) {
    const match = Object.entries(extensions).find(([_, v]) => v(value)) ?? app.throwNotFound();
    const filePath = imagePath + match[0];
    await Promise.all(Object.keys(extensions).map(x => this.fileService.deleteAsync(imagePath + x)));
    await this.fileService.writeAsync(filePath, value);
  }
}

const extensions = {
  '.gif' : (x: Buffer) => x.slice(0, 3).toString('hex') === '474946',
  '.jpg' : (x: Buffer) => x.slice(0, 2).toString('hex') === 'ffd8',
  '.png' : (x: Buffer) => x.slice(0, 4).toString('hex') === '89504e47',
  '.webp': (x: Buffer) => x.slice(0, 4).toString('hex') === '52494646',
};
