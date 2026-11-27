/**
 * Archive topic/search/center filters. Mount: [data-filter-list]
 */
(function (global) {
  'use strict';

  function initArchiveFilters() {
    var list = document.querySelector('[data-filter-list]');
    if (!list) return;

    var items = Array.from(list.children);
    var chips = Array.from(document.querySelectorAll('[data-topic-chip]'));
    var searchForm = document.querySelector('[data-archive-search]');
    var search = searchForm ? searchForm.querySelector('input') : null;
    var centerSelect = document.querySelector('[data-center-filter]');
    var empty = document.querySelector('[data-empty]');
    var count = document.querySelector('[data-count]');
    var moreBtn = document.querySelector('[data-load-more]');
    var shown = document.querySelector('[data-shown]');
    var params = new URLSearchParams(location.search);

    var topic = params.get('topic') || 'all';
    var center = params.get('center') || 'all';
    var expanded = false;

    if (!chips.some(function (c) { return c.dataset.topicChip === topic; })) topic = 'all';
    if (centerSelect) centerSelect.value = center;
    if (centerSelect && centerSelect.value !== center) center = 'all';

    function apply() {
      var q = ((search && search.value) || '').trim().toLowerCase();
      var visible = 0;
      items.forEach(function (el) {
        var match = (topic === 'all' || el.dataset.topic === topic)
          && (center === 'all' || el.dataset.center === center)
          && (!q || (el.dataset.search || '').includes(q));
        var deferred = el.hasAttribute('data-more-item') && !expanded && topic === 'all' && center === 'all' && !q;
        el.hidden = !match || deferred;
        if (!el.hidden) visible += 1;
      });
      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', c.dataset.topicChip === topic ? 'true' : 'false');
      });
      if (empty) empty.hidden = visible > 0;
      if (count) count.textContent = String(visible);
      if (shown) shown.textContent = String(visible);
      if (moreBtn) {
        var hasDeferred = items.some(function (el) { return el.hasAttribute('data-more-item'); });
        var wrap = moreBtn.closest('.load-more');
        if (wrap) {
          wrap.hidden = !hasDeferred || expanded || topic !== 'all' || center !== 'all' || !!q;
        }
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        topic = chip.dataset.topicChip;
        var url = new URL(location.href);
        if (topic === 'all') url.searchParams.delete('topic');
        else url.searchParams.set('topic', topic);
        history.replaceState(null, '', url);
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
    if (searchForm) searchForm.addEventListener('submit', function (e) { e.preventDefault(); });
    if (centerSelect) {
      centerSelect.addEventListener('change', function () {
        center = centerSelect.value;
        apply();
      });
    }
    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        expanded = true;
        apply();
      });
    }

    apply();
  }

  global.AcsoArchiveFilters = { init: initArchiveFilters };
})(typeof window !== 'undefined' ? window : this);
