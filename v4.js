// 2amidea.si v4: ribbon hero, reveals, scroll-lit lists, Calvee demo, triage queue, typed API sample, waitlist.
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Waitlist notifications: FormSubmit emails each entry to NOTIFY.to, with NOTIFY.cc in copy.
  // After FormSubmit's one-time activation, NOTIFY.to can be swapped for the random alias it sends.
  var NOTIFY = { to: 'create@the2amidea.com', cc: 'nayana@the2amidea.com,solomon@the2amidea.com' };
  // Optional storage in the Webtree Lead System. Leave formKey empty to skip.
  var LEADS = { url: 'https://nltsfzpxyomupobuuqut.supabase.co', apikey: 'sb_publishable_cEwcKS4kjWCFH7uAYP63aQ_7XFAa1to', formKey: '' };

  // ---------- Header ----------
  var top = $('.top');
  var onScroll = function () { if (top) top.classList.toggle('stuck', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------- Reveal ----------
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach(function (el) { io.observe(el); });

  // ---------- Ribbon hero: one twisting silk band made of fine strands (Nebius-like) ----------
  var cv = $('.ribbon');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, t0 = performance.now(), mx = 0, my = 0, tmx = 0, tmy = 0, run = true, raf;
    var size = function () {
      var d = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    size(); window.addEventListener('resize', size);
    window.addEventListener('pointermove', function (e) { tmx = e.clientX / W - .5; tmy = e.clientY / H - .5; }, { passive: true });
    var mixc = function (c1, c2, k, a) { return 'rgba(' + Math.round(c1[0] + (c2[0] - c1[0]) * k) + ',' + Math.round(c1[1] + (c2[1] - c1[1]) * k) + ',' + Math.round(c1[2] + (c2[2] - c1[2]) * k) + ',' + a.toFixed(3) + ')'; };
    // o: {y0, y1 (centre line from left to right, as a share of H), amp, half, turns, speed, phase, front, back, light, alpha, strands}
    var ribbon = function (t, o) {
      var step = 5, n = Math.ceil((W + 200) / step) + 1, xs = [], yc = [], hw = [], fc = [];
      for (var i = 0; i < n; i++) {
        var x = -100 + i * step, p = x / W;
        var th = p * o.turns * Math.PI + t * o.speed + o.phase + mx * .6;
        xs.push(x);
        yc.push(H * (o.y0 + (o.y1 - o.y0) * p) + Math.sin(p * 2.6 + t * .18 + o.phase) * H * o.amp + my * 30 * Math.sin(p * 3.2));
        hw.push(o.half * Math.cos(th)); fc.push(Math.cos(th));
      }
      // Surface: thin quads, lit by how much each slice faces the viewer.
      for (i = 0; i < n - 1; i++) {
        var f = fc[i], lit = Math.abs(f), col = f >= 0 ? o.front : o.back;
        ctx.fillStyle = mixc(col, o.light, Math.pow(lit, 3) * .7, o.alpha * (.55 + .45 * lit));
        ctx.beginPath();
        ctx.moveTo(xs[i], yc[i] - hw[i]); ctx.lineTo(xs[i + 1] + .6, yc[i + 1] - hw[i + 1]);
        ctx.lineTo(xs[i + 1] + .6, yc[i + 1] + hw[i + 1]); ctx.lineTo(xs[i], yc[i] + hw[i]); ctx.closePath(); ctx.fill();
      }
      // Soft version: no strands (sharp texture removed on request).
      if (!o.strands) return;
      ctx.lineWidth = .7;
      for (var j = 0; j <= o.strands; j++) {
        var s = -1 + 2 * j / o.strands;
        ctx.strokeStyle = j % 2 ? 'rgba(255,255,255,' + (.16 * o.alpha) + ')' : 'rgba(5,43,66,' + (.06 * o.alpha) + ')';
        ctx.beginPath();
        for (i = 0; i < n; i += 2) { var y = yc[i] + hw[i] * s; i ? ctx.lineTo(xs[i], y) : ctx.moveTo(xs[i], y); }
        ctx.stroke();
      }
    };
    var frame = function (now) {
      var t = reduced ? 3 : (now - t0) / 1000;
      mx += (tmx - mx) * .04; my += (tmy - my) * .04;
      ctx.clearRect(0, 0, W, H);
      var big = Math.min(H * .2, 190);
      ribbon(t, { y0: .78, y1: .3, amp: .05, half: big * .55, turns: 1.6, speed: .16, phase: 2.4, front: [97, 78, 250], back: [150, 140, 255], light: [224, 228, 255], alpha: .38, strands: 0 });
      ribbon(t, { y0: .72, y1: .26, amp: .07, half: big, turns: 2.2, speed: .2, phase: 0, front: [176, 214, 40], back: [205, 240, 70], light: [246, 255, 204], alpha: .75, strands: 0 });
      if (!reduced && run) raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(function (es) { run = es[0].isIntersecting; if (run) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } }).observe(cv);
    raf = requestAnimationFrame(frame);
  }

  // ---------- Count-up numbers (decimals and Indian grouping kept) ----------
  $$('[data-count]').forEach(function (el) {
    var raw = el.getAttribute('data-count'), end = +raw, dec = (raw.split('.')[1] || '').length, fmt = el.getAttribute('data-fmt');
    var show = function (v) { el.textContent = fmt === 'in' ? Math.round(v).toLocaleString('en-IN') : v.toFixed(dec); };
    if (reduced || end < 2) return;
    new IntersectionObserver(function (es, ob) {
      if (!es[0].isIntersecting) return; ob.disconnect();
      var t0 = performance.now(), d = 1400;
      (function tick(now) { var k = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - k, 3); show(Math.max(end * e, dec ? 0.1 : 1)); if (k < 1) requestAnimationFrame(tick); else show(end); })(t0);
    }, { threshold: .6 }).observe(el);
  });

  // ---------- Scroll-lit lists (home shifts, AANMA walk-through) ----------
  var lit = $$('[data-shift], [data-step]');
  if (lit.length) {
    var walk = $('.walk');
    var light = function () {
      var mid = window.innerHeight * .55;
      lit.forEach(function (el) { var r = el.getBoundingClientRect(); el.classList.toggle('on', r.top < mid); });
      if (walk) {
        var r = walk.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
        walk.style.setProperty('--p', (p * 100).toFixed(1) + '%');
      }
    };
    window.addEventListener('scroll', light, { passive: true }); window.addEventListener('resize', light); light();
  }

  // ---------- Hero shot tilt ----------
  $$('.tilt').forEach(function (el) {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = 'perspective(1200px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  // ---------- Typed API sample ----------
  $$('pre[data-type]').forEach(function (pre) {
    if (reduced) return;
    var html = pre.innerHTML; pre.innerHTML = ''; var done = false;
    new IntersectionObserver(function (es, ob) {
      if (!es[0].isIntersecting || done) return; done = true; ob.disconnect();
      var tmp = document.createElement('div'); tmp.innerHTML = html;
      var text = tmp.textContent, i = 0;
      var tick = function () { i += 3; pre.textContent = text.slice(0, i); if (i < text.length) setTimeout(tick, 16); else pre.innerHTML = html; };
      tick();
    }, { threshold: .4 }).observe(pre);
  });

  // ---------- Live Calvee demo ----------
  $$('[data-demo]').forEach(function (demo) {
    var frame = $('.demo-frame', demo), cap = $('[data-demo-cap]', demo), btns = $$('[data-scene]', demo), base = demo.dataset.demo, live = false;
    var load = function (b) {
      btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      if (cap) cap.innerHTML = b.dataset.cap;
      if (!live) return;
      var old = $('iframe', frame); if (old) old.remove();
      frame.classList.remove('live');
      var f = document.createElement('iframe');
      f.title = 'Calvee lesson scene: ' + b.textContent.trim(); f.allow = 'fullscreen; xr-spatial-tracking'; f.src = base + b.dataset.scene;
      f.addEventListener('load', function () { frame.classList.add('live'); });
      frame.appendChild(f);
    };
    $('.demo-play', frame).addEventListener('click', function () { live = true; load(btns.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0] || btns[0]); });
    btns.forEach(function (b) { b.addEventListener('click', function () { load(b); }); });
  });

  // ---------- Triage queue ----------
  var queue = $('[data-queue]');
  if (queue) {
    var list = $('.q-list', queue), items = $$('.q-item', list), qs = $('[data-queue-status]', queue), QH = 76, t1;
    var place = function (o) { o.forEach(function (el, i) { el.style.top = i * QH + 'px'; }); };
    var byU = items.slice().sort(function (a, b) { return a.dataset.rank - b.dataset.rank; });
    var go = function () {
      clearTimeout(t1); list.classList.remove('sorted'); place(items); qs.textContent = 'In the order the scans arrived';
      t1 = setTimeout(function () { list.classList.add('sorted'); place(byU); qs.textContent = 'Sorted by urgency, most serious first'; }, reduced ? 0 : 1600);
    };
    place(items);
    $('[data-queue-again]', queue).addEventListener('click', go);
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) go(); }, { threshold: .4 }).observe(queue);
  }

  // ---------- Waitlist ----------
  var form = $('#waitlist-form');
  if (form) {
    var status = $('.wl-status', form), done = $('.wl-done', form);
    var val = function (n) { var el = form.elements[n]; if (!el) return ''; if (el.length && !el.tagName) { for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value; return ''; } return (el.value || '').trim(); };
    var state = function (s, m) { form.setAttribute('data-state', s); status.textContent = m || ''; };
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (val('company')) return;
      var need = ['name', 'email', 'location', 'facility_details'], bad = [];
      $$('.f', form).forEach(function (f) { f.classList.remove('bad'); });
      need.forEach(function (n) { if (!val(n)) bad.push(n); });
      if (val('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) bad.push('email');
      if (bad.length) {
        bad.forEach(function (n) { form.elements[n].closest('.f').classList.add('bad'); });
        form.elements[bad[0]].focus();
        state('error', bad.indexOf('email') > -1 && val('email') ? 'Please check the email address.' : 'Please fill in the fields marked *.');
        return;
      }
      state('sending', 'Sending…');
      var q = new URLSearchParams(location.search), utm = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { utm[k] = q.get(k) || ''; });
      var fields = { website: val('website_url'), location: val('location'), facility_details: val('facility_details'), interest: val('interest'), landing_url: location.href };
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 120000);
      var mail = fetch('https://formsubmit.co/ajax/' + NOTIFY.to, {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal: ctrl ? ctrl.signal : undefined,
        body: JSON.stringify({
          _subject: '2i waitlist: ' + val('name'), _cc: NOTIFY.cc, _template: 'table', _replyto: val('email'),
          Institute: val('name'), Email: val('email'), Website: fields.website, Location: fields.location,
          'Interested in': fields.interest, 'Current facility details': fields.facility_details,
          Page: fields.landing_url, Source: [utm.utm_source, utm.utm_campaign].filter(Boolean).join(' / ')
        })
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || ('notify ' + r.status));
      }); });
      if (LEADS.formKey) {
        fetch(LEADS.url + '/rest/v1/rpc/submit_lead', {
          method: 'POST', headers: { 'Content-Type': 'application/json', apikey: LEADS.apikey },
          body: JSON.stringify({ p_key: LEADS.formKey, p_lead: Object.assign({}, utm, { name: val('name'), email: val('email'), phone: '', message: fields.facility_details, company: '', form: 'waitlist', page_url: location.href, referrer: document.referrer, click_ids: {}, fields: fields }) })
        }).catch(function () {});
      }
      // The mail service can take up to a minute. The request keeps going in the background (keepalive),
      // so the visitor sees the thank-you after 8 s unless the service has already refused the entry.
      var shown = false;
      var thank = function () { if (shown) return; shown = true; state('success'); $('p', done).textContent = 'Thank you. We will write to you at ' + val('email') + '.'; done.hidden = false; };
      var wait = setTimeout(thank, 8000);
      mail.then(function () { clearTimeout(timer); clearTimeout(wait); thank(); }).catch(function () {
        clearTimeout(timer); clearTimeout(wait);
        if (!shown) state('error', 'This did not send. Please check your connection and try again.');
      });
    });
  }
})();

/* v6: Models dropdown + mobile menu */
(function () {
  var top = document.querySelector('.top');
  var mb = document.querySelector('.menu-btn');
  if (mb) mb.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    mb.setAttribute('aria-expanded', String(open));
    mb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  Array.prototype.forEach.call(document.querySelectorAll('.dd'), function (dd) {
    var b = dd.querySelector('.dd-btn');
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dd.classList.toggle('open');
      b.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function () { dd.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); });
    dd.addEventListener('keydown', function (e) { if (e.key === 'Escape') { dd.classList.remove('open'); b.focus(); } });
  });
})();
