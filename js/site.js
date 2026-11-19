/* ==========================================================================
   CONTACT FORM ENDPOINT  ← paste the Formspree URL here
   1. Create a form at https://formspree.io (target email: marharytadolha@gmail.com)
   2. Copy its endpoint, it looks like https://formspree.io/f/abcdwxyz
   3. Replace the value below, save, commit and redeploy.
   Until then the form shows its error message (with the email address).
   ========================================================================== */
var FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';


/* Marharyta Dolha — portfolio
   Small, dependency-free behaviour for the static pages:
   1. "IE · 14:32" clock in the header (Cork / Dublin time)
   2. Swipe carousels with dots and auto-advance (MealCraft settings screenshots)
   3. Click-through competitor carousels (MealCraft)
   4. Tabs for the redesigned screens (MealCraft)
   5. Videos only play while they are on screen (saves battery and data)
   6. "More about me" panel on Home
   7. Gentle fade-up of sections as they scroll into view
   8. Copy-email button and the contact form
*/
(function () {
  'use strict';

  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function rm() { return !!(reduceMotion && reduceMotion.matches); }
  function isArrow(e) { return e.key === 'ArrowLeft' || e.key === 'ArrowRight'; }

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

  function setDisabled(btn, off) {
    if (!btn) return;
    btn.style.opacity = off ? '0.35' : '1';
    btn.setAttribute('aria-disabled', off ? 'true' : 'false');
  }

  /* 2. Swipe carousels: auto-advance every 5 s, pause on hover,
        wait 5 s after a manual move, never move with reduced motion.
        ← and → move it while it has focus. */
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
      setDisabled(prev, slide === 0);
      setDisabled(next, slide === total - 1);
      dots.forEach(function (d, i) {
        d.style.width = i === slide ? '24px' : '8px';
        d.style.background = i === slide ? '#1B1915' : '#C9C5BC';
      });
    }
    function goTo(i) {
      slide = i;
      track.scrollTo({ left: i * step(), behavior: rm() ? 'auto' : 'smooth' });
      lastMove = Date.now();
      render();
    }

    if (prev) prev.addEventListener('click', function () { goTo(Math.max(0, slide - 1)); });
    if (next) next.addEventListener('click', function () { goTo(Math.min(total - 1, slide + 1)); });
    track.addEventListener('keydown', function (e) {
      if (!isArrow(e)) return;
      e.preventDefault();
      goTo(e.key === 'ArrowRight' ? Math.min(total - 1, slide + 1) : Math.max(0, slide - 1));
    });
    track.addEventListener('scroll', function () {
      var i = Math.max(0, Math.min(total - 1, Math.round(track.scrollLeft / step())));
      if (i !== slide) { slide = i; render(); }
    }, { passive: true });
    track.addEventListener('mouseenter', function () { paused = true; });
    track.addEventListener('mouseleave', function () { paused = false; lastMove = Date.now(); });
    ['touchstart', 'wheel', 'keydown', 'focusin'].forEach(function (ev) {
      track.addEventListener(ev, function () { lastMove = Date.now(); }, { passive: true });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) lastMove = Date.now();
      }, { threshold: 0.3 }).observe(track);
    }
    setInterval(function () {
      if (paused || !inView || document.hidden || rm()) return;
      if (track.contains(document.activeElement)) return;
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
          if (on && !rm()) { var p = e.play && e.play(); if (p && p.catch) p.catch(function () {}); }
          else if (!on && e.pause) { e.pause(); }
        }
      });
      if (counter) counter.textContent = (cur + 1) + ' / ' + count;
      setDisabled(prev, cur === 0);
      setDisabled(next, cur === count - 1);
    }
    function move(d) {
      var n = Math.max(0, Math.min(count - 1, cur + d));
      if (n !== cur) { cur = n; render(); }
    }
    if (prev) prev.addEventListener('click', function () { move(-1); });
    if (next) next.addEventListener('click', function () { move(1); });
    var group = prev && prev.closest('[role="group"]');
    if (group) {
      group.addEventListener('keydown', function (e) {
        if (!isArrow(e)) return;
        e.preventDefault();
        move(e.key === 'ArrowRight' ? 1 : -1);
      });
    }
    render();
  });

  /* 4. Tabs (colours come from css/site.css via aria-selected) */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"][data-tab]'));
  function pick(k, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === k;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) {
        t.focus();
        if (t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    });
    document.querySelectorAll('[data-panel]').forEach(function (p) {
      p.style.display = p.getAttribute('data-panel') === k ? 'grid' : 'none';
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t.getAttribute('data-tab')); });
    t.addEventListener('keydown', function (e) {
      if (!isArrow(e)) return;
      e.preventDefault();
      var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      pick(n.getAttribute('data-tab'), true);
    });
  });
  if (tabs.length) pick(tabs[0].getAttribute('data-tab'));

  /* 5. Play videos only while visible; no autoplay with "reduce motion" */
  if (rm()) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); if (v.pause) v.pause(); });
  }
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && v.offsetParent !== null && !rm()) {
          var p = v.play && v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (v.pause) {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('video[autoplay]').forEach(function (v) { vio.observe(v); });
  }

  /* 6. "More about me": the intro slides left and the About panel slides in.
        Opens on click, swipe left, or #about in the URL; closes with Back,
        swipe right or Esc. The hidden panel is inert. */
  var intro = document.querySelector('[data-intro]');
  if (intro) {
    var viewport = intro.querySelector('.intro-viewport');
    var track = intro.querySelector('.intro-track');
    var mainPanel = document.getElementById('intro-main');
    var aboutPanel = document.getElementById('about');
    var aboutTitle = document.getElementById('about-title');
    var opener = intro.querySelector('[data-about-open]');
    var isOpen = false;
    var DURATION = 500;

    var syncHeight = function () {
      viewport.style.height = (isOpen ? aboutPanel : mainPanel).offsetHeight + 'px';
    };
    var cleanUrl = function () { return location.pathname + location.search; };
    var scrollToIntro = function () {
      var top = intro.getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: window.pageYOffset + top, behavior: rm() ? 'auto' : 'smooth' });
    };

    var setOpen = function (open, opts) {
      opts = opts || {};
      if (open === isOpen) return;
      isOpen = open;
      var instant = opts.instant || rm();
      if (instant) intro.classList.add('no-anim');
      track.classList.toggle('is-open', open);
      mainPanel.inert = open;
      aboutPanel.inert = !open;
      if (opener) opener.setAttribute('aria-expanded', open ? 'true' : 'false');
      syncHeight();
      viewport.scrollLeft = 0;
      if (instant) { void track.offsetWidth; intro.classList.remove('no-anim'); }
      if (opts.focus !== false) {
        if (open) { aboutTitle.focus({ preventScroll: true }); scrollToIntro(); }
        else if (opener) { opener.focus({ preventScroll: true }); }
      }
      if (history.replaceState && !opts.keepUrl) {
        history.replaceState(null, '', open ? '#about' : cleanUrl());
      }
    };

    aboutPanel.inert = true;
    syncHeight();
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(syncHeight);
      ro.observe(mainPanel);
      ro.observe(aboutPanel);
    } else {
      window.addEventListener('resize', syncHeight);
    }
    viewport.addEventListener('scroll', function () { viewport.scrollLeft = 0; });

    // "More about me" and every link to #about on this page (e.g. the nav)
    document.querySelectorAll('a[href="#about"], a[href="index.html#about"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (isOpen) { aboutTitle.focus({ preventScroll: true }); scrollToIntro(); }
        else setOpen(true);
      });
    });
    intro.querySelector('[data-about-close]').addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) setOpen(false);
    });

    // "case studies" and "Should we talk?": close the panel, then scroll there
    intro.querySelectorAll('[data-about-goto]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        setOpen(false, { focus: false, keepUrl: true });
        setTimeout(function () {
          target.scrollIntoView({ behavior: rm() ? 'auto' : 'smooth', block: 'start' });
          target.focus({ preventScroll: true });
          if (history.replaceState) history.replaceState(null, '', a.getAttribute('href'));
        }, rm() ? 0 : DURATION);
      });
    });

    // swipe: left opens, right goes back
    var sx = null, sy = 0;
    viewport.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { sx = null; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx, dy = t.clientY - sy;
      sx = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (e.target.closest && e.target.closest('video, input, textarea')) return;
      setOpen(dx < 0, { focus: false });
    }, { passive: true });

    // open straight away for index.html#about
    var fromHash = function () { if (location.hash === '#about') setOpen(true, { instant: true }); };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  /* 7. Fade sections, figures and cards up as they first scroll into view.
        The hidden state is only added here, so without JS everything shows. */
  if (!rm() && 'IntersectionObserver' in window) {
    var revealSel = '#main section, #main figure, #main article, #main [style*="box-shadow: 0 12px 32px"]';
    var skip = '.intro, [data-car], [data-panel], .comp';
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        rio.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll(revealSel).forEach(function (el) {
      if (el.matches(skip) || el.closest(skip)) return;
      if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen
      el.classList.add('reveal');
      rio.observe(el);
    });
  }

  /* 8a. Copy the email address */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) resolve(); else reject();
    });
  }
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.querySelector('[data-copy-label]');
    var status = btn.parentNode.querySelector('[data-copy-status]');
    var timer;
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-copy')).then(function () {
        label.textContent = 'Copied';
        if (status) status.textContent = 'Copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          label.textContent = 'Copy';
          if (status) status.textContent = '';
        }, 2000);
      }, function () {
        if (status) status.textContent = 'Could not copy. The address is marharytadolha@gmail.com';
      });
    });
  });

  /* 8b. Contact form → Formspree */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var submit = form.querySelector('[data-submit]');
    var formError = form.querySelector('[data-form-error]');
    var success = document.querySelector('[data-form-success]');
    var checks = {
      name: function (v) { return v ? '' : 'Please enter your name.'; },
      email: function (v, el) {
        if (!v) return 'Please enter your email address.';
        return el.validity && el.validity.typeMismatch ? 'Please enter a valid email address, like name@example.com.' : '';
      },
      message: function (v) { return v ? '' : 'Please write a message.'; }
    };
    var showError = function (el, msg) {
      var box = document.getElementById(el.id + '-error');
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      box.textContent = msg;
      box.hidden = !msg;
    };
    var validate = function (el) {
      var msg = checks[el.name](el.value.trim(), el);
      showError(el, msg);
      return !msg;
    };
    var fields = Object.keys(checks).map(function (n) { return form.elements[n]; });
    fields.forEach(function (el) {
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
      el.addEventListener('blur', function () { if (el.value.trim()) validate(el); });
    });

    var setSending = function (on) {
      submit.disabled = on;
      submit.textContent = on ? 'Sending…' : 'Send message';
    };
    var done = function () {
      form.hidden = true;
      success.hidden = false;
      success.focus();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (el) { if (!validate(el) && !firstBad) firstBad = el; });
      if (firstBad) { firstBad.focus(); return; }
      formError.hidden = true;
      if (form.elements._gotcha && form.elements._gotcha.value) { done(); return; } // bot
      setSending(true);
      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        done();
      }).catch(function () {
        setSending(false);
        formError.hidden = false;
      });
    });
  }
})();
