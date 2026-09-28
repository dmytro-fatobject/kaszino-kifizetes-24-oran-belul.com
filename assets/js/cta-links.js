(function () {
  var SITE_ID = 'kaszino-kifizetes-24-oran-belul-com';
  var path = encodeURIComponent(location.pathname || '/');

  function buildUrl(el) {
    var ctaName = el.dataset.ctaName || '';
    var section = el.dataset.ctaSection || '';
    return (
      '/api/cta/go?siteId=' + encodeURIComponent(SITE_ID) +
      '&ctaName=' + encodeURIComponent(ctaName) +
      '&section=' + encodeURIComponent(section) +
      '&path=' + path
    );
  }

  document.querySelectorAll('[data-cta-name]').forEach(function (el) {
    if (el.tagName === 'BUTTON') {
      // Read data-cta-name fresh on every click: some buttons (e.g. the
      // bonus-slot reveal modal) start with an empty ctaName and only get
      // the real brand filled in later, after a spin.
      el.addEventListener('click', function () {
        window.open(buildUrl(el), '_blank', 'noopener,noreferrer');
      });
      return;
    }

    el.setAttribute('href', buildUrl(el));
  });
})();
