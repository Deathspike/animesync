/**
 * Evaluate the stream.
 * @typedef {import('.').PageStream} PageStream
 * @typedef {import('../../../..').api.RemoteStream} RemoteStream
 * @typedef {import('../../../..').api.RemoteStreamSubtitle} RemoteStreamSubtitle
 * @returns {RemoteStream}
 **/
function evaluateStream() {
  const dataSource = extractDataSource();
  const subtitles = mapSubtitle(dataSource);
  const type = 'hls';
  const url = mapStreamUrl(dataSource);
  return {subtitles, type, url};

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
   * Map the stream.
   * @param {PageStream} dataSource 
   * @returns {string}
   */
  function mapStreamUrl(dataSource) {
    const stream = dataSource.streams.find(x => x.format === 'adaptive_hls' && x.audio_lang === 'jaJP' && !x.hardsub_lang);
    if (stream) return stream.url;
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
    if (language === 'esLA') return 'spa';
    if (language === 'esES') return 'spa';
    if (language === 'itIT') return 'ita';
    if (language === 'ptBR') return 'por';
    if (language === 'ruRU') return 'rus';
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
  console.log(evaluateStream());
}
