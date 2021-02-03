import * as app from '../..';

export function createPages(): Array<app.api.RemoteProviderPage> {
  return [
    {type: 'oneOf', id: 'popularity', label: 'Most Popular', options: []},
    {type: 'oneOf', id: 'date', label: 'Date Added', options: []},
    {type: 'oneOf', id: 'genres', label: 'Genres', options: [
      {id: 'action-adventure', label: 'Action/Adventure'},
      {id: 'comedy', label: 'Comedy'},
      {id: 'drama', label: 'Drama'},
      {id: 'fan-service', label: 'Fan Service'},
      {id: 'fantasy', label: 'Fantasy'},
      {id: 'horror', label: 'Horror'},
      {id: 'live-action', label: 'Live-Action'},
      {id: 'psychological', label: 'Psychological'},
      {id: 'romance', label: 'Romance'},
      {id: 'sci-fi', label: 'Sci Fi'},
      {id: 'shoujo', label: 'Shoujo'},
      {id: 'shounen', label: 'Shounen'},
      {id: 'slice-of-life', label: 'Slice Of Life'}
    ]}
  ];
}
