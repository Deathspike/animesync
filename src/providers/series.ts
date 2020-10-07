import {crunchyrollAsync} from './crunchyroll';
import {funimationAsync} from './funimation';

export async function seriesAsync(rootPath: string, seriesUrl: string) {
  if (seriesUrl.toLowerCase().startsWith('https://www.crunchyroll.com/')) {
    console.log(`Fetching ${seriesUrl}`);
    await crunchyrollAsync(rootPath, seriesUrl);
    console.log(`Finished ${seriesUrl}`);
  } else if (seriesUrl.toLowerCase().startsWith('https://www.funimation.com/')) {
    console.log(`Fetching ${seriesUrl}`);
    await funimationAsync(rootPath, seriesUrl);
    console.log(`Finished ${seriesUrl}`);
  } else {
    console.log(`Skipping ${seriesUrl}`);
  }
}
