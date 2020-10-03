import * as app from '.';
import * as path from 'path';

(async () => {
  const outputPath = path.join(__dirname, '../That Time I Got Reincarnated as a Slime 01x02 [Kaizoku].mkv');
  await app.episodeAsync('https://www.crunchyroll.com/that-time-i-got-reincarnated-as-a-slime/episode-2-meeting-the-goblins-777520', outputPath);
})();
