function seasons() {
  return Array.from(document.querySelectorAll('.season-dropdown')).reverse().map(seasonNode => ({
    episodes: seasonNode.nextElementSibling ? extractEpisodes(seasonNode.nextElementSibling) : [],
    title: reduceWhitespace(seasonNode.textContent)
  }));

  /**
   * @param {Element} containerNode 
   */
  function extractEpisodes(containerNode) {
    return Array.from(containerNode.querySelectorAll('a')).reverse().map(episodeNode => ({
      title: reduceWhitespace(episodeNode.textContent),
      url: episodeNode.href
    }));
  }

  /**
   * @param {string?} value
   **/
  function reduceWhitespace(value) {
    return value ? value.trim().replace(/\s+/g, ' ') : '';
  }
}

if (typeof module !== 'undefined') {
  module.exports = {seasons};
} else {
  console.log(seasons());
}
