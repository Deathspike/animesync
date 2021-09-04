import * as app from '..';
import * as clv from 'class-validator';
import fetch from 'node-fetch';

export class EpisodeImage {
  constructor(source: EpisodeImage) {
    this.filePath = source.filePath;
  }

  static async findAsync(imageService: app.ImageService, episodePath: string) {
    const filePath = `${episodePath}-thumb`;
    const value = await imageService.findAsync(filePath);
    return await app.ValidationError.validateSingleAsync(EpisodeImage, new EpisodeImage(value));
  }

  static async saveAsync(imageService: app.ImageService, episodePath: string, episode: app.api.RemoteSeriesSeasonEpisode) {
    if (!episode.imageUrl) return;
    const filePath = `${episodePath}-thumb`;
    const value = await fetch(episode.imageUrl).then(x => x.buffer());
    await imageService.saveAsync(filePath, value);
  }

  @clv.IsString()
  @clv.IsNotEmpty()
  readonly filePath: string;
}
