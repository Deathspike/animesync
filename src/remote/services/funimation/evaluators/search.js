/**
 * Evaluate the search.
 * @typedef {import('../../..').api.RemoteSearch} RemoteSearch
 * @typedef {import('../../..').api.RemoteSearchSeries} RemoteSearchSeries
 * @returns {RemoteSearch}
 **/
function evaluateSearch() {
  const series = mapSeries();
  const hasMorePages = Boolean(series.length);
  return {hasMorePages, series};

  /**
   * Map the series.
   * @returns {Array<RemoteSearchSeries>}
   */
  function mapSeries() {
    return Array.from(document.querySelectorAll('.show-wrapper')).map((containerNode) => {
      const imageUrl = processUrl(containerNode.querySelector('img'), 'data-src');
      const title = validateStrict(containerNode.querySelector('.name a'));
      const url = processUrl(containerNode.querySelector('.name a'));
      return {imageUrl, title, url};
    });
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
  module.exports = {evaluateSearch};
} else {
  console.info(evaluateSearch());
}
