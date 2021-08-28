import * as app from '..';
import * as clv from 'class-validator';
import os from 'os';
import path from 'path';
const filePath = path.join(os.homedir(), 'animesync', 'library.json');

export class CoreInfo {
  constructor(source: CoreInfo) {
    this.rootPaths = source.rootPaths ?? [app.settings.path.library];
  }

  static async loadAsync(fileService: app.FileService) {
    const buffer = await fileService.readAsync(filePath).catch(() => {});
    const value = buffer ? JSON.parse(buffer.toString()) : {};
    return await app.ValidationError.validateSingleAsync(CoreInfo, new CoreInfo(value));
  }

  static async saveAsync(fileService: app.FileService, rootPath: string) {
    const coreInfo = await this.loadAsync(fileService);
    tryAdd(coreInfo, rootPath);
    await fileService.writeAsync(filePath, JSON.stringify(coreInfo, null, 2));
  }

  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
  @clv.ArrayNotEmpty()
  readonly rootPaths: Array<string>;
}

function tryAdd(coreInfo: CoreInfo, rootPath: string) {
  if (coreInfo.rootPaths.some(x => x.toLowerCase() === rootPath.toLowerCase())) return;
  coreInfo.rootPaths.push(rootPath);
}
