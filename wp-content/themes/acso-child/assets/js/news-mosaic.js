/**
 * ACSO news mosaic control — reusable 5-tile slider (tl/bl/feat/tr/br).
 * Usage: AcsoNewsMosaic.mount(rootEl, options)
 */
(function (global) {
  'use strict';

  var SLOTS = ['bl', 'tl', 'feat', 'tr', 'br'];

  var DEFAULT_POOL = [
    {
      title: 'Андрій Крупник про реформу ОСН у колонці для «Інтерфакс-Україна»',
      date: '7 листопада, 2026',
      href: 'news-single.html',
      img: 'news_1.png',
      tags: 'Блоги',
    },
    {
      title: 'Галина Семенець про майбутнє військово-цивільних адміністрацій: нова колонка у блогах LIGA.net',
      date: '3 листопада, 2026',
      href: 'news-single.html',
      img: 'news_2.png',
      tags: 'Блоги',
    },
    {
      title: 'Реінтеграція має починатися з людей: Ірина Іванова виступила на Donbas Media Forum',
      date: '22 жовтня, 2026',
      href: 'news-single.html',
      img: 'hero_bg.png',
      tags: 'featured · Блоги · Події',
      featured: true,
    },
    {
      title: 'У Києві презентували путівник із дистанційної та гібридної участі жителів',
      date: '17 вересня, 2026',
      href: 'news-single.html',
      img: 'news_1.png',
      tags: 'Події',
    },
    {
      title: 'Від стійкості громад до оновлення законодавства: у Києві відбулася XV Всеукраїнська конференція',
      date: '15 вересня, 2026',
      href: 'news-single.html',
      img: 'hero_bg.png',
      tags: 'Події',
    },
    {
      title: 'Форум місцевої демократії 2026: головні підсумки',
      date: '20 травня, 2026',
      href: 'news-single.html',
      img: 'hero_bg.png',
      tags: 'Події',
    },
    {
      title: 'Стартувала школа громадської участі для органів самоорганізації населення',
      date: '15 травня, 2026',
      href: 'news-single.html',
      img: 'news_1.png',
      tags: 'Навчання',
    },
    {
      title: 'Анонс: вебінар «Бюджет участі: як запустити в громаді»',
      date: '9 травня, 2026',
      href: 'news-single.html',
      img: '',
      tags: 'Анонс',
    },
  ];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cloneAssign(src) {
    return { bl: src.bl, tl: src.tl, feat: src.feat, tr: src.tr, br: src.br };
  }

  function advanceContour(assign, incoming) {
    return {
      br: incoming,
      tr: assign.br,
      feat: assign.tr,
      bl: assign.feat,
      tl: assign.bl,
    };
  }

  function tileHtml(item) {
    var tags = item.tags
      ? '<p class="news-mosaic__tags">' + escapeHtml(item.tags) + '</p>'
      : '<p class="news-mosaic__tags news-mosaic__tags--empty" aria-hidden="true">&#8203;</p>';
    var media = item.img
      ? '<img src="' + escapeHtml(item.img) + '" alt="" loading="lazy">'
      : '<span class="news-mosaic__placeholder" aria-hidden="true"></span>';
    return (
      '<a class="news-mosaic__tile" href="' + escapeHtml(item.href) + '">' +
      '<span class="news-mosaic__media">' + media + '</span>' +
      '<span class="news-mosaic__body">' + tags +
      '<span class="news-mosaic__title">' + escapeHtml(item.title) + '</span>' +
      '<time class="news-mosaic__date" datetime="">' + escapeHtml(item.date) + '</time>' +
      '</span></a>'
    );
  }

  /**
   * @param {HTMLElement} root  [data-news-mosaic]
   * @param {object} [options]
   * @param {Array} [options.pool]
   * @param {number} [options.autoplayMs=0]  auto step interval; 0 = off
   * @param {number} [options.windowSize=5]
   * @param {function} [options.onStep]
   * @returns {{ step: function, destroy: function, getState: function }|null}
   */
  function mount(root, options) {
    if (!root) return null;
    options = options || {};

    var fromData = (typeof global.AcsoData !== 'undefined' && Array.isArray(global.AcsoData.newsMosaicPool))
      ? global.AcsoData.newsMosaicPool
      : null;
    var pool = (options.pool && options.pool.length)
      ? options.pool.slice()
      : (fromData ? fromData.slice() : DEFAULT_POOL.slice());
    var windowSize = Math.min(options.windowSize || 5, pool.length);
    if (windowSize < 1) return null;

    var assignments = { tl: 0, bl: 1, feat: 2, tr: 3, br: 4 };
    Object.keys(assignments).forEach(function (k, i) {
      assignments[k] = Math.min(i, pool.length - 1);
    });
    var tail = windowSize;
    var history = [cloneAssign(assignments)];
    var cells = {};
    SLOTS.forEach(function (slot) {
      cells[slot] = root.querySelector('[data-mosaic-slot="' + slot + '"]');
    });

    var controlsRoot = options.controlsRoot || root;
    var prevBtn = options.prevBtn || controlsRoot.querySelector('[data-mosaic-prev]');
    var nextBtn = options.nextBtn || controlsRoot.querySelector('[data-mosaic-next]');
    var hint = options.hint || controlsRoot.querySelector('[data-mosaic-hint]');
    var autoplayMs = options.autoplayMs || 0;
    var autoplayTimer = null;
    var destroyed = false;
    var keyTarget = options.keyTarget || root;

    function render() {
      SLOTS.forEach(function (slot) {
        var idx = assignments[slot];
        var item = pool[idx];
        var cell = cells[slot];
        if (!item || !cell) return;
        cell.innerHTML = tileHtml(item);
      });
      if (hint) {
        hint.textContent = 'Крок ' + history.length + ' · у пулі ' + pool.length + ' новин';
      }
      /* Якщо є onReachStart — з кроку 1 можна йти вліво (на «нульовий» кадр) */
      if (prevBtn) {
        prevBtn.disabled = history.length <= 1 && typeof options.onReachStart !== 'function';
      }
      if (nextBtn) nextBtn.disabled = tail >= pool.length;
      if (typeof options.onStep === 'function') {
        options.onStep({ step: history.length, tail: tail, poolSize: pool.length });
      }
    }

    function step(dir) {
      if (destroyed) return false;
      if (dir > 0) {
        if (tail >= pool.length) return false;
        assignments = advanceContour(assignments, tail);
        tail++;
        history.push(cloneAssign(assignments));
      } else {
        if (history.length <= 1) return false;
        history.pop();
        assignments = cloneAssign(history[history.length - 1]);
        tail--;
      }
      render();
      return true;
    }

    function restartAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      if (!autoplayMs || destroyed) return;
      autoplayTimer = setInterval(function () {
        if (tail >= pool.length) {
          /* loop: reset to first news window (не на zero — це робить хост) */
          assignments = { tl: 0, bl: 1, feat: 2, tr: 3, br: 4 };
          tail = windowSize;
          history = [cloneAssign(assignments)];
          render();
          return;
        }
        step(1);
      }, autoplayMs);
    }

    function onPrev() {
      if (history.length <= 1 && typeof options.onReachStart === 'function') {
        options.onReachStart();
        return;
      }
      step(-1);
      restartAutoplay();
    }
    function onNext() {
      step(1);
      restartAutoplay();
    }
    function onKey(e) {
      if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', onPrev);
    if (nextBtn) nextBtn.addEventListener('click', onNext);
    keyTarget.addEventListener('keydown', onKey);

    render();
    restartAutoplay();

    return {
      step: step,
      destroy: function () {
        destroyed = true;
        if (autoplayTimer) clearInterval(autoplayTimer);
        if (prevBtn) prevBtn.removeEventListener('click', onPrev);
        if (nextBtn) nextBtn.removeEventListener('click', onNext);
        keyTarget.removeEventListener('keydown', onKey);
      },
      getState: function () {
        return { step: history.length, tail: tail, poolSize: pool.length };
      },
    };
  }

  global.AcsoNewsMosaic = {
    SLOTS: SLOTS,
    DEFAULT_POOL: DEFAULT_POOL,
    mount: mount,
    escapeHtml: escapeHtml,
  };
})(typeof window !== 'undefined' ? window : this);
