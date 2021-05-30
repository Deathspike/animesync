import * as app from '../..';

export class FunimationContext {
  static findPage(page?: string) {
    return this.pages().find(x => x.id === page);
  }

  static pages(): Array<app.api.RemoteProviderPage> {
    return [
      {type: 'oneOf', id: 'date', label: 'Updated', options: []},
      {type: 'mixOf', id: 'genres', label: 'Genres', options: [
        {id: 'Action/Adventure', label: 'Action/Adventure'},
        {id: 'Comedy', label: 'Comedy'},
        {id: 'Drama', label: 'Drama'},
        {id: 'Fan Service', label: 'Fan Service'},
        {id: 'Fantasy', label: 'Fantasy'},
        {id: 'Horror', label: 'Horror'},
        {id: 'Live-Action', label: 'Live-Action'},
        {id: 'Psychological', label: 'Psychological'},
        {id: 'Romance', label: 'Romance'},
        {id: 'Sci Fi', label: 'Sci Fi'},
        {id: 'Shoujo', label: 'Shoujo'},
        {id: 'Shounen', label: 'Shounen'},
        {id: 'Slice of Life', label: 'Slice Of Life'}
      ]}
    ];
  }
}
