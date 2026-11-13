document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('is-open');
            mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    initHeroSlider();
    initNewsMosaic();
    initDirectionSlider();
    initArchiveFilters();
    initNetworkMap();
    initContactForm();
    initShare();
    initLightbox();
    initSiteSearch();
    initSubnav();
});

function initHeroSlider() {
    const track = document.querySelector('[data-hero-slider]');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('[data-hero-slide]'));
    const prevBtn = document.querySelector('[data-hero-prev]');
    const nextBtn = document.querySelector('[data-hero-next]');
    const dotsHost = document.querySelector('[data-hero-dots]');
    if (slides.length < 2 || !dotsHost) return;

    let index = slides.findIndex((s) => s.classList.contains('is-active'));
    if (index < 0) index = 0;

    let timer = null;
    const INTERVAL_MS = 8000;

    dotsHost.innerHTML = '';
    slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hero-slider__dot';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', `Слайд ${i + 1}`);
        btn.addEventListener('click', () => goTo(i, true));
        dotsHost.appendChild(btn);
    });

    const dots = Array.from(dotsHost.querySelectorAll('.hero-slider__dot'));

    function setActive(i) {
        slides.forEach((slide, n) => {
            const on = n === i;
            slide.classList.toggle('is-active', on);
            slide.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
        dots.forEach((dot, n) => {
            const on = n === i;
            dot.classList.toggle('is-active', on);
            dot.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        index = i;
    }

    function goTo(i, userDriven) {
        const next = (i + slides.length) % slides.length;
        setActive(next);
        if (userDriven) restartAutoplay();
    }

    function restartAutoplay() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => goTo(index + 1, false), INTERVAL_MS);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1, true); });

  track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goTo(index - 1, true);
        if (e.key === 'ArrowRight') goTo(index + 1, true);
    });

    setActive(index);
    restartAutoplay();
}


var NEWS_MOSAIC_SLOTS = ['bl', 'tl', 'feat', 'tr', 'br'];

function initNewsMosaic() {
    var root = document.querySelector('[data-news-mosaic]');
    if (!root) return;

    var pool = [
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

    /* Контур 1→2→3→4→5: tl → bl → feat → tr → br (1 найновіша, 5 найстаріша у вікні) */
    var assignments = { tl: 0, bl: 1, feat: 2, tr: 3, br: 4 };
    var tail = 5;
    var cells = {};
    NEWS_MOSAIC_SLOTS.forEach(function (slot) {
        cells[slot] = root.querySelector('[data-mosaic-slot="' + slot + '"]');
    });
    var prevBtn = root.querySelector('[data-mosaic-prev]');
    var nextBtn = root.querySelector('[data-mosaic-next]');
    var hint = root.querySelector('[data-mosaic-hint]');

    function cloneMosaicAssign(src) {
        return { bl: src.bl, tl: src.tl, feat: src.feat, tr: src.tr, br: src.br };
    }

    var history = [cloneMosaicAssign(assignments)];

    function tileHtml(item, isFeat) {
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

    function advanceContour(assign, incoming) {
        return {
            br: incoming,
            tr: assign.br,
            feat: assign.tr,
            bl: assign.feat,
            tl: assign.bl,
        };
    }

    function render() {
        NEWS_MOSAIC_SLOTS.forEach(function (slot) {
            var idx = assignments[slot];
            var item = pool[idx];
            var cell = cells[slot];
            if (!item || !cell) return;
            cell.innerHTML = tileHtml(item, slot === 'feat');
        });
        if (hint) {
            hint.textContent = 'Крок ' + history.length + ' · у пулі ' + pool.length + ' новин';
        }
        if (prevBtn) prevBtn.disabled = history.length <= 1;
        if (nextBtn) nextBtn.disabled = tail >= pool.length;
    }

    function step(dir) {
        if (dir > 0) {
            if (tail >= pool.length) return;
            assignments = advanceContour(assignments, tail);
            tail++;
            history.push(cloneMosaicAssign(assignments));
        } else {
            if (history.length <= 1) return;
            history.pop();
            assignments = cloneMosaicAssign(history[history.length - 1]);
            tail--;
        }
        render();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });

    root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
    });

    render();
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function initDirectionSlider() {
    var root = document.querySelector('[data-dir-slider]');
    if (!root) return;
    var track = root.querySelector('[data-dir-track]');
    var prev = root.querySelector('[data-dir-prev]');
    var next = root.querySelector('[data-dir-next]');
    var bar = root.querySelector('[data-dir-progress]');
    var cards = Array.prototype.slice.call(track.children);
    var index = 0;
    var busy = false;

    function stepSize() {
        var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
        return cards[0].getBoundingClientRect().width + gap;
    }

    function markEdge() {
        cards.forEach(function (card, n) {
            card.classList.toggle('is-edge', n === 0);
        });
    }

    function updateBar() {
        if (!bar) return;
        bar.style.marginLeft = ((index / cards.length) * 100) + '%';
        bar.style.width = ((1 / cards.length) * 100) + '%';
    }

    function release(onDone) {
        var finished = false;
        function finish() {
            if (finished) return;
            finished = true;
            track.removeEventListener('transitionend', onEnd);
            if (onDone) onDone();
            busy = false;
        }
        function onEnd(event) {
            if (event.target !== track) return;
            finish();
        }
        track.addEventListener('transitionend', onEnd);
        window.setTimeout(finish, 500);
    }

    function goNext() {
        if (busy || cards.length < 2) return;
        busy = true;
        var step = stepSize();
        cards[1].classList.add('is-edge');
        cards[0].classList.remove('is-edge');
        track.style.transition = 'transform 0.45s ease';
        track.style.transform = 'translateX(' + (-step) + 'px)';
        release(function () {
            track.style.transition = 'none';
            track.appendChild(cards[0]);
            cards.push(cards.shift());
            track.style.transform = 'translateX(0px)';
            track.offsetHeight;
            track.style.transition = '';
            index = (index + 1) % cards.length;
            markEdge();
            updateBar();
        });
    }

    function goPrev() {
        if (busy || cards.length < 2) return;
        busy = true;
        var step = stepSize();
        var incoming = cards[cards.length - 1];
        track.style.transition = 'none';
        track.insertBefore(incoming, cards[0]);
        cards.unshift(cards.pop());
        track.style.transform = 'translateX(' + (-step) + 'px)';
        track.offsetHeight;
        markEdge();
        track.style.transition = 'transform 0.45s ease';
        track.style.transform = 'translateX(0px)';
        release(function () {
            index = (index - 1 + cards.length) % cards.length;
            markEdge();
            updateBar();
        });
    }

    if (prev) prev.addEventListener('click', goPrev);
    if (next) next.addEventListener('click', goNext);
    markEdge();
    updateBar();
}

