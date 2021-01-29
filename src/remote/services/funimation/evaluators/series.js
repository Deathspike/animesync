/**
 * @typedef {import('.').PageSeries} PageSeries
 * @typedef {import('.').PageSeriesSeason} PageSeriesSeason
 * @typedef {import('.').PageSeriesSeasonEpisode} PageSeriesSeasonEpisode
 * @typedef {import('../../..').api.RemoteSeries} RemoteSeries
 * @typedef {import('../../..').api.RemoteSeriesSeason} RemoteSeriesSeason
 * @typedef {import('../../..').api.RemoteSeriesSeasonEpisode} RemoteSeriesSeasonEpisode
 * @type {PageSeries}
 */
var titleData;

/**
 * Evaluate the series.
 * @returns {Promise<RemoteSeries>}
 **/
async function evaluateSeriesAsync() {
  return {
    genres: titleData.genres.map(x => x.name),
    imageUrl: titleData.poster,
    seasons: await getSeasonAsync(),
    synopsis: titleData.synopsis,
    title: titleData.title,
    url: location.href
  };

  /**
   * Fetch the season.
   * @param {URL} url 
   * @returns {Promise<PageSeriesSeason>}
   */
  async function fetchSeasonAsync(url) {
    return await fetch(url.toString()).then(x => x.json());
  }

  /**
   * Retrieve the seasons.
   * @returns {Promise<Array<RemoteSeriesSeason>>}
   */
  async function getSeasonAsync() {
    return await Promise.all(titleData.children.map(async (season) => {
      const episodes = await getSeasonEpisodeAsync(new URL(`/api/episodes/?title_id=${titleData.id}&season=${season.number}&sort=order&sort_direction=ASC`, location.href));
      const title = season.title;
      return {episodes, title};
    }));
  }

  /**
   * Retrieve the season episodes.
   * @param {URL} url 
   * @returns {Promise<Array<RemoteSeriesSeasonEpisode>>}
   */
  async function getSeasonEpisodeAsync(url) {
    const season = await fetchSeasonAsync(url);
    const episodes = season.items.filter(x => x.audio.includes('Japanese')).map(mapSeasonEpisode);
    return episodes;
  }

  /**
   * Map the season episode.
   * @param {PageSeriesSeasonEpisode} episode
   * @returns {RemoteSeriesSeasonEpisode}
   **/
  function mapSeasonEpisode(episode) {
    const imageUrl = episode.poster;
    const isPremium = Boolean(episode.mostRecentSvod.subscriptionRequired);
    const name = episode.item.episodeNum;
    const title = episode.item.episodeName;
    const synopsis = episode.synopsis;
    const url = new URL(`${episode.item.episodeSlug}/?lang=japanese`, location.href).toString();
    return {imageUrl, isPremium, name, title, synopsis, url};
  }
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateSeriesAsync};
} else {
  evaluateSeriesAsync().then(console.info.bind(console));
}
