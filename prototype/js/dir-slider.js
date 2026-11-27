/**
 * Directions focus-carousel (IRF-style). Mount: [data-dir-focus]
 * WP: theme prints slides; this module only handles active index + motion.
 */
(function (global) {
  'use strict';

  var NARROW_MQ = '(max-width: 699px)';
  var MOVE_MS = 550;

  function cssPx(el, name, fallback) {
    var probe = document.createElement('div');
    probe.style.cssText =
      'position:absolute;visibility:hidden;pointer-events:none;width:var(' +
      name +
      ');height:0;';
    el.appendChild(probe);
    var w = probe.offsetWidth;
    el.removeChild(probe);
    return w || fallback;
  }

  function initOne(root) {
    if (root.getAttribute('data-dir-ready') === '1') return;
    root.setAttribute('data-dir-ready', '1');

    var track = root.querySelector('[data-dir-track]');
    var prev = root.querySelector('[data-dir-prev]');
    var next = root.querySelector('[data-dir-next]');
    var bar = root.querySelector('[data-dir-progress]');
    var viewport = root.querySelector('.dir-focus__viewport') || root;
    if (!track) return;

    var slides = Array.prototype.slice.call(track.querySelectorAll('[data-dir-slide]'));
    if (!slides.length) return;

    var index = Math.min(2, slides.length - 1);
    var busy = false;
    var reduceMotion = false;

    try {
      reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { /* ignore */ }

    function isMobile() {
      try {
        return window.matchMedia(NARROW_MQ).matches;
      } catch (e) {
        return false;
      }
    }

    function metrics() {
      var gap = cssPx(root, '--dir-gap', 16);
      var narrow = cssPx(root, '--dir-narrow', 180);
      var wide = cssPx(root, '--dir-wide', 600);
      if (isMobile()) {
        narrow = viewport.clientWidth;
        wide = viewport.clientWidth;
        gap = 0;
      }
      return { gap: gap, narrow: narrow, wide: wide };
    }

    /** Final left edge of slide i when `index` is active (fixed CSS sizes — no layout thrash). */
    function slideLeftAt(i, activeIndex, m) {
      var left = 0;
      var n;
      for (n = 0; n < i; n += 1) {
        left += (n === activeIndex ? m.wide : m.narrow) + m.gap;
      }
      return left;
    }

    function updateBar() {
      if (!bar) return;
      var n = slides.length;
      bar.style.width = (100 / n) + '%';
      bar.style.transform = 'translateX(' + (index * 100) + '%)';
    }

    function setA11y() {
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-current', active ? 'true' : 'false');
        var text = slide.querySelector('.dir-focus__text');
        var media = slide.querySelector('.dir-focus__media');
        if (text) text.setAttribute('aria-hidden', active ? 'false' : 'true');
        if (media) media.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
    }

    function targetFor(activeIndex) {
      var vpW = viewport.clientWidth;
      var m = metrics();
      var left = slideLeftAt(activeIndex, activeIndex, m);
      var width = m.wide;
      return Math.round(vpW / 2 - (left + width / 2));
    }

    function applyTransform(px, animate) {
      if (animate && !reduceMotion) {
        track.style.transition = 'transform ' + MOVE_MS + 'ms cubic-bezier(0.25, 0.1, 0.25, 1)';
      } else {
        track.style.transition = 'none';
      }
      track.style.transform = 'translate3d(' + px + 'px, 0, 0)';
    }

    function goTo(nextIndex, animate) {
      if (busy) return;
      var n = slides.length;
      if (n < 1) return;
      index = ((nextIndex % n) + n) % n;
      busy = true;

      var doAnimate = animate !== false && !reduceMotion;
      var target = targetFor(index);

      // Class + transform in one frame → one smooth move (no re-center pass).
      setA11y();
      updateBar();
      applyTransform(target, doAnimate);

      window.setTimeout(function () {
        busy = false;
      }, doAnimate ? MOVE_MS : 0);
    }

    function onPrev() {
      goTo(index - 1, true);
    }

    function onNext() {
      goTo(index + 1, true);
    }

    if (prev) prev.addEventListener('click', onPrev);
    if (next) next.addEventListener('click', onNext);

    slides.forEach(function (slide, i) {
      slide.addEventListener('click', function (event) {
        if (i === index) return;
        event.preventDefault();
        goTo(i, true);
      });
    });

    var touchX = null;
    viewport.addEventListener('touchstart', function (event) {
      if (!event.changedTouches || !event.changedTouches[0]) return;
      touchX = event.changedTouches[0].clientX;
    }, { passive: true });

    viewport.addEventListener('touchend', function (event) {
      if (touchX == null || !event.changedTouches || !event.changedTouches[0]) return;
      var dx = event.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) < 40) return;
      if (dx < 0) onNext();
      else onPrev();
    }, { passive: true });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        applyTransform(targetFor(index), false);
      }, 120);
    });

    if (isMobile()) index = 0;
    setA11y();
    updateBar();
    applyTransform(targetFor(index), false);
  }

  function initDirectionSlider() {
    var roots = document.querySelectorAll('[data-dir-focus]');
    Array.prototype.forEach.call(roots, initOne);
  }

  global.AcsoDirSlider = { init: initDirectionSlider };
  global.AcsoDirFocus = global.AcsoDirSlider;
})(typeof window !== 'undefined' ? window : this);