function initArchiveFilters() {
    const list = document.querySelector('[data-filter-list]');
    if (!list) return;

    const items = Array.from(list.children);
    const chips = Array.from(document.querySelectorAll('[data-topic-chip]'));
    const search = document.querySelector('[data-archive-search] input');
    const centerSelect = document.querySelector('[data-center-filter]');
    const empty = document.querySelector('[data-empty]');
    const count = document.querySelector('[data-count]');
    const moreBtn = document.querySelector('[data-load-more]');
    const shown = document.querySelector('[data-shown]');
    const params = new URLSearchParams(location.search);

    let topic = params.get('topic') || 'all';
    let center = params.get('center') || 'all';
    let expanded = false;

    if (!chips.some((c) => c.dataset.topicChip === topic)) topic = 'all';
    if (centerSelect) centerSelect.value = center;
    if (centerSelect && centerSelect.value !== center) center = 'all';

    function apply() {
        const q = ((search && search.value) || '').trim().toLowerCase();
        let visible = 0;
        items.forEach((el) => {
            const match = (topic === 'all' || el.dataset.topic === topic)
                && (center === 'all' || el.dataset.center === center)
                && (!q || (el.dataset.search || '').includes(q));
            const deferred = el.hasAttribute('data-more-item') && !expanded && topic === 'all' && center === 'all' && !q;
            el.hidden = !match || deferred;
            if (!el.hidden) visible += 1;
        });
        chips.forEach((c) => c.setAttribute('aria-pressed', c.dataset.topicChip === topic ? 'true' : 'false'));
        if (empty) empty.hidden = visible > 0;
        if (count) count.textContent = visible;
        if (shown) shown.textContent = visible;
        if (moreBtn) {
            const hasDeferred = items.some((el) => el.hasAttribute('data-more-item'));
            moreBtn.closest('.load-more').hidden = !hasDeferred || expanded || topic !== 'all' || center !== 'all' || !!q;
        }
    }

    chips.forEach((chip) => chip.addEventListener('click', () => {
        topic = chip.dataset.topicChip;
        const url = new URL(location.href);
        if (topic === 'all') url.searchParams.delete('topic'); else url.searchParams.set('topic', topic);
        history.replaceState(null, '', url);
        apply();
    }));
    if (search) search.addEventListener('input', apply);
    if (search && search.closest('form')) search.closest('form').addEventListener('submit', function (e) { e.preventDefault(); });
    if (centerSelect) centerSelect.addEventListener('change', function () { center = centerSelect.value; apply(); });
    if (moreBtn) moreBtn.addEventListener('click', function () { expanded = true; apply(); });

    apply();
}

