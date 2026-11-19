// 2amidea.si: reveals, the "reads one person" panel, the live Calvee demo, filters, the triage queue.
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky bar gets a hairline once the page moves.
  var top = document.querySelector('.top');
  if (top) {
    var onScroll = function () { top.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Reveal on view.
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      seen.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { seen.observe(el); });

  // ---------- The reader: one person in, one next step out ----------
  var READS = {
    aanma: {
      name: 'AANMA', kind: 'clinical model',
      ins: [['Scan', 'Chest X-ray'], ['Age', '70 years'], ['Medicines', 'On blood thinners'], ['Record', 'Allergy noted']],
      outs: [['Urgency', 'Read this case first'], ['Next step', 'More tests or a referral'], ['Alert', 'Blood thinners, allergy'], ['Draft report', 'For the doctor to sign']],
      foot: 'The doctor reviews, edits and <strong>signs</strong>.'
    },
    calvee: {
      name: 'Calvee', kind: 'learning model',
      ins: [['Chapter', 'Class 9 · Motion'], ['Interest', 'Cricket'], ['Last answer', 'Wrong, and sure'], ['Reads best', 'Short sentences']],
      outs: [['Example', 'Running between wickets'], ['Support', 'Every step worked'], ['Practice', 'A new setting each time'], ['Teacher sees', 'Who needs help, and why']],
      foot: 'The teacher <strong>leads</strong> the class.'
    }
  };
  var reader = document.querySelector('[data-reader]');
  if (reader) {
    var tabs = Array.prototype.slice.call(reader.querySelectorAll('[data-read]'));
    var colIn = reader.querySelector('.reader-col.in');
    var colOut = reader.querySelector('.reader-col.out');
    var core = reader.querySelector('.core');
    var wires = reader.querySelector('.reader-wires');
    var foot = reader.querySelector('[data-reader-foot]');
    var bar = reader.querySelector('.reader-bar i');
    var stage = reader.querySelector('.reader-stage');
    var timers = [];
    var current = 'aanma';
    var CYCLE = 7600;
    var clear = function () { timers.forEach(clearTimeout); timers = []; };
    var at = function (ms, fn) { timers.push(setTimeout(fn, reduced ? 0 : ms)); };

    var fill = function (col, title, rows) {
      col.innerHTML = '<h3>' + title + '</h3>' + rows.map(function (r) {
        return '<div class="chip"><b>' + r[0] + '</b>' + r[1] + '</div>';
      }).join('');
      return Array.prototype.slice.call(col.querySelectorAll('.chip'));
    };
    var drawWires = function (inChips, outChips) {
      var box = stage.getBoundingClientRect();
      var c = core.getBoundingClientRect();
      var cx = c.left - box.left + c.width / 2;
      var cy = c.top - box.top + c.height / 2;
      wires.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
      var path = function (x1, y1, x2, y2) {
        var mx = (x1 + x2) / 2;
        return 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2;
      };
      var html = '';
      inChips.forEach(function (ch) {
        var r = ch.getBoundingClientRect();
        html += '<path d="' + path(r.right - box.left, r.top - box.top + r.height / 2, cx - c.width / 2, cy) + '"/>';
      });
      outChips.forEach(function (ch) {
        var r = ch.getBoundingClientRect();
        html += '<path d="' + path(cx + c.width / 2, cy, r.left - box.left, r.top - box.top + r.height / 2) + '"/>';
      });
      wires.innerHTML = html;
      return Array.prototype.slice.call(wires.querySelectorAll('path'));
    };

    var play = function (key) {
      clear();
      current = key;
      var d = READS[key];
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.read === key)); });
      core.innerHTML = d.name + '<small>' + d.kind + '</small>';
      foot.innerHTML = d.foot;
      var ins = fill(colIn, 'Reads', d.ins);
      var outs = fill(colOut, 'Returns', d.outs);
      var paths = drawWires(ins, outs);
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0';
        void bar.offsetWidth;
        bar.style.transition = reduced ? 'none' : 'width ' + CYCLE + 'ms linear';
        bar.style.width = '100%';
      }
      ins.forEach(function (ch, i) { at(250 + i * 380, function () { ch.classList.add('on'); paths[i].classList.add('on'); }); });
      at(250 + ins.length * 380 + 150, function () { core.classList.remove('pulse'); void core.offsetWidth; core.classList.add('pulse'); });
      outs.forEach(function (ch, i) {
        at(250 + ins.length * 380 + 600 + i * 420, function () { ch.classList.add('on'); paths[ins.length + i].classList.add('on'); });
      });
      if (!reduced) at(CYCLE, function () { play(key === 'aanma' ? 'calvee' : 'aanma'); });
    };
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { play(t.dataset.read); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var next = tabs[(tabs.indexOf(t) + 1) % tabs.length];
        next.focus();
        play(next.dataset.read);
      });
    });
    // Start when the panel is on screen; pause the cycle when it leaves.
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) play(current); else clear(); });
    }, { threshold: 0.25 }).observe(reader);
    var redraw;
    window.addEventListener('resize', function () { clearTimeout(redraw); redraw = setTimeout(function () { play(current); }, 200); });
  }

  // ---------- Live Calvee demo: a real lesson scene in an iframe ----------
  document.querySelectorAll('[data-demo]').forEach(function (demo) {
    var frame = demo.querySelector('.demo-frame');
    var poster = frame.querySelector('img');
    var playBtn = frame.querySelector('.demo-play');
    var cap = demo.querySelector('[data-demo-cap]');
    var buttons = Array.prototype.slice.call(demo.querySelectorAll('[data-scene]'));
    var base = demo.dataset.demo;
    var live = false;
    var load = function (btn) {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      if (cap) cap.innerHTML = btn.dataset.cap;
      if (btn.dataset.poster && poster) poster.src = btn.dataset.poster;
      if (!live) return;
      var old = frame.querySelector('iframe');
      if (old) old.remove();
      frame.classList.remove('is-live');
      var f = document.createElement('iframe');
      f.title = 'Calvee lesson scene: ' + btn.textContent.trim();
      f.loading = 'lazy';
      f.allow = 'fullscreen; xr-spatial-tracking';
      f.src = base + btn.dataset.scene;
      f.addEventListener('load', function () { frame.classList.add('is-live'); });
      frame.appendChild(f);
    };
    playBtn.addEventListener('click', function () {
      live = true;
      var on = buttons.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0] || buttons[0];
      load(on);
    });
    buttons.forEach(function (b) { b.addEventListener('click', function () { load(b); }); });
  });

  // ---------- Use-case filters ----------
  document.querySelectorAll('[data-filters]').forEach(function (group) {
    var list = document.querySelector(group.dataset.filters);
    var buttons = Array.prototype.slice.call(group.querySelectorAll('button'));
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        list.querySelectorAll('[data-kind]').forEach(function (item) {
          item.hidden = b.dataset.f !== 'all' && item.dataset.kind !== b.dataset.f;
        });
      });
    });
  });

  // ---------- Triage queue illustration: cases arrive in order, then sort by urgency ----------
  var queue = document.querySelector('[data-queue]');
  if (queue) {
    var list = queue.querySelector('.q-list');
    var items = Array.prototype.slice.call(list.querySelectorAll('.q-item'));
    var status = queue.querySelector('[data-queue-status]');
    var again = queue.querySelector('[data-queue-again]');
    var H = 76;
    var place = function (order) { order.forEach(function (el, i) { el.style.top = i * H + 'px'; }); };
    var arrival = items.slice();
    var byUrgency = items.slice().sort(function (a, b) { return Number(a.dataset.rank) - Number(b.dataset.rank); });
    var t1;
    var run = function () {
      clearTimeout(t1);
      list.classList.remove('sorted');
      place(arrival);
      status.textContent = 'In the order the scans arrived';
      t1 = setTimeout(function () {
        list.classList.add('sorted');
        place(byUrgency);
        status.textContent = 'Sorted by urgency, most serious first';
      }, reduced ? 0 : 1800);
    };
    place(arrival);
    if (again) again.addEventListener('click', run);
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) run(); });
    }, { threshold: 0.4 }).observe(queue);
  }
})();
