import * as app from '..';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import fs from 'fs-extra';
import path from 'path';

@ncm.Injectable()
export class PluginService {
  private readonly loggerService: app.LoggerService;
  private readonly moduleRef: ncr.ModuleRef;

  constructor(loggerService: app.LoggerService, moduleRef: ncr.ModuleRef) {
    this.loggerService = loggerService;
    this.moduleRef = moduleRef;
  }

  async providersAsync<T>(handlerAsync: (providers: Array<app.IProvider>) => Promise<T>) {
    return await this.loadAsync(async (plugins) => {
      const constructors = plugins.reduce((p, c) => c.providers ? p.concat(c.providers) : p, [] as Array<ncm.Type<app.IProvider>>);
      const providers = await Promise.all(constructors.map(x => this.tryProviderAsync(x)));
      return await handlerAsync(providers.filter(x => x).map(x => x!));
    });
  }

  private async loadAsync<T>(handlerAsync: (plugins: Array<app.IPlugin>) => Promise<T>) {
    await fs.ensureDir(app.settings.path.plugin);
    const fileNames = await fs.readdir(app.settings.path.plugin);
    const filePaths = fileNames.map(x => path.join(app.settings.path.plugin, x));
    const plugins = await Promise.all(filePaths.map(x => this.tryPluginAsync(x)));
    return await handlerAsync(plugins.filter(x => x?.version === 2).map(x => x!)).finally(() => unload(filePaths));
  }
  
  private async tryPluginAsync(filePath: string): Promise<app.IPlugin | undefined> {
    try {
      const packageData = await fs.readJson(path.join(filePath, 'package.json')).catch(() => ({}));
      const pluginPath = packageData.animeloyalty && path.resolve(filePath, packageData.animeloyalty);
      return pluginPath ? require(pluginPath) : undefined;
    } catch (error) {
      this.loggerService.error(error);
      return undefined;
    }
  }

  private async tryProviderAsync(type: ncm.Type<app.IProvider>) {
    try {
      return this.moduleRef.create(type);
    } catch (error) {
      this.loggerService.error(error);
      return undefined;
    }
  }
}

function unload(filePaths: Array<string>) {
  Object.keys(require.cache)
    .filter(x => filePaths.some(y => x.startsWith(y)))
    .forEach(x => delete require.cache[x]);
}
