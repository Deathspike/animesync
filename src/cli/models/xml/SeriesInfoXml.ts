import xml2js from 'xml2js';

export class SeriesInfoXml {
  private readonly value: ParsedSeriesInfo;

  private constructor(value: ParsedSeriesInfo) {
    this.value = value;
  }

  static async parseAsync(xml: string) {
    return new SeriesInfoXml(await xml2js.parseStringPromise(xml, {
      emptyTag: undefined,
      explicitRoot: false
    }));
  }

  static serialize(seriesInfo: SeriesInfoXml) {
    const namedseason = seriesInfo.seasons?.map((x, i) => ({$: {number: String(i + 1)}, _: x}));
    const plot = seriesInfo.synopsis && [seriesInfo.synopsis];
    const title = [seriesInfo.title];
    const uniqueid = [{$: {type: ['animesync']}, _: seriesInfo.url}];
    return new xml2js.Builder().buildObject({tvshow: {namedseason, plot, title, uniqueid} as ParsedSeriesInfo});
  }

  get seasons() {
    return this.value.namedseason
      ?.map(x => typeof x !== 'string' ? x : {$: {number: []}, _: x})
      ?.sort((a, b) => Number(a.$.number?.[0]) - Number(b.$.number?.[0]))
      ?.map(x => x._);
  }

  get synopsis() {
    return this.value.plot
      ?.find(Boolean);
  }

  get title() {
    return this.value.title
      ?.find(Boolean) ?? '';
  }

  get url() {
    return this.value.uniqueid
      ?.filter(x => typeof x !== 'string' && x.$.type.includes('animesync'))
      ?.map(x => typeof x !== 'string' ? x._ : '')
      ?.find(Boolean) ?? '';
  }
}

type ParsedSeriesInfo = {
  namedseason?: Array<string | {$: {number: Array<string>}, _: string}>;
  plot?: Array<string>;
  title?: Array<string>;
  uniqueid?: Array<string | {$: {type: Array<string>}, _: string}>
};
