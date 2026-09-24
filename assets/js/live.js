/* Delice Bakery — shows changes published in the admin panel.
   The pages are built from assets/data/site.json and are complete on their own. When the admin panel
   has something newer, this script redraws only the spots that changed (menus, prices, holiday cards,
   galleries, hours, announcement). It also shows the panel's preview, and test mode on a computer.
   If the panel can't be reached, the page simply keeps what it has. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var LOCAL = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var CACHE_KEY = "delice-live-v1";
  var TEST_KEY = "delice-admin-test-v1";
  var PREVIEW_KEY = "delice-preview";
  var CFG = (window.DeliceSite && window.DeliceSite.config()) || {};
  var baked = Number(doc.getAttribute("data-v")) || 0;
  var base = adminBase();

  function adminBase() {
    var raw = String(CFG.admin || "").trim();
    if (!raw) return "";
    try {
      var u = new URL(raw);
      return u.protocol === "https:" || (u.protocol === "http:" && /^(localhost|127\.0\.0\.1)$/.test(u.hostname)) ? u.origin : "";
    } catch (e) { return ""; }
  }
  function read(store, key) { try { var v = store.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function write(store, key, value) { try { store.setItem(key, JSON.stringify(value)); } catch (e) { /* full or blocked */ } }
  function looksValid(d) { return d && typeof d === "object" && Array.isArray(d.sections) && d.hours && d.info; }

  function loadRenderer() {
    if (window.DeliceRender) return Promise.resolve(window.DeliceRender);
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      var me = document.querySelector('script[src*="assets/js/live.js"]');
      s.src = me ? me.getAttribute("src").replace("live.js", "render.js") : "assets/js/render.js";
      s.onload = function () { resolve(window.DeliceRender); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* Photo addresses: uploaded photos come from the admin panel (or this browser in test mode);
     photos already copied into the website use their file (only used to spot what changed). */
  function uploadTypes(R, d) {
    var t = {};
    R.eachPhoto(d, function (p) { if (/^upload:/.test(String(p.src))) t[p.src.slice(7)] = p.t || "webp"; });
    return t;
  }
  var testUrls = {};
  function ctxFor(R, d, mode) {
    var types = uploadTypes(R, d);
    var today = window.DeliceSite ? window.DeliceSite.today() : R.laToday();
    return {
      baked: { today: today, upload: function (id, v) { return "assets/img/u/" + id + (v === "m" ? "-m" : "") + "." + (types[id] || "webp"); } },
      live: { today: today, upload: function (id, v) {
        if (mode === "test") return testUrls[id + ":" + (v === "m" ? "m" : "full")] || "";
        return base ? base + "/img/" + id + (v === "m" ? "?v=m" : "") : "";
      } }
    };
  }
  function bakedHash(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 8) { var m = /^slot:[^#]*#([a-z0-9]+)$/.exec(n.nodeValue); return m ? m[1] : ""; }
      if (n.nodeType === 1) break;
    }
    return "";
  }

  function swapInfo(oldI, newI) {
    if (!oldI || !newI) return;
    var pairs = [];
    var digits = function (s) { return String(s || "").replace(/\D/g, "").slice(-10); };
    if (newI.phone && oldI.phone !== newI.phone) pairs.push([oldI.phone, newI.phone]);
    if (newI.email && oldI.email !== newI.email) pairs.push([oldI.email, newI.email]);
    if (!pairs.length && (!newI.orderUrl || oldI.orderUrl === newI.orderUrl)) return;
    document.querySelectorAll("a[href]").forEach(function (a) {
      var h = a.getAttribute("href");
      if (/^tel:/.test(h) && newI.phone && oldI.phone !== newI.phone && digits(h) === digits(oldI.phone)) a.setAttribute("href", "tel:+1" + digits(newI.phone));
      else if (/^mailto:/.test(h)) pairs.forEach(function (p) { h = h.split(p[0]).join(p[1]); }), a.setAttribute("href", h);
      else if (newI.orderUrl && h === oldI.orderUrl) a.setAttribute("href", newI.orderUrl);
    });
    if (!pairs.length) return;
    var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walk.nextNode())) {
      var v = n.nodeValue, w = v;
      pairs.forEach(function (p) { if (w.indexOf(p[0]) > -1) w = w.split(p[0]).join(p[1]); });
      if (w !== v) n.nodeValue = w;
    }
  }

  var shownVersion = 0;
  function apply(R, d, mode, version) {
    if (!looksValid(d)) return false;
    var c = ctxFor(R, d, mode);
    var changed = [];
    document.querySelectorAll("[data-slot]").forEach(function (el) {
      var id = el.getAttribute("data-slot");
      var asBaked = R.renderSlot(id, d, c.baked);
      if (asBaked == null) return;
      var h = R.hash(asBaked);
      if (h === bakedHash(el)) return;
      var html = R.renderSlot(id, d, c.live);
      el.innerHTML = "<!--slot:" + id + "#" + h + "-->" + html + "<!--/slot:" + id + "-->";
      changed.push(el);
    });
    document.querySelectorAll("[data-show]").forEach(function (el) {
      el.hidden = !R.showState(el.getAttribute("data-show"), d);
    });
    swapInfo(CFG.info, d.info);
    CFG.info = { phone: d.info.phone, email: d.info.email, orderUrl: d.info.orderUrl };
    if (window.DeliceSite) {
      window.DeliceSite.setHours(R.hoursConfig(d));
      changed.forEach(function (el) { window.DeliceSite.refresh(el); });
      window.DeliceSite.refresh(document);
    }
    shownVersion = version || shownVersion;
    doc.setAttribute("data-live", mode);
    if (version) doc.setAttribute("data-live-v", String(version));
    return true;
  }

  /* ---- preview of unpublished changes (opened from the admin panel) ---- */
  function previewToken() {
    var m = /[?&]preview=([A-Za-z0-9_-]{8,80})/.exec(location.search);
    if (m) { try { sessionStorage.setItem(PREVIEW_KEY, m[1]); } catch (e) { /* ignore */ } return m[1]; }
    try { return sessionStorage.getItem(PREVIEW_KEY) || ""; } catch (e) { return ""; }
  }
  function previewBar(text) {
    var bar = document.createElement("div");
    bar.className = "preview-bar";
    bar.setAttribute("role", "status");
    bar.innerHTML = "<span><strong>Preview</strong> · " + text + '</span><button type="button">Exit preview</button>';
    bar.querySelector("button").addEventListener("click", function () {
      try { sessionStorage.removeItem(PREVIEW_KEY); } catch (e) { /* ignore */ }
      location.href = location.pathname + location.hash;
    });
    document.body.appendChild(bar);
    doc.classList.add("is-preview");
  }
  function loadTestPhotos(R, d) {
    var ids = R.uploadIds(d);
    if (!ids.length || !window.indexedDB) return Promise.resolve();
    return new Promise(function (resolve) {
      var req;
      try { req = indexedDB.open("delice-admin-test", 1); } catch (e) { resolve(); return; }
      req.onupgradeneeded = function () { req.result.createObjectStore("images"); };
      req.onerror = function () { resolve(); };
      req.onsuccess = function () {
        var db = req.result, left = ids.length;
        var done = function () { if (--left <= 0) { db.close(); resolve(); } };
        try {
          var st = db.transaction("images", "readonly").objectStore("images");
          ids.forEach(function (id) {
            var g = st.get(id);
            g.onsuccess = function () {
              var rec = g.result;
              if (rec && rec.full) {
                testUrls[id + ":full"] = URL.createObjectURL(rec.full);
                testUrls[id + ":m"] = URL.createObjectURL(rec.m || rec.full);
              }
              done();
            };
            g.onerror = done;
          });
        } catch (e) { db.close(); resolve(); }
      };
    });
  }

  function fetchJson(url, ms) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms || 4000);
    return fetch(url, { mode: "cors", credentials: "omit", cache: "no-cache", signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error("status " + r.status); return r.json(); },
        function (e) { clearTimeout(timer); throw e; });
  }

  function start() {
    var token = previewToken();
    if (token === "local") {
      var p = read(localStorage, "delice-admin-preview");
      if (p && looksValid(p.doc)) {
        return loadRenderer().then(function (R) {
          return loadTestPhotos(R, p.doc).then(function () { apply(R, p.doc, "test", 0); previewBar("these changes are only in the admin panel’s test mode."); });
        });
      }
    } else if (token && base) {
      return Promise.all([loadRenderer(), fetchJson(base + "/api/preview/" + token, 8000)]).then(function (r) {
        if (r[1] && looksValid(r[1].doc)) { apply(r[0], r[1].doc, "preview", 0); previewBar("these changes aren’t on the website yet."); }
        else previewBar("this preview has ended. Make a new one from the admin panel.");
      }).catch(function () { previewBar("the preview couldn’t be loaded. Make a new one from the admin panel."); });
    }
    if (LOCAL) {
      var t = read(localStorage, TEST_KEY);
      if (t && t.doc && t.preview !== false && t.version > 0) {
        return loadRenderer().then(function (R) { return loadTestPhotos(R, t.doc).then(function () { apply(R, t.doc, "test", t.version); }); });
      }
    }
    if (!base) return null;
    var cached = read(localStorage, CACHE_KEY);
    var usable = cached && cached.base === base && cached.version > baked && looksValid(cached.doc);
    var have = Math.max(baked, usable ? cached.version : 0);
    // Show what this browser already knows right away, then ask the panel (a tiny answer when nothing changed).
    var fromCache = usable ? loadRenderer().then(function (R) { apply(R, cached.doc, "live", cached.version); }) : Promise.resolve();
    return fromCache.then(function () { return fetchJson(base + "/api/public?v=" + have); }).then(function (data) {
      if (!data || !data.version) return;
      if (data.same || data.version <= baked) {
        if (usable) write(localStorage, CACHE_KEY, { base: base, at: Date.now(), version: cached.version, doc: cached.doc });
        return;
      }
      if (!looksValid(data.doc)) return;
      write(localStorage, CACHE_KEY, { base: base, at: Date.now(), version: data.version, doc: data.doc });
      if (data.version === shownVersion) return;
      return loadRenderer().then(function (R) { apply(R, data.doc, "live", data.version); });
    }).catch(function () { /* keep what the page has */ });
  }

  function go() { try { Promise.resolve(start()).catch(function () {}); } catch (e) { /* keep the page as is */ } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
