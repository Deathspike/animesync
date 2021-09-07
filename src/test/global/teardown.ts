import * as app from '../../server';
import fs from 'fs';
import path from 'path';

export default async function() {
  if (!process.env.AST_CI) return;
  const fileNames = await fs.promises.readdir(app.settings.path.logger).catch(() => []);
  const filePaths = fileNames.map(x => path.join(app.settings.path.logger, x));
  for (const filePath of filePaths) {
    const value = await fs.promises.readFile(filePath, 'utf8');
    console.log(filePath);
    console.log(value);
  }
}
