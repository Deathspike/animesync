import * as app from '.';
import path from 'path';

// TODO: Output MKV into temp file then move, to prevent failures from re-downloading.
// TODO: CloudFlare protection is not checked/bypassed on CrunchyRoll.
// TODO: Logging? Either file-based or just console, but something, at least.
// TODO: Add something resembling automation? Or a UI? At least prevent re-download after manual move.
// TODO: Add login support for CrunchyRoll.
// TODO: Region switching? Most anime isn't available in my region.
// TODO: Funimation? Other sources?

(async () => {
  const libraryPath = path.join(__dirname, '../lib');
  await app.seriesAsync('https://www.crunchyroll.com/that-time-i-got-reincarnated-as-a-slime', libraryPath);
})();
