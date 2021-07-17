import * as app from '../../..';
import * as cli from '../..';
import {updateArtworkAsync} from './updateArtwork'
import fs from 'fs-extra';

export async function updateEpisodeAsync(seasonPath: string, episodePath: string, seasonIndex: number, episodeIndex: number, episode: app.api.RemoteSeriesSeasonEpisode) {
  const episodeInfo = cli.EpisodeInfo.create(seasonIndex, episodeIndex, episode);
  await fs.ensureDir(seasonPath);
  await fs.writeFile(`${episodePath}.nfo`, String(episodeInfo));
  await updateArtworkAsync(`${episodePath}-thumb`, episode.imageUrl);
}
