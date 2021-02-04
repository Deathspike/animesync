/**
 * Evaluate the stream.
 * @typedef {import('.').PageStream} PageStream
 * @typedef {import('.').PageStreamExperience} PageStreamExperience
 * @typedef {import('.').PageStreamExperienceTrack} PageStreamExperienceTrack
 * @typedef {import('.').PageStreamShowExperience} PageStreamShowExperience
 * @typedef {import('../../..').api.RemoteStream} RemoteStream
 * @typedef {import('../../..').api.RemoteStreamSource} RemoteStreamSource
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
  const sources = mapSource(dataSource.show);
  const subtitles = mapSubtitle(dataSource.experience);
  const type = 'hls';
  return {sources, subtitles, type};

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
   * Retrieve the data source.
   * @returns {Promise<{experience: PageStreamExperience, show: PageStreamShowExperience}>}
   */
  async function getDataSourceAsync() {
    const experiencePromise = fetchExperience();
    const showPromise = fetchShowExperience();
    const experience = await experiencePromise;
    const show = await showPromise;
    return {experience, show};
  }
  
  /**
   * Map the sources.
   * @param {PageStreamShowExperience} show
   * @returns {Array<RemoteStreamSource>}
   */
  function mapSource(show) {
    const item = show.items.find(x => x.videoType === 'm3u8');
    if (item) return [{url: item.src}];
    throw new Error();
  }

  /**
   * Map the subtitles.
   * @param {PageStreamExperience} experience
   * @returns {Array<RemoteStreamSubtitle>}
   */
  function mapSubtitle(experience) {
    return findTextTracks(experience).filter(x => x.src.endsWith('.vtt') && x.type === 'Full').map(x => ({
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