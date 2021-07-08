/**
 * Evaluate the page.
 * @typedef {import('.').PageSearch} PageSearch
 * @typedef {import('../../..').api.RemoteSearch} RemoteSearch
 * @typedef {import('../../..').api.RemoteSearchSeries} RemoteSearchSeries
 * @returns {RemoteSearch}
 **/
function evaluatePage() {
  const search = getSearch();
  const series = mapSeries(search);
  const hasMorePages = search.count > search.offset + search.limit;
  return {hasMorePages, series};

  /**
   * Get the search result.
   * @returns {PageSearch}
   */
  function getSearch() {
    const textContent = document.body.textContent;
    if (textContent) return JSON.parse(textContent);
    throw new Error();
  }

  /**
   * Map the series.
   * @param {PageSearch} search
   * @returns {Array<RemoteSearchSeries>}
   */
  function mapSeries(search) {
    return search.items.hits.map(data => ({
      imageUrl: processImageUrl(data.images),
      title: data.title,
      url: new URL(data.showUrl, 'https://www.funimation.com/').toString()
    }));
  }
  
  /**
   * Process the image.
   * @param {Record<String, string>} images
   * @returns {string}
   */
  function processImageUrl(images) {
    const entries = Object.entries(images);
    const keyart = entries.find(([k]) => k === 'showKeyart');
    if (keyart) return validateStrict(keyart[1]);
    throw new Error();
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
  module.exports = {evaluatePage};
} else {
  console.info(evaluatePage());
}
