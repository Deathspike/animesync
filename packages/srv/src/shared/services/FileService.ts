import * as ncm from '@nestjs/common';
import fs from 'fs';
import path from 'path';

@ncm.Injectable()
export class FileService {
  async appendAsync(filePath: string, value: Buffer | string) {
    const directoryPath = path.dirname(filePath);
    await fs.promises.mkdir(directoryPath, {recursive: true});
    await fs.promises.appendFile(filePath, value);
  }

  async deleteAsync(filePath: string) {
    const options = {force: true, recursive: true, maxRetries: 50};
    await fs.promises.rm(filePath, options);
  }

  async ensureAsync(directoryPath: string) {
    await fs.promises.mkdir(directoryPath, {recursive: true});
  }

  async existsAsync(path: string) {
    return await fs.promises.access(path).then(() => true, () => false);
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
    const directoryPath = path.dirname(filePath);
    const temporaryPath = `${filePath}.tmp`;
    await fs.promises.mkdir(directoryPath, {recursive: true});
    await fs.promises.writeFile(temporaryPath, value);
    await fs.promises.rename(temporaryPath, filePath);
  }
}
