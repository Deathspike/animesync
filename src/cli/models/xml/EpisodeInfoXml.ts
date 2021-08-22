import xml2js from 'xml2js';

export class EpisodeInfoXml {
  private readonly value: ParsedEpisodeInfo;

  private constructor(value: ParsedEpisodeInfo) {
    this.value = value;
  }

  static async parseAsync(xml: string) {
    return new EpisodeInfoXml(await xml2js.parseStringPromise(xml, {
      emptyTag: undefined,
      explicitRoot: false
    }));
  }

  static serialize(episodeInfo: EpisodeInfoXml) {
    const episode = [String(episodeInfo.episode)];
    const plot = episodeInfo.synopsis && [episodeInfo.synopsis];
    const season = [String(episodeInfo.season)];
    const title = episodeInfo.title && [episodeInfo.title];
    const uniqueid = [{$: {type: ['animesync']}, _: episodeInfo.url}];
    return new xml2js.Builder().buildObject({episodedetails: {episode, plot, season, title, uniqueid} as ParsedEpisodeInfo});
  }

  get episode() {
    return this.value.episode
      ?.map(Number)
      ?.find(Boolean) ?? 0;
  }

  get season() {
    return this.value.season
      ?.map(Number)
      ?.find(Boolean) ?? 0;
  }

  get synopsis() {
    return this.value.plot
      ?.find(Boolean);
  }
  
  get title() {
    return this.value.title
      ?.find(Boolean);
  }

  get url() {
    return this.value.uniqueid
      ?.filter(x => typeof x !== 'string' && x.$.type.includes('animesync'))
      ?.map(x => typeof x !== 'string' ? x._ : '')
      ?.find(Boolean) ?? '';
  }
}

type ParsedEpisodeInfo = {
  episode?: Array<string>;
  plot?: Array<string>;
  season?: Array<string>;
  title?: Array<string>;
  uniqueid?: Array<string | {$: {type: Array<string>}, _: string}>
};
