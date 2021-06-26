import * as app from '../..';
import * as clv from 'class-validator';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

export class CoreInfo {
  private constructor(source: CoreInfo) {
    this.rootPaths = source.rootPaths ?? [app.settings.path.library];
  }

  static async loadAsync() {
    const input = await fs.readJson(path.join(os.homedir(), 'animesync', 'cli.json')).catch(() => ({}));
    const value = new CoreInfo(input);
    await clv.validateOrReject(value);
    return value;
  }

  static async registerRootPathAsync(coreInfo: CoreInfo, rootPath: string) {
    const isMissing = process.platform === 'win32'
      ? coreInfo.rootPaths.every(x => x.toLowerCase() !== rootPath.toLowerCase())
      : coreInfo.rootPaths.every(x => x !== rootPath);
    if (isMissing) {
      coreInfo.rootPaths.push(rootPath);
      await fs.ensureDir(path.join(os.homedir(), 'animesync'));
      await fs.writeJson(path.join(os.homedir(), 'animesync', 'cli.json'), coreInfo, {spaces: 2});
    }
  }

  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
  readonly rootPaths: Array<string>;
}
