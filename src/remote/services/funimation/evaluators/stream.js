/**
 * Evaluate the stream.
 * @typedef {import('.').PageStream} PageStream
 * @typedef {import('.').PageStreamExperience} PageStreamExperience
 * @typedef {import('.').PageStreamExperienceTrack} PageStreamExperienceTrack
 * @typedef {import('.').PageStreamShowExperience} PageStreamShowExperience
 * @typedef {import('../../..').api.RemoteStream} RemoteStream
 * @typedef {import('../../..').api.RemoteStreamSubtitle} RemoteStreamSubtitle
 * @type {PageStream}
 **/
var TITLE_DATA;

/**
 * Evaluate the stream.
 * @returns {Promise<RemoteStream>}
 **/
async function evaluateStreamAsync() {
  const dataSource = await getDataSourceAsync();
  const subtitles = mapSubtitle(dataSource.textTracks);
  const type = 'hls';
  const url = dataSource.src;
  return {subtitles, type, url};

  /**
   * Fetch the experience.
   * @returns {Promise<PageStreamExperience>}
   */
  async function fetchExperience() {
    const experienceUrl = new URL(`/api/experience/${TITLE_DATA.id}`, location.href);
    return await fetch(experienceUrl.toString()).then(x => x.json());
  }

  /**
   * Fetch the show experience.
   * @returns {Promise<PageStreamShowExperience>}
   */
  async function fetchShowExperience() {
    const id = [...Array(8)].map(() => Math.random().toString(36)[2]).join('');
    const showExperienceUrl = new URL(`/api/showexperience/${TITLE_DATA.id}?pinst_id=${id}`, location.href);
    return await fetch(showExperienceUrl.toString()).then(x => x.json());
  }

  /**
   * Find the text tracks.
   * @param {PageStreamExperience} experience 
   * @returns {Array<PageStreamExperienceTrack>}
   */
  function findTextTracks(experience) {
    for (const season of experience.seasons) {
      for (const episode of season.episodes) {
        for (const language of Object.values(episode.languages)) {
          for (const alpha of Object.values(language.alpha)) {
            if (String(alpha.experienceId) !== TITLE_DATA.id) continue;
            const source = alpha.sources.find(x => x.type === 'application/x-mpegURL');
            if (source) return source.textTracks;
          }
        }
      }
    }
    throw new Error();
  }

  /**
   * Find the source.
   * @param {PageStreamShowExperience} sources
   * @returns {string}
   */
  function findSource(sources) {
    const item = sources.items.find(x => x.videoType === 'm3u8');
    if (item) return item.src;
    throw new Error();
  }

  /**
   * Retrieve the data source.
   * @returns {Promise<{src: string, textTracks: Array<PageStreamExperienceTrack>}>}
   */
  async function getDataSourceAsync() {
    const experiencePromise = fetchExperience();
    const showPromise = fetchShowExperience();
    const experience = await experiencePromise;
    const show = await showPromise;
    return {src: findSource(show), textTracks: findTextTracks(experience)};
  }
  
  /**
   * Map the subtitles.
   * @param {Array<PageStreamExperienceTrack>} textTracks
   * @returns {Array<RemoteStreamSubtitle>}
   */
  function mapSubtitle(textTracks) {
    return textTracks.filter(x => x.src.endsWith('.vtt') && x.type === 'Full').map(x => ({
      language: mapSubtitleLanguage(x.language),
      type: 'vtt',
      url: x.src
    }));
  }

  /**
   * Map the subtitle language.
   * @param {string} language 
   * @return {RemoteStreamSubtitle['language']}
   */
  function mapSubtitleLanguage(language) {
    if (language === 'es') return 'spa';
    if (language === 'en') return 'eng';
    if (language === 'pt') return 'por';
    throw new Error();
  }
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateStreamAsync};
} else {
  evaluateStreamAsync().then(console.info.bind(console));
}
