(function () {
  'use strict';

  function getTitle(title) {
    return '--' + title;
  }

  document.title += getTitle('two');
})();
