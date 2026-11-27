/**
 * Home hero: zero frame (map + mission) ↔ news mosaic slideshow.
 * Mount: [data-home-hero]
 */
(function (global) {
  'use strict';

  function initHomeHeroNews() {
    var hero = document.querySelector('[data-home-hero]');
    if (!hero || !global.AcsoNewsMosaic) return null;

    var zero = hero.querySelector('[data-home-hero-zero]');
    var mosaicWrap = hero.querySelector('[data-home-hero-mosaic]');
    var mosaicRoot = hero.querySelector('[data-news-mosaic-hero]');
    var controls = hero.querySelector('[data-home-hero-controls]');
    var prevBtn = hero.querySelector('[data-mosaic-prev]');
    var nextBtn = hero.querySelector('[data-mosaic-next]');
    var hint = hero.querySelector('[data-mosaic-hint]');
    if (!mosaicRoot || !mosaicWrap || !controls || !nextBtn) return null;

    var ACTIVATE_MS = 5000;
    var AUTOPLAY_MS = 8000;
    var live = false;
    var mosaicApi = null;
    var activateTimer = null;

    function setZeroControls() {
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = false;
      if (hint) hint.textContent = 'Новини Асоціації';
    }

    function showZeroFrame() {
      live = false;
      if (mosaicApi) {
        mosaicApi.destroy();
        mosaicApi = null;
      }
      hero.classList.remove('is-live');
      if (zero) {
        zero.hidden = false;
        zero.setAttribute('aria-hidden', 'false');
      }
      mosaicWrap.hidden = true;
      mosaicWrap.setAttribute('aria-hidden', 'true');
      setZeroControls();
      nextBtn.addEventListener('click', onZeroNext);
      scheduleAutoEnter();
    }

    function enterNewsMode() {
      if (live) return;
      live = true;
      if (activateTimer) {
        clearTimeout(activateTimer);
        activateTimer = null;
      }
      nextBtn.removeEventListener('click', onZeroNext);
      hero.classList.add('is-live');
      if (zero) {
        zero.hidden = true;
        zero.setAttribute('aria-hidden', 'true');
      }
      mosaicWrap.hidden = false;
      mosaicWrap.setAttribute('aria-hidden', 'false');
      if (mosaicApi) {
        mosaicApi.destroy();
        mosaicApi = null;
      }
      mosaicApi = global.AcsoNewsMosaic.mount(mosaicRoot, {
        autoplayMs: AUTOPLAY_MS,
        controlsRoot: controls,
        prevBtn: prevBtn,
        nextBtn: nextBtn,
        hint: hint,
        keyTarget: hero,
        onReachStart: showZeroFrame,
      });
    }

    function onZeroNext(e) {
      e.preventDefault();
      enterNewsMode();
    }

    function scheduleAutoEnter() {
      if (activateTimer) clearTimeout(activateTimer);
      activateTimer = setTimeout(enterNewsMode, ACTIVATE_MS);
    }

    nextBtn.addEventListener('click', onZeroNext);
    hero.addEventListener('keydown', function (e) {
      if (live) return;
      if (e.key === 'ArrowRight') enterNewsMode();
    });
    if (!hero.hasAttribute('tabindex')) hero.setAttribute('tabindex', '0');
    setZeroControls();
    scheduleAutoEnter();

    return { enterNewsMode: enterNewsMode, showZeroFrame: showZeroFrame };
  }

  function initNewsMosaicPages() {
    if (!global.AcsoNewsMosaic) return;
    document.querySelectorAll('[data-news-mosaic]:not([data-news-mosaic-hero])').forEach(function (root) {
      global.AcsoNewsMosaic.mount(root);
    });
  }

  global.AcsoHomeHero = {
    init: initHomeHeroNews,
    initArchiveMosaics: initNewsMosaicPages,
  };
})(typeof window !== 'undefined' ? window : this);
