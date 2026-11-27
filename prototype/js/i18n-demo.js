/**
 * Prototype-only UA/EN menu switch (localStorage).
 * Production: Polylang — do not port this file into theme as i18n source of truth.
 */
(function (global) {
  'use strict';

  var MENU_EN = {
    'index.html': ['Home'],
    'index.html?nav=home': ['Home'],
    'directions.html': ['Activity areas'],
    'about.html': ['About us'],
    'democracy.html': ['Local democracy'],
    'analytics.html': ['Analytics'],
    'library.html': ['Library'],
    'news.html': ['Association news'],
    'network.html': ['RC network'],
    'partners.html': ['Partners’ blog'],
    'search.html': ['Search'],
  };

  var HEADINGS_EN = {
    'Головна': 'Home',
    'Сильні громади — основа демократичної України': 'Strong communities — the foundation of a democratic Ukraine',
    'Напрями діяльності': 'Activity areas',
    'Про нас': 'About us',
    'Місцева демократія': 'Local democracy',
    'Аналітика': 'Analytics',
    'Бібліотека': 'Library',
    'Новини Асоціації': 'Association news',
    'Мережа ресурсних центрів': 'Resource centres network',
    'Блог партнерів': 'Partners’ blog',
    'Пошук': 'Search',
    'Пошук по сайту': 'Site search',
    'Стани елементів': 'UI states',
    'Стани інтерактивних елементів': 'Interactive element states',
  };

  var HOME_PAGE_EN = {
    h1: 'Strong communities — the foundation of a democratic Ukraine',
    lead: 'We promote democracy and capable communities through residents’ self-organization and meaningful civic participation<br>in local affairs.',
  };

  function initMenuLanguage() {
    var switches = Array.from(document.querySelectorAll('.lang-link'));
    if (!switches.length) return;

    var links = Array.from(document.querySelectorAll('.main-nav a, .footer-sitemap a'))
      .filter(function (a) { return MENU_EN[a.getAttribute('href')]; });

    function textTargets(a) {
      var lines = a.querySelectorAll('.nav-label__line');
      if (lines.length) return Array.from(lines);
      var node = Array.from(a.childNodes).find(function (n) {
        return n.nodeType === Node.TEXT_NODE && n.textContent.trim();
      });
      return node ? [node] : [];
    }

    links.forEach(function (a) {
      a.dataset.labelUk = JSON.stringify(textTargets(a).map(function (n) { return n.textContent.trim(); }));
    });

    var headings = Array.from(document.querySelectorAll('.breadcrumbs li > a, .breadcrumbs li[aria-current], .page-head h1'))
      .filter(function (el) { return HEADINGS_EN[el.textContent.trim()]; });
    headings.forEach(function (el) { el.dataset.labelUk = el.textContent.trim(); });

    var homeHead = document.querySelector('.page-head--home');
    var homeH1 = homeHead ? homeHead.querySelector('h1') : null;
    var homeLead = homeHead ? homeHead.querySelector('.page-head__lead') : null;
    var homeUk = null;
    if (homeH1 && homeLead) {
      homeUk = { h1: homeH1.innerHTML, lead: homeLead.innerHTML };
    }

    function apply(lang) {
      links.forEach(function (a) {
        var labels = lang === 'en' ? MENU_EN[a.getAttribute('href')] : JSON.parse(a.dataset.labelUk);
        var targets = textTargets(a);
        var caret = a.querySelector('.nav-caret');
        if (targets.length > 1) {
          targets.forEach(function (n, i) { n.textContent = labels[i] || ''; });
        } else if (targets[0]) {
          targets[0].textContent = labels.join(' ') + (caret ? ' ' : '');
        }
      });
      headings.forEach(function (el) {
        el.textContent = lang === 'en' ? HEADINGS_EN[el.dataset.labelUk] : el.dataset.labelUk;
      });
      if (homeUk && homeH1 && homeLead) {
        if (lang === 'en') {
          homeH1.textContent = HOME_PAGE_EN.h1;
          homeLead.innerHTML = HOME_PAGE_EN.lead;
        } else {
          homeH1.innerHTML = homeUk.h1;
          homeLead.innerHTML = homeUk.lead;
        }
      }
      switches.forEach(function (s) {
        s.classList.toggle('is-active', s.getAttribute('hreflang') === (lang === 'en' ? 'en' : 'uk'));
      });
      localStorage.setItem('acso-menu-lang', lang);
    }

    switches.forEach(function (s) {
      s.addEventListener('click', function (e) {
        e.preventDefault();
        apply(s.getAttribute('hreflang') === 'en' ? 'en' : 'uk');
      });
    });

    if (localStorage.getItem('acso-menu-lang') === 'en') apply('en');
  }

  function initAboutNav() {
    var onAbout = location.pathname.endsWith('about.html') || location.pathname.endsWith('/about');
    var link = document.querySelector('.main-nav a[href="about.html"]');
    if (!link) return;
    if (onAbout) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  function init() {
    initMenuLanguage();
    initAboutNav();
    document.documentElement.classList.remove('is-lang-pending');
  }

  global.AcsoI18nDemo = { init: init };
})(typeof window !== 'undefined' ? window : this);
