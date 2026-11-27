/**
 * ACSO front boot — thin orchestrator for theme enqueue parity.
 * Load order (see footer scripts / functions.php):
 *   util → news-mosaic-data → news-mosaic → home-hero → dir-slider →
 *   archive-filters → network-map → ui-chrome → i18n-demo → main
 */
(function (global) {
  'use strict';

  function boot() {
    if (global.AcsoUiChrome) global.AcsoUiChrome.init();
    if (global.AcsoHomeHero) {
      global.AcsoHomeHero.init();
      global.AcsoHomeHero.initArchiveMosaics();
    }
    if (global.AcsoDirSlider) global.AcsoDirSlider.init();
    if (global.AcsoArchiveFilters) global.AcsoArchiveFilters.init();
    if (global.AcsoNetworkMap) global.AcsoNetworkMap.init();
  }

  if (global.AcsoI18nDemo) global.AcsoI18nDemo.init();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : this);
