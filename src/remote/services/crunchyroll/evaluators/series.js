/**
 * @typedef {import('../../..').api.RemoteSeries} RemoteSeries
 * @typedef {import('../../..').api.RemoteSeriesSeason} RemoteSeriesSeason
 * @typedef {import('../../..').api.RemoteSeriesSeasonEpisode} RemoteSeriesSeasonEpisode
 * @type any
 */
var $;

/**
 * Evaluate the series.
 * @returns {RemoteSeries}
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
   * Determines whether the season has Japanese audio.
   * @param {RemoteSeriesSeason} season 
   * @returns {boolean}
   */
  function hasJapaneseAudio(season) {
    if (/\((Arabic|English|French|German|Italian|Portuguese|Russian|Spanish)(\s+Dub)?\)$/.test(season.title)) return false;
    if (/\((Dub|Dubbed)\)$/.test(season.title)) return false;
    return true;
  }

  /**
   * Map the seasons.
   * @param {Element?} containerNode
   * @returns {Array<RemoteSeriesSeason>}
   */
  function mapSeason(containerNode) {
    if (!containerNode) return [];
    return Array.from(containerNode.querySelectorAll('.season')).reverse().map((seasonNode) => {
      const episodes = mapSeasonEpisodes(seasonNode.querySelector('ul')) ?? [];
      const title = validateStrict(seasonNode.querySelector(':scope > a') ?? document.querySelector('#template_container h1'));
      return {episodes, title};
    }).filter(hasJapaneseAudio);
  }

  /**
   * Map the season episodes.
   * @param {Element?} seasonNode 
   * @returns {Array<RemoteSeriesSeasonEpisode>}
   */
  function mapSeasonEpisodes(seasonNode) {
    if (!seasonNode) return [];
    return Array.from(seasonNode.querySelectorAll('li')).reverse().map((episodeNode) => {
      const bubbleData = processBubbleData($(episodeNode).data('bubble_data'));
      const imageUrl = processUrl(episodeNode.querySelector('img'), 'data-thumbnailurl');
      const isPremium = imageUrl.endsWith('star.jpg');
      const name = processName(episodeNode.querySelector('.series-title'));
      const title = validate(bubbleData.title);
      const url = processUrl(episodeNode.querySelector('a'));
      return {imageUrl, isPremium, name, title, url};
    });
  }

  /**
   * Process the bubble data.
   * @param {{name: string}} value
   * @returns {{title: string}}
   */
  function processBubbleData(value) {
    const match = value.name.match(/^(?:Episode\s(.*)\s-\s)?(.*)?$/);
    const title = (match && match[2]) ?? '';
    return {title};
  }

  /**
   * Process the name.
   * @param {Element?} nameNode
   * @returns {string}
   */
  function processName(nameNode) {
    const value = validate(nameNode);
    const match = value?.match(/^(?:Episode\s)?(.*)$/);
    if (match) return match[1];
    throw new Error();
  }

  /**
   * Process the URL.
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
   * Validate the text content.
   * @param {(Element|string)?} value 
   * @returns {string|undefined}
   */
  function validate(value) {
    if (typeof value === 'string') {
      return value.trim().replace(/\s+/g, ' ') || undefined;
    } else if (value) {
      return validate(value.textContent);
    } else {
      return undefined;
    }
  }

  /**
   * Validate the text content.
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
  console.info(evaluateSeries());
}
