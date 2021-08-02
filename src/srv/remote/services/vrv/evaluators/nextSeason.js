/**
 * Evaluate the next season.
 * @returns {boolean}
 */
function evaluateNextSeason() {
  const seasons = document.querySelector('.c-select-content');
  const children = seasons?.querySelectorAll('div');
  if (children) {
    let isActive = false;
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains('state-active')) {
        isActive = true;
      } else if (isActive) {
        children[i].click();
        return true;
      }
    }
  }
  return false;
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateNextSeason};
} else {
  console.info(evaluateNextSeason());
}
