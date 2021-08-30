import * as app from '..';
import JSZip from 'jszip';
import path from 'path';

export class SubtitleBundler {
  private readonly fileService: app.FileService;
  private readonly syncPath: string;

  constructor(fileService: app.FileService, syncPath: string) {
    this.fileService = fileService;
    this.syncPath = syncPath;
  }

  async runAsync(filePath: string) {
    const fileNames = await this.fileService.listAsync(this.syncPath);
    const zip = new JSZip();
    if (fileNames.length) {
      await Promise.all(fileNames.map(x => this.saveAsync(x, zip)));
      const value = await zip.generateAsync({type: 'nodebuffer'});
      await this.fileService.writeAsync(filePath, value);
    }
  }

  private async saveAsync(fileName: string, zip: JSZip) {
    const filePath = path.join(this.syncPath, fileName);
    const value = await this.fileService.readAsync(filePath);
    zip.file(fileName, value);
  }
}
