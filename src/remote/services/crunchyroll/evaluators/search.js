/**
 * Evaluate the search.
 * @typedef {import('.').PageSearch} PageSearch
 * @typedef {import('../../..').api.RemoteSearch} RemoteSearch
 * @typedef {import('../../..').api.RemoteSearchSeries} RemoteSearchSeries
 * @param {{query: string, pageNumber?: number}=} model
 * @returns {Promise<RemoteSearch>}
 **/
async function evaluateSearchAsync(model) {
  const series = await getSeriesAsync((model && model.query) ?? '', (model && model.pageNumber) ?? 1);
  const hasMorePages = Boolean(series.length);
  return {hasMorePages, series};

  /**
   * Fetch the candidates.
   * @returns {Promise<PageSearch>}
   */
  async function fetchCandidatesAsync() {
    const response = await fetch('/ajax/?req=RpcApiSearch_GetSearchCandidates');
    const text = await response.text();
    return JSON.parse(text.replace(/^[^{]+(.*)[^}]+$/m, '$1'));
  }

  /**
   * Retrieve the series.
   * @param {string} query
   * @param {number} pageNumber
   * @returns {Promise<Array<RemoteSearchSeries>>}
   */
  async function getSeriesAsync(query, pageNumber) {
    const candidates = await fetchCandidatesAsync();
    const matches = candidates.data
      .filter(x => x.type === 'Series')
      .map(x => ({item: x, score: measureSimilarity(query, x.name)}));
    const results = matches
      .sort((a, b) => b.score - a.score)
      .slice(Math.max(pageNumber - 1, 0) * 50)
      .slice(0, 50);
    return results.map(x => ({
      imageUrl: x.item.img.replace(/_small\.jpg$/, '_thumb.jpg'),
      title: x.item.name,
      url: new URL(x.item.link, location.href).toString()
    }));
  }

  /**
   * Measures the similarly of two values.
   * @param {string} v1
   * @param {string} v2
   * @returns {number}
   */
  function measureSimilarity(v1, v2) {
    if (!v1.length || !v2.length) return 0;
    const p1 = spawnSimilarlySet(v1.length < v2.length ? v1 : v2, 2);
    const p2 = spawnSimilarlySet(v1.length < v2.length ? v2 : v1, 2);
    const ps = new Set(p1);
    return p2.reduce((p, c) => ps.delete(c) ? p + 1 : p, 0) / p2.length;
  }

  /**
   * Spawns the similarity set.
   * @param {string} value
   * @param {number} length
   * @returns {Array<number>}
   */
  function spawnSimilarlySet(value, length) {
    const s = ' '.repeat(length - 1) + value.toLowerCase() + ' '.repeat(length - 1);
    const v = new Array(s.length - length + 1);
    for (let i = 0; i < v.length; i++) v[i] = s.slice(i, i + length);
    return v;
  }
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateSearchAsync};
} else {
  evaluateSearchAsync().then(console.info.bind(console));
}
