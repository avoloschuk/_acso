/**
 * @deprecated Use modular scripts in prototype/js/ (see js/main.js).
 * Kept as a no-op redirect notice for old bookmarks / cached HTML.
 */
(function () {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('[ACSO] prototype/script.js is deprecated. Load js/main.js (and modules) instead.');
  }
})();