function initNetworkMap() {
    const root = document.querySelector('[data-network]');
    if (!root) return;

    const markers = Array.from(root.querySelectorAll('[data-center-marker]'));
    const items = Array.from(root.querySelectorAll('[data-center-item]'));
    const name = root.querySelector('[data-center-name]');
    const region = root.querySelector('[data-center-region]');

    function select(slug, scroll) {
        markers.forEach((m) => m.classList.toggle('is-active', m.dataset.centerMarker === slug));
        items.forEach((b) => {
            const on = b.dataset.centerItem === slug;
            b.classList.toggle('is-active', on);
            if (on) {
                name.textContent = b.dataset.name;
                region.textContent = b.dataset.region;
                if (scroll) b.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    markers.forEach((m) => m.addEventListener('click', () => select(m.dataset.centerMarker, true)));
    items.forEach((b) => b.addEventListener('click', () => select(b.dataset.centerItem, false)));
}

function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;

    const success = form.querySelector('[data-form-success]');

    function validate(field) {
        const input = field.querySelector('input, textarea, select');
        if (!input || !input.required) return true;
        const ok = input.type === 'checkbox' ? input.checked : input.checkValidity() && input.value.trim() !== '';
        field.classList.toggle('is-invalid', !ok);
        return ok;
    }

    const fields = Array.from(form.querySelectorAll('.form-field'));
    fields.forEach((f) => f.addEventListener('change', () => validate(f)));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ok = fields.map(validate).every(Boolean);
        success.hidden = !ok;
        if (ok) {
            form.reset();
            success.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            var invalid = form.querySelector('.is-invalid input, .is-invalid textarea'); if (invalid) invalid.focus();
        }
    });
}

function initShare() {
    document.querySelectorAll('.share a[href*="="]').forEach((a) => {
        a.href += encodeURIComponent(location.href);
    });
    document.querySelectorAll('[data-copy-link]').forEach((btn) => {
        const label = btn.querySelector('span');
        btn.addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(location.href); } catch (_) { /* clipboard unavailable */ }
            btn.classList.add('is-done');
            label.textContent = 'Скопійовано';
            setTimeout(() => { btn.classList.remove('is-done'); label.textContent = 'Копіювати'; }, 2000);
        });
    });
}

