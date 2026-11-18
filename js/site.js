/* Marharyta Dolha — portfolio
   Small, dependency-free behaviour for the static pages:
   1. "IE · 14:32" clock in the header (Cork / Dublin time)
   2. Swipe carousels with dots and auto-advance (MealCraft settings screenshots)
   3. Click-through competitor carousels (MealCraft)
   4. Tabs for the redesigned screens (MealCraft)
   5. Videos only play while they are on screen (saves battery and data)
*/
(function () {
  'use strict';

  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  /* 1. Cork time */
  function corkTime() {
    try {
      return new Intl.DateTimeFormat('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Dublin' }).format(new Date());
    } catch (e) {
      return '';
    }
  }
  function updateTime() {
    var t = corkTime();
    document.querySelectorAll('[data-cork-time]').forEach(function (el) { el.textContent = t; });
  }
  updateTime();
  setInterval(updateTime, 30000);

  /* 2. Swipe carousels: auto-advance every 5 s, pause on hover,
        wait 5 s after a manual move, never move with reduced motion. */
  document.querySelectorAll('[data-car]').forEach(function (track) {
    var key = track.getAttribute('data-car');
    var total = track.children.length;
    var counter = document.querySelector('[data-car-counter="' + key + '"]');
    var prev = document.querySelector('[data-car-prev="' + key + '"]');
    var next = document.querySelector('[data-car-next="' + key + '"]');
    var dots = document.querySelectorAll('[data-car-dot="' + key + '"]');
    var slide = 0;
    var lastMove = Date.now();
    var paused = false;
    var inView = true;

    function step() {
      var first = track.children[0];
      var gap = parseFloat(getComputedStyle(track).columnGap) || 24;
      return first ? first.getBoundingClientRect().width + gap : track.clientWidth;
    }
    function render() {
      if (counter) counter.textContent = (slide + 1) + ' / ' + total;
      if (prev) prev.style.opacity = slide === 0 ? '0.35' : '1';
      if (next) next.style.opacity = slide === total - 1 ? '0.35' : '1';
      dots.forEach(function (d, i) {
        d.style.width = i === slide ? '24px' : '8px';
        d.style.background = i === slide ? '#111111' : '#C9C5BC';
      });
    }
    function goTo(i) {
      slide = i;
      track.scrollTo({ left: i * step(), behavior: 'smooth' });
      lastMove = Date.now();
      render();
    }

    if (prev) prev.addEventListener('click', function () { goTo(Math.max(0, slide - 1)); });
    if (next) next.addEventListener('click', function () { goTo(Math.min(total - 1, slide + 1)); });
    track.addEventListener('scroll', function () {
      var i = Math.max(0, Math.min(total - 1, Math.round(track.scrollLeft / step())));
      if (i !== slide) { slide = i; render(); }
    }, { passive: true });
    track.addEventListener('mouseenter', function () { paused = true; });
    track.addEventListener('mouseleave', function () { paused = false; lastMove = Date.now(); });
    ['touchstart', 'wheel', 'keydown'].forEach(function (ev) {
      track.addEventListener(ev, function () { lastMove = Date.now(); }, { passive: true });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) lastMove = Date.now();
      }, { threshold: 0.3 }).observe(track);
    }
    setInterval(function () {
      if (paused || !inView || document.hidden) return;
      if (reduceMotion && reduceMotion.matches) return;
      if (Date.now() - lastMove < 5000) return;
      goTo((slide + 1) % total);
    }, 1000);
    render();
  });

  /* 3. Click-through carousels (one screen visible at a time) */
  var groups = {};
  document.querySelectorAll('[data-comp]').forEach(function (el) {
    var k = el.getAttribute('data-comp');
    (groups[k] = groups[k] || []).push(el);
  });
  Object.keys(groups).forEach(function (k) {
    var els = groups[k];
    var count = 0;
    els.forEach(function (e) { count = Math.max(count, +e.getAttribute('data-i') + 1); });
    var cur = 0;
    var counter = document.querySelector('[data-comp-counter="' + k + '"]');
    var prev = document.querySelector('[data-comp-prev="' + k + '"]');
    var next = document.querySelector('[data-comp-next="' + k + '"]');
    function render() {
      els.forEach(function (e) {
        var on = +e.getAttribute('data-i') === cur;
        e.style.display = on ? 'block' : 'none';
        if (e.tagName === 'VIDEO') {
          if (on && !(reduceMotion && reduceMotion.matches)) { var p = e.play && e.play(); if (p && p.catch) p.catch(function () {}); }
          else if (!on && e.pause) { e.pause(); }
        }
      });
      if (counter) counter.textContent = (cur + 1) + ' / ' + count;
      if (prev) prev.style.opacity = cur === 0 ? '0.35' : '1';
      if (next) next.style.opacity = cur === count - 1 ? '0.35' : '1';
    }
    if (prev) prev.addEventListener('click', function () { if (cur > 0) { cur--; render(); } });
    if (next) next.addEventListener('click', function () { if (cur < count - 1) { cur++; render(); } });
    render();
  });

  /* 4. Tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"][data-tab]'));
  function pick(k, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === k;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      t.style.borderBottomColor = on ? '#111111' : 'transparent';
      t.style.color = on ? '#111111' : '#5E5E5E';
      if (on && focus) t.focus();
    });
    document.querySelectorAll('[data-panel]').forEach(function (p) {
      p.style.display = p.getAttribute('data-panel') === k ? 'grid' : 'none';
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t.getAttribute('data-tab')); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      pick(n.getAttribute('data-tab'), true);
    });
  });
  if (tabs.length) pick(tabs[0].getAttribute('data-tab'));

  /* 5. Play videos only while visible; no autoplay with "reduce motion" */
  if (reduceMotion && reduceMotion.matches) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); if (v.pause) v.pause(); });
  }
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && v.offsetParent !== null && !(reduceMotion && reduceMotion.matches)) {
          var p = v.play && v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (v.pause) {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('video[autoplay]').forEach(function (v) { vio.observe(v); });
  }
})();
