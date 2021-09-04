/**
 * Evaluate the stream.
 * @typedef {import('.').PageStream} PageStream
 * @typedef {import('../../..').api.RemoteStream} RemoteStream
 * @typedef {import('../../..').api.RemoteStreamSource} RemoteStreamSource
 * @typedef {import('../../..').api.RemoteStreamSubtitle} RemoteStreamSubtitle
 * @returns {RemoteStream}
 **/
function evaluateStream() {
  const dataSource = extractDataSource();
  const sources = mapSource(dataSource);
  const subtitles = mapSubtitle(dataSource);
  return {sources, subtitles};

  /**
   * Extract the data source.
   * @returns {PageStream}
   */
  function extractDataSource() {
    const match = document.body.innerHTML.match(/vilos\.config\.media\s*=\s*({.+});/);
    const source = match && JSON.parse(match[1]);
    if (source) return source;
    throw new Error();
  }

  /**
   * Map the sources.
   * @param {PageStream} dataSource 
   * @returns {Array<RemoteStreamSource>}
   */
  function mapSource(dataSource) {
    const streams = dataSource.streams.filter(x => x.format === 'adaptive_hls');
    const stream = streams.find(x => !x.hardsub_lang) ?? streams[0];
    if (stream) return [{url: stream.url, type: 'hls'}];
    throw new Error();
  }

  /**
   * Map the subtitles.
   * @param {PageStream} dataSource 
   * @returns {Array<RemoteStreamSubtitle>}
   */
  function mapSubtitle(dataSource) {
    return dataSource.subtitles.map(x => ({
      language: mapSubtitleLanguage(x.language),
      type: mapSubtitleType(x.format),
      url: x.url
    }));
  }

  /**
   * Map the subtitle language.
   * @param {string} language 
   * @return {RemoteStreamSubtitle['language']}
   */
  function mapSubtitleLanguage(language) {
    if (language === 'arME') return 'ara';
    if (language === 'frFR') return 'fre';
    if (language === 'deDE') return 'ger';
    if (language === 'enUS') return 'eng';
    if (language === 'esLA') return 'spa-419';
    if (language === 'esES') return 'spa';
    if (language === 'itIT') return 'ita';
    if (language === 'ptBR') return 'por';
    if (language === 'ruRU') return 'rus';
    if (language === 'trTR') return 'tur';
    throw new Error();
  }
  
  /**
   * Map the subtitle type.
   * @param {string} format
   * @returns {RemoteStreamSubtitle['type']}
   */
  function mapSubtitleType(format) {
    if (format === 'ass') return 'ass';
    throw new Error();
  }
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateStream};
} else {
  console.info(evaluateStream());
}
