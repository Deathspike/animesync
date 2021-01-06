/**
 * @typedef {import('../../..').IApiSeries} IApiSeries
 * @typedef {import('../../..').IApiSeriesSeason} IApiSeriesSeason
 * @typedef {import('../../..').IApiSeriesSeasonEpisode} IApiSeriesSeasonEpisode
 * @type any
 */
var $;

/**
 * Evaluates the series.
 * @returns {IApiSeries}
 **/
function evaluateSeries() {
  return {
    genres: Array.from(document.querySelectorAll('#sidebar a[href*="/genres/"]')).map(validateStrict),
    imageUrl: processUrl(document.querySelector('#sidebar img')),
    seasons: mapSeason(document.querySelector('.list-of-seasons')),
    synopsis: validate(document.querySelector('#sidebar .description .more')),
    title: validateStrict(document.querySelector('#template_container h1')),
    url: location.href
  };

  /**
   * Maps the season.
   * @param {Element?} containerNode
   * @returns {Array<IApiSeriesSeason>}
   */
  function mapSeason(containerNode) {
    if (!containerNode) throw new Error();
    return Array.from(containerNode.querySelectorAll('.season')).reverse().map((seasonNode) => {
      const episodes = mapSeasonEpisodes(seasonNode.querySelector('ul')) ?? [];
      const title = validateStrict(seasonNode.querySelector('a') ?? document.querySelector('#template_container h1'));
      return {episodes, title};
    }).filter(x => !/\(.+\)/.test(x.title));
  }

  /**
   * Maps the season episodes.
   * @param {Element?} seasonNode 
   * @returns {Array<IApiSeriesSeasonEpisode>}
   */
  function mapSeasonEpisodes(seasonNode) {
    if (!seasonNode) throw new Error();
    return Array.from(seasonNode.querySelectorAll('li')).reverse().map((episodeNode) => {
      const data = processBubbleData($(episodeNode).data('bubble_data'));
      console.log(data);
      const imageUrl = processUrl(episodeNode.querySelector('img'), 'data-thumbnailurl');
      const isPremium = imageUrl.endsWith('star.jpg');
      const number = validateStrict(data.number);
      const synopsis = validate(data.description);
      const title = validate(data.title);
      const url = processUrl(episodeNode.querySelector('a'));
      return {imageUrl, isPremium, number, synopsis, title, url};
    });
  }

  /**
   * Processes the bubble data.
   * @param {{name: string, description: string}} value
   * @returns {{description: string, number: string, title: string}}
   */
  function processBubbleData(value) {
    const description = value.description;
    const match = value.name.match(/^Episode\s(.+?)\s-\s(.*)$/);
    const number = (match && match[1]) ?? value.name;
    const title = (match && match[2]) ?? '';
    return {description, number, title};
  }

  /**
   * Processes the URL.
   * @throws If the URL is invalid.
   * @param {Element|string?} value 
   * @param {string=} attributeName
   * @returns {string}
   */
  function processUrl(value, attributeName) {
    if (typeof value === 'string') {
      return new URL(value, location.href).toString();
    } else if (value && value.nodeName === 'A') {
      return processUrl((attributeName && value.getAttribute(attributeName)) ?? value.getAttribute('href'));
    } else if (value && value.nodeName === 'IMG') {
      return processUrl((attributeName && value.getAttribute(attributeName)) ?? value.getAttribute('src'));
    } else {
      throw new Error();
    }
  }

  /**
   * Validates the text content.
   * @param {(Element|string)?} value 
   * @returns {string}
   */
  function validate(value) {
    if (typeof value === 'string') {
      return value.trim().replace(/\s+/g, ' ');
    } else if (value) {
      return validate(value.textContent);
    } else {
      return '';
    }
  }

  /**
   * Validates the text content.
   * @throws If the text content is empty.
   * @param {(Element|string)?} value 
   * @returns {string}
   */
  function validateStrict(value) {
    const result = validate(value);
    if (result) return result;
    throw new Error();
  }
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateSeries};
} else {
  console.log(evaluateSeries());
}
