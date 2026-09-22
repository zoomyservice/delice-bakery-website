/* Delice Bakery — site scripts (no dependencies) */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");
  var CFG = window.DELICE || {};

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var hb = document.querySelector(".site-header").getBoundingClientRect().bottom;
      document.documentElement.style.setProperty("--nav-top", Math.max(0, hb) + "px");
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  document.querySelectorAll(".nav .has-sub > .nav-link").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var li = btn.parentElement;
      var isOpen = li.classList.contains("open");
      document.querySelectorAll(".nav .has-sub.open").forEach(function (o) { if (o !== li) { o.classList.remove("open"); o.firstElementChild.setAttribute("aria-expanded", "false"); } });
      li.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      e.stopPropagation();
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav")) document.querySelectorAll(".nav .has-sub.open").forEach(function (o) { if (window.innerWidth > 1240) o.classList.remove("open"); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".nav .has-sub.open").forEach(function (o) { o.classList.remove("open"); });
      if (document.body.classList.contains("nav-open")) { document.body.classList.remove("nav-open"); if (toggle) toggle.setAttribute("aria-expanded", "false"); }
    }
  });

  /* ---------- open / closed status ---------- */
  var HOURS = CFG.hours || { 0: ["07:00", "17:30"], 1: ["07:00", "17:30"], 2: ["07:00", "17:30"], 3: ["07:00", "17:30"], 4: ["07:00", "17:30"], 5: ["06:30", "16:00"], 6: null };
  function laNow() {
    try {
      var s = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
      return new Date(s);
    } catch (e) { return new Date(); }
  }
  function toMin(t) { var p = t.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fmt(t) { var m = toMin(t), h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return h + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + " " + ap; }
  var now = laNow(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
  var today = HOURS[day];
  var status = "Closed today", open = false;
  if (today) {
    if (mins >= toMin(today[0]) && mins < toMin(today[1])) { open = true; status = "Open now · until " + fmt(today[1]); }
    else if (mins < toMin(today[0])) status = "Opens today at " + fmt(today[0]);
    else status = "Closed now";
  } else status = "Closed today (Shabbat)";
  document.querySelectorAll("[data-status]").forEach(function (el) {
    el.textContent = status;
    var dot = el.parentElement.querySelector(".dot"); if (dot && open) dot.classList.add("open");
  });
  document.querySelectorAll(".hours tr[data-day]").forEach(function (tr) {
    if (tr.getAttribute("data-day").split(",").indexOf(String(day)) > -1) tr.classList.add("today");
  });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- lightbox ---------- */
  var lb, lbImg, lbCount, group = [], idx = 0;
  function buildLb() {
    lb = document.createElement("div");
    lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML = '<img alt="">' +
      '<button class="lb-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-prev" aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="lb-next" aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<div class="lb-count" aria-live="polite"></div>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector("img"); lbCount = lb.querySelector(".lb-count");
    lb.querySelector(".lb-close").onclick = closeLb;
    lb.querySelector(".lb-prev").onclick = function () { show(idx - 1); };
    lb.querySelector(".lb-next").onclick = function () { show(idx + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); sx = null; });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }
  var lastFocus = null;
  function show(i) {
    if (!group.length) return;
    idx = (i + group.length) % group.length;
    var el = group[idx];
    lbImg.src = el.getAttribute("data-full");
    lbImg.alt = el.getAttribute("data-alt") || "";
    lbCount.textContent = group.length > 1 ? (idx + 1) + " / " + group.length : "";
    lb.querySelector(".lb-prev").style.display = lb.querySelector(".lb-next").style.display = group.length > 1 ? "" : "none";
  }
  function openLb(el) {
    if (!lb) buildLb();
    var g = el.getAttribute("data-group");
    group = g ? Array.prototype.slice.call(document.querySelectorAll('[data-full][data-group="' + g + '"]')) : [el];
    lastFocus = el;
    lb.classList.add("open"); document.body.style.overflow = "hidden";
    show(group.indexOf(el));
    lb.querySelector(".lb-close").focus();
  }
  function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; lbImg.src = ""; if (lastFocus) lastFocus.focus(); }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-full]");
    if (el) { e.preventDefault(); openLb(el); }
  });

  /* ---------- videos: play when visible, pause when not ---------- */
  var vids = document.querySelectorAll("video[data-auto]");
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (v.preload === "none") v.preload = "auto";
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) v.pause();
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { vio.observe(v); });
  }
  document.querySelectorAll(".vid .sound").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.parentElement.querySelector("video");
      v.muted = !v.muted;
      b.setAttribute("aria-label", v.muted ? "Turn sound on" : "Turn sound off");
      b.innerHTML = v.muted ? SVG_MUTED : SVG_SOUND;
      if (v.paused) v.play();
    });
  });
  var SVG_MUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/></svg>';
  var SVG_SOUND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/></svg>';

  /* ---------- reveal on scroll ---------- */
  var rev = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && rev.length) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (r) { rio.observe(r); });
  } else rev.forEach(function (r) { r.classList.add("in"); });

  /* ---------- forms ---------- */
  var F = CFG.forms || { provider: "mailto", to: "delicebakery26@gmail.com" };
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector(".form-msg");
      var hp = form.querySelector(".hp input"); if (hp && hp.value) return;
      var required = form.querySelectorAll("[required]"), bad = null;
      required.forEach(function (f) { if (!bad && !f.value.trim()) bad = f; });
      var email = form.querySelector('input[type="email"]');
      if (!bad && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad = email;
      if (bad) { if (msg) { msg.className = "form-msg err"; msg.textContent = "Please fill in " + (bad.getAttribute("data-label") || "this field") + "."; } bad.focus(); return; }
      var data = {}; new FormData(form).forEach(function (v, k) { if (k !== "bot-field") data[k] = v; });
      var subject = form.getAttribute("data-subject") || "Website message";
      if (F.provider === "formspree" && F.endpoint) {
        data._subject = subject;
        fetch(F.endpoint, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw 0; form.reset(); if (msg) { msg.className = "form-msg ok"; msg.textContent = form.getAttribute("data-ok") || "Thanks! We received your message."; } })
          .catch(function () { mailto(subject, data, msg); });
      } else mailto(subject, data, msg);
    });
  });
  function mailto(subject, data, msg) {
    var body = Object.keys(data).map(function (k) { return k.charAt(0).toUpperCase() + k.slice(1) + ": " + data[k]; }).join("\n");
    window.location.href = "mailto:" + (F.to || "delicebakery26@gmail.com") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    if (msg) { msg.className = "form-msg ok"; msg.textContent = "Your email app should open with your message ready to send."; }
  }
})();
