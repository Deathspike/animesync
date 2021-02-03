import * as app from '../..';

export function createPages(): Array<app.api.RemoteProviderPage> {
  return [
    {type: 'oneOf', id: 'popular', label: 'Popular', options: []},
    {type: 'oneOf', id: 'simulcasts', label: 'Simulcasts', options: []},
    {type: 'oneOf', id: 'updated', label: 'Updated', options: []},
    {type: 'anyOf', id: 'genres', label: 'Genres', options: createGenreOptions()},
    {type: 'oneOf', id: 'seasons', label: 'Seasons', options: createSeasonOptions()}
  ];
}

function createGenreOptions() {
  return [
    {id: 'action', label: 'Action'},
    {id: 'adventure', label: 'Adventure'},
    {id: 'comedy', label: 'Comedy'},
    {id: 'drama', label: 'Drama'},
    {id: 'fantasy', label: 'Fantasy'},
    {id: 'harem', label: 'Harem'},
    {id: 'historical', label: 'Historical'},
    {id: 'idols', label: 'Idols'},
    {id: 'isekai', label: 'Isekai'},
    {id: 'magical_girls', label: 'Magical Girls'},
    {id: 'mecha', label: 'Mecha'},
    {id: 'music', label: 'Music'},
    {id: 'mystery', label: 'Mystery'},
    {id: 'post-apocalyptic', label: 'Post-Apocalyptic'},
    {id: 'romance', label: 'Romance'},
    {id: 'sci-fi', label: 'Sci-Fi'},
    {id: 'seinen', label: 'Seinen'},
    {id: 'shojo', label: 'Shojo'},
    {id: 'shonen', label: 'Shonen'},
    {id: 'slice_of_life', label: 'Slice of Life'},
    {id: 'sports', label: 'Sports'},
    {id: 'supernatural', label: 'Supernatural'},
    {id: 'thriller', label: 'Thriller'}
  ];
}

function createSeasonOptions() {
  const current = new Date();
  const results = [];
  while (current >= new Date(2009, 0, 1)) {
    const index = Math.floor(current.getMonth() / 3);
    const season = ['Winter', 'Spring', 'Summer', 'Fall'][index];
    results.push({id: `${season.toLowerCase()}_${current.getFullYear()}`, label: `${season} ${current.getFullYear()}`});
    current.setMonth(current.getMonth() - 3);
  }
  return results;
}
