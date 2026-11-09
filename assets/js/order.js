/* Delice Bakery — the order page (order.html): order for pickup, pay at the bakery.
   The menu, prices, pickup times and the order itself come from the admin panel (CFG.admin), so they're always
   what the bakery published: sold-out items, holiday hours, closed days and each item's notice are respected.
   The cart is kept in this browser (localStorage) until the order is placed. No accounts, no online payment. */
(function () {
  "use strict";
  var CFG = (window.DeliceSite && window.DeliceSite.config()) || {};
  var LOCAL = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var CART_KEY = "delice-cart-v1";
  var API = apiBase();
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var money = function (c) { c = Math.round(c || 0); return "$" + (c % 100 ? (c / 100).toFixed(2) : String(c / 100)); };
  var money2 = function (c) { return "$" + ((c || 0) / 100).toFixed(2); };
  var plural = function (n, w, m) { return n + " " + (n === 1 ? w : (m || w + "s")); };
  var ICON = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>'
  };

  function apiBase() {
    // on a computer (local copy) ?api=http://127.0.0.1:8789 points at a local admin panel
    var q = LOCAL ? new URLSearchParams(location.search).get("api") : "";
    var raw = String(q || CFG.admin || "").trim();
    try {
      var u = new URL(raw);
      return u.protocol === "https:" || (u.protocol === "http:" && /^(localhost|127\.0\.0\.1)$/.test(u.hostname)) ? u.origin : "";
    } catch (e) { return ""; }
  }
  function call(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || "GET", headers: {}, mode: "cors", credentials: "omit" };
    if (opts.body) { init.headers["Content-Type"] = "application/json"; init.headers["X-Delice-Order"] = "1"; init.body = JSON.stringify(opts.body); }
    return fetch(API + path, init).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) { var e = new Error(data.error || "Something went wrong. Please try again or call the bakery."); e.data = data; e.status = res.status; throw e; }
        return data;
      });
    }, function () { throw new Error("No connection. Check the internet and try again, or call the bakery at " + phone() + "."); });
  }
  function phone() { return (state.menu && state.menu.store && state.menu.store.phone) || (CFG.info && CFG.info.phone) || "(310) 289-6556"; }
  function photoUrl(p, big) {
    if (!p || !p.src) return "";
    var m = /^upload:([A-Za-z0-9_-]+)$/.exec(p.src);
    if (m) return API ? API + "/img/" + m[1] + (big ? "" : "?v=m") : "";
    return "assets/img/" + p.src + (big ? "" : "-m") + ".webp";
  }

  /* ---------------------------------------------------------------- state */
  var state = { menu: null, items: {}, choices: {}, cart: readCart(), q: "", times: null, step: "cart", busy: false, done: null, form: {} };
  function readCart() {
    try { var c = JSON.parse(localStorage.getItem(CART_KEY) || "null"); return c && Array.isArray(c.lines) ? c : { lines: [] }; } catch (e) { return { lines: [] }; }
  }
  function saveCart() {
    try { if (state.cart.lines.length) localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); else localStorage.removeItem(CART_KEY); } catch (e) { /* private mode */ }
    drawFab();
  }
  var lineKey = function (l) { return l.id + "|" + l.size + "|" + (l.extras || []).slice().sort().join("+"); };
  function priceOf(l) {
    var it = state.items[l.id];
    if (!it) return null;
    var s = it.sizes.filter(function (x) { return x.id === l.size; })[0];
    if (!s) return null;
    return s.price;
  }
  function optsOf(it, sizeId, extras) {
    var s = it.sizes.filter(function (x) { return x.id === sizeId; })[0];
    var parts = [];
    if (it.sizes.length > 1 && s && s.name) parts.push(s.name);
    else if (it.sizes.length === 1 && s && s.name && !/^(regular|each)$/i.test(s.name)) parts.push(s.name);
    (extras || []).forEach(function (x) {
      var p = x.split(":"), g = state.choices[p[0]];
      var o = g && g.options.filter(function (y) { return y.id === p[1]; })[0];
      if (o) parts.push(o.name);
    });
    return parts.join(" · ");
  }
  // keep the cart in step with the menu: items no longer offered come out, names and prices follow the menu
  function checkCart() {
    var removed = [];
    state.cart.lines = state.cart.lines.filter(function (l) {
      var it = state.items[l.id];
      var ok = it && priceOf(l) !== null && it.sold_out !== "soldout";
      if (!ok) removed.push(l.name || "An item");
      else { l.name = it.name; l.unit = priceOf(l); l.opts = optsOf(it, l.size, l.extras); }
      return ok;
    });
    saveCart();
    if (removed.length) toast(removed.join(", ") + (removed.length > 1 ? " are" : " is") + " no longer available and came out of your order.");
  }
  var count = function () { return state.cart.lines.reduce(function (s, l) { return s + l.qty; }, 0); };
  var total = function () { return state.cart.lines.reduce(function (s, l) { return s + (l.unit || 0) * l.qty; }, 0); };

  /* ---------------------------------------------------------------- menu */
  function load() {
    if (!API) { showNotice("Online ordering isn’t available on this copy of the website. Please call the bakery at " + phone() + "."); $("#order-menu").innerHTML = ""; return; }
    call("/api/order/menu").then(function (m) {
      state.menu = m;
      state.items = {}; state.choices = {};
      m.categories.forEach(function (c) { c.items.forEach(function (it) { it.cat = c; state.items[it.id] = it; }); });
      (m.choices || []).forEach(function (g) { state.choices[g.id] = g; });
      if (!m.open) showNotice(m.message || "Online ordering is paused right now. Please call the bakery at " + phone() + ".");
      else if (m.note) showNotice(m.note, true);
      checkCart();
      drawMenu();
      if (location.hash === "#cart" && state.cart.lines.length) openCart();
    }).catch(function (e) {
      $("#order-menu").innerHTML = '<div class="order-empty"><p>' + esc(e.message) + '</p><button type="button" class="btn ghost" data-act="retry">Try again</button></div>';
    });
  }
  function showNotice(text, info) {
    var n = $("#order-notice");
    n.hidden = false;
    n.className = "order-notice" + (info ? " is-info" : "");
    n.innerHTML = (info ? "<strong>Good to know:</strong> " : "") + esc(text);
  }
  function soldText(it) {
    if (it.sold_out === "soldout") return "Sold out";
    if (it.sold_out === "today") return "Sold out today";
    return "";
  }
  function priceText(it) {
    if (it.sizes.length === 1) return money(it.sizes[0].price) + (it.sizes[0].name && !/^(regular|each)$/i.test(it.sizes[0].name) ? ' <span class="oi-unit">' + esc(it.sizes[0].name) + "</span>" : "");
    var lo = Math.min.apply(null, it.sizes.map(function (s) { return s.price; }));
    return '<span class="oi-from">from</span> ' + money(lo);
  }
  function noticeText(min) {
    if (!min || min < 60) return "";
    var h = Math.round(min / 60), d = Math.floor(h / 24);
    return d ? plural(d, "day") + (h % 24 ? " " + plural(h % 24, "hour") : "") + "’ notice" : plural(h, "hour") + "’ notice";
  }
  function drawMenu() {
    var m = state.menu;
    var q = state.q.trim().toLowerCase();
    var cats = m.categories.map(function (c) {
      var items = c.items.filter(function (it) { return !q || (it.name + " " + it.desc + " " + c.name + " " + c.page_label).toLowerCase().indexOf(q) > -1; });
      return { c: c, items: items };
    }).filter(function (x) { return x.items.length; });
    // pages first, then their categories (a holiday page that's on comes first)
    var groups = [];
    cats.forEach(function (x) {
      var g = groups.filter(function (y) { return y.label === x.c.page_label; })[0];
      if (!g) { g = { label: x.c.page_label, id: "p-" + x.c.page, holiday: x.c.holiday, cats: [] }; groups.push(g); }
      g.cats.push(x);
    });
    groups.sort(function (a, b) { return (b.holiday ? 1 : 0) - (a.holiday ? 1 : 0); });
    $("#order-cats").innerHTML = groups.map(function (g) { return '<a href="#' + esc(g.id) + '">' + esc(g.label) + "</a>"; }).join("");
    if (!groups.length) {
      $("#order-menu").innerHTML = '<div class="order-empty"><p>' + (q ? "Nothing matches “" + esc(state.q) + "”." : "There’s nothing to order online right now. Please call the bakery at " + esc(phone()) + ".") + "</p></div>";
      return;
    }
    $("#order-menu").innerHTML = groups.map(function (g) {
      return '<section class="og anchor" id="' + esc(g.id) + '"><h2 class="og__title">' + esc(g.label) + (g.holiday ? ' <span class="og__badge">Holiday</span>' : "") + "</h2>" +
        g.cats.map(function (x) {
          var head = g.cats.length > 1 || x.c.name !== g.label ? '<h3 class="oc__title">' + esc(x.c.name) + "</h3>" : "";
          return '<div class="oc">' + head + '<div class="oi-grid">' + x.items.map(itemCard).join("") + "</div></div>";
        }).join("") + "</section>";
    }).join("");
  }
  function itemCard(it) {
    var sold = soldText(it);
    var img = it.photo ? '<div class="oi__img"><img src="' + esc(photoUrl(it.photo)) + '" alt="' + esc(it.photo.alt || it.name) + '" loading="lazy" decoding="async"></div>' : '<div class="oi__img oi__img--none" aria-hidden="true"><span>' + esc(it.name.charAt(0)) + "</span></div>";
    var note = noticeText(it.notice_min);
    var inCart = state.cart.lines.filter(function (l) { return l.id === it.id; }).reduce(function (s, l) { return s + l.qty; }, 0);
    return '<article class="oi' + (it.sold_out === "soldout" ? " is-soldout" : "") + '" data-item="' + esc(it.id) + '">' + img +
      '<div class="oi__body"><h4 class="oi__name">' + esc(it.name) + "</h4>" +
      (it.desc ? '<p class="oi__desc">' + esc(it.desc) + "</p>" : "") +
      '<div class="oi__meta">' + (sold ? '<span class="oi__so">' + esc(sold) + (it.sold_out === "today" ? " · order for another day" : "") + "</span>" : "") + (note ? '<span class="oi__note">' + esc(note) + "</span>" : "") + "</div>" +
      '<div class="oi__foot"><span class="oi__price">' + priceText(it) + "</span>" +
      (it.sold_out === "soldout" ? "" : '<button type="button" class="oi__add" data-act="add" aria-label="Add ' + esc(it.name) + '">' + (inCart ? '<span class="oi__in">' + inCart + "</span>" : ICON.plus) + "<span>" + (inCart ? "Add more" : "Add") + "</span></button>") +
      "</div></div></article>";
  }

  /* ---------------------------------------------------------------- add an item (size, flavor, how many) */
  function addLine(line) {
    var k = lineKey(line);
    var m = state.cart.lines.filter(function (l) { return lineKey(l) === k; })[0];
    if (m) m.qty = Math.min(99, m.qty + line.qty); else state.cart.lines.push(line);
    saveCart();
    drawMenu();
    toast(line.qty + " × " + line.name + (line.opts ? " (" + line.opts + ")" : "") + " added to your order.", true);
  }
  function quickAdd(it) {
    var groups = (it.extras || []).map(function (id) { return state.choices[id]; }).filter(Boolean);
    if (it.sizes.length === 1 && !groups.length) {
      addLine({ id: it.id, size: it.sizes[0].id, extras: [], qty: 1, name: it.name, opts: optsOf(it, it.sizes[0].id, []), unit: it.sizes[0].price });
      return;
    }
    openItem(it);
  }
  function openItem(it) {
    var groups = (it.extras || []).map(function (id) { return state.choices[id]; }).filter(Boolean);
    var sheet = $("#item-sheet");
    var sel = { size: it.sizes[0].id, extras: {}, qty: 1 };
    var draw = function () {
      var unit = (it.sizes.filter(function (s) { return s.id === sel.size; })[0] || it.sizes[0]).price;
      var missing = groups.filter(function (g) { return !sel.extras[g.id]; })[0];
      sheet.innerHTML = '<form method="dialog" class="sheet__inner">' +
        '<div class="sheet__head">' + (it.photo ? '<img src="' + esc(photoUrl(it.photo)) + '" alt="" class="sheet__img">' : "") +
          '<div><h2 id="item-title">' + esc(it.name) + "</h2>" + (it.desc ? '<p class="sheet__desc">' + esc(it.desc) + "</p>" : "") + "</div>" +
          '<button type="button" class="sheet__x" data-act="close" aria-label="Close">' + ICON.x + "</button></div>" +
        (it.sizes.length > 1 ? '<fieldset class="pick"><legend>Choose</legend>' + it.sizes.map(function (s) {
          return '<label class="pick__opt"><input type="radio" name="size" value="' + esc(s.id) + '"' + (sel.size === s.id ? " checked" : "") + "><span>" + esc(s.name || "Regular") + "</span><b>" + money2(s.price) + "</b></label>";
        }).join("") + "</fieldset>" : "") +
        groups.map(function (g) {
          return '<fieldset class="pick"><legend>' + esc(g.name) + "</legend>" + g.options.map(function (o) {
            return '<label class="pick__opt"><input type="radio" name="g-' + esc(g.id) + '" value="' + esc(o.id) + '"' + (sel.extras[g.id] === o.id ? " checked" : "") + "><span>" + esc(o.name) + "</span>" + (o.price ? "<b>+" + money2(o.price) + "</b>" : "") + "</label>";
          }).join("") + "</fieldset>";
        }).join("") +
        '<div class="sheet__qty"><span>How many</span>' + stepper(sel.qty, "qty") + "</div>" +
        (it.sold_out === "today" ? '<p class="sheet__warn">Sold out today: pick another day at checkout.</p>' : "") +
        '<div class="sheet__actions"><button type="button" class="btn gold btn-block" data-act="confirm"' + (missing ? " disabled" : "") + ">" +
          (missing ? "Choose " + esc(g0(missing.name)) : "Add to order · " + money2(unit * sel.qty)) + "</button></div></form>";
    };
    function g0(s) { return s.toLowerCase(); }
    sheet.onclick = function (e) {
      var b = e.target.closest("[data-act]");
      if (e.target === sheet) { sheet.close(); return; }
      if (!b) return;
      var act = b.getAttribute("data-act");
      if (act === "close") sheet.close();
      if (act === "qty-") { sel.qty = Math.max(1, sel.qty - 1); draw(); }
      if (act === "qty+") { sel.qty = Math.min(99, sel.qty + 1); draw(); }
      if (act === "confirm") {
        var ex = groups.map(function (g) { return g.id + ":" + sel.extras[g.id]; });
        var unit = (it.sizes.filter(function (s) { return s.id === sel.size; })[0] || it.sizes[0]).price;
        sheet.close();
        addLine({ id: it.id, size: sel.size, extras: ex, qty: sel.qty, name: it.name, opts: optsOf(it, sel.size, ex), unit: unit });
      }
    };
    sheet.onchange = function (e) {
      var t = e.target;
      if (t.name === "size") sel.size = t.value;
      else if (/^g-/.test(t.name)) sel.extras[t.name.slice(2)] = t.value;
      draw();
    };
    draw();
    openDialog(sheet);
  }
  function stepper(v, name) {
    return '<span class="qstep"><button type="button" data-act="' + name + '-" aria-label="One less">' + ICON.minus + '</button><output aria-live="polite">' + v + '</output><button type="button" data-act="' + name + '+" aria-label="One more">' + ICON.plus + "</button></span>";
  }
  function openDialog(d) {
    if (typeof d.showModal === "function") { if (!d.open) d.showModal(); } else d.setAttribute("open", "");
    document.body.classList.add("sheet-open");
    d.addEventListener("close", function onClose() { document.body.classList.remove("sheet-open"); d.removeEventListener("close", onClose); });
  }

  /* ---------------------------------------------------------------- cart and checkout */
  function drawFab() {
    var n = count();
    var fab = $("#cart-fab");
    if (!fab) return;
    fab.hidden = !n;
    $("#cart-count").textContent = n;
    $("#cart-total").textContent = n ? money2(total()) : "";
    document.querySelectorAll(".order-top .cart-count").forEach(function (b) { b.textContent = n; b.hidden = !n; });
  }
  function openCart() {
    state.step = state.done ? "done" : "cart";
    drawCart();
    openDialog($("#cart-sheet"));
  }
  function drawCart() {
    var s = $("#cart-sheet");
    if (state.step === "done") { s.innerHTML = doneView(); return; }
    if (state.step === "checkout") { s.innerHTML = checkoutView(); return; }
    var lines = state.cart.lines;
    s.innerHTML = '<div class="sheet__inner">' +
      '<div class="sheet__head"><div><h2 id="cart-title">Your order</h2><p class="sheet__desc">Pickup at Delice Bakery · pay at the bakery</p></div><button type="button" class="sheet__x" data-act="close" aria-label="Close">' + ICON.x + "</button></div>" +
      (!lines.length ? '<p class="cart-empty">Your order is empty. Add something from the menu.</p>' :
        '<ul class="cart-lines">' + lines.map(function (l, i) {
          return '<li class="cl" data-line="' + i + '"><div class="cl__info"><b>' + esc(l.name) + "</b>" + (l.opts ? "<span>" + esc(l.opts) + "</span>" : "") + "</div>" +
            stepper(l.qty, "line") + '<span class="cl__price">' + money2((l.unit || 0) * l.qty) + '</span><button type="button" class="cl__rm" data-act="remove" aria-label="Remove ' + esc(l.name) + '">' + ICON.trash + "</button></li>";
        }).join("") + "</ul>" +
        '<div class="cart-total"><span>Total before tax</span><b>' + money2(total()) + "</b></div>" +
        '<p class="cart-pay">You pay at the bakery when you pick up (tax is added there).</p>' +
        '<div class="sheet__actions"><button type="button" class="btn gold btn-block" data-act="checkout"' + (state.menu && !state.menu.open ? " disabled" : "") + ">Choose a pickup time</button>" +
        '<button type="button" class="btn ghost btn-block" data-act="close">Add more</button></div>') +
      "</div>";
  }
  function slotLabel(t) { var p = t.split(":").map(Number), h = p[0] % 12 || 12; return h + (p[1] ? ":" + String(p[1]).padStart(2, "0") : "") + " " + (p[0] >= 12 ? "pm" : "am"); }
  function dayLabel(d, today) {
    var tomorrow = new Date(Date.parse(today + "T12:00:00Z") + 864e5).toISOString().slice(0, 10);
    var dt = new Date(d + "T12:00:00Z");
    var name = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
    return d === today ? "Today · " + name : d === tomorrow ? "Tomorrow · " + name : name;
  }
  function loadTimes() {
    state.times = null;
    var ids = state.cart.lines.map(function (l) { return encodeURIComponent(l.id); }).join(",");
    return call("/api/order/times?items=" + ids).then(function (t) {
      state.times = t;
      var f = state.form;
      var day = t.days && t.days.filter(function (d) { return d.date === f.date; })[0];
      if (!day && t.days && t.days.length) { f.date = t.days[0].date; f.time = ""; }
      if (day && f.time && day.slots.indexOf(f.time) < 0) f.time = "";
      if (state.step === "checkout") drawCart();
    }).catch(function (e) { state.times = { error: e.message }; if (state.step === "checkout") drawCart(); });
  }
  function checkoutView() {
    var t = state.times, f = state.form;
    var head = '<div class="sheet__head"><button type="button" class="sheet__back" data-act="back" aria-label="Back to your order">' + ICON.left + '</button><div><h2 id="cart-title">Pickup and your details</h2><p class="sheet__desc">' + plural(count(), "item") + " · " + money2(total()) + ' · pay at the bakery</p></div><button type="button" class="sheet__x" data-act="close" aria-label="Close">' + ICON.x + "</button></div>";
    if (!t) return '<div class="sheet__inner">' + head + '<p class="cart-empty">Finding pickup times…</p></div>';
    if (t.error) return '<div class="sheet__inner">' + head + '<p class="form-err">' + esc(t.error) + '</p><button type="button" class="btn ghost" data-act="times">Try again</button></div>';
    if (!t.open) return '<div class="sheet__inner">' + head + '<p class="form-err">' + esc(t.message) + "</p></div>";
    if (!t.days.length) return '<div class="sheet__inner">' + head + '<p class="form-err">There are no pickup times in the next days. Please call the bakery at ' + esc(phone()) + ".</p></div>";
    var day = t.days.filter(function (d) { return d.date === f.date; })[0] || t.days[0];
    var longNotice = (t.notice || []).map(function (n) { var it = state.items[n.id]; return it ? it.name + " (" + noticeText(n.min) + ")" : ""; }).filter(Boolean);
    return '<form class="sheet__inner checkout" id="checkout" novalidate>' + head +
      (longNotice.length ? '<p class="sheet__warn">Some items need notice: ' + esc(longNotice.join(", ")) + ". The first pickup day is set for them.</p>" : "") +
      '<div class="co-row"><label class="co-field"><span>Pickup day</span><select name="date" required>' + t.days.map(function (d) { return '<option value="' + d.date + '"' + (d.date === day.date ? " selected" : "") + ">" + esc(dayLabel(d.date, t.today)) + "</option>"; }).join("") + "</select></label>" +
      '<label class="co-field"><span>Pickup time</span><select name="time" required><option value="">Pick a time</option>' + day.slots.map(function (s) { return '<option value="' + s + '"' + (s === f.time ? " selected" : "") + ">" + slotLabel(s) + "</option>"; }).join("") + "</select></label></div>" +
      '<label class="co-field"><span>Your name</span><input name="name" required maxlength="80" autocomplete="name" value="' + esc(f.name || "") + '"></label>' +
      '<div class="co-row"><label class="co-field"><span>Phone</span><input name="phone" type="tel" required maxlength="30" autocomplete="tel" placeholder="(310) 555-0123" value="' + esc(f.phone || "") + '"></label>' +
      '<label class="co-field"><span>Email <em>(optional)</em></span><input name="email" type="email" maxlength="200" autocomplete="email" value="' + esc(f.email || "") + '"></label></div>' +
      '<label class="co-field"><span>Note <em>(optional)</em></span><textarea name="note" maxlength="300" rows="2" placeholder="Writing on a cake, slicing a loaf…">' + esc(f.note || "") + "</textarea></label>" +
      '<label class="co-hp" aria-hidden="true">Website <input name="website" tabindex="-1" autocomplete="off"></label>' +
      '<p class="form-err" id="co-err" role="alert" hidden></p>' +
      '<div class="cart-total"><span>Total before tax · pay at pickup</span><b>' + money2(total()) + "</b></div>" +
      '<div class="sheet__actions"><button type="submit" class="btn gold btn-block"' + (state.busy ? " disabled" : "") + ">" + (state.busy ? "Placing your order…" : "Place order") + "</button></div>" +
      '<p class="co-small">We’ll have it ready at 8583 W. Pico Blvd, Los Angeles. Questions or changes: <a href="tel:+1' + esc(phone().replace(/\D/g, "").slice(-10)) + '">' + esc(phone()) + "</a>.</p></form>";
  }
  function submit(form) {
    var f = state.form;
    ["date", "time", "name", "phone", "email", "note"].forEach(function (k) { f[k] = form.elements[k] ? form.elements[k].value.trim() : ""; });
    var err = $("#co-err");
    var say = function (m) { err.hidden = false; err.textContent = m; };
    if (!f.time) return say("Pick a pickup time.");
    if (!f.name) return say("Type your name.");
    if (f.phone.replace(/\D/g, "").length < 10) return say("Type your phone number with the area code.");
    state.busy = true; drawCart();
    var body = { date: f.date, time: f.time, name: f.name, phone: f.phone, email: f.email, note: f.note, website: form.elements.website.value, store: "delice",
      lines: state.cart.lines.map(function (l) { return { id: l.id, size: l.size, extras: l.extras, qty: l.qty, name: l.name }; }) };
    call("/api/order", { method: "POST", body: body }).then(function (r) {
      state.busy = false;
      state.done = r;
      state.cart = { lines: [] }; saveCart();
      try { localStorage.setItem("delice-order-me", JSON.stringify({ name: f.name, phone: f.phone, email: f.email })); } catch (e) { /* ignore */ }
      state.form = { name: f.name, phone: f.phone, email: f.email };
      state.step = "done"; drawCart(); drawMenu();
    }).catch(function (e) {
      state.busy = false;
      drawCart();
      var msg = $("#co-err");
      if (msg) { msg.hidden = false; msg.textContent = e.message; }
      if (e.data && e.data.times_changed) loadTimes();
    });
  }
  function doneView() {
    var r = state.done;
    return '<div class="sheet__inner done">' +
      '<div class="sheet__head"><div><span class="done__tick">' + ICON.check + '</span><h2 id="cart-title">Thank you, your order is in</h2><p class="sheet__desc">Order <b>' + esc(r.no) + "</b></p></div>" +
      '<button type="button" class="sheet__x" data-act="close" aria-label="Close">' + ICON.x + "</button></div>" +
      '<div class="done__when"><span>Pickup</span><b>' + esc(r.pickup.text) + "</b><span>" + esc(r.store.name) + ", " + esc(r.store.street) + ", " + esc(r.store.cityLine) + "</span></div>" +
      '<ul class="cart-lines cart-lines--done">' + r.items.map(function (i) { return '<li class="cl"><div class="cl__info"><b>' + i.qty + " × " + esc(i.name) + "</b>" + (i.opts ? "<span>" + esc(i.opts) + "</span>" : "") + '</div><span class="cl__price">' + money2(i.cents) + "</span></li>"; }).join("") + "</ul>" +
      '<div class="cart-total"><span>Total before tax · pay at pickup</span><b>' + money2(r.subtotal_cents) + "</b></div>" +
      '<p class="cart-pay">Please give your order number or your name at the counter. To change or cancel, call <a href="tel:+1' + esc(String(r.store.phone || phone()).replace(/\D/g, "").slice(-10)) + '">' + esc(r.store.phone || phone()) + "</a>.</p>" +
      '<div class="sheet__actions"><button type="button" class="btn ghost btn-block" data-act="new">Start a new order</button></div></div>';
  }

  /* ---------------------------------------------------------------- toast */
  var toastTimer;
  function toast(text, withCart) {
    var t = $("#order-toast");
    t.innerHTML = esc(text) + (withCart ? ' <button type="button" data-act="open-cart">See your order</button>' : "");
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 4200);
  }

  /* ---------------------------------------------------------------- events */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act");
    if (act === "retry") { $("#order-menu").innerHTML = '<p class="order-loading">Loading the menu…</p>'; load(); }
    if (act === "add") { var it = state.items[b.closest("[data-item]").getAttribute("data-item")]; if (it) quickAdd(it); }
    if (act === "open-cart") { $("#order-toast").hidden = true; openCart(); }
    if (!b.closest("#cart-sheet")) return;
    var sheet = $("#cart-sheet");
    var li = b.closest("[data-line]"), idx = li ? Number(li.getAttribute("data-line")) : -1;
    if (act === "close") sheet.close();
    if (act === "line-" && idx > -1) { var l = state.cart.lines[idx]; if (l.qty > 1) l.qty--; else state.cart.lines.splice(idx, 1); saveCart(); drawCart(); drawMenu(); }
    if (act === "line+" && idx > -1) { state.cart.lines[idx].qty = Math.min(99, state.cart.lines[idx].qty + 1); saveCart(); drawCart(); drawMenu(); }
    if (act === "remove" && idx > -1) { state.cart.lines.splice(idx, 1); saveCart(); drawCart(); drawMenu(); }
    if (act === "checkout") {
      try { var me = JSON.parse(localStorage.getItem("delice-order-me") || "null"); if (me) { state.form.name = state.form.name || me.name; state.form.phone = state.form.phone || me.phone; state.form.email = state.form.email || me.email; } } catch (er) { /* ignore */ }
      state.step = "checkout"; drawCart(); loadTimes();
    }
    if (act === "back") { state.step = "cart"; drawCart(); }
    if (act === "times") loadTimes();
    if (act === "new") { state.done = null; state.step = "cart"; sheet.close(); }
  });
  document.addEventListener("change", function (e) {
    var form = e.target.closest("#checkout");
    if (!form) return;
    if (e.target.name === "date") {
      ["name", "phone", "email", "note"].forEach(function (k) { state.form[k] = form.elements[k].value; });
      state.form.date = e.target.value; state.form.time = ""; drawCart();
      var tsel = $("#checkout select[name=time]"); if (tsel) tsel.focus();
    }
    if (e.target.name === "time") state.form.time = e.target.value;
  });
  document.addEventListener("submit", function (e) {
    if (e.target.id !== "checkout") return;
    e.preventDefault();
    if (!state.busy) submit(e.target);
  });
  var cartSheet = $("#cart-sheet");
  if (cartSheet) cartSheet.addEventListener("click", function (e) { if (e.target === cartSheet) cartSheet.close(); });
  var fab = $("#cart-fab");
  if (fab) fab.addEventListener("click", openCart);
  var qIn = $("#order-q");
  if (qIn) qIn.addEventListener("input", function () { state.q = qIn.value; if (state.menu) drawMenu(); });
  document.querySelectorAll('.order-top').forEach(function (a) {
    a.addEventListener("click", function (e) { if (count()) { e.preventDefault(); openCart(); } });
  });

  drawFab();
  load();
})();
