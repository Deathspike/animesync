/**
 * @typedef {import('../../..').IApiSeries} IApiSeries
 * @typedef {import('../../..').IApiSeriesSeason} IApiSeriesSeason
 * @typedef {import('../../..').IApiSeriesSeasonEpisode} IApiSeriesSeasonEpisode
 * @typedef {import('./typings').ISeries} ISeries
 * @typedef {import('./typings').ISeriesSeason} ISeriesSeason
 * @typedef {import('./typings').ISeriesSeasonEpisode} ISeriesSeasonEpisode
 * @type {ISeries}
 */
var titleData;

/**
 * Evaluates the series.
 * @returns {Promise<IApiSeries>}
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
   * Fetches the season.
   * @param {URL} url 
   * @returns {Promise<ISeriesSeason>}
   */
  async function fetchSeasonAsync(url) {
    return await fetch(url.toString()).then(x => x.json());
  }

  /**
   * Maps the season episode.
   * @param {ISeriesSeasonEpisode} episode
   * @returns {IApiSeriesSeasonEpisode}
   **/
  function mapSeasonEpisode(episode) {
    const imageUrl = episode.poster;
    const isPremium = episode.mostRecentSvod.subscriptionRequired;
    const number = episode.item.episodeNum;
    const title = episode.item.episodeName;
    const synopsis = episode.synopsis;
    const url = new URL(`${episode.item.episodeSlug}/?lang=japanese`, location.href).toString();
    return {imageUrl, isPremium, number, title, synopsis, url};
  }

  /**
   * Retrieves each season.
   * @returns {Promise<Array<IApiSeriesSeason>>}
   */
  async function getSeasonAsync() {
    return await Promise.all(titleData.children.map(async (season) => {
      const episodes = await getSeasonEpisodeAsync(new URL(`/api/episodes/?title_id=${titleData.id}&season=${season.number}&sort=order&sort_direction=ASC`, location.href));
      const title = season.title;
      return {episodes, title};
    }));
  }

  /**
   * Retrieves each episode.
   * @param {URL} url 
   * @returns {Promise<Array<IApiSeriesSeasonEpisode>>}
   */
  async function getSeasonEpisodeAsync(url) {
    const season = await fetchSeasonAsync(url);
    const episodes = season.items.filter(x => x.audio.includes('Japanese')).map(mapSeasonEpisode);
    return episodes;
  }
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateSeriesAsync};
} else {
  evaluateSeriesAsync().then(console.log.bind(console));
}
