import * as clv from 'class-validator';

export function RemoteSeriesUrl() {
  const crunchyroll = /^https:\/\/www\.crunchyroll\.com\/[^\/]+$/;
  const funimation = /^https:\/\/www\.funimation\.com\/shows\/[^\/]+\/$/;
  return clv.Matches(new RegExp([crunchyroll.source, funimation.source].join('|')))
}