function initLightbox() {
    const box = document.querySelector('[data-lightbox-root]');
    if (!box) return;

    const img = box.querySelector('img');
    const close = () => { box.hidden = true; };

    document.querySelectorAll('[data-lightbox]').forEach((btn) => btn.addEventListener('click', () => {
        img.src = btn.dataset.lightbox;
        var thumb = btn.querySelector('img'); img.alt = thumb ? thumb.alt : '';
        box.hidden = false;
        box.querySelector('.lightbox__close').focus();
    }));
    box.addEventListener('click', (e) => { if (e.target !== img) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

function initSiteSearch() {
    const form = document.querySelector('[data-site-search]');
    const list = document.querySelector('[data-results]');
    if (!form || !list) return;

    const input = form.querySelector('input');
    const summary = document.querySelector('[data-search-summary]');
    const empty = document.querySelector('[data-empty]');
    const results = Array.from(list.querySelectorAll('.result'));
    const originals = results.map((r) => ({
        title: r.querySelector('.result__title a').textContent,
        excerpt: r.querySelector('.result__excerpt').textContent,
    }));
    const q0 = new URLSearchParams(location.search).get('q');
    if (q0 !== null) input.value = q0;

    const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const highlight = (text, words) => {
        let html = escape(text);
        words.forEach((w) => {
            html = html.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\p{L}\\p{N}'’-]*)`, 'giu'), '<mark>$1</mark>');
        });
        return html;
    };

    function run() {
        const q = input.value.trim();
        const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
        let n = 0;
        results.forEach((r, i) => {
            const hay = r.dataset.search;
            const match = words.length > 0 && words.some((w) => hay.includes(w.slice(0, Math.max(3, w.length - 2))));
            r.hidden = !match;
            if (match) n += 1;
            const stems = words.map((w) => w.slice(0, Math.max(3, w.length - 2)));
            r.querySelector('.result__title a').innerHTML = highlight(originals[i].title, stems);
            r.querySelector('.result__excerpt').innerHTML = highlight(originals[i].excerpt, stems);
        });
        const mod10 = n % 10;
        const mod100 = n % 100;
        const noun = mod10 === 1 && mod100 !== 11 ? 'результат'
            : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'результати' : 'результатів';
        summary.innerHTML = q
            ? `За запитом <strong>«${escape(q)}»</strong> знайдено <strong>${n}</strong> ${noun}`
            : 'Введіть запит, щоб побачити результати';
        empty.hidden = n > 0 || !q;
        var pager = document.querySelector('.pagination'); var pagerNav = pager ? pager.closest('nav') : null; if (pagerNav) pagerNav.toggleAttribute('hidden', n === 0);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = new URL(location.href);
        url.searchParams.set('q', input.value.trim());
        history.replaceState(null, '', url);
        run();
    });
    run();
}

function initSubnav() {
    const links = Array.from(document.querySelectorAll('[data-subnav-link]'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((a) => a.classList.remove('is-active'));
            var currentLink = byId.get(entry.target.id); if (currentLink) currentLink.classList.add('is-active');
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    byId.forEach((_, id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });
}

const MENU_EN = {
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

const HEADINGS_EN = {
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

const HOME_PAGE_EN = {
  h1: 'Strong communities — the foundation of a democratic Ukraine',
  lead: 'We promote democracy and capable communities through residents’ self-organization and meaningful civic participation<br>in local affairs.',
};

function initMenuLanguage() {
    const switches = Array.from(document.querySelectorAll('.lang-link'));
    if (!switches.length) return;

    const links = Array.from(document.querySelectorAll('.main-nav a, .footer-sitemap a'))
        .filter((a) => MENU_EN[a.getAttribute('href')]);

    function textTargets(a) {
        const lines = a.querySelectorAll('.nav-label__line');
        if (lines.length) return Array.from(lines);
        const node = Array.from(a.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        return node ? [node] : [];
    }

    links.forEach((a) => {
        a.dataset.labelUk = JSON.stringify(textTargets(a).map((n) => n.textContent.trim()));
    });

    const headings = Array.from(document.querySelectorAll('.breadcrumbs li > a, .breadcrumbs li[aria-current], .page-head h1'))
        .filter((el) => HEADINGS_EN[el.textContent.trim()]);
    headings.forEach((el) => { el.dataset.labelUk = el.textContent.trim(); });

    const homeHead = document.querySelector('.page-head--home');
    const homeH1 = homeHead ? homeHead.querySelector('h1') : null;
    const homeLead = homeHead ? homeHead.querySelector('.page-head__lead') : null;
    var homeUk = null;
    if (homeH1 && homeLead) {
        homeUk = { h1: homeH1.innerHTML, lead: homeLead.innerHTML };
    }

    function apply(lang) {
        links.forEach((a) => {
            const labels = lang === 'en' ? MENU_EN[a.getAttribute('href')] : JSON.parse(a.dataset.labelUk);
            const targets = textTargets(a);
            const caret = a.querySelector('.nav-caret');
            if (targets.length > 1) {
                targets.forEach((n, i) => { n.textContent = labels[i] || ''; });
            } else if (targets[0]) {
                targets[0].textContent = labels.join(' ') + (caret ? ' ' : '');
            }
        });
        headings.forEach((el) => {
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
        switches.forEach((s) => s.classList.toggle('is-active', s.getAttribute('hreflang') === (lang === 'en' ? 'en' : 'uk')));
        localStorage.setItem('acso-menu-lang', lang);
    }

    switches.forEach((s) => s.addEventListener('click', (e) => {
        e.preventDefault();
        apply(s.getAttribute('hreflang') === 'en' ? 'en' : 'uk');
    }));

    if (localStorage.getItem('acso-menu-lang') === 'en') apply('en');
}

// Runs as soon as the script is parsed (it is loaded at the end of <body>); the <head> inline script hides translatable parts until then.
initMenuLanguage();

function initAboutNav() {
    var onAbout = location.pathname.endsWith('about.html') || location.pathname.endsWith('/about');
    var link = document.querySelector('.main-nav a[href="about.html"]');
    if (!link) return;
    if (onAbout) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
}

initAboutNav();
document.documentElement.classList.remove('is-lang-pending');
