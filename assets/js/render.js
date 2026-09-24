/* Delice Bakery — shared renderer.
   Draws every editable part of the website (menus, prices, holiday cards, galleries, hours, announcement)
   from one data document. The same file is used by the website (live changes), the build/bake scripts
   (static pages), the admin panel (preview and checks) and the server (cleaning what gets saved). */
(function (root, factory) {
  var R = factory();
  if (typeof module === "object" && module.exports) module.exports = R;
  else root.DeliceRender = R;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var DAY3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTH3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* Pages of the website, in menu order (used by the admin panel to group things). */
  var PAGES = [
    ["index", "Home page"],
    ["rosh-hashanah", "Rosh Hashanah & High Holidays"], ["hanukah", "Hanukkah"], ["purim", "Purim"],
    ["pesach", "Passover (Pesach)"], ["chavouot", "Shavuot"], ["thanksgiving", "Thanksgiving"],
    ["cake-1", "Cakes & tarts"], ["tart", "Fruit tarts"], ["macaron", "French macarons"],
    ["croissant", "Croissants & pastries"], ["challah", "Challah"], ["bread-1", "Artisan bread"],
    ["menu", "Café menu"], ["drink", "Coffee & drinks"],
    ["custom-cake", "Wedding cakes"], ["wedding-galerie", "Wedding gallery"], ["pieces-montee", "Croquembouche"],
    ["dipping-cake", "Dipping & printed cakes"], ["birthday-cake", "Letter & number cakes"],
    ["birthday-cake-1", "Birthday & bar/bat mitzvah cakes"], ["custom-cake-1", "All custom cakes"],
    ["tower", "Macaron & meringue towers"], ["custom-cake-tips", "Custom cake tips"],
    ["food-platers", "Food platters"], ["pastry-plateres", "Pastry platters"]
  ];
  var HOLIDAY_PAGES = ["rosh-hashanah", "hanukah", "purim", "pesach", "chavouot", "thanksgiving"];

  /* What each kind of list can hold. The admin panel builds its item editor from this. */
  var KINDS = {
    cards: { label: "Product cards", fields: ["name", "desc", "prices", "photos", "tags", "note"], many: true },
    promos: { label: "Holiday cards", fields: ["kicker", "name", "desc", "prices", "photos", "ribbon"], many: true },
    boxes: { label: "Gift boxes", fields: ["kicker", "name", "desc", "pills", "prices", "photos"], many: true },
    spotlight: { label: "Spotlight", fields: ["kicker", "name", "prices", "photos", "ribbon"], many: true },
    menu: { label: "Café menu", fields: ["name", "desc", "prices", "photo", "extra"], many: true },
    table: { label: "Order list", fields: ["name", "opts", "size", "prices"], many: true },
    drinks: { label: "Drinks board", fields: ["name", "prices", "pills"], many: true },
    feature: { label: "Featured item", fields: ["name", "prices", "pills", "note"], many: false },
    flavors: { label: "Flavors", fields: ["name", "photo"], many: true }
  };
  var LIMITS = {
    name: 90, desc: 600, kicker: 40, ribbon: 30, note: 160, extra: 160, opts: 200, size: 60, label: 40,
    price: 40, tag: 24, pill: 120, alt: 160, prices: 12, photos: 12, tags: 5, pills: 20,
    items: 150, groups: 20, sections: 60, galleries: 40, galleryItems: 400, special: 120, cards: 8,
    announcement: 220, linkText: 40, url: 300
  };
  var TAG_PRESETS = ["Dairy", "Pareve", "New", "Best seller", "Gluten free"];

  /* ------------------------------------------------------------------ small helpers */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isObj(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function str(v) { return v == null ? "" : String(v); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function slugify(s) {
    return str(s).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";
  }
  function hash(s) { // FNV-1a, 32 bit
    var h = 0x811c9dc5;
    s = str(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }

  /* Today's date at the bakery (Los Angeles), as YYYY-MM-DD. */
  function laToday(d) {
    try {
      return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(d || new Date());
    } catch (e) { return (d || new Date()).toISOString().slice(0, 10); }
  }
  function addDays(iso, n) {
    var p = iso.split("-").map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
    return d.toISOString().slice(0, 10);
  }
  function weekday(iso) { var p = iso.split("-").map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); }
  function fmtDate(iso, long) {
    var p = iso.split("-").map(Number);
    return (long ? DAY[weekday(iso)] : DAY3[weekday(iso)]) + ", " + MONTH3[p[1] - 1] + " " + p[2];
  }
  function validDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str(s));
    if (!m) return false;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] && +m[1] >= 2020 && +m[1] <= 2100;
  }
  function validTime(s) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(str(s)); }
  function fmtTime(t, short) { // "07:00" -> "7:00 am" (or "7 am" when short)
    var p = t.split(":").map(Number), h = p[0], m = p[1], ap = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return (short && !m ? String(h) : h + ":" + (m < 10 ? "0" : "") + m) + " " + ap;
  }

  /* Prices are kept as they are shown ("$29", "$4.50", "$2.40 – $2.99", "12 lb (3 to 4 feet)").
     Typed amounts are tidied: 4.5 -> $4.50, 29 -> $29, .80 -> $0.80, "2.40-2.99" -> "$2.40 – $2.99". */
  var AMOUNT = /^\$?\s*(\d{0,6})(?:\.(\d{1,2}))?$/;
  function normAmount(s) {
    var m = AMOUNT.exec(s);
    if (!m || (!m[1] && !m[2])) return null;
    var dollars = String(Number(m[1] || "0"));
    return "$" + dollars + (m[2] != null ? "." + (m[2] + "0").slice(0, 2) : "");
  }
  function normPrice(v) {
    var s = str(v).replace(/\s+/g, " ").trim();
    if (!s) return "";
    var a = normAmount(s.replace(/,/g, ""));
    if (a) return a;
    var r = /^(.+?)\s*[-–—]\s*(.+)$/.exec(s);
    if (r) {
      var x = normAmount(r[1].replace(/,/g, "")), y = normAmount(r[2].replace(/,/g, ""));
      if (x && y) return x + " – " + y;
    }
    return s;
  }
  function isMoney(p) { return /^\$\d+(\.\d\d)?$/.test(str(p)); }
  function priceValue(p) { var m = /\$?(\d+(?:\.\d+)?)/.exec(str(p)); return m ? Number(m[1]) : null; }
  function fmtMoney(n, keepCents) {
    var c = Math.round(n * 100);
    if (!keepCents && c % 100 === 0) return "$" + c / 100;
    return "$" + (c / 100).toFixed(2);
  }
  function bare(p) { // board style: "$2.25" -> "2.25", "$0.80" -> ".80"
    var s = str(p);
    if (!isMoney(s)) return s;
    return s.replace(/^\$0\./, ".").replace(/^\$/, "");
  }
  function priceText(prices, sep) {
    prices = arr(prices);
    if (prices.length === 1 && !prices[0].label) return str(prices[0].price);
    return prices.map(function (p) { return (p.label ? p.label + " " : "") + p.price; }).join(sep || " · ");
  }

  /* ------------------------------------------------------------------ sold out / hidden */
  function isSoldOut(it, today) {
    if (!it || !it.soldOut) return false;
    return !it.soldOutUntil || (today || laToday()) < it.soldOutUntil;
  }
  function visible(it) { return !!it && !it.hidden; }
  function soAttr(it, today) {
    return isSoldOut(it, today) && it.soldOutUntil ? ' data-so-until="' + esc(it.soldOutUntil) + '"' : "";
  }
  function soBadge(it, today, cls) {
    if (!isSoldOut(it, today)) return "";
    return '<span class="' + (cls || "so") + '"' + soAttr(it, today) + ">Sold out</span>";
  }

  /* ------------------------------------------------------------------ data lookups */
  function sections(doc) { return arr(doc && doc.sections); }
  function findSection(doc, id) {
    var s = sections(doc);
    for (var i = 0; i < s.length; i++) if (s[i].id === id) return s[i];
    return null;
  }
  function itemsOf(sec) {
    if (!sec) return [];
    if (Array.isArray(sec.groups)) return [].concat.apply([], sec.groups.map(function (g) { return arr(g.items); }));
    return arr(sec.items);
  }
  function findItem(doc, ref) {
    var p = str(ref).split("/");
    var sec = findSection(doc, p[0]);
    if (!sec) return null;
    var list = itemsOf(sec);
    for (var i = 0; i < list.length; i++) if (list[i].id === p[1]) return { sec: sec, item: list[i] };
    return null;
  }
  function eachItem(doc, fn) {
    sections(doc).forEach(function (sec) {
      if (Array.isArray(sec.groups)) sec.groups.forEach(function (g) { arr(g.items).forEach(function (it, i) { fn(it, sec, g, i); }); });
      else arr(sec.items).forEach(function (it, i) { fn(it, sec, null, i); });
    });
  }
  function eachPhoto(doc, fn) {
    eachItem(doc, function (it) { arr(it.photos).forEach(fn); });
    arr(doc && doc.galleries).forEach(function (g) { arr(g.items).forEach(function (x) { if (x && x.src) fn(x); }); });
    if (doc && doc.home && doc.home.banner && doc.home.banner.img) fn(doc.home.banner.img);
  }
  function uploadIds(doc) {
    var ids = {};
    eachPhoto(doc, function (p) { if (/^upload:/.test(str(p.src))) ids[p.src.slice(7)] = 1; });
    return Object.keys(ids);
  }
  function pageLabel(slug) {
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i][0] === slug) return PAGES[i][1];
    return slug;
  }

  /* ------------------------------------------------------------------ media */
  function imgUrls(ref, ctx) {
    var src = str(ref && ref.src);
    if (/^upload:/.test(src)) {
      var id = src.slice(7);
      var up = (ctx && ctx.upload) || function () { return ""; };
      return { full: up(id, "full"), med: up(id, "m") };
    }
    var base = (ctx && ctx.assetBase) || "";
    return { full: base + "assets/img/" + src + ".webp", med: base + "assets/img/" + src + "-m.webp" };
  }
  function zoomAttrs(ref, group, alt, ctx) {
    return 'data-full="' + esc(imgUrls(ref, ctx).full) + '" data-group="' + esc(group) + '" data-alt="' + esc(alt) + '"';
  }
  /* <img> with a responsive srcset (and a zoom button for the lightbox when o.zoom is set). */
  function img(ref, o, ctx) {
    o = o || {};
    var u = imgUrls(ref, ctx);
    var w = Number(ref.w) || 800, h = Number(ref.h) || 800;
    var mw = w >= h ? Math.min(800, w) : Math.round(w * Math.min(1, 800 / h));
    var alt = o.alt != null ? o.alt : "";
    var tag = '<img src="' + esc(u.med) + '" srcset="' + esc(u.med) + " " + mw + "w, " + esc(u.full) + " " + w + 'w" sizes="' + esc(o.sizes || "(max-width: 700px) 100vw, 50vw") +
      '" width="' + w + '" height="' + h + '" alt="' + esc(alt) + '"' + (o.eager ? "" : ' loading="lazy"') + ' decoding="async"' +
      (o.cls ? ' class="' + esc(o.cls) + '"' : "") + (o.attrs ? " " + o.attrs : "") + ">";
    if (o.zoom) {
      return '<button type="button" class="zoom" ' + zoomAttrs(ref, o.zoom, alt, ctx) + ' aria-label="Enlarge photo: ' + esc(alt) + '">' + tag + "</button>";
    }
    return tag;
  }
  function video(v, o, ctx) {
    o = o || {};
    var base = (ctx && ctx.assetBase) || "";
    var style = o.ratio ? ' style="aspect-ratio:' + esc(o.ratio) + '"' : (v.w && v.h ? ' style="aspect-ratio:' + v.w + "/" + v.h + '"' : "");
    return '<div class="vid' + (o.cls ? " " + esc(o.cls) : "") + '"' + style + '><video muted loop playsinline data-auto preload="none"' +
      (v.poster ? ' poster="' + base + "assets/img/" + esc(v.poster) + '-m.webp"' : "") + ' aria-label="' + esc(v.label || "Video from Delice Bakery") + '">' +
      '<source src="' + base + "assets/video/" + esc(v.video) + '.mp4" type="video/mp4"></video></div>';
  }
  function photoAlt(ph, it) { return ph && ph.alt ? ph.alt : it.name + " — Delice Bakery"; }
  function extraPhotos(it, group, ctx) {
    return arr(it.photos).slice(1).map(function (ph) {
      return "<span hidden " + zoomAttrs(ph, group, photoAlt(ph, it), ctx) + "></span>";
    }).join("");
  }

  /* ------------------------------------------------------------------ building blocks */
  function priceList(prices, cls) {
    prices = arr(prices);
    if (!prices.length) return "";
    return '<ul class="' + (cls || "prices") + '">' + prices.map(function (p) {
      return '<li><span class="lbl">' + esc(p.label) + '</span><span class="fill"></span><span class="amt">' + esc(p.price) + "</span></li>";
    }).join("") + "</ul>";
  }
  function isSingle(prices) { prices = arr(prices); return prices.length === 1 && !prices[0].label; }
  var ORN = '<div class="orn" aria-hidden="true"><svg viewBox="0 0 46 14" fill="none" stroke="currentColor" stroke-width="1.2">' +
    '<circle cx="23" cy="7" r="3"/><path d="M4 7h10M32 7h10"/><circle cx="16.5" cy="7" r="1.4" fill="currentColor"/>' +
    '<circle cx="29.5" cy="7" r="1.4" fill="currentColor"/></svg></div>';

  function mailto(doc, subject) {
    var email = str(doc.info && doc.info.email);
    return "mailto:" + email + "?subject=" + encodeURIComponent(subject || "Order");
  }

  /* ---------- product card ---------- */
  function card(it, sec, ctx, today) {
    var group = sec.id + "-" + it.id;
    var photos = arr(it.photos);
    var media = "";
    if (photos.length) {
      var first = photos[0];
      var cut = sec.cover ? false : !!first.cut;
      var more = "";
      if (photos.length > 1) {
        var n = photos.length - 1;
        more = '<button type="button" class="more" ' + zoomAttrs(photos[1], group, photoAlt(photos[1], it), ctx) + ">+" + n + " photo" + (n > 1 ? "s" : "") + "</button>" +
          extraPhotos(it, group, ctx);
      }
      media = '<div class="media ' + (cut ? "cutout" : "cover") + '">' +
        img(first, { alt: photoAlt(first, it), sizes: "(max-width: 560px) 100vw, (max-width: 860px) 50vw, 33vw", zoom: group }, ctx) + more + "</div>";
    }
    var tags = soBadge(it, today, "tag so") + arr(it.tags).map(function (t) {
      return '<span class="tag ' + esc(str(t).toLowerCase()) + '">' + esc(t) + "</span>";
    }).join("");
    var body = "<h3>" + esc(it.name) + "</h3>";
    if (it.desc) body += '<p class="desc">' + esc(it.desc) + "</p>";
    if (isSingle(it.prices)) body += '<div class="price-single">' + esc(it.prices[0].price) + "</div>";
    else body += priceList(it.prices);
    if (it.note) body += '<p class="sizes-note">' + esc(it.note) + "</p>";
    return '<article class="card reveal' + (isSoldOut(it, today) ? " is-soldout" : "") + '"' + soAttr(it, today) + ">" + media +
      '<div class="body">' + tags + body + "</div></article>";
  }

  /* ---------- holiday card (home page and holiday pages) ---------- */
  var PROMO_SIZES = "(max-width: 560px) 100vw, (max-width: 860px) 50vw, 25vw";
  function promo(it, sec, ctx, today, kicker) {
    var group = sec.id + "-" + it.id;
    var photos = arr(it.photos);
    var first = photos[0];
    var media = first ? img(first, { alt: photoAlt(first, it), sizes: PROMO_SIZES, zoom: group }, ctx) + extraPhotos(it, group, ctx) : "";
    var rib = it.ribbon ? '<span class="ribbon">' + esc(it.ribbon) + "</span>" : "";
    var k = it.kicker || kicker || pageLabel(sec.page);
    return '<article class="promo hcard reveal' + (isSoldOut(it, today) ? " is-soldout" : "") + '"' + soAttr(it, today) + ">" +
      '<div class="promo-media">' + media + rib + "</div>" +
      '<div class="promo-head"><span class="kicker">' + esc(k) + "</span><h3>" + esc(it.name) + "</h3>" + soBadge(it, today) + "</div>" +
      '<p class="promo-desc">' + esc(it.desc || "") + "</p>" +
      '<div class="promo-prices">' + priceList(it.prices) + "</div></article>";
  }

  /* ---------- gift boxes (Purim) ---------- */
  function box(it, sec, ctx, today, i) {
    var group = sec.id + "-" + it.id;
    var photos = arr(it.photos);
    var first = photos[0];
    var seal = isSingle(it.prices) ? '<span class="seal"><span><small>ONLY</small>' + esc(it.prices[0].price) + "</span></span>" : "";
    var media = first ? img(first, { alt: photoAlt(first, it), sizes: "(max-width: 860px) 100vw, 50vw", zoom: group }, ctx) : "";
    var body = '<span class="kicker">' + esc(it.kicker || "") + "</span><h3>" + esc(it.name) + "</h3>" + soBadge(it, today);
    if (!seal) body += priceList(it.prices);
    if (it.desc) body += '<p class="box-desc">' + esc(it.desc) + "</p>";
    if (arr(it.pills).length) body += '<ul class="pill-list">' + it.pills.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>";
    return '<article class="promo ' + (i % 2 ? "ivory" : "noir") + ' reveal' + (isSoldOut(it, today) ? " is-soldout" : "") + '"' + soAttr(it, today) + ">" +
      '<div class="promo-media">' + media + seal + "</div>" + extraPhotos(it, group, ctx) +
      '<div class="promo-body">' + body + "</div></article>";
  }

  /* ---------- spotlight card (Shavuot "new" cheesecake) ---------- */
  function spotlight(it, sec, ctx, today) {
    var group = sec.id + "-" + it.id;
    var first = arr(it.photos)[0];
    var media = first ? img(first, { alt: photoAlt(first, it), sizes: "(max-width: 860px) 100vw, 45vw", zoom: group }, ctx) + extraPhotos(it, group, ctx) : "";
    var rib = it.ribbon ? '<span class="ribbon">' + esc(it.ribbon) + "</span>" : "";
    return '<article class="promo ivory spotlight reveal' + (isSoldOut(it, today) ? " is-soldout" : "") + '"' + soAttr(it, today) + ">" +
      '<div class="promo-media">' + media + rib + "</div>" +
      '<div class="promo-body"><span class="kicker">' + esc(it.kicker || "") + "</span><h3>" + esc(it.name) + "</h3>" +
      '<div class="big-price">' + esc(priceText(it.prices)) + "</div>" + soBadge(it, today) + "</div></article>";
  }

  /* ---------- café menu ---------- */
  function menuItem(it, ctx, today) {
    var ph = arr(it.photos)[0];
    var im = "";
    if (ph) {
      var alt = ph.alt || it.name;
      im = '<button type="button" class="mi-img" ' + zoomAttrs(ph, "menu", alt, ctx) + ' aria-label="Enlarge photo: ' + esc(alt) + '">' +
        img(ph, { alt: alt, sizes: "120px" }, ctx) + "</button>";
    }
    return '<div class="menu-item' + (ph ? "" : " noimg") + (isSoldOut(it, today) ? " is-soldout" : "") + '"' + soAttr(it, today) + ">" + im +
      '<div><div class="mi-head"><h3>' + esc(it.name) + '</h3><span class="fill"></span><span class="mi-price">' + esc(priceText(it.prices)) + "</span></div>" +
      soBadge(it, today) + (it.desc ? "<p>" + esc(it.desc) + "</p>" : "") + (it.extra ? '<p class="add">' + esc(it.extra) + "</p>" : "") + "</div></div>";
  }
  function menuBody(sec, ctx, today) {
    var groups = arr(sec.groups).map(function (g) { return { g: g, items: arr(g.items).filter(visible) }; })
      .filter(function (x) { return x.items.length; });
    var nav = groups.map(function (x) { return '<a href="#' + esc(x.g.id) + '">' + esc(x.g.title) + "</a>"; }).join("");
    var secs = groups.map(function (x) {
      return '<section class="menu-sec anchor" id="' + esc(x.g.id) + '"><h2>' + esc(x.g.title) + '</h2><div class="menu-cols">' +
        x.items.map(function (it) { return menuItem(it, ctx, today); }).join("") + "</div></section>";
    }).join("");
    return '<nav class="menu-nav" aria-label="Menu sections"><div class="wrap">' + nav + '</div></nav><div class="wrap" style="padding-bottom:80px">' + secs + "</div>";
  }

  /* ---------- Passover order list ---------- */
  function tableRow(it, today) {
    var so = isSoldOut(it, today);
    return "<tr" + (so ? ' class="is-soldout"' + soAttr(it, today) : "") + "><td>" + esc(it.name) + (it.opts ? '<div class="opt">' + esc(it.opts) + "</div>" : "") +
      soBadge(it, today) + '</td><td class="sz">' + esc(it.size || "") + '</td><td class="p">' + esc(priceText(it.prices)) + "</td></tr>";
  }

  /* ---------- coffee & drinks boards ---------- */
  function drinks(sec, ctx, today) {
    var G = {};
    arr(sec.groups).forEach(function (g) { G[g.id] = g; });
    var vis = function (g) { return g ? arr(g.items).filter(visible) : []; };
    var cell = function (p, isBare) { return esc(isBare ? bare(p) : p); };
    var head = function (cols) { return "<thead><tr><th></th>" + cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead>"; };
    var rows = function (g, isBare) {
      var cols = arr(g.cols);
      return vis(g).map(function (it) {
        var ps = arr(it.prices);
        return "<tr><td>" + esc(it.name) + soBadge(it, today) + "</td>" +
          cols.map(function (c, i) { return "<td>" + cell(ps[i] ? ps[i].price : "", isBare) + "</td>"; }).join("") + "</tr>";
      }).join("");
    };
    var table = function (g, style, isBare, noHead) {
      if (!g || !vis(g).length) return "";
      return "<table" + (style ? ' style="' + style + '"' : "") + ">" + (noHead ? "" : head(arr(g.cols))) + "<tbody>" + rows(g, isBare) + "</tbody></table>";
    };
    var sub = function (g) { return g && vis(g).length ? '<h3 class="sub-h">' + esc(g.title) + "</h3>" + table(g, "", true, true) : ""; };
    var bg = function (name) { return '<div class="board-bg" style="background-image:url(\'' + ((ctx && ctx.assetBase) || "") + "assets/img/" + name + '.webp\')"></div>'; };
    var one = function (g) { var v = vis(g); return v[0] || null; };

    var b1 = table(G.coffee, "", true) + table(G.espresso, "margin-top:14px", true) + table(G.tea, "margin-top:14px", true) + sub(G.customize) + sub(G.flavor);
    var out = '<div class="board reveal">' + bg("board-beans") + "<h3>" + esc(G.coffee ? G.coffee.title : "Espresso & coffee") + "</h3>" + b1 + "</div>";
    var bl = one(G.blended), sh = one(G.shakes);
    var right = "";
    if (bl) {
      right += '<div class="board reveal">' + bg("board-beans") + "<h3>" + esc(G.blended.title) + '</h3><p class="note">' + esc(priceText(bl.prices)) + "</p>" + soBadge(bl, today) +
        '<ul class="flavors">' + arr(bl.pills).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>";
    }
    var juice = G.juice && vis(G.juice).length ? '<h3 class="sub-h">' + esc(G.juice.title) + "</h3>" + table(G.juice, "", false) : "";
    if (sh || juice) {
      right += '<div class="board reveal">' + bg("board-oj") +
        (sh ? "<h3>" + esc(G.shakes.title) + '</h3><p class="note">' + esc(priceText(sh.prices)) + "</p>" + soBadge(sh, today) +
          "<table><tbody>" + arr(sh.pills).map(function (p) {
            var m = /^(.*?)\s+[—–-]\s+(.*)$/.exec(p);
            return "<tr><td>" + (m ? "<strong>" + esc(m[1]) + "</strong> — " + esc(m[2]) : "<strong>" + esc(p) + "</strong>") + "</td></tr>";
          }).join("") + "</tbody></table>" : "") + juice + "</div>";
    }
    return out + '<div style="display:grid;gap:clamp(16px,2.4vw,28px)">' + right + "</div>";
  }

  /* ---------- macaron flavors ---------- */
  function flavor(it, ctx, today) {
    var ph = arr(it.photos)[0];
    return '<div class="flavor reveal' + (isSoldOut(it, today) ? " is-soldout" : "") + '"' + soAttr(it, today) + '><div class="media">' +
      (ph ? img(ph, { alt: ph.alt || it.name + " French macaron", sizes: "(max-width: 560px) 50vw, 25vw", zoom: "flavors" }, ctx) : "") +
      "</div><h3>" + esc(it.name) + "</h3>" + soBadge(it, today) + "</div>";
  }

  /* ---------- photo galleries ---------- */
  function galleryBody(g, ctx) {
    return arr(g.items).filter(visible).map(function (x) {
      if (x.video) return "<figure>" + video(x, null, ctx) + "</figure>";
      return "<figure>" + img(x, { alt: x.alt || g.altBase || "", sizes: "(max-width: 600px) 50vw, 33vw", zoom: g.id }, ctx) + "</figure>";
    }).join("");
  }

  /* ---------- home page holiday section ---------- */
  function homeSection(doc, ctx, today) {
    var h = doc.home || {};
    if (!h.show) return "";
    var cards = arr(h.cards).map(function (ref) { return findItem(doc, ref); })
      .filter(function (x) { return x && visible(x.item); });
    var page = str(h.page || "rosh-hashanah");
    var b = h.banner || {};
    var subject = h.orderSubject || "Holiday order";
    var banner = "";
    if (b.show) {
      banner = '<div class="holiday-banner reveal"><div class="hb-grid">' +
        '<div class="hb-art">' + (b.img ? img(b.img, { alt: "", sizes: "(max-width: 760px) 100vw, 45vw" }, ctx) : "") + "</div>" +
        '<div class="hb-text">' +
        (b.line1 ? '<p class="hb-happy gold-text">' + esc(b.line1) + "</p>" : "") +
        (b.line2 ? '<p class="hb-title gold-text">' + esc(b.line2) + "</p>" : "") +
        (b.line3 ? '<p class="hb-sub">' + esc(b.line3) + "</p>" : "") + ORN +
        (b.wish || b.wishBold ? '<p class="hb-wish">' + esc(b.wish || "") + (b.wishBold ? " <strong>" + esc(b.wishBold) + "</strong>" : "") + "</p>" : "") +
        '<div class="btn-row" style="justify-content:center"><a class="btn gold" href="' + esc(mailto(doc, subject)) + '">E-mail your holiday order</a>' +
        '<a class="btn ghost" style="color:#f5e9cf;border-color:rgba(245,233,207,.45)" href="' + esc(page) + '.html">Holiday menu</a></div>' +
        "</div></div></div>";
    }
    var n = cards.length;
    var grid = n ? '<div class="grid c' + Math.max(2, Math.min(4, n)) + ' promos">' + cards.map(function (x) {
      return promo(x.item, x.sec, ctx, today, pageLabel(x.sec.page));
    }).join("") + "</div>" : "";
    var head = (h.eyebrow || h.title || h.lead) ? '<div class="section-head center"' + (banner ? ' style="margin-top:64px"' : "") + ">" +
      (h.eyebrow ? '<span class="eyebrow">' + esc(h.eyebrow) + "</span>" : "") + (h.title ? "<h2>" + esc(h.title) + "</h2>" : "") +
      (h.lead ? '<p class="lead">' + esc(h.lead) + "</p>" : "") + "</div>" : "";
    return '<div class="wrap">' + banner + head + grid +
      '<div class="btn-row" style="justify-content:center"><a class="btn gold" href="' + esc(mailto(doc, subject)) + '">E-mail your holiday order</a>' +
      '<a class="btn ghost" href="' + esc(page) + '.html">' + esc(h.linkText || "See the full holiday menu") + "</a></div></div>";
  }

  /* ------------------------------------------------------------------ hours */
  function weekHours(doc) {
    var w = arr(doc.hours && doc.hours.week);
    var out = [];
    for (var d = 0; d < 7; d++) {
      var h = w.filter(function (x) { return x.day === d; })[0] || {};
      out.push({ day: d, open: h.open || "", close: h.close || "" });
    }
    return out;
  }
  /* Consecutive days with the same hours, Sunday first: [{from, to, open, close, days:[..]}] */
  function hourGroups(doc) {
    var out = [];
    weekHours(doc).forEach(function (h) {
      var last = out[out.length - 1];
      if (last && last.open === h.open && last.close === h.close) { last.to = h.day; last.days.push(h.day); }
      else out.push({ from: h.day, to: h.day, open: h.open, close: h.close, days: [h.day] });
    });
    return out;
  }
  function dayRange(g, style) {
    if (g.from === g.to) return style === "short" ? DAY3[g.from] : DAY[g.from];
    if (style === "short") return DAY3[g.from] + "–" + DAY3[g.to];
    return DAY[g.from] + (style === "words" ? " to " : " – ") + DAY[g.to];
  }
  function groupHours(g, short) {
    if (!g.open) return g.days.length === 1 && g.from === 6 ? "Closed (Shabbat)" : "Closed";
    return short ? fmtTime(g.open, true) + "–" + fmtTime(g.close, true) : fmtTime(g.open) + " – " + fmtTime(g.close);
  }
  function upcomingSpecial(doc, today) {
    return arr(doc.hours && doc.hours.special).filter(function (s) { return (s.to || s.from) >= today; })
      .sort(function (a, b) { return a.from < b.from ? -1 : 1; });
  }
  function specialText(s) {
    var when = s.to && s.to !== s.from ? fmtDate(s.from) + " – " + fmtDate(s.to) : fmtDate(s.from, true);
    var what = s.closed ? "Closed" : fmtTime(s.open) + " – " + fmtTime(s.close);
    return { when: when, what: what, note: s.note || "" };
  }
  function specialList(doc, today, max) {
    var list = upcomingSpecial(doc, today).slice(0, max || 6);
    if (!list.length) return "";
    return '<p class="sh-title">Holiday hours</p><ul class="sh-list">' + list.map(function (s) {
      var t = specialText(s);
      return '<li data-until="' + esc(addDays(s.to || s.from, 1)) + '"><strong>' + esc(t.when) + "</strong> · " + esc(t.what) +
        (t.note ? " <span>— " + esc(t.note) + "</span>" : "") + "</li>";
    }).join("") + "</ul>";
  }
  /* The small hours object the website's own script uses for "Open now". */
  function hoursConfig(doc) {
    var w = {};
    weekHours(doc).forEach(function (h) { w[h.day] = h.open ? [h.open, h.close] : null; });
    return { week: w, special: arr(doc.hours && doc.hours.special).map(function (s) {
      return { from: s.from, to: s.to || s.from, closed: !!s.closed, open: s.open || "", close: s.close || "", note: s.note || "" };
    }) };
  }

  /* ------------------------------------------------------------------ announcement */
  function safeLink(u) {
    u = str(u).trim();
    if (!u) return "";
    if (/^https:\/\/[^\s"'<>]+$/i.test(u)) return u;
    if (/^(mailto:|tel:)[^\s"'<>]+$/i.test(u)) return u;
    if (/^[a-z0-9-]+\.html(#[a-z0-9-]+)?$/i.test(u)) return u;
    return "";
  }
  function announcement(doc) {
    var a = doc.announcement || {};
    var text = str(a.text).trim();
    if (!text) return "";
    var link = safeLink(a.link);
    var attrs = (a.from ? ' data-from="' + esc(a.from) + '"' : "") + (a.until ? ' data-until="' + esc(addDays(a.until, 1)) + '"' : "");
    return '<div class="announce-in" data-key="' + hash(text + link) + '"' + attrs + '><p>' + esc(text) +
      (link ? ' <a href="' + esc(link) + '"' + (/^https:/i.test(link) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(a.linkText || "Learn more") + "</a>" : "") +
      '</p><button type="button" class="announce-x" aria-label="Hide this message">&times;</button></div>';
  }

  /* ------------------------------------------------------------------ slots */
  /* A slot is a spot on a page that is drawn from the data. Its id says what goes there:
       list:<section>          all visible items of a list, in that list's style
       gallery:<gallery>       the photos of a gallery
       price:<section>/<item>[:rows|:dots]   an item's price(s)
       pills:<section>/<item>[:dots]          an item's flavors / contents
       name:<section>/<item>   an item's name
       home, announce, info:cafeHours, hours:top|footer|strip|table|note|special
     renderSlot returns the HTML, or null for a slot it doesn't know (the page keeps what it has). */
  function renderSlot(id, doc, ctx) {
    ctx = ctx || {};
    var today = ctx.today || laToday();
    var m;
    if ((m = /^list:(.+)$/.exec(id))) {
      var sec = findSection(doc, m[1]);
      if (!sec) return "";
      if (sec.kind === "menu") return menuBody(sec, ctx, today);
      if (sec.kind === "drinks") return drinks(sec, ctx, today);
      var items = arr(sec.items).filter(visible);
      if (sec.kind === "cards" || sec.kind === "feature") return items.map(function (it) { return card(it, sec, ctx, today); }).join("");
      if (sec.kind === "promos") return items.map(function (it) { return promo(it, sec, ctx, today); }).join("");
      if (sec.kind === "boxes") return items.map(function (it, i) { return box(it, sec, ctx, today, i); }).join("");
      if (sec.kind === "spotlight") return items.map(function (it) { return spotlight(it, sec, ctx, today); }).join("");
      if (sec.kind === "table") return items.map(function (it) { return tableRow(it, today); }).join("");
      if (sec.kind === "flavors") return items.map(function (it) { return flavor(it, ctx, today); }).join("");
      return "";
    }
    if ((m = /^gallery:(.+)$/.exec(id))) {
      var g = arr(doc.galleries).filter(function (x) { return x.id === m[1]; })[0];
      return g ? galleryBody(g, ctx) : "";
    }
    if ((m = /^(price|pills|name|note):([^:]+)(?::(rows|dots))?$/.exec(id))) {
      var f = findItem(doc, m[2]);
      if (!f || !visible(f.item)) return "";
      var it = f.item;
      if (m[1] === "name") return esc(it.name);
      if (m[1] === "note") return esc(it.note || "");
      if (m[1] === "pills") {
        if (m[3] === "dots") return esc(arr(it.pills).join(" · "));
        return arr(it.pills).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
      }
      if (m[3] === "rows") return priceList(it.prices) + (isSoldOut(it, today) ? '<p class="so-note">' + soBadge(it, today) + "</p>" : "");
      return esc(priceText(it.prices)) + (isSoldOut(it, today) ? " " + soBadge(it, today) : "");
    }
    if (id === "home") return homeSection(doc, ctx, today);
    if (id === "announce") return announcement(doc);
    if (id === "info:cafeHours") return esc(doc.info && doc.info.cafeHours);
    if ((m = /^hours:(top|footer|strip|table|note|special)$/.exec(id))) {
      var groups = hourGroups(doc);
      if (m[1] === "top") return esc(groups.filter(function (g) { return g.open; }).map(function (g) { return dayRange(g, "short") + " " + groupHours(g, true); }).join(" · "));
      if (m[1] === "footer") return groups.map(function (g) { return '<li><span style="color:#efe4d1">' + esc(dayRange(g)) + "</span><br>" + esc(groupHours(g)) + "</li>"; }).join("");
      if (m[1] === "table") return groups.map(function (g) { return '<tr data-day="' + g.days.join(",") + '"><td>' + esc(dayRange(g)) + "</td><td>" + esc(groupHours(g)) + "</td></tr>"; }).join("");
      if (m[1] === "note") return esc(doc.hours && doc.hours.note);
      if (m[1] === "special") return specialList(doc, today, 6);
      var open = groups.filter(function (g) { return g.open; });
      return '<span class="eyebrow">Hours</span>' + open.map(function (g, i) {
        return "<h3" + (i ? ' style="margin-top:14px"' : "") + ">" + esc(dayRange(g, "words")) + "</h3><p>" + esc(groupHours(g)) + "</p>";
      }).join("") + specialList(doc, today, 3);
    }
    return null;
  }
  /* One item drawn in its list's style (the admin panel's live preview). */
  function renderItem(sec, it, ctx) {
    ctx = ctx || {};
    var today = ctx.today || laToday();
    var k = sec.kind;
    if (k === "promos") return promo(it, sec, ctx, today);
    if (k === "boxes") return box(it, sec, ctx, today, 0);
    if (k === "spotlight") return spotlight(it, sec, ctx, today);
    if (k === "menu") return '<div class="menu-cols">' + menuItem(it, ctx, today) + "</div>";
    if (k === "flavors") return flavor(it, ctx, today);
    if (k === "table") return '<table class="order-table"><tbody>' + tableRow(it, today) + "</tbody></table>";
    if (k === "feature" || k === "drinks") {
      return '<div class="card"><div class="body"><h3>' + esc(it.name) + "</h3>" + (isSingle(it.prices) ? '<div class="price-single">' + esc(it.prices[0].price) + "</div>" : priceList(it.prices)) +
        (it.note ? '<p class="sizes-note">' + esc(it.note) + "</p>" : "") + (arr(it.pills).length ? '<ul class="pill-list">' + it.pills.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" : "") +
        soBadge(it, today) + "</div></div>";
    }
    return card(it, sec, ctx, today);
  }

  /* Whether a [data-show] block should be hidden (its item is hidden or gone). */
  function showState(ref, doc) {
    var f = findItem(doc, ref);
    return !!f && visible(f.item);
  }

  /* ------------------------------------------------------------------ tidy and check (admin + server) */
  var CTRL = /[\u0000-\u0008\u000B-\u001F\u007F​-‏‪-‮⁦-⁩﻿]/g;
  function clean(v, max, multiline) {
    var s = str(v).normalize("NFC");
    s = multiline ? s.replace(/\r\n?/g, "\n").replace(CTRL, "") : s.replace(/[\r\n\t]+/g, " ").replace(CTRL, "");
    s = s.replace(/[ \t]{2,}/g, " ").trim();
    return s.length > max ? s.slice(0, max) : s;
  }
  function Problem(message, go) { this.message = message; this.go = go || null; }

  /* Tidies a document in place so what is shown in the panel is exactly what gets saved.
     It never throws; problemsIn() reports what still needs fixing. */
  function normalizeDoc(d, today) {
    today = today || laToday();
    d.schema = 1;
    d.info = isObj(d.info) ? d.info : {};
    ["phone", "email", "orderUrl", "cafeHours"].forEach(function (k) { d.info[k] = clean(d.info[k], k === "orderUrl" ? LIMITS.url : 80); });
    d.hours = isObj(d.hours) ? d.hours : {};
    d.hours.week = weekHours(d);
    d.hours.note = clean(d.hours.note, 160);
    d.hours.special = arr(d.hours.special).filter(isObj).map(function (s) {
      var o = { from: str(s.from), to: str(s.to || s.from), closed: !!s.closed, open: s.closed ? "" : str(s.open), close: s.closed ? "" : str(s.close), note: clean(s.note, 80) };
      if (o.to < o.from) o.to = o.from;
      return o;
    }).sort(function (a, b) { return a.from < b.from ? -1 : a.from > b.from ? 1 : 0; });
    var a = isObj(d.announcement) ? d.announcement : {};
    d.announcement = { text: clean(a.text, LIMITS.announcement), link: clean(a.link, LIMITS.url), linkText: clean(a.linkText, LIMITS.linkText), from: str(a.from), until: str(a.until) };
    var h = isObj(d.home) ? d.home : {};
    var b = isObj(h.banner) ? h.banner : {};
    d.home = {
      show: h.show !== false,
      banner: { show: b.show !== false, line1: clean(b.line1, 30), line2: clean(b.line2, 30), line3: clean(b.line3, 40), wish: clean(b.wish, 160), wishBold: clean(b.wishBold, 80), img: isObj(b.img) ? tidyPhoto(b.img) : null },
      eyebrow: clean(h.eyebrow, 40), title: clean(h.title, 80), lead: clean(h.lead, 240),
      cards: arr(h.cards).map(str).filter(function (r) { return /^[a-z0-9-]+\/[a-z0-9-]+$/.test(r); }).slice(0, LIMITS.cards),
      page: HOLIDAY_PAGES.indexOf(h.page) > -1 ? h.page : "rosh-hashanah",
      linkText: clean(h.linkText, 40), orderSubject: clean(h.orderSubject, 60)
    };
    if (!d.home.banner.img) delete d.home.banner.img;
    d.sections = arr(d.sections).filter(isObj);
    d.sections.forEach(function (sec) {
      if (Array.isArray(sec.groups)) sec.groups.forEach(function (g) { g.title = clean(g.title, 60); g.items = arr(g.items).filter(isObj).map(function (it) { return tidyItem(it, sec, today); }); });
      else sec.items = arr(sec.items).filter(isObj).map(function (it) { return tidyItem(it, sec, today); });
    });
    d.galleries = arr(d.galleries).filter(isObj);
    d.galleries.forEach(function (g) {
      g.items = arr(g.items).filter(isObj).map(function (x) {
        var y = x.video
          ? { video: str(x.video), poster: str(x.poster), w: Math.round(Number(x.w)) || 0, h: Math.round(Number(x.h)) || 0, label: clean(x.label, LIMITS.alt) }
          : tidyPhoto(x);
        if (x.hidden) y.hidden = true;
        return y;
      });
    });
    return d;
  }
  function tidyPhoto(p) {
    var o = { src: str(p.src), w: Math.round(Number(p.w)) || 800, h: Math.round(Number(p.h)) || 800 };
    if (p.cut) o.cut = true;
    var alt = clean(p.alt, LIMITS.alt);
    if (alt) o.alt = alt;
    return o;
  }
  function tidyItem(it, sec, today) {
    var o = { id: str(it.id) || slugify(it.name) };
    o.name = clean(it.name, LIMITS.name);
    ["kicker", "ribbon", "note", "extra", "opts", "size"].forEach(function (k) { var v = clean(it[k], LIMITS[k]); if (v) o[k] = v; });
    var desc = clean(it.desc, LIMITS.desc, true);
    if (desc) o.desc = desc;
    o.prices = arr(it.prices).filter(isObj).map(function (p) { return { label: clean(p.label, LIMITS.label), price: normPrice(clean(p.price, LIMITS.price)) }; });
    var photos = arr(it.photos).filter(function (p) { return isObj(p) && p.src; }).map(tidyPhoto);
    if (photos.length) o.photos = photos;
    var tags = arr(it.tags).map(function (t) { return clean(t, LIMITS.tag); }).filter(Boolean);
    if (tags.length) o.tags = tags;
    var pills = arr(it.pills).map(function (t) { return clean(t, LIMITS.pill); }).filter(Boolean);
    if (pills.length) o.pills = pills;
    if (it.hidden) o.hidden = true;
    if (isSoldOut(it, today)) { o.soldOut = true; if (it.soldOutUntil) o.soldOutUntil = str(it.soldOutUntil); }
    return o;
  }

  /* Friendly checks before publishing. Each problem says where to look (go). */
  function problemsIn(d) {
    var out = [];
    var add = function (msg, go) { out.push(new Problem(msg, go)); };
    var info = d.info || {};
    if (info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) add("The e-mail address doesn’t look right.", { tab: "info", sel: "#in-email" });
    if (info.phone && (info.phone.replace(/\D/g, "").length < 10)) add("The phone number needs at least 10 digits.", { tab: "info", sel: "#in-phone" });
    if (info.orderUrl && !/^https:\/\/[^\s"'<>]+$/i.test(info.orderUrl)) add("The online ordering link must start with https://", { tab: "info", sel: "#in-order" });
    weekHours(d).forEach(function (h) {
      if ((h.open || h.close) && !(validTime(h.open) && validTime(h.close))) add(DAY[h.day] + " needs both an opening and a closing time.", { tab: "hours" });
      else if (h.open && h.close <= h.open) add("On " + DAY[h.day] + ", closing time must be after opening time.", { tab: "hours" });
    });
    arr(d.hours && d.hours.special).forEach(function (s) {
      if (!validDate(s.from) || !validDate(s.to || s.from)) add("A special day has a date that isn’t valid.", { tab: "hours" });
      else if (!s.closed && !(validTime(s.open) && validTime(s.close) && s.close > s.open)) add("Special hours on " + fmtDate(s.from) + " need an opening time before the closing time.", { tab: "hours" });
    });
    var an = d.announcement || {};
    if (an.link && !safeLink(an.link)) add("The announcement link must start with https:// (or be a page like cake-1.html).", { tab: "info", sel: "#an-link" });
    if (an.from && !validDate(an.from)) add("The announcement start date isn’t valid.", { tab: "info" });
    if (an.until && !validDate(an.until)) add("The announcement end date isn’t valid.", { tab: "info" });
    if (an.from && an.until && an.until < an.from) add("The announcement ends before it starts.", { tab: "info" });
    arr(d.home && d.home.cards).forEach(function (ref) { if (!findItem(d, ref)) add("A card on the home page points to an item that was deleted.", { tab: "home" }); });
    sections(d).forEach(function (sec) {
      var lists = Array.isArray(sec.groups) ? sec.groups.map(function (g) { return { g: g, items: arr(g.items) }; }) : [{ g: null, items: arr(sec.items) }];
      var seen = {};
      lists.forEach(function (l) {
        l.items.forEach(function (it) {
          var where = { tab: "menu", sec: sec.id, item: it.id };
          var label = it.name || "An item";
          if (!it.name) add("An item in “" + sec.name + "” needs a name.", where);
          if (seen[it.id]) add("“" + label + "” is listed twice in “" + sec.name + "”.", where);
          seen[it.id] = 1;
          var labels = {};
          arr(it.prices).forEach(function (p) {
            if (!p.price) add("A price of “" + label + "” is empty.", where);
            var k = str(p.label).toLowerCase();
            if (arr(it.prices).length > 1 && sec.kind !== "drinks") {
              if (!k) add("Each size of “" + label + "” needs a name.", where);
              else if (labels[k]) add("“" + label + "” lists the size “" + p.label + "” twice.", where);
              labels[k] = 1;
            }
          });
          arr(it.photos).forEach(function (ph) { if (!/^upload:[A-Za-z0-9_-]{16,64}$|^[a-z0-9-]{1,40}$/.test(str(ph.src))) add("“" + label + "” has a photo that can’t be used.", where); });
        });
      });
    });
    arr(d.galleries).forEach(function (g) {
      arr(g.items).forEach(function (x, i) {
        if (!x.video && !str(x.alt).trim()) add("Photo " + (i + 1) + " in the “" + g.name + "” gallery needs a short description.", { tab: "galleries", gallery: g.id, index: i });
      });
    });
    return out;
  }

  /* Human summary of what changed between two versions (shown before publishing). */
  function describeChanges(a, b, today) {
    var lines = [];
    var idx = function (d) {
      var m = {};
      eachItem(d, function (it, sec, g) { m[sec.id + "/" + it.id] = { it: it, sec: sec, g: g }; });
      return m;
    };
    var A = idx(a), B = idx(b);
    var pt = function (it) { return priceText(it.prices, ", "); };
    var secName = function (x) { return x.g && x.g.title ? x.g.title : x.sec.name; };
    Object.keys(B).forEach(function (k) {
      var n = B[k].it;
      if (!A[k]) { lines.push("Added “" + n.name + "” to " + secName(B[k])); return; }
      var o = A[k].it;
      if (o.name !== n.name) lines.push("Renamed “" + o.name + "” to “" + n.name + "”");
      if (pt(o) !== pt(n)) lines.push(n.name + ": " + (pt(o) || "no price") + " → " + (pt(n) || "no price"));
      if (isSoldOut(o, today) !== isSoldOut(n, today)) lines.push(n.name + ": " + (isSoldOut(n, today) ? (n.soldOutUntil ? "sold out today" : "sold out") : "available again"));
      if (!!o.hidden !== !!n.hidden) lines.push(n.name + ": " + (n.hidden ? "hidden from the website" : "back on the website"));
      if (JSON.stringify(arr(o.photos).map(function (p) { return p.src; })) !== JSON.stringify(arr(n.photos).map(function (p) { return p.src; }))) lines.push(n.name + ": photos changed");
      var rest = function (x) { return JSON.stringify([x.desc || "", x.kicker || "", x.ribbon || "", x.note || "", x.extra || "", x.opts || "", x.size || "", arr(x.tags), arr(x.pills), arr(x.photos).map(function (p) { return p.alt || ""; })]); };
      if (rest(o) !== rest(n)) lines.push(n.name + ": details updated");
    });
    Object.keys(A).forEach(function (k) { if (!B[k]) lines.push("Removed “" + A[k].it.name + "” from " + secName(A[k])); });
    var order = function (d) { return JSON.stringify(sections(d).map(function (s) { return [s.id, itemsOf(s).map(function (i) { return i.id; })]; })); };
    if (order(a) !== order(b) && !lines.some(function (l) { return /^(Added|Removed)/.test(l); })) lines.push("Items were reordered");
    var ga = {}, gb = {};
    arr(a.galleries).forEach(function (g) { ga[g.id] = g; });
    arr(b.galleries).forEach(function (g) {
      gb[g.id] = g;
      var o = ga[g.id];
      if (!o) return;
      var srcs = function (x, onlyVisible) { return arr(x.items).filter(function (i) { return !onlyVisible || visible(i); }).map(function (i) { return i.src || i.video; }); };
      var so = srcs(o), sn = srcs(g), vo = srcs(o, true), vn = srcs(g, true);
      var added = sn.filter(function (s) { return so.indexOf(s) < 0; }).length, removed = so.filter(function (s) { return sn.indexOf(s) < 0; }).length;
      var hid = vo.filter(function (s) { return vn.indexOf(s) < 0 && sn.indexOf(s) > -1; }).length, shown = vn.filter(function (s) { return vo.indexOf(s) < 0 && so.indexOf(s) > -1; }).length;
      if (added) lines.push("Gallery “" + g.name + "”: " + plural(added, "photo") + " added");
      if (removed) lines.push("Gallery “" + g.name + "”: " + plural(removed, "photo") + " removed");
      if (hid) lines.push("Gallery “" + g.name + "”: " + plural(hid, "photo") + " hidden");
      if (shown) lines.push("Gallery “" + g.name + "”: " + plural(shown, "photo") + " shown again");
      if (!added && !removed && !hid && !shown && JSON.stringify(o.items) !== JSON.stringify(g.items)) lines.push("Gallery “" + g.name + "”: photos reordered or described");
    });
    var same = function (x, y) { return JSON.stringify(x) === JSON.stringify(y); };
    if (!same(a.home, b.home)) lines.push("Home page holiday section changed");
    if (!same(a.hours && a.hours.week, b.hours && b.hours.week)) lines.push("Store hours changed");
    if (!same(a.hours && a.hours.special, b.hours && b.hours.special)) lines.push("Closed days and holiday hours changed");
    if ((a.hours && a.hours.note) !== (b.hours && b.hours.note)) lines.push("Hours note changed");
    if (!same(a.announcement, b.announcement)) lines.push(b.announcement && b.announcement.text ? "Announcement bar updated" : "Announcement bar turned off");
    if (!same(a.info, b.info)) lines.push("Contact details or links changed");
    return lines;
  }

  return {
    DAY: DAY, PAGES: PAGES, HOLIDAY_PAGES: HOLIDAY_PAGES, KINDS: KINDS, LIMITS: LIMITS, TAG_PRESETS: TAG_PRESETS,
    esc: esc, clone: clone, slugify: slugify, hash: hash, plural: plural, laToday: laToday, addDays: addDays, weekday: weekday,
    fmtDate: fmtDate, fmtTime: fmtTime, validDate: validDate, validTime: validTime,
    normPrice: normPrice, isMoney: isMoney, priceValue: priceValue, fmtMoney: fmtMoney, priceText: priceText,
    isSoldOut: isSoldOut, visible: visible, sections: sections, findSection: findSection, itemsOf: itemsOf, findItem: findItem,
    eachItem: eachItem, eachPhoto: eachPhoto, uploadIds: uploadIds, pageLabel: pageLabel, imgUrls: imgUrls,
    renderSlot: renderSlot, renderItem: renderItem, showState: showState, hoursConfig: hoursConfig, weekHours: weekHours, hourGroups: hourGroups,
    specialText: specialText, upcomingSpecial: upcomingSpecial, safeLink: safeLink,
    normalizeDoc: normalizeDoc, problemsIn: problemsIn, describeChanges: describeChanges, cleanText: clean
  };
});
