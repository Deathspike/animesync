import * as app from '../..';
import * as cli from '..';
import fs from 'fs-extra';
import path from 'path';

export async function migrateAsync() {
  await v1LibraryAsync();
  await v1SeriesAsync();
}

async function v1LibraryAsync() {
  const newPath = path.join(app.settings.path.library, '.animesync', 'library.json');
  const oldPath = path.join(app.settings.path.library, '.library');
  if (await fs.pathExists(oldPath)) {
    const oldSource = await fs.readJson(oldPath) as Record<string, string>;
    const newSource = {version: 1, entries: {}} as cli.ILibrary;
    Object.keys(oldSource).forEach((seriesUrl) => newSource.entries[seriesUrl] = {rootPath: oldSource[seriesUrl] === app.settings.path.library ? undefined : oldSource[seriesUrl]});
    await fs.ensureDir(path.dirname(newPath));
    await fs.writeJson(newPath, newSource, {spaces: 2});
    await fs.remove(oldPath);
  }
}

async function v1SeriesAsync() {
  if (!await fs.pathExists(app.settings.path.library)) return;
  const rootPath = path.join(app.settings.path.library, '.animesync');
  const seriesNames = await fs.readdir(app.settings.path.library);
  for (let seriesName of seriesNames) {
    const seriesSourcePath = path.join(app.settings.path.library, seriesName, '.series');
    if (await fs.pathExists(seriesSourcePath)) {
      const seriesSource = await fs.readJson(seriesSourcePath) as Record<string, string>;
      await fs.ensureDir(path.join(rootPath, seriesName));
      await Promise.all(Object.values(seriesSource).map((episodeName) => fs.writeFile(path.join(rootPath, seriesName, episodeName.replace(/\.(.+)$/, '')), Buffer.alloc(0))));
      await fs.remove(seriesSourcePath);
    }
  }
}
