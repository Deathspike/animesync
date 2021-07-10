/**
 * Evaluate the stream.
 * @typedef {import('.').PageStreamExperience} PageStreamExperience
 * @typedef {import('.').PageStreamExperienceTrack} PageStreamExperienceTrack
 * @typedef {import('.').PageStreamShowExperience} PageStreamShowExperience
 * @typedef {import('../../..').api.RemoteStream} RemoteStream
 * @typedef {import('../../..').api.RemoteStreamSource} RemoteStreamSource
 * @typedef {import('../../..').api.RemoteStreamSubtitle} RemoteStreamSubtitle
 * @returns {Promise<RemoteStream>}
 **/
async function evaluateStreamAsync() {
  const dataSource = await getDataSourceAsync();
  const sources = mapSource(dataSource.show);
  const subtitles = mapSubtitle(dataSource.experienceId, dataSource.experience);
  return {sources, subtitles};

  /**
   * Fetch the experience.
   * @param {HTMLIFrameElement} player
   * @returns {Promise<PageStreamExperience>}
   */
  async function fetchExperienceAsync(player) {
    const endTime = Date.now() + 10000;
    return await new Promise((resolve, reject) => {
      (function tick() {
        const match = player.contentWindow?.document?.body?.innerHTML?.match(/var\s*show\s*=\s*({.+});/);
        if (match) try {
          resolve(JSON.parse(match[1]));
        } catch {
          setTimeout(tick, 0);
        } else if (endTime >= Date.now()) {
          setTimeout(tick, 0);
        } else {
          reject();
        }
      })();
    });
  }

  /**
   * Fetch the experience identifier.
   * @param {HTMLIFrameElement} player
   * @returns {string}
   */
   function fetchExperienceId(player) {
    const match = player.src.match(/\/([0-9]+)\//);
    if (match) return match[1];
    throw new Error();
  }

  /**
   * Fetch the show experience.
   * @param {string} experienceId
   * @returns {Promise<PageStreamShowExperience>}
   */
  async function fetchShowExperienceAsync(experienceId) {
    const id = [...Array(8)].map(() => Math.random().toString(36)[2]).join('');
    const showExperienceUrl = new URL(`/api/showexperience/${experienceId}?pinst_id=${id}`, location.href);
    return await fetch(showExperienceUrl.toString()).then(x => x.json());
  }

  /**
   * Find the text tracks.
   * @param {string} experienceId
   * @param {PageStreamExperience} experience 
   * @returns {Array<PageStreamExperienceTrack>}
   */
  function findTextTracks(experienceId, experience) {
    for (const season of experience.seasons) {
      for (const episode of season.episodes) {
        for (const language of Object.values(episode.languages)) {
          for (const alpha of Object.values(language.alpha)) {
            if (String(alpha.experienceId) !== experienceId) continue;
            const source = alpha.sources.find(x => x.type === 'application/x-mpegURL');
            if (source) return source.textTracks;
          }
        }
      }
    }
    throw new Error();
  }

  /**
   * Forces the stream to Japanese.
   * @param {HTMLIFrameElement} player
   * @param {PageStreamExperience} experience 
   * @param {string} experienceId
   * @returns {Promise<boolean>}
   */
  async function forceJapaneseAsync(player, experience, experienceId) {
    return new Promise((resolve, reject) => {
      setTimeout(reject, 10000);
      for (const season of experience.seasons) {
        for (const episode of season.episodes) {
          for (const languageKey of Object.keys(episode.languages)) {
            const language = episode.languages[languageKey];
            if (Object.values(language.alpha).every(x => String(x.experienceId) !== experienceId)) {
              continue;
            } else if (languageKey.toLowerCase() === 'japanese') {
              resolve(false);
              break;
            } else if (!episode.languages.japanese) {
              resolve(false);
              continue;
            } else {
              player.src = player.src.replace(/\/([0-9]+)\//, `/${Object.values(episode.languages.japanese.alpha).map(x => x.experienceId).shift()}/`);
              player.addEventListener('load', () => resolve(true));
              player.addEventListener('error', () => reject());
              return;
            }
          }
        }
      }
    });
  }

  /**
   * Retrieve the data source.
   * @returns {Promise<{experience: PageStreamExperience, experienceId: string, show: PageStreamShowExperience}>}
   */
  async function getDataSourceAsync() {
    const player = await waitForPlayerAsync();
    const experience = await fetchExperienceAsync(player);
    const experienceId = fetchExperienceId(player);
    if (await forceJapaneseAsync(player, experience, experienceId)) return await getDataSourceAsync();
    const show = await fetchShowExperienceAsync(experienceId);
    return {experience, experienceId, show};
  }
  
  /**
   * Map the sources.
   * @param {PageStreamShowExperience} show
   * @returns {Array<RemoteStreamSource>}
   */
  function mapSource(show) {
    const item = show.items.find(x => x.videoType === 'm3u8');
    if (item) return [{url: item.src, type: 'hls'}];
    throw new Error();
  }

  /**
   * Map the subtitles.
   * @param {string} experienceId
   * @param {PageStreamExperience} experience
   * @returns {Array<RemoteStreamSubtitle>}
   */
  function mapSubtitle(experienceId, experience) {
    return findTextTracks(experienceId, experience)
      .filter(x => x.src.endsWith('.vtt') && x.type.toLowerCase() === 'full')
      .map(x => ({language: mapSubtitleLanguage(x.language), type: 'srt', url: x.src}));
  }

  /**
   * Map the subtitle language.
   * @param {string} language 
   * @return {RemoteStreamSubtitle['language']}
   */
  function mapSubtitleLanguage(language) {
    if (language === 'es') return 'es-LA';
    if (language === 'en') return 'en-US';
    if (language === 'pt') return 'pt-BR';
    throw new Error();
  }
  
  /**
   * Wait for the player.
   * @returns {Promise<HTMLIFrameElement>}
   */
   async function waitForPlayerAsync() {
    const endTime = Date.now() + 10000;
    return await new Promise((resolve, reject) => {
      (function tick() {
        const player = Array.from(document.querySelectorAll('iframe')).filter(x => x.id === 'player').shift();
        const playerDoc = player?.contentWindow?.document;
        const playerReady = playerDoc?.readyState === 'complete' || playerDoc?.readyState === 'interactive';
        if (player && playerReady) {
          resolve(player);
        } else if (endTime >= Date.now()) {
          setTimeout(tick, 0);
        } else {
          reject();
        }
      })();
    });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateStreamAsync};
} else {
  evaluateStreamAsync().then(console.info.bind(console));
}
