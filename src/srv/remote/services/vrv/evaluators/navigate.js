/**
 * Evaluate the navigation.
 * @param {string} url 
 */
function evaluateNavigate(url) {
  history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

if (typeof module !== 'undefined') {
  module.exports = {evaluateNavigate};
} else {
  evaluateNavigate('https://vrv.co/watch/GY8VGKN8Y/A-Certain-Scientific-Railgun');
}
