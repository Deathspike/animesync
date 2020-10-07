function seasons() {
  return Array.from(document.querySelectorAll('.season')).reverse().map(containerNode => {
    const episodes = extractEpisodes(containerNode.querySelector('.portrait-grid'));
    const title = textContent(containerNode.querySelector(':scope > a') || document.querySelector('#template_container h1'));
    return {episodes, title};
  });

  /**
   * @param {Element?} containerNode 
   */
  function extractEpisodes(containerNode) {
    if (!containerNode) throw new Error('Invalid episode node');
    return Array.from(containerNode.querySelectorAll('a')).reverse().map(episodeNode => ({
      title: textContent(episodeNode),
      url: episodeNode.href
    }));
  }

  /**
   * @param {Element?} node
   **/
  function textContent(node) {
    if (!node) throw new Error('Invalid text node');
    if (!node.textContent) throw new Error('Invalid text node content');
    return node.textContent.trim().replace(/\s+/g, ' ');
  }
}

if (typeof module !== 'undefined') {
  module.exports = {seasons};
} else {
  console.log(seasons());
}
