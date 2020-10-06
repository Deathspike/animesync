import {crunchyrollAsync} from './crunchyroll';

export async function seriesAsync(rootPath: string, seriesUrl: string) {
  if (seriesUrl.toLowerCase().startsWith('https://www.crunchyroll.com/')) {
    console.log(`Fetching ${seriesUrl}`);
    await crunchyrollAsync(rootPath, seriesUrl);
    console.log(`Finished ${seriesUrl}`);
  } else {
    console.log(`Skipping ${seriesUrl}`);
  }
}
