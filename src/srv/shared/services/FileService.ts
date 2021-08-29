import * as ncm from '@nestjs/common';
import fs from 'fs';
import path from 'path';

@ncm.Injectable()
export class FileService {
  async appendAsync(filePath: string, value: Buffer | string) {
    const dirPath = path.dirname(filePath);
    await fs.promises.mkdir(dirPath, {recursive: true});
    await fs.promises.appendFile(filePath, value);
  }

  async deleteAsync(filePath: string) {
    const options = {force: true, recursive: true, maxRetries: 50};
    await fs.promises.rm(filePath, options);
  }

  async existsAsync(resourcePath: string) {
    return await fs.promises.access(resourcePath).then(() => true, () => false);
  }

  async listAsync(directoryPath: string) {
    return fs.promises.readdir(directoryPath);
  }

  async readAsync(filePath: string) {
    return await fs.promises.readFile(filePath);
  }

  async renameAsync(oldPath: string, newPath: string) {
    await fs.promises.rename(oldPath, newPath);
  }

  async writeAsync(filePath: string, value: Buffer | string) {
    const dirPath = path.dirname(filePath);
    const tmpPath = `${filePath}.tmp`;
    await fs.promises.mkdir(dirPath, {recursive: true});
    await fs.promises.writeFile(tmpPath, value);
    await fs.promises.rename(tmpPath, filePath);
  }
}
