/**
 * Evaluates the query.
 * @typedef {import('../../..').IApiQuery} IApiQuery
 * @typedef {import('../../..').IApiQuerySeries} IApiQuerySeries
 * @returns {IApiQuery}
 **/
function evaluateQuery() {
  const series = mapSeries();
  const hasMorePages = Boolean(series.length);
  return {hasMorePages, series};

  /**
   * Maps the series.
   * @returns {Array<IApiQuerySeries>}
   */
  function mapSeries() {
    return Array.from(document.querySelectorAll('li')).map((containerNode) => {
      const imageUrl = processUrl(containerNode.querySelector('img'), 'data-src').replace(/_thumb\.jpg$/,  '_full.jpg');
      const title = validateStrict(containerNode.querySelector('span[itemprop=name]'));
      const url = processUrl(containerNode.querySelector('a'));
      return {imageUrl, title, url};
    });
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
  module.exports = {evaluateQuery};
} else {
  console.log(evaluateQuery());
}
