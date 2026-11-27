/**
 * RC network map + list sync. Mount: [data-network]
 */
(function (global) {
  'use strict';

  function initNetworkMap() {
    var root = document.querySelector('[data-network]');
    if (!root) return;

    var markers = Array.from(root.querySelectorAll('[data-center-marker]'));
    var items = Array.from(root.querySelectorAll('[data-center-item]'));
    var name = root.querySelector('[data-center-name]');
    var region = root.querySelector('[data-center-region]');

    function select(slug, scroll) {
      markers.forEach(function (m) {
        m.classList.toggle('is-active', m.dataset.centerMarker === slug);
      });
      items.forEach(function (b) {
        var on = b.dataset.centerItem === slug;
        b.classList.toggle('is-active', on);
        if (on && name && region) {
          name.textContent = b.dataset.name;
          region.textContent = b.dataset.region;
          if (scroll) b.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    markers.forEach(function (m) {
      m.addEventListener('click', function () { select(m.dataset.centerMarker, true); });
    });
    items.forEach(function (b) {
      b.addEventListener('click', function () { select(b.dataset.centerItem, false); });
    });
  }

  global.AcsoNetworkMap = { init: initNetworkMap };
})(typeof window !== 'undefined' ? window : this);
