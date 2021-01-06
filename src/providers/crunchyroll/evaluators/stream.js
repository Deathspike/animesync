/**
 * Evaluates the stream.
 * @typedef {import('../../..').IApiStream} IApiStream
 * @typedef {import('./typings').IStreamData} IStreamData
 * @returns {IApiStream}
 **/
function evaluateStream() {
  const dataSource = getDataSource();
  const manifestType = 'hls';
  const manifestUrl = getManifestUrl(dataSource);
  const subtitleType = 'ass';
  const subtitleUrl = getSubtitleUrl(dataSource);
  return {manifestType, manifestUrl, subtitleType, subtitleUrl};

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
   * @returns {string}
   */
  function getSubtitleUrl(dataSource) {
    const subtitle = dataSource.subtitles.find(x => x.format === 'ass' && x.language === 'enUS');
    if (subtitle) return subtitle.url;
    throw new Error();
  }
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateStream};
} else {
  console.log(evaluateStream());
}
