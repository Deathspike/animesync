/**
 * Evaluates the stream.
 * @typedef {import('../../..').IApiStream} IApiStream
 * @typedef {import('../../..').IApiStreamSubtitle} IApiStreamSubtitle
 * @typedef {import('./typings').IStreamData} IStreamData
 * @returns {IApiStream}
 **/
function evaluateStream() {
  const dataSource = getDataSource();
  const manifestType = 'hls';
  const manifestUrl = getManifestUrl(dataSource);
  const subtitles = getSubtitles(dataSource);
  return {manifestType, manifestUrl, subtitles};

  /**
   * Retrieves the data source.
   * @returns {IStreamData}
   */
  function getDataSource() {
    const match = document.body.innerHTML.match(/vilos\.config\.media\s*=\s*({.+});/);
    const source = match && JSON.parse(match[1]);
    if (source) return source;
    throw new Error();
  }

  /**
   * Fetches the manifest.
   * @param {IStreamData} dataSource 
   * @returns {string}
   */
  function getManifestUrl(dataSource) {
    const manifest = dataSource.streams.find(x => x.format === 'adaptive_hls' && x.audio_lang === 'jaJP' && !x.hardsub_lang);
    if (manifest) return manifest.url;
    throw new Error();
  }

  /**
   * Fetches the subtitle.
   * @param {IStreamData} dataSource 
   * @returns {Array<IApiStreamSubtitle>}
   */
  function getSubtitles(dataSource) {
    return dataSource.subtitles
      .filter(x => x.format === 'ass')
      .map(x => ({language: transform(x.language), type: 'ass', url: x.url}))
      .filter(x => Boolean(x.language));
  }

  /**
   * Transforms to ISO 639-2.
   * @param {string} language 
   * @return {string}
   */
  function transform(language) {
    if (language === 'arME') return 'ara';
    if (language === 'frFR') return 'fre';
    if (language === 'deDE') return 'ger';
    if (language === 'enUS') return 'eng';
    if (language === 'esLA') return 'spa';
    if (language === 'esES') return 'spa';
    if (language === 'itIT') return 'ita';
    if (language === 'ptBR') return 'por';
    if (language === 'ruRU') return 'rus';
    return '';
  }
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateStream};
} else {
  console.log(evaluateStream());
}
