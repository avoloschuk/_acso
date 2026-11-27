/**
 * Shared chrome behaviours: mobile nav, forms, share, lightbox, search, subnav, legacy hero slider.
 */
(function (global) {
  'use strict';

  function initMobileNav() {
    var mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    var mainNav = document.querySelector('.main-nav');
    if (!mobileMenuBtn || !mainNav) return;
    mobileMenuBtn.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function initHeroSlider() {
    var track = document.querySelector('[data-hero-slider]');
    if (!track) return;

    var slides = Array.from(track.querySelectorAll('[data-hero-slide]'));
    var prevBtn = document.querySelector('[data-hero-prev]');
    var nextBtn = document.querySelector('[data-hero-next]');
    var dotsHost = document.querySelector('[data-hero-dots]');
    if (slides.length < 2 || !dotsHost) return;

    var index = slides.findIndex(function (s) { return s.classList.contains('is-active'); });
    if (index < 0) index = 0;
    var timer = null;
    var INTERVAL_MS = 8000;

    dotsHost.innerHTML = '';
    slides.forEach(function (_, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hero-slider__dot';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', 'Слайд ' + (i + 1));
      btn.addEventListener('click', function () { goTo(i, true); });
      dotsHost.appendChild(btn);
    });
    var dots = Array.from(dotsHost.querySelectorAll('.hero-slider__dot'));

    function setActive(i) {
      slides.forEach(function (slide, n) {
        var on = n === i;
        slide.classList.toggle('is-active', on);
        slide.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      dots.forEach(function (dot, n) {
        var on = n === i;
        dot.classList.toggle('is-active', on);
        dot.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      index = i;
    }

    function goTo(i, userDriven) {
      var next = (i + slides.length) % slides.length;
      setActive(next);
      if (userDriven) restartAutoplay();
    }

    function restartAutoplay() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { goTo(index + 1, false); }, INTERVAL_MS);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1, true); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') goTo(index - 1, true);
      if (e.key === 'ArrowRight') goTo(index + 1, true);
    });

    setActive(index);
    restartAutoplay();
  }

  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var success = form.querySelector('[data-form-success]');

    function validate(field) {
      var input = field.querySelector('input, textarea, select');
      if (!input || !input.required) return true;
      var ok = input.type === 'checkbox' ? input.checked : input.checkValidity() && input.value.trim() !== '';
      field.classList.toggle('is-invalid', !ok);
      return ok;
    }

    var fields = Array.from(form.querySelectorAll('.form-field'));
    fields.forEach(function (f) {
      f.addEventListener('change', function () { validate(f); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = fields.map(validate).every(Boolean);
      if (success) success.hidden = !ok;
      if (ok) {
        form.reset();
        if (success) success.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        var invalid = form.querySelector('.is-invalid input, .is-invalid textarea');
        if (invalid) invalid.focus();
      }
    });
  }

  function initShare() {
    document.querySelectorAll('.share a[href*="="]').forEach(function (a) {
      a.href += encodeURIComponent(location.href);
    });
    document.querySelectorAll('[data-copy-link]').forEach(function (btn) {
      var label = btn.querySelector('span');
      btn.addEventListener('click', function () {
        var done = function () {
          btn.classList.add('is-done');
          if (label) label.textContent = 'Скопійовано';
          setTimeout(function () {
            btn.classList.remove('is-done');
            if (label) label.textContent = 'Копіювати';
          }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(location.href).then(done).catch(done);
        } else {
          done();
        }
      });
    });
  }

  function initLightbox() {
    var box = document.querySelector('[data-lightbox-root]');
    if (!box) return;
    var img = box.querySelector('img');
    var close = function () { box.hidden = true; };

    document.querySelectorAll('[data-lightbox]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        img.src = btn.dataset.lightbox;
        var thumb = btn.querySelector('img');
        img.alt = thumb ? thumb.alt : '';
        box.hidden = false;
        var closer = box.querySelector('.lightbox__close');
        if (closer) closer.focus();
      });
    });
    box.addEventListener('click', function (e) { if (e.target !== img) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  function initSiteSearch() {
    var form = document.querySelector('[data-site-search]');
    var list = document.querySelector('[data-results]');
    if (!form || !list) return;

    var input = form.querySelector('input');
    var summary = document.querySelector('[data-search-summary]');
    var empty = document.querySelector('[data-empty]');
    var results = Array.from(list.querySelectorAll('.result'));
    var originals = results.map(function (r) {
      return {
        title: r.querySelector('.result__title a').textContent,
        excerpt: r.querySelector('.result__excerpt').textContent,
      };
    });
    var q0 = new URLSearchParams(location.search).get('q');
    if (q0 !== null) input.value = q0;

    var escape = function (s) {
      return s.replace(/[&<>"]/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
      });
    };
    var highlight = function (text, words) {
      var html = escape(text);
      words.forEach(function (w) {
        html = html.replace(
          new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\p{L}\\p{N}\'’-]*)', 'giu'),
          '<mark>$1</mark>'
        );
      });
      return html;
    };

    function run() {
      var q = input.value.trim();
      var words = q.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 2; });
      var n = 0;
      results.forEach(function (r, i) {
        var hay = r.dataset.search;
        var match = words.length > 0 && words.some(function (w) {
          return hay.includes(w.slice(0, Math.max(3, w.length - 2)));
        });
        r.hidden = !match;
        if (match) n += 1;
        var stems = words.map(function (w) { return w.slice(0, Math.max(3, w.length - 2)); });
        r.querySelector('.result__title a').innerHTML = highlight(originals[i].title, stems);
        r.querySelector('.result__excerpt').innerHTML = highlight(originals[i].excerpt, stems);
      });
      var mod10 = n % 10;
      var mod100 = n % 100;
      var noun = mod10 === 1 && mod100 !== 11 ? 'результат'
        : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'результати' : 'результатів';
      if (summary) {
        summary.innerHTML = q
          ? 'За запитом <strong>«' + escape(q) + '»</strong> знайдено <strong>' + n + '</strong> ' + noun
          : 'Введіть запит, щоб побачити результати';
      }
      if (empty) empty.hidden = n > 0 || !q;
      var pager = document.querySelector('.pagination');
      var pagerNav = pager ? pager.closest('nav') : null;
      if (pagerNav) pagerNav.toggleAttribute('hidden', n === 0);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var url = new URL(location.href);
      url.searchParams.set('q', input.value.trim());
      history.replaceState(null, '', url);
      run();
    });
    run();
  }

  function initSubnav() {
    var links = Array.from(document.querySelectorAll('[data-subnav-link]'));
    if (!links.length) return;

    var header = document.querySelector('.site-header');
    var subnav = document.querySelector('.subnav');

    function stickyOffset() {
      return (header ? header.offsetHeight : 0) + (subnav ? subnav.offsetHeight : 0);
    }

    function scrollToSectionId(id, behavior) {
      behavior = behavior || 'smooth';
      var section = document.getElementById(id);
      if (!section) return;
      var top = section.getBoundingClientRect().top + window.scrollY - stickyOffset();
      window.scrollTo({ top: Math.max(0, top), behavior: behavior });
    }

    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.hash.slice(1);
        if (!id || !document.getElementById(id)) return;
        e.preventDefault();
        scrollToSectionId(id);
        history.pushState(null, '', '#' + id);
        links.forEach(function (link) { link.classList.remove('is-active'); });
        a.classList.add('is-active');
      });
    });

    if (location.hash) {
      var id = location.hash.slice(1);
      if (document.getElementById(id)) {
        requestAnimationFrame(function () { scrollToSectionId(id, 'auto'); });
      }
    }

    if (!('IntersectionObserver' in window)) return;

    var byId = new Map(links.map(function (a) { return [a.hash.slice(1), a]; }));
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        var currentLink = byId.get(entry.target.id);
        if (currentLink) currentLink.classList.add('is-active');
      });
    }, {
      rootMargin: '-' + stickyOffset() + 'px 0px -60% 0px',
      threshold: 0,
    });
    byId.forEach(function (_, sid) {
      var el = document.getElementById(sid);
      if (el) observer.observe(el);
    });
  }

  function init() {
    initMobileNav();
    initHeroSlider();
    initContactForm();
    initShare();
    initLightbox();
    initSiteSearch();
    initSubnav();
  }

  global.AcsoUiChrome = {
    init: init,
    initMobileNav: initMobileNav,
    initSubnav: initSubnav,
  };
})(typeof window !== 'undefined' ? window : this);
