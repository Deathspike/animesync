function nextSeason() {
  return selectSeason(document.querySelector('select#seasonSelect'));

  /** @param {HTMLSelectElement?} selectNode */
  function selectSeason(selectNode) {
    if (selectNode && selectNode.selectedIndex + 1 < selectNode.options.length) {
      selectNode.options[selectNode.selectedIndex + 1].selected = true;
      selectNode.dispatchEvent(new Event('change'));
      return true;
    } else {
      return false;
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = {nextSeason};
} else {
  console.log(nextSeason());
}
