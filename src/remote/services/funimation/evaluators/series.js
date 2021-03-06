/**
 * @typedef {import('.').PageSeries} PageSeries
 * @typedef {import('.').PageSeriesSeason} PageSeriesSeason
 * @typedef {import('.').PageSeriesSeasonEpisode} PageSeriesSeasonEpisode
 * @typedef {import('../../..').api.RemoteSeries} RemoteSeries
 * @typedef {import('../../..').api.RemoteSeriesSeason} RemoteSeriesSeason
 * @typedef {import('../../..').api.RemoteSeriesSeasonEpisode} RemoteSeriesSeasonEpisode
 * @type {string}
 */
var region;

/**
 * Evaluate the series.
 * @returns {Promise<RemoteSeries>}
 **/
async function evaluateSeriesAsync() {
  const data = await fetchSeriesAsync();
  const genres = data.genres.map(x => x.name);
  const imageUrl = data.images.find(x => x.key === 'showKeyart')?.path;
  const seasons = await getSeasonAsync();
  const synopsis = data.longSynopsis;
  const title = data.name;
  const url = location.href.split('?')[0];
  return {genres, imageUrl, seasons, synopsis, title, url};

  /**
   * Fetch the series.
   * @returns {Promise<PageSeries>}
   */
  async function fetchSeriesAsync() {
    const region = await waitForRegionAsync();
    const seriesUrl = new URL(`/v2${location.pathname}?region=${region}&deviceType=web`, `https://title-api.prd.funimationsvc.com/`);
    return await fetch(seriesUrl.toString()).then(x => x.json());
  }

  /**
   * Fetch the season.
   * @param {string} seasonId
   * @returns {Promise<PageSeriesSeason>}
   */
  async function fetchSeasonAsync(seasonId) {
    const region = await waitForRegionAsync();
    const seasonUrl = new URL(`/v1/seasons/${seasonId}?region=${region}&deviceType=web`, `https://title-api.prd.funimationsvc.com/`);
    return await fetch(seasonUrl.toString()).then(x => x.json());
  }

  /**
   * Retrieve the seasons.
   * @returns {Promise<Array<RemoteSeriesSeason>>}
   */
  async function getSeasonAsync() {
    return await Promise.all(data.seasons.map(async (season) => {
      const episodes = await getSeasonEpisodeAsync(season.id);
      const title = season.name;
      return {episodes, title};
    }));
  }

  /**
   * Retrieve the season episodes.
   * @param {string} seasonId
   * @returns {Promise<Array<RemoteSeriesSeasonEpisode>>}
   */
  async function getSeasonEpisodeAsync(seasonId) {
    const season = await fetchSeasonAsync(seasonId);
    const episodes = season.episodes.filter(x => x.videoList.some(y => y.spokenLanguages.some(z => z.languageCode === 'ja'))).map(mapSeasonEpisode);
    return episodes;
  }

  /**
   * Map the season episode.
   * @param {PageSeriesSeasonEpisode} episode
   * @returns {RemoteSeriesSeasonEpisode}
   **/
  function mapSeasonEpisode(episode) {
    const imageUrl = episode.images.find(x => x.key === 'episodeThumbnail')?.path;
    const isPremium = Boolean(episode.isSubRequired);
    const name = episode.episodeNumber;
    const title = episode.name;
    const url = new URL(`${episode.slug}/`, location.href).toString();
    return {imageUrl, isPremium, name, title, url};
  }

  /**
   * Waits for the region.
   * @returns {Promise<string>}
   */
   function waitForRegionAsync() {
    return new Promise((resolve, reject) => {
      const endTime = Date.now() + 10000;
      (function tick() {
        if (typeof region !== 'undefined') {
          resolve(region);
        } else if (endTime >= Date.now()) {
          setTimeout(tick, 0);
        } else {
          reject();
        }
      })();
    });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateSeriesAsync};
} else {
  evaluateSeriesAsync().then(console.info.bind(console));
}
