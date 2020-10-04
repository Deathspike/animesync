import * as app from '.';
import fs from 'fs-extra';
import path from 'path';

// TODO: Add something resembling automation? Or a UI?
// TODO: Add login support for CrunchyRoll.
// TODO: Region switching? Most anime isn't available in my region.
// TODO: Funimation? Other sources?

(async () => {
  const rootPath = path.join(__dirname, '../lib');
  await fs.remove(app.settings.episode);
  await app.seriesAsync('https://www.crunchyroll.com/a-certain-magical-index', rootPath);
})();
