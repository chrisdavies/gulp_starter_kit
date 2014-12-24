(function () {
  function getTitle(title) {
    return '--' + title;
  }

  document.title += getTitle('two');
})();
