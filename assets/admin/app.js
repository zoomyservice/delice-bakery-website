/* Delice Bakery — admin panel
   Change prices, items, photos and holiday menus on every page, the home page holiday section, photo
   galleries, store hours, holiday closures and special hours, the announcement bar and contact details,
   then preview and publish. Every publish is kept in a history you can restore.

   It runs in two places:
   - On Cloudflare (data-mode="server"): real logins (owner and staff), changes go live on the website.
   - As admin.html in the website folder (data-mode="site"): on your own computer it is a test mode
     (log in with admin / 1234, or staff / 1234) that saves only in this browser. On a web server it links
     to the live panel. */
(() => {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const R = window.DeliceRender;
  const IS_SERVER = root.getAttribute('data-mode') === 'server';
  const IS_LOCAL = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const TEST_USERS = { admin: { pass: '1234', role: 'owner' }, staff: { pass: '1234', role: 'staff' } };
  const DAY = R.DAY;
  const WEEK = [0, 1, 2, 3, 4, 5, 6];
  const MAX_PHOTOS = 12;
  // Yom Tov days (outside Israel) when a Shabbat-observant bakery is usually closed. [from, to, name]
  const YOM_TOV = [["2026-04-02","2026-04-03","Passover (first days)"],["2026-04-08","2026-04-09","Passover (last days)"],["2026-05-22","2026-05-23","Shavuot"],["2026-09-12","2026-09-13","Rosh Hashanah"],["2026-09-21","2026-09-21","Yom Kippur"],["2026-09-26","2026-09-27","Sukkot"],["2026-10-03","2026-10-04","Shemini Atzeret & Simchat Torah"],["2027-04-22","2027-04-23","Passover (first days)"],["2027-04-28","2027-04-29","Passover (last days)"],["2027-06-11","2027-06-12","Shavuot"],["2027-10-02","2027-10-03","Rosh Hashanah"],["2027-10-11","2027-10-11","Yom Kippur"],["2027-10-16","2027-10-17","Sukkot"],["2027-10-23","2027-10-24","Shemini Atzeret & Simchat Torah"],["2028-04-11","2028-04-12","Passover (first days)"],["2028-04-17","2028-04-18","Passover (last days)"],["2028-05-31","2028-06-01","Shavuot"],["2028-09-21","2028-09-22","Rosh Hashanah"],["2028-09-30","2028-09-30","Yom Kippur"],["2028-10-05","2028-10-06","Sukkot"],["2028-10-12","2028-10-13","Shemini Atzeret & Simchat Torah"],["2029-03-31","2029-04-01","Passover (first days)"],["2029-04-06","2029-04-07","Passover (last days)"],["2029-05-20","2029-05-21","Shavuot"],["2029-09-10","2029-09-11","Rosh Hashanah"],["2029-09-19","2029-09-19","Yom Kippur"],["2029-09-24","2029-09-25","Sukkot"],["2029-10-01","2029-10-02","Shemini Atzeret & Simchat Torah"],["2030-04-18","2030-04-19","Passover (first days)"],["2030-04-24","2030-04-25","Passover (last days)"],["2030-06-07","2030-06-08","Shavuot"],["2030-09-28","2030-09-29","Rosh Hashanah"],["2030-10-07","2030-10-07","Yom Kippur"],["2030-10-12","2030-10-13","Sukkot"],["2030-10-19","2030-10-20","Shemini Atzeret & Simchat Torah"],["2031-04-08","2031-04-09","Passover (first days)"],["2031-04-14","2031-04-15","Passover (last days)"],["2031-05-28","2031-05-29","Shavuot"],["2031-09-18","2031-09-19","Rosh Hashanah"],["2031-09-27","2031-09-27","Yom Kippur"],["2031-10-02","2031-10-03","Sukkot"],["2031-10-09","2031-10-10","Shemini Atzeret & Simchat Torah"],["2032-03-27","2032-03-28","Passover (first days)"],["2032-04-02","2032-04-03","Passover (last days)"],["2032-05-16","2032-05-17","Shavuot"],["2032-09-06","2032-09-07","Rosh Hashanah"],["2032-09-15","2032-09-15","Yom Kippur"],["2032-09-20","2032-09-21","Sukkot"],["2032-09-27","2032-09-28","Shemini Atzeret & Simchat Torah"],["2033-04-14","2033-04-15","Passover (first days)"],["2033-04-20","2033-04-21","Passover (last days)"],["2033-06-03","2033-06-04","Shavuot"],["2033-09-24","2033-09-25","Rosh Hashanah"],["2033-10-03","2033-10-03","Yom Kippur"],["2033-10-08","2033-10-09","Sukkot"],["2033-10-15","2033-10-16","Shemini Atzeret & Simchat Torah"],["2034-04-04","2034-04-05","Passover (first days)"],["2034-04-10","2034-04-11","Passover (last days)"],["2034-05-24","2034-05-25","Shavuot"],["2034-09-14","2034-09-15","Rosh Hashanah"],["2034-09-23","2034-09-23","Yom Kippur"],["2034-09-28","2034-09-29","Sukkot"],["2034-10-05","2034-10-06","Shemini Atzeret & Simchat Torah"],["2035-04-24","2035-04-25","Passover (first days)"],["2035-04-30","2035-05-01","Passover (last days)"],["2035-06-13","2035-06-14","Shavuot"],["2035-10-04","2035-10-05","Rosh Hashanah"],["2035-10-13","2035-10-13","Yom Kippur"],["2035-10-18","2035-10-19","Sukkot"],["2035-10-25","2035-10-26","Shemini Atzeret & Simchat Torah"],["2036-04-12","2036-04-13","Passover (first days)"],["2036-04-18","2036-04-19","Passover (last days)"],["2036-06-01","2036-06-02","Shavuot"],["2036-09-22","2036-09-23","Rosh Hashanah"],["2036-10-01","2036-10-01","Yom Kippur"],["2036-10-06","2036-10-07","Sukkot"],["2036-10-13","2036-10-14","Shemini Atzeret & Simchat Torah"]];
  // Suggested text for the home page holiday section, per holiday page.
  const HOLIDAY_PRESETS = {
    'rosh-hashanah': { label: 'Rosh Hashanah', line1: 'HAPPY', line2: 'HOLIDAYS', line3: 'SHANA TOVA', wish: 'Wishing you and your family a wonderful new year filled with', wishBold: 'Peace, Blessings & Good Health.', eyebrow: 'Holiday menu', title: 'For your holiday table', lead: 'Challah gift boxes, honey cake and round holiday challahs — order by e-mail or phone and pick up at the bakery.', subject: 'Holiday order' },
    hanukah: { label: 'Hanukkah', line1: 'HAPPY', line2: 'HANUKKAH', line3: 'CHAG SAMEACH', wish: 'Wishing you eight bright nights filled with', wishBold: 'Light, Joy & Sweet Moments.', eyebrow: 'Hanukkah menu', title: 'Fancy donuts are here', lead: 'Filled donuts made fresh in our kitchen — e-mail us your order and pick up at the bakery.', subject: 'Hanukkah order' },
    purim: { label: 'Purim', line1: 'HAPPY', line2: 'PURIM', line3: 'PURIM SAMEACH', wish: 'Wishing you a joyful Purim filled with', wishBold: 'Laughter, Friends & Sweet Treats.', eyebrow: 'Purim menu', title: 'Mishloach manot gift boxes', lead: 'Gift boxes and hamantashen, ready to give — order by e-mail or phone.', subject: 'Purim order' },
    pesach: { label: 'Passover', line1: 'HAPPY', line2: 'PASSOVER', line3: 'CHAG KASHER VESAMEACH', wish: 'Wishing you and your family a Passover filled with', wishBold: 'Freedom, Family & Sweetness.', eyebrow: 'Passover menu', title: 'For your Seder table', lead: 'Cakes, mousse cakes, pies and cookies for Pesach — call or e-mail us to place your order.', subject: 'Passover order' },
    chavouot: { label: 'Shavuot', line1: 'HAPPY', line2: 'SHAVUOT', line3: 'CHAG SAMEACH', wish: 'Wishing you a sweet Shavuot filled with', wishBold: 'Blessings & Cheesecake.', eyebrow: 'Shavuot menu', title: 'Cheesecakes for Shavuot', lead: 'All dairy, Cholov Yisroel — e-mail us your order and pick up at the bakery.', subject: 'Shavuot order' },
    thanksgiving: { label: 'Thanksgiving', line1: 'HAPPY', line2: 'THANKSGIVING', line3: 'GIVE THANKS', wish: 'Wishing you a warm Thanksgiving filled with', wishBold: 'Family, Gratitude & Pie.', eyebrow: 'Thanksgiving menu', title: 'Pies for your table', lead: 'Pumpkin, apple and pecan pies, cupcakes and tarts — order by e-mail and pick up at the bakery.', subject: 'Thanksgiving order' },
  };
  const ROUNDING = [['cent', 'To the cent'], ['5', 'Nearest 5¢'], ['10', 'Nearest 10¢'], ['25', 'Nearest 25¢'], ['50', 'Nearest 50¢'], ['100', 'Nearest dollar'], ['95', 'End in .95'], ['99', 'End in .99']];

  /* ------------------------------------------------------------------ small helpers */
  const $ = (sel, el) => (el || doc).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || doc).querySelectorAll(sel));
  const esc = R.esc;
  const clone = R.clone;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  let uidCounter = 0;
  const uid = (p) => `${p || 'x'}-${++uidCounter}`;
  const plural = R.plural;
  const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const slugify = R.slugify;
  const today = () => R.laToday();

  function randomId(bytes) {
    const a = crypto.getRandomValues(new Uint8Array(bytes || 18));
    return btoa(String.fromCharCode.apply(null, a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fmtStamp(ms) {
    if (!ms) return '';
    return new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function fmtAgo(ms) {
    const s = Math.round((Date.now() - ms) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return plural(Math.round(s / 60), 'minute') + ' ago';
    if (s < 86400) return plural(Math.round(s / 3600), 'hour') + ' ago';
    return fmtStamp(ms);
  }
  const fmtDay = (iso) => R.fmtDate(iso, true);
  /* A price typed by a person: "4.5" -> "$4.50", "12 lb" stays as written. Empty stays empty. */
  const tidyPrice = (v) => R.normPrice(v);
  /* What goes in a price box (the box already shows a $): "$4.50" -> "4.50", "$2.40 – $2.99" -> "2.40 – 2.99". */
  function priceInputValue(p) {
    const s = String(p == null ? '' : p);
    if (R.isMoney(s)) return s.slice(1);
    const m = /^\$(\d+(?:\.\d\d)?) – \$(\d+(?:\.\d\d)?)$/.exec(s);
    return m ? `${m[1]} – ${m[2]}` : s;
  }
  /* A date, with the year when it isn't this year. */
  function fmtDateY(iso, long) {
    const y = iso.slice(0, 4);
    return R.fmtDate(iso, long) + (y !== today().slice(0, 4) ? `, ${y}` : '');
  }
  const priceOk = (v) => String(v || '').trim() !== '';
  /* Price boxes show a "$" in front of plain amounts; text like "1 lb · $19.50" or "Market price" goes without it. */
  const isBareAmount = (v) => /^\s*(\d+(\.\d*)?|\.\d+)(\s*[–-]\s*\$?(\d+(\.\d*)?|\.\d+))?\s*$/.test(String(v || ''));
  const moneyClass = (v) => `money${String(v || '').trim() && !isBareAmount(v) ? ' money--plain' : ''}`;
  function syncMoney(input) {
    const box = input && input.closest('.money');
    if (box) box.className = moneyClass(input.value);
    if (input && input.classList.contains('input--row')) input.classList.toggle('is-wide', input.value.length > 7);
  }

  const ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    trash: '<path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l.8 12.5h9.4L17.5 7M9.5 7V4.5h5V7"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    photo: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4.5 3.5 3 3-2.5L20 17"/>',
    external: '<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    tag: '<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.5"/>',
    home: '<path d="M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
    gallery: '<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5"/><rect x="13" y="13" width="7.5" height="7.5" rx="1.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    megaphone: '<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9a4 4 0 0 1 0 6"/>',
    history: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4M12 8v4l3 2"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    logout: '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
    percent: '<path d="M6 18L18 6"/><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/>',
    star: '<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>',
    video: '<rect x="3.5" y="6" width="12" height="12" rx="2"/><path d="M15.5 10.5l5-3v9l-5-3"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    menu: '<path d="M5 6h14M5 12h14M5 18h14"/>',
    undo: '<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    move: '<path d="M12 3.5v17M3.5 12h17"/><path d="M9.5 6L12 3.5 14.5 6M9.5 18l2.5 2.5 2.5-2.5M6 9.5L3.5 12 6 14.5M18 9.5l2.5 2.5-2.5 2.5"/>',
  };
  const icon = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    trySet(key, value) { try { store.set(key, value); return true; } catch (e) { return false; } },
    del(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } },
  };

  /* ------------------------------------------------------------------ toasts and dialogs */
  function toast(message, kind, action) {
    const region = $('.toasts');
    if (!region) return;
    // Only the latest change can be undone (an older Undo would also take back everything done since).
    if (action) $$('.toast', region).forEach((old) => { if (old.querySelector('button')) old.remove(); });
    const t = doc.createElement('div');
    t.className = `toast${kind ? ` toast--${kind}` : ''}`;
    t.innerHTML = `<span>${esc(message)}</span>`;
    if (action) {
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'btn btn--sm btn--light';
      b.textContent = action.label;
      b.addEventListener('click', () => { t.remove(); action.run(); });
      t.appendChild(b);
    }
    region.appendChild(t);
    setTimeout(() => { t.classList.add('is-leaving'); setTimeout(() => t.remove(), 300); }, action ? 9000 : kind === 'error' ? 7000 : 4200);
  }

  const dialogs = [];
  function setBackgroundInert() {
    const app = $('#app');
    const top = dialogs[dialogs.length - 1];
    [app].concat(dialogs.map((d) => d.box)).forEach((el) => {
      if (!el) return;
      const off = !!top && el !== top.box;
      if ('inert' in el) el.inert = off;
      if (off) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden');
    });
    doc.body.classList.toggle('has-dialog', dialogs.length > 0);
  }
  function openDialog(opts) {
    const id = uid('dlg');
    const box = doc.createElement('div');
    box.className = 'dlg-backdrop';
    box.innerHTML =
      `<div class="dlg${opts.size ? ` dlg--${opts.size}` : ''}" role="${opts.alert ? 'alertdialog' : 'dialog'}" aria-modal="true" aria-labelledby="${id}-title">` +
        '<form class="dlg__form" novalidate>' +
          `<header class="dlg__head"><h2 id="${id}-title" tabindex="-1">${esc(opts.title)}</h2>` +
          `<button type="button" class="icon-btn" data-dlg-close aria-label="Close">${icon('close')}</button></header>` +
          `<div class="dlg__body">${opts.body || ''}</div>` +
          `<footer class="dlg__foot">${opts.foot || ''}</footer>` +
        '</form></div>';
    doc.body.appendChild(box);
    const opener = doc.activeElement;
    let settled = false;
    const dlg = {
      box, id,
      form: $('form', box),
      body: $('.dlg__body', box),
      close(result) {
        if (settled) return;
        settled = true;
        const i = dialogs.indexOf(dlg);
        if (i > -1) dialogs.splice(i, 1);
        box.remove();
        setBackgroundInert();
        if (opts.onClose) opts.onClose(result);
        const back = opts.returnFocus || opener;
        if (back && back.isConnected && back.focus) back.focus();
      },
      async tryClose() {
        if (opts.confirmClose && opts.confirmClose()) {
          const ok = await ask({ title: 'Close without saving?', text: 'Your changes in this window will be lost.', ok: 'Close without saving', danger: true });
          if (!ok) return;
        }
        dlg.close(null);
      },
    };
    dialogs.push(dlg);
    setBackgroundInert();
    box.addEventListener('mousedown', (e) => { box._downOnBackdrop = e.target === box; });
    box.addEventListener('click', (e) => {
      if (e.target.closest('[data-dlg-close]')) { e.preventDefault(); dlg.tryClose(); }
      else if (e.target === box && box._downOnBackdrop && opts.closeOnBackdrop) dlg.tryClose();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); dlg.tryClose(); return; }
      if (e.key !== 'Tab') return;
      const f = $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]', box)
        .filter((el) => el.offsetParent !== null || el === doc.activeElement);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (doc.activeElement === first || !box.contains(doc.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    dlg.form.addEventListener('submit', (e) => { e.preventDefault(); if (opts.onSubmit) opts.onSubmit(dlg, e); });
    requestAnimationFrame(() => {
      const target = (opts.focus && $(opts.focus, box)) || $(`#${id}-title`, box);
      if (target) target.focus();
    });
    return dlg;
  }
  function ask(o) {
    return new Promise((resolve) => {
      openDialog({
        title: o.title, alert: true, size: 'sm', closeOnBackdrop: true,
        body: `<p>${esc(o.text || '')}</p>${o.html || ''}`,
        foot: `<button type="button" class="btn btn--quiet" data-dlg-close>${esc(o.cancel || 'Cancel')}</button>` +
          `<button type="submit" class="btn ${o.danger ? 'btn--danger' : 'btn--primary'}" data-ok>${esc(o.ok || 'OK')}</button>`,
        focus: '[data-ok]',
        onSubmit: (d) => d.close(true),
        onClose: (r) => resolve(r === true),
      });
    });
  }
  function fieldError(input, message) {
    if (!input) return;
    const field = input.closest('.field') || input.parentElement;
    let err = field.querySelector(':scope > .field__error');
    if (!message) {
      if (err) err.remove();
      input.removeAttribute('aria-invalid');
      const ids = (input.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && !x.endsWith('-err'));
      if (ids.length) input.setAttribute('aria-describedby', ids.join(' ')); else input.removeAttribute('aria-describedby');
      return;
    }
    if (!input.id) input.id = uid('in');
    if (!err) {
      err = doc.createElement('p');
      err.className = 'field__error';
      err.id = `${input.id}-err`;
      field.appendChild(err);
    }
    err.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    const ids = (input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (!ids.includes(err.id)) ids.push(err.id);
    input.setAttribute('aria-describedby', ids.join(' '));
  }
  function counter(id, value, max) {
    return `<p class="hint" id="${id}-count"><span data-count-for="${id}">${String(value || '').length}</span> of ${max} characters</p>`;
  }

  /* ------------------------------------------------------------------ backends */
  class ApiError extends Error {
    constructor(status, code, message, extra) {
      super(message);
      this.status = status;
      this.code = code;
      this.extra = extra || {};
    }
  }

  async function request(method, path, body, isForm) {
    const opts = { method, credentials: 'same-origin', cache: 'no-store', headers: { 'X-Delice-Admin': '1' } };
    if (body !== undefined) {
      if (isForm) opts.body = body;
      else { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    }
    let res;
    try { res = await fetch(path, opts); } catch (e) {
      throw new ApiError(0, 'offline', 'Can’t reach the server. Check your internet connection and try again.');
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* not JSON */ }
    if (!res.ok) {
      const d = data || {};
      throw new ApiError(res.status, d.error || 'error', d.message || `The server answered with an error (${res.status}).`, d);
    }
    return data;
  }

  const serverBackend = {
    kind: 'server',
    session: () => request('GET', '/api/session'),
    login: (username, password) => request('POST', '/api/login', { username, password }),
    logout: () => request('POST', '/api/logout', {}),
    logoutAll: () => request('POST', '/api/logout-all', {}),
    load: () => request('GET', '/api/data'),
    save: (d, baseVersion, note, force) => request('PUT', '/api/data', { doc: d, baseVersion, note, force: !!force }),
    history: async () => (await request('GET', '/api/history')).versions,
    getVersion: (v) => request('GET', `/api/history/${encodeURIComponent(v)}`),
    restore: (v) => request('POST', '/api/restore', { version: v }),
    activity: () => request('GET', '/api/activity'),
    upload(full, m) {
      const fd = new FormData();
      fd.append('full', full, 'photo');
      fd.append('m', m, 'medium');
      return request('POST', '/api/images', fd, true);
    },
    preview: (d) => request('POST', '/api/preview', { doc: d }),
    users: async () => (await request('GET', '/api/users')).users,
    saveUser: (name, password) => request('POST', '/api/users', { name, password }),
    deleteUser: (name) => request('DELETE', `/api/users/${encodeURIComponent(name)}`),
    changePassword: (current, next) => request('POST', '/api/password', { current, next }),
    imageUrl: (id, variant) => `/img/${encodeURIComponent(id)}${variant === 'm' ? '?v=m' : ''}`,
    preload: async () => {},
  };

  /* Test mode keeps everything in this browser: data in localStorage, photos in IndexedDB. */
  const TEST_KEY = 'delice-admin-test-v1';
  const TEST_SESSION = 'delice-admin-test-session';
  const TEST_LOCK = 'delice-admin-test-lock';
  const idb = {
    db: null,
    open() {
      if (this.db) return Promise.resolve(this.db);
      return new Promise((resolve, reject) => {
        let req;
        try { req = indexedDB.open('delice-admin-test', 1); } catch (e) { reject(e); return; }
        req.onupgradeneeded = () => req.result.createObjectStore('images');
        req.onsuccess = () => { this.db = req.result; resolve(this.db); };
        req.onerror = () => reject(req.error);
      });
    },
    async run(mode, fn) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('images', mode);
        const r = fn(tx.objectStore('images'));
        tx.oncomplete = () => resolve(r && 'result' in r ? r.result : undefined);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    },
    put(id, value) { return this.run('readwrite', (s) => s.put(value, id)); },
    get(id) { return this.run('readonly', (s) => s.get(id)); },
    clear() { return this.run('readwrite', (s) => s.clear()); },
  };

  async function siteSeed() {
    if (window.DELICE_SEED && window.DELICE_SEED.doc) return clone(window.DELICE_SEED);
    const res = await fetch('assets/data/site.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('The website data (assets/data/site.json) couldn’t be loaded.');
    return res.json();
  }

  const localBackend = {
    kind: 'local',
    urls: new Map(),
    data() { return store.get(TEST_KEY, null); },
    who() { try { return JSON.parse(sessionStorage.getItem(TEST_SESSION) || 'null'); } catch (e) { return null; } },
    async session() {
      const s = this.who();
      return { authenticated: !!s, user: s ? s.user : null, role: s ? s.role : null, siteUrl: '', setup: null };
    },
    async login(username, password) {
      const now = Date.now();
      const lock = store.get(TEST_LOCK, { fails: 0, until: 0 });
      if (lock.until > now) {
        throw new ApiError(429, 'locked', 'Too many wrong tries. Please wait and try again.', { retryAfter: Math.ceil((lock.until - now) / 1000) });
      }
      const name = String(username).trim().toLowerCase();
      const u = TEST_USERS[name];
      if (u && password === u.pass) {
        store.del(TEST_LOCK);
        try { sessionStorage.setItem(TEST_SESSION, JSON.stringify({ user: name, role: u.role })); } catch (e) { /* ignore */ }
        return { ok: true };
      }
      lock.fails = (lock.fails || 0) + 1;
      if (lock.fails >= 5) { lock.until = now + 30e3; lock.fails = 0; }
      store.trySet(TEST_LOCK, lock);
      if (lock.until > now) throw new ApiError(429, 'locked', 'Too many wrong tries. Please wait and try again.', { retryAfter: 30 });
      throw new ApiError(401, 'invalid', 'That username or passcode isn’t right.', { remaining: 5 - lock.fails });
    },
    async logout() {
      try { sessionStorage.removeItem(TEST_SESSION); } catch (e) { /* ignore */ }
      return { ok: true };
    },
    logoutAll() { return this.logout(); },
    async load() {
      const seed = await siteSeed();
      const d = this.data();
      if (!d || !d.doc) return { version: 0, savedAt: null, doc: seed.doc, original: seed.doc };
      return { version: d.version, savedAt: d.savedAt, doc: d.doc, original: seed.doc };
    },
    async save(docIn, base, note, force) {
      const d = this.data() || { version: 0, history: [] };
      if (d.version !== base && !force) {
        throw new ApiError(409, 'conflict', 'Changes were published in another tab after you opened this one.', { currentVersion: d.version });
      }
      const who = this.who() || {};
      const saved = R.normalizeDoc(clone(docIn), today());
      const problems = R.problemsIn(saved);
      if (problems.length) throw new ApiError(400, 'invalid', problems[0].message);
      if (who.role === 'staff') {
        const cur = d.doc || (await siteSeed()).doc;
        if (!staffOnlyChanged(cur, saved)) throw new ApiError(403, 'forbidden', 'Staff logins can only change sold out items, closed days and the announcement.');
      }
      const now = Date.now();
      const version = (d.version || 0) + 1;
      const history = [{ version, savedAt: now, note: note || '', by: who.user || '', doc: saved }].concat(d.history || []).slice(0, 8);
      const next = { version, savedAt: now, doc: saved, history, preview: d.preview !== false };
      try { store.set(TEST_KEY, next); } catch (e) {
        try { next.history = next.history.slice(0, 2); store.set(TEST_KEY, next); } catch (e2) {
          throw new ApiError(507, 'full', 'This browser’s storage for test mode is full. Reset the test data (Logins & security) and try again.');
        }
      }
      return { ok: true, version, savedAt: now, doc: saved };
    },
    async history() {
      const d = this.data();
      return d ? (d.history || []).map((h) => ({ version: h.version, savedAt: h.savedAt, note: h.note, by: h.by })) : [];
    },
    async getVersion(v) {
      const d = this.data();
      const h = d && (d.history || []).find((x) => x.version === Number(v));
      if (!h) throw new ApiError(404, 'not_found', 'That version isn’t in the history any more.');
      return clone(h);
    },
    async restore(v) {
      const h = await this.getVersion(v);
      const d = this.data();
      return this.save(h.doc, d ? d.version : 0, `Restored version ${v}`);
    },
    async activity() { return { events: [], sessions: [] }; },
    async upload(full, m) {
      const id = randomId(18);
      try { await idb.put(id, { full, m, at: Date.now() }); } catch (e) {
        throw new ApiError(0, 'storage', 'This browser won’t store photos for test mode (try Chrome). The live panel isn’t affected.');
      }
      this.urls.set(`${id}:full`, URL.createObjectURL(full));
      this.urls.set(`${id}:m`, URL.createObjectURL(m));
      return { ok: true, ref: `upload:${id}` };
    },
    async preview(d) {
      if (!store.trySet('delice-admin-preview', { at: Date.now(), doc: d })) {
        throw new ApiError(507, 'full', 'This browser’s storage for test mode is full.');
      }
      return { token: 'local' };
    },
    async users() { return [{ name: 'staff', role: 'staff', createdAt: null, test: true }]; },
    async saveUser() { throw new ApiError(400, 'test', 'Staff logins are managed in the live panel. In test mode, use staff / 1234.'); },
    async deleteUser() { throw new ApiError(400, 'test', 'Staff logins are managed in the live panel.'); },
    async changePassword() { throw new ApiError(400, 'test', 'Test mode always uses the passcode 1234. The live panel lets you change yours.'); },
    imageUrl(id, variant) { return this.urls.get(`${id}:${variant === 'm' ? 'm' : 'full'}`) || ''; },
    async preload(docs) {
      const ids = new Set();
      docs.filter(Boolean).forEach((d) => R.uploadIds(d).forEach((id) => ids.add(id)));
      for (const id of ids) {
        if (this.urls.has(`${id}:full`)) continue;
        try {
          const rec = await idb.get(id);
          if (rec) {
            this.urls.set(`${id}:full`, URL.createObjectURL(rec.full));
            this.urls.set(`${id}:m`, URL.createObjectURL(rec.m || rec.full));
          }
        } catch (e) { /* photos unavailable */ }
      }
    },
    async reset() {
      store.del(TEST_KEY);
      store.del('delice-admin-preview');
      try { await idb.clear(); } catch (e) { /* ignore */ }
    },
    previewOn() { const d = this.data(); return !d || d.preview !== false; },
    setPreview(on) {
      const d = this.data();
      if (d) { d.preview = !!on; store.trySet(TEST_KEY, d); }
    },
  };

  /* What a staff login may change: sold out (and sold out today), closed days / special hours, and the
     announcement. The server checks the same thing. */
  function staffView(d) {
    const x = clone(d);
    R.eachItem(x, (it) => { delete it.soldOut; delete it.soldOutUntil; });
    if (x.hours) delete x.hours.special;
    delete x.announcement;
    return JSON.stringify(x);
  }
  function staffOnlyChanged(before, after) {
    return staffView(R.normalizeDoc(clone(before), today())) === staffView(R.normalizeDoc(clone(after), today()));
  }

  /* ------------------------------------------------------------------ photos */
  async function decodeImage(file) {
    if ('createImageBitmap' in window) {
      try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { /* try the plain way */ }
      try { return await createImageBitmap(file); } catch (e) { /* fall back to <img> */ }
    }
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }
  function drawScaled(src, maxSide, flat) {
    const w0 = src.naturalWidth || src.width, h0 = src.naturalHeight || src.height;
    const scale = Math.min(1, maxSide / Math.max(w0, h0));
    const c = doc.createElement('canvas');
    c.width = Math.max(1, Math.round(w0 * scale));
    c.height = Math.max(1, Math.round(h0 * scale));
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    if (flat) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }
  function hasTransparency(canvas) {
    try {
      const d = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      const step = Math.max(4, Math.floor(d.length / 4 / 40000)) * 4;
      for (let i = 3; i < d.length; i += step) if (d[i] < 250) return true;
    } catch (e) { /* ignore */ }
    return false;
  }
  const toBlob = (canvas, type, q) => new Promise((resolve) => canvas.toBlob(resolve, type, q));
  let webpOk = null;
  async function canWebp() {
    if (webpOk === null) {
      const c = doc.createElement('canvas');
      c.width = c.height = 2;
      const b = await toBlob(c, 'image/webp', 0.8);
      webpOk = !!b && b.type === 'image/webp';
    }
    return webpOk;
  }
  async function encodePhoto(src, maxSide, maxBytes, alpha) {
    const webp = await canWebp();
    for (const side of [maxSide, Math.round(maxSide * 0.8), Math.round(maxSide * 0.6)]) {
      for (const q of [0.84, 0.76, 0.66]) {
        const canvas = drawScaled(src, side, !webp || !alpha);
        const b = await toBlob(canvas, webp ? 'image/webp' : 'image/jpeg', q);
        if (b && b.size <= maxBytes) return { blob: b, w: canvas.width, h: canvas.height, t: webp ? 'webp' : 'jpg' };
      }
    }
    return null;
  }
  /* Makes the two sizes the website uses: a large one (up to 1600 px) and a medium one (up to 800 px). */
  async function preparePhoto(file) {
    if (!file) throw new Error('Choose a photo first.');
    if (file.size > 40 * 1024 * 1024) throw new Error('That photo is over 40 MB. Please choose a smaller one.');
    let src;
    try { src = await decodeImage(file); } catch (e) {
      throw new Error('This photo couldn’t be opened. Use a JPG, PNG or WebP photo (on an iPhone, share it as “Most Compatible”).');
    }
    const alpha = /png|webp/i.test(file.type) && hasTransparency(drawScaled(src, 400, false));
    const full = await encodePhoto(src, 1600, 1600000, alpha);
    const m = await encodePhoto(src, 800, 420000, alpha);
    if (src.close) src.close();
    if (!full || !m) throw new Error('This photo couldn’t be made small enough. Try another one.');
    return { full: full.blob, m: m.blob, w: full.w, h: full.h, t: full.t, cut: alpha && full.t === 'webp' };
  }
  async function uploadPhoto(file, alt) {
    const p = await preparePhoto(file);
    const res = await state.backend.upload(p.full, p.m);
    const ref = { src: res.ref, w: p.w, h: p.h };
    if (p.t !== 'webp') ref.t = p.t;
    if (p.cut) ref.cut = true;
    if (alt) ref.alt = alt;
    return { ref, kb: Math.round((p.full.size + p.m.size) / 1024) };
  }
  function photoUrl(ref, variant) {
    if (!ref || !ref.src) return '';
    if (/^upload:/.test(ref.src)) return state.backend.imageUrl(ref.src.slice(7), variant);
    return `${state.assetBase}assets/img/${ref.src}${variant === 'm' ? '-m' : ''}.webp`;
  }
  function videoPoster(v) { return v && v.poster ? `${state.assetBase}assets/img/${v.poster}-m.webp` : ''; }

  /* Every photo already on the website (for "Choose from website photos"). */
  function photoLibrary() {
    const seen = new Map();
    const add = (p, where) => {
      if (!p || !p.src || p.video || seen.has(p.src)) return;
      seen.set(p.src, { ref: { src: p.src, w: p.w, h: p.h, t: p.t, cut: p.cut }, alt: p.alt || '', where });
    };
    [state.draft, state.original].filter(Boolean).forEach((d) => {
      R.eachItem(d, (it, sec) => (it.photos || []).forEach((p) => add(Object.assign({ alt: p.alt || it.name }, p), `${R.pageLabel(sec.page)} · ${it.name}`)));
      (d.galleries || []).forEach((g) => (g.items || []).forEach((p) => add(p, `Gallery · ${g.name}`)));
      if (d.home && d.home.banner && d.home.banner.img) add(d.home.banner.img, 'Home page banner');
    });
    return Array.from(seen.values());
  }
  function pickPhoto(opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      const lib = photoLibrary();
      let shown = 60;
      const body =
        `<div class="search">${icon('search')}<label class="sr-only" for="pk-find">Find a photo</label>` +
        '<input class="input" id="pk-find" type="search" placeholder="Find a photo (for example: challah)" autocomplete="off"></div>' +
        '<p class="hint" data-pk-count></p><ul class="picker" data-pk-list></ul>' +
        '<p><button type="button" class="btn btn--quiet btn--sm" data-act="more" hidden>Show more</button></p>';
      const dlg = openDialog({
        title: opts.title || 'Choose a photo from the website', size: 'lg', body, closeOnBackdrop: true,
        foot: '<button type="button" class="btn btn--quiet" data-dlg-close>Cancel</button>',
        focus: '#pk-find', onClose: (r) => resolve(r || null),
      });
      const draw = () => {
        const words = fold($('#pk-find', dlg.box).value).split(/\s+/).filter(Boolean);
        const hits = lib.filter((x) => words.every((w) => fold(`${x.alt} ${x.where}`).includes(w)));
        $('[data-pk-count]', dlg.box).textContent = `${plural(hits.length, 'photo')}${words.length ? ' match' : ''}.`;
        $('[data-pk-list]', dlg.box).innerHTML = hits.slice(0, shown).map((x) => {
          const i = lib.indexOf(x);
          return `<li><button type="button" class="picker__btn" data-pick="${i}" title="${esc(x.where)}">` +
            `<img src="${esc(photoUrl(x.ref, 'm'))}" alt="" loading="lazy"><span>${esc(x.alt || x.where)}</span></button></li>`;
        }).join('');
        $('[data-act="more"]', dlg.box).hidden = hits.length <= shown;
      };
      draw();
      dlg.box.addEventListener('input', (e) => { if (e.target.id === 'pk-find') { shown = 60; draw(); } });
      dlg.box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-pick]');
        if (b) { const x = lib[Number(b.getAttribute('data-pick'))]; dlg.close(Object.assign(clone(x.ref), x.alt ? { alt: x.alt } : {})); return; }
        if (e.target.closest('[data-act="more"]')) { shown += 60; draw(); }
      });
    });
  }

  /* ------------------------------------------------------------------ state */
  const state = {
    backend: null,
    user: '',
    role: 'owner',        // 'owner' or 'staff'
    siteUrl: '',          // the website (for links and previews)
    assetBase: '',        // where the website's photos are
    published: null,      // { version, savedAt, doc }
    original: null,       // the website's own files
    draft: null,
    tab: 'menu',
    search: '',
    filter: 'all',
    page: '',
    collapsed: {},
    openGalleries: {},
    lastGallery: '',      // the gallery last worked on (Preview opens its page)
    lastActivity: Date.now(),
  };
  const DRAFT_KEY = () => `delice-admin-draft-v1:${IS_SERVER ? location.host : 'test'}:${state.user || ''}`;
  const TABS = [
    ['menu', 'Menu & prices', 'tag'],
    ['home', 'Home page', 'home'],
    ['galleries', 'Photo galleries', 'gallery'],
    ['hours', 'Hours & holidays', 'clock'],
    ['info', 'Announcement & contact', 'megaphone'],
    ['history', 'History & backup', 'history'],
    ['security', 'Logins & security', 'lock'],
  ];
  const STAFF_TABS = ['menu', 'hours', 'info', 'security'];
  const isOwner = () => state.role !== 'staff';
  const tabsFor = () => TABS.filter(([k]) => isOwner() || STAFF_TABS.includes(k));

  function canon(v) {
    if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
    if (v && typeof v === 'object') {
      return `{${Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}`;
    }
    return JSON.stringify(v);
  }
  const normalized = (d) => R.normalizeDoc(clone(d), today());
  function isDirty() { return !!state.draft && !!state.published && canon(normalized(state.draft)) !== canon(normalized(state.published.doc)); }

  /* ------------------------------------------------------------------ draft bookkeeping */
  let saveTimer = null;
  function saveDraftNow() {
    if (!state.draft || !state.published) return;
    if (isDirty()) store.trySet(DRAFT_KEY(), { base: state.published.version, savedAt: Date.now(), doc: state.draft });
    else store.del(DRAFT_KEY());
  }
  function changed(opts) {
    state.lastActivity = Date.now();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraftNow, 350);
    if (opts && opts.rerender) renderTab(opts.focus);
    refreshStatus();
  }
  let statusTimer = 0;
  function refreshStatus(now) {
    clearTimeout(statusTimer);
    if (now) drawStatus(); else statusTimer = setTimeout(drawStatus, 160);
  }
  function drawStatus() {
    const el = $('[data-status]');
    if (!el || !state.published) return;
    const dirty = isDirty();
    $$('[data-act="publish"]').forEach((b) => { b.disabled = !dirty; b.classList.toggle('is-ready', dirty); });
    $$('[data-act="discard"]').forEach((b) => { b.hidden = !dirty; });
    root.classList.toggle('is-dirty', dirty);
    const text = (() => {
      if (dirty) {
        const n = R.describeChanges(normalized(state.published.doc), normalized(state.draft), today()).length || 1;
        return `<span class="dot dot--warn" aria-hidden="true"></span>${plural(n, 'change')} not published yet`;
      }
      if (state.published.version) return `<span class="dot dot--ok" aria-hidden="true"></span>Published · ${esc(fmtStamp(state.published.savedAt))}`;
      return '<span class="dot" aria-hidden="true"></span>No changes published yet';
    })();
    $$('[data-status]').forEach((s) => { s.innerHTML = text; });
  }
  window.addEventListener('beforeunload', (e) => {
    if (state.draft && isDirty()) { saveDraftNow(); e.preventDefault(); e.returnValue = ''; }
  });

  /* Undo for deletes and bulk changes. */
  function withUndo(message, snapshot) {
    toast(message, '', { label: 'Undo', run: () => { state.draft = snapshot; changed({ rerender: true }); toast('Undone.'); } });
  }

  /* ------------------------------------------------------------------ screens */
  const app = () => $('#app');
  const logoImg = () => `<img class="logo" src="${esc(state.assetBase)}assets/img/logo-light.png" width="120" height="62" alt="">`;
  const brandMark = () => '<span class="brandmark" aria-hidden="true">D</span>';

  function adminUrlFromSite() {
    let raw = '';
    try { raw = String((JSON.parse($('#delice-config') ? $('#delice-config').textContent : '{}') || {}).admin || ''); } catch (e) { raw = ''; }
    raw = raw.trim();
    if (!raw) return '';
    try {
      const u = new URL(raw);
      if (u.protocol !== 'https:' && !/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) return '';
      return `${u.origin}/`;
    } catch (e) { return ''; }
  }

  function renderLinkPage(liveUrl) {
    doc.title = 'Admin · Delice Bakery';
    app().innerHTML =
      `<main class="login" id="admin-main" tabindex="-1"><div class="card login__card">${brandMark()}` +
      '<h1>Delice Bakery admin</h1>' +
      (liveUrl
        ? '<p>The admin panel runs on its own secure address.</p>' +
          `<p><a class="btn btn--primary btn--block" href="${esc(liveUrl)}" rel="noopener">Open the admin panel</a></p>`
        : '<p>The admin panel isn’t connected to this website yet.</p>') +
      '<p class="muted small"><a href="index.html">Back to the website</a></p></div></main>';
  }

  function renderChooser(liveUrl) {
    app().innerHTML =
      `<main class="login" id="admin-main" tabindex="-1"><div class="card login__card">${brandMark()}` +
      '<h1>Delice Bakery admin</h1>' +
      '<p>This copy of the website is connected to the live admin panel.</p>' +
      `<p><a class="btn btn--primary btn--block" href="${esc(liveUrl)}" rel="noopener">Open the live admin panel</a></p>` +
      '<p><button type="button" class="btn btn--quiet btn--block" data-act="test-mode">Try test mode on this computer</button></p>' +
      '<p class="muted small">Test mode saves only in this browser and never changes the live website.</p></div></main>';
    $('[data-act="test-mode"]').addEventListener('click', () => startTestMode());
  }

  function renderLogin(info) {
    info = info || {};
    const test = state.backend.kind === 'local';
    doc.title = 'Log in · Delice Bakery admin';
    const setupMsg = info.setup === 'weak'
      ? 'The passcode set on Cloudflare is too weak, so logins are turned off. Set a passcode with at least 12 characters, then reload this page.'
      : info.setup === 'missing'
        ? 'No passcode has been set yet, so logins are turned off. Double-click “Set admin passcode” in the admin-panel folder, then reload this page.'
        : '';
    app().innerHTML =
      '<main class="login" id="admin-main" tabindex="-1">' +
      `<form class="card login__card" novalidate autocomplete="on">${brandMark()}` +
      '<h1 tabindex="-1">Delice Bakery admin</h1>' +
      (test ? '<div class="note note--test"><strong>Test mode.</strong> Log in as <code>admin</code> or <code>staff</code> with the passcode <code>1234</code>. Changes are saved only in this browser and show on this copy of the website.</div>' : '') +
      (setupMsg ? `<div class="note note--warn" role="alert">${esc(setupMsg)}</div>` : '') +
      '<div class="field"><label for="lg-user">Username</label>' +
        '<input class="input" id="lg-user" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required maxlength="100"></div>' +
      '<div class="field"><label for="lg-pass">Passcode</label><div class="pass">' +
        '<input class="input" id="lg-pass" name="password" type="password" autocomplete="current-password" required maxlength="200">' +
        '<button type="button" class="btn btn--quiet btn--sm" data-act="toggle-pass" aria-pressed="false" aria-controls="lg-pass">Show</button></div></div>' +
      '<p class="form-error" data-login-error role="alert" hidden></p>' +
      `<button class="btn btn--primary btn--block" type="submit"${setupMsg ? ' disabled' : ''}>Log in</button>` +
      (test ? '' : '<p class="muted small">Too many wrong tries lock the login for a while (devices that logged in before aren’t affected by other people’s tries). Forgot your passcode? The owner can give staff a new one in Logins &amp; security; the owner’s own passcode is reset by whoever manages the website.</p>') +
      (info.message ? `<p class="note">${esc(info.message)}</p>` : '') +
      '</form></main>';
    const form = $('form', app());
    const user = $('#lg-user'), pass = $('#lg-pass'), err = $('[data-login-error]');
    $('[data-act="toggle-pass"]').addEventListener('click', (e) => {
      const show = pass.type === 'password';
      pass.type = show ? 'text' : 'password';
      e.currentTarget.textContent = show ? 'Hide' : 'Show';
      e.currentTarget.setAttribute('aria-pressed', String(show));
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.hidden = true;
      fieldError(user, user.value.trim() ? '' : 'Enter your username.');
      fieldError(pass, pass.value ? '' : 'Enter your passcode.');
      if (!user.value.trim()) { user.focus(); return; }
      if (!pass.value) { pass.focus(); return; }
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.textContent = 'Logging in…';
      try {
        await state.backend.login(user.value, pass.value);
        pass.value = '';
        const s = await state.backend.session();
        state.user = s.user || user.value.trim().toLowerCase();
        state.role = s.role || 'owner';
        if (s.siteUrl) setSite(s.siteUrl);
        await startApp();
      } catch (ex) {
        let msg = ex.message;
        if (ex.code === 'locked' && ex.extra.retryAfter) {
          const mins = Math.ceil(ex.extra.retryAfter / 60);
          msg = ex.extra.retryAfter < 60 ? `Too many wrong tries. Try again in ${ex.extra.retryAfter} seconds.` : `Too many wrong tries. Try again in ${plural(mins, 'minute')}.`;
          if (ex.extra.known === false) msg += ' A device you’ve logged in with before can still log in.';
        } else if (ex.code === 'invalid' && ex.extra.remaining != null && ex.extra.remaining <= 2) {
          msg += ` ${plural(ex.extra.remaining, 'try', 'tries')} left before the login locks for a while.`;
        }
        err.textContent = msg;
        err.hidden = false;
        btn.disabled = false;
        btn.textContent = 'Log in';
        pass.select();
        pass.focus();
      }
    });
    (info.setup ? $('h1', form) : user).focus();
  }

  function setSite(url) {
    state.siteUrl = url || '';
    state.assetBase = url ? url.replace(/\/?$/, '/') : '';
  }
  function siteLink(page) { return `${state.siteUrl ? state.siteUrl.replace(/\/?$/, '/') : ''}${page || 'index'}.html`; }

  async function startApp() {
    const loaded = await state.backend.load();
    state.published = { version: loaded.version, savedAt: loaded.savedAt, doc: normalized(loaded.doc) };
    state.original = loaded.original ? normalized(loaded.original) : clone(state.published.doc);
    state.draft = clone(state.published.doc);
    await state.backend.preload([loaded.doc]);
    let restoredNote = '';
    const saved = store.get(DRAFT_KEY(), null);
    if (saved && saved.doc) {
      if (canon(normalized(saved.doc)) !== canon(state.published.doc)) {
        state.draft = normalized(saved.doc);
        await state.backend.preload([saved.doc]);
        restoredNote = saved.base === loaded.version
          ? 'We brought back changes you hadn’t published yet.'
          : 'We brought back changes you hadn’t published. The website was updated since then, so check them before publishing.';
      } else store.del(DRAFT_KEY());
    }
    if (!tabsFor().some(([k]) => k === state.tab)) state.tab = 'menu';
    renderShell();
    if (restoredNote) {
      const n = $('[data-restored]');
      n.hidden = false;
      $('[data-restored-text]', n).textContent = restoredNote;
    }
    keepAlive();
  }

  function renderShell() {
    const test = state.backend.kind === 'local';
    doc.title = 'Delice Bakery admin';
    const who = `${esc(state.user)}${isOwner() ? '' : ' · staff'}`;
    app().innerHTML =
      '<div class="shell">' +
      '<header class="topbar">' +
        `<a class="topbar__brand" href="${esc(siteLink('index'))}" target="_blank" rel="noopener" title="Open the website">${logoImg()}<span><small>${test ? 'Admin · test mode' : 'Admin'}</small><small class="topbar__who">${icon('user')}${who}</small></span></a>` +
        '<p class="topbar__status" data-status role="status" aria-live="polite"></p>' +
        '<div class="topbar__actions">' +
          '<button type="button" class="btn btn--ghost" data-act="discard" hidden>Discard</button>' +
          `<button type="button" class="btn btn--ghost" data-act="preview">${icon('eye')}Preview</button>` +
          '<button type="button" class="btn btn--primary" data-act="publish" disabled>Publish changes</button>' +
          `<button type="button" class="icon-btn icon-btn--light" data-act="logout" aria-label="Log out" title="Log out">${icon('logout')}</button>` +
        '</div>' +
      '</header>' +
      (test ? `<div class="banner banner--test"><span><strong>Test mode:</strong> changes are saved in this browser only and show on this copy of the website (<a href="${esc(siteLink('index'))}" target="_blank" rel="noopener">open it</a> after publishing). The live website isn’t affected.</span></div>` : '') +
      (isOwner() ? '' : '<div class="banner banner--info"><span>You’re logged in as staff: you can mark items sold out, add closed days and holiday hours, and change the announcement.</span></div>') +
      '<div class="banner banner--info" data-restored hidden><span data-restored-text></span> <button type="button" class="btn btn--quiet btn--sm" data-act="drop-restored">Discard them</button></div>' +
      '<div class="layout">' +
        '<nav class="sidenav" aria-label="Admin sections"><ul>' +
          tabsFor().map(([key, label, ic]) => `<li><button type="button" data-tab="${key}">${icon(ic)}<span>${esc(label)}</span></button></li>`).join('') +
        '</ul>' +
        `<a class="sidenav__site" href="${esc(siteLink('index'))}" target="_blank" rel="noopener">${icon('external')}<span>View website</span></a></nav>` +
        '<main class="main" id="admin-main" tabindex="-1"></main>' +
      '</div>' +
      '<div class="pubbar"><p class="pubbar__status" data-status aria-hidden="true"></p>' +
        '<button type="button" class="btn btn--primary" data-act="publish" disabled>Publish</button></div>' +
      '</div>';
    const shell = $('.shell');
    shell.addEventListener('click', onShellClick);
    renderTab();
    refreshStatus();
  }

  async function onShellClick(e) {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn && tabBtn.closest('.sidenav')) {
      state.tab = tabBtn.getAttribute('data-tab');
      renderTab();
      $('#admin-main').focus({ preventScroll: true });
      window.scrollTo(0, 0);
      return;
    }
    const act = e.target.closest('[data-act]');
    if (!act || !(act.closest('.topbar') || act.closest('.banner') || act.closest('.pubbar'))) return;
    const name = act.getAttribute('data-act');
    if (name === 'publish') publish();
    else if (name === 'preview') openPreview();
    else if (name === 'discard') {
      const ok = await ask({ title: 'Discard your changes?', text: 'Everything you changed since the last publish will be undone.', ok: 'Discard changes', danger: true });
      if (!ok) return;
      state.draft = clone(state.published.doc);
      store.del(DRAFT_KEY());
      $('[data-restored]').hidden = true;
      changed({ rerender: true });
      toast('Changes discarded.');
    } else if (name === 'drop-restored') {
      state.draft = clone(state.published.doc);
      store.del(DRAFT_KEY());
      $('[data-restored]').hidden = true;
      changed({ rerender: true });
      toast('Changes discarded.');
    } else if (name === 'logout') {
      if (isDirty()) {
        const ok = await ask({ title: 'Log out?', text: 'Your unpublished changes stay saved in this browser, and come back when you log in here again.', ok: 'Log out' });
        if (!ok) return;
        saveDraftNow();
      }
      try { await state.backend.logout(); } catch (ex) { /* ignore */ }
      state.draft = null;
      clearInterval(aliveTimer);
      renderLogin({ message: 'You’re logged out.' });
    }
  }

  function renderTab(focusSel) {
    const main = $('#admin-main');
    if (!main) return;
    $$('.sidenav [data-tab]').forEach((b) => {
      if (b.getAttribute('data-tab') === state.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    const views = { menu: viewMenu, home: viewHome, galleries: viewGalleries, hours: viewHours, info: viewInfo, history: viewHistory, security: viewSecurity };
    const scrollY = window.scrollY;
    main.innerHTML = '';
    (views[state.tab] || viewMenu)(main);
    if (focusSel) {
      window.scrollTo(0, scrollY);
      const el = typeof focusSel === 'string' ? $(focusSel, main) : null;
      if (el) el.focus({ preventScroll: false });
    }
  }

  function goTo(go) {
    if (!go) return;
    state.tab = go.tab;
    if (go.tab === 'menu') {
      state.search = '';
      state.filter = 'all';
      state.page = '';
      if (go.sec) state.collapsed[go.sec] = false;
    }
    if (go.tab === 'galleries' && go.gallery) state.openGalleries[go.gallery] = true;
    renderTab();
    requestAnimationFrame(() => {
      let el = null;
      if (go.tab === 'menu' && go.item) el = $(`[data-row="${go.sec}/${go.item}"] [data-act="edit-item"]`);
      else if (go.tab === 'menu' && go.sec) el = $(`[data-sec="${go.sec}"] h3`);
      else if (go.tab === 'galleries' && go.gallery != null) el = $(`[data-gal="${go.gallery}"] [data-gi="${go.index}"] input`) || $(`[data-gal="${go.gallery}"] h2`);
      else if (go.sel) el = $(`#admin-main ${go.sel}`);
      el = el || $('#admin-main h1');
      if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); }
    });
  }

  /* ------------------------------------------------------------------ preview */
  async function openPreview(page, query) {
    const win = window.open('about:blank', '_blank');
    try {
      const d = normalized(state.draft);
      const res = await state.backend.preview(d);
      let target = page, q = query || '';
      if (!target) [target, q] = previewPageFor();
      const qs = q ? `${q}&` : '';
      const url = state.backend.kind === 'local' ? new URL(`${target}.html?${qs}preview=local`, location.href).href : `${siteLink(target)}?${qs}preview=${encodeURIComponent(res.token)}`;
      if (win) { win.opener = null; win.location.href = url; } else window.open(url, '_blank', 'noopener');
      toast('Preview opened in a new tab. Nothing is published until you press Publish.');
    } catch (ex) {
      if (win) win.close();
      if (ex.code === 'signed_out') handleSaveError(ex); else toast(`The preview couldn’t be made: ${ex.message}`, 'error');
    }
  }
  /* The page (and address query) the Preview button opens for the tab in use. */
  function previewPageFor() {
    if (state.tab === 'home') return ['index', ''];
    if (state.tab === 'hours') return ['contact', ''];
    if (state.tab === 'menu' && state.page) return [state.page, ''];
    if (state.tab === 'galleries' && state.lastGallery) {
      const g = state.draft.galleries.find((x) => x.id === state.lastGallery && !x.removed);
      if (g && g.custom && g.page === 'own') return ['gallery', `g=${encodeURIComponent(g.id)}`];
      if (g) return [g.page, ''];
    }
    return ['index', ''];
  }

  /* ------------------------------------------------------------------ publishing */
  async function publish(force) {
    // Checked and saved as a tidied copy: the open view keeps working on the draft itself.
    const draft = normalized(state.draft);
    const problems = R.problemsIn(draft);
    if (problems.length) {
      const dlg = openDialog({
        title: 'Fix these before publishing', size: 'md', alert: true,
        body: `<p>${plural(problems.length, 'thing needs', 'things need')} a quick fix:</p><ul class="problems">` +
          problems.slice(0, 12).map((p, i) => `<li><span>${esc(p.message)}</span> <button type="button" class="btn btn--quiet btn--sm" data-problem="${i}">Show</button></li>`).join('') +
          '</ul>',
        foot: '<button type="button" class="btn btn--primary" data-dlg-close>OK</button>',
      });
      dlg.body.addEventListener('click', (e) => {
        const b = e.target.closest('[data-problem]');
        if (!b) return;
        dlg.close();
        goTo(problems[Number(b.getAttribute('data-problem'))].go);
      });
      return;
    }
    const lines = R.describeChanges(normalized(state.published.doc), draft, today());
    openDialog({
      title: force ? 'Publish your version?' : 'Publish these changes?', size: 'md',
      body: (lines.length
        ? `<ul class="change-list">${lines.slice(0, 16).map((l) => `<li>${esc(l)}</li>`).join('')}${lines.length > 16 ? `<li>…and ${lines.length - 16} more</li>` : ''}</ul>`
        : '<p>Save the current version.</p>') +
        '<div class="field"><label for="pub-note">Note for the history <span class="muted">(optional)</span></label>' +
        '<input class="input" id="pub-note" maxlength="140" placeholder="For example: new holiday prices"></div>' +
        `<p class="muted small">${state.backend.kind === 'local' ? 'Your copy of the website shows the changes when you reload it.' : 'The website shows the changes right away. Refresh any page that’s already open.'}</p>`,
      foot: '<button type="button" class="btn btn--quiet" data-dlg-close>Cancel</button><button type="submit" class="btn btn--primary" data-ok>Publish</button>',
      focus: '#pub-note',
      onSubmit: async (d) => {
        const btn = $('[data-ok]', d.box);
        btn.disabled = true;
        btn.textContent = 'Publishing…';
        try {
          const res = await state.backend.save(draft, state.published.version, $('#pub-note', d.box).value.trim(), force);
          state.published = { version: res.version, savedAt: res.savedAt, doc: normalized(res.doc) };
          state.draft = clone(state.published.doc);
          store.del(DRAFT_KEY());
          const r = $('[data-restored]');
          if (r) r.hidden = true;
          d.close(true);
          changed({ rerender: true });
          refreshStatus(true);
          toast(state.backend.kind === 'local' ? 'Published to your test copy.' : 'Published! It’s on the website now. Refresh the page to see it.', 'ok');
        } catch (ex) {
          d.close(false);
          handleSaveError(ex);
        }
      },
    });
  }

  async function handleSaveError(ex) {
    if (ex.code === 'signed_out') {
      saveDraftNow();
      toast('Your login ended. Log in again; your changes are kept.', 'error');
      renderLogin({ message: 'Your login ended. Log in again to publish. Your changes are kept in this browser.' });
      return;
    }
    if (ex.code === 'conflict') {
      const choice = await new Promise((resolve) => {
        const d = openDialog({
          title: 'The website changed while you were editing', size: 'md', alert: true,
          body: '<p>Someone published other changes after you opened the panel.</p>' +
            '<p><strong>Publish mine</strong> replaces their changes with your version. <strong>Load theirs</strong> discards your unpublished changes.</p>',
          foot: '<button type="button" class="btn btn--quiet" data-dlg-close>Cancel</button>' +
            '<button type="button" class="btn btn--quiet" data-choice="theirs">Load theirs</button>' +
            '<button type="button" class="btn btn--primary" data-choice="mine">Publish mine</button>',
          onClose: (r) => resolve(r),
        });
        d.box.addEventListener('click', (e) => {
          const b = e.target.closest('[data-choice]');
          if (b) d.close(b.getAttribute('data-choice'));
        });
      });
      if (choice === 'mine') publish(true);
      else if (choice === 'theirs') {
        const loaded = await state.backend.load();
        state.published = { version: loaded.version, savedAt: loaded.savedAt, doc: normalized(loaded.doc) };
        state.draft = clone(state.published.doc);
        await state.backend.preload([loaded.doc]);
        store.del(DRAFT_KEY());
        changed({ rerender: true });
        toast('Loaded the latest published version.');
      }
      return;
    }
    toast(`Not published: ${ex.message}`, 'error');
  }

  /* Keep the login alive while someone is actively editing (the server ends idle logins after an hour). */
  let aliveTimer = null;
  function keepAlive() {
    clearInterval(aliveTimer);
    if (state.backend.kind !== 'server') return;
    aliveTimer = setInterval(async () => {
      if (Date.now() - state.lastActivity > 10 * 60e3) return;
      try {
        const s = await state.backend.session();
        if (!s.authenticated && state.draft) {
          saveDraftNow();
          clearInterval(aliveTimer);
          renderLogin({ message: 'Your login ended. Log in again to keep going. Your changes are kept in this browser.' });
        }
      } catch (e) { /* offline: try again later */ }
    }, 4 * 60e3);
  }
  ['input', 'change', 'click', 'keydown'].forEach((t) => doc.addEventListener(t, () => { state.lastActivity = Date.now(); }, { passive: true, capture: true }));

  /* ------------------------------------------------------------------ menu & prices */
  const KINDS = R.KINDS;
  const hasPhotos = (sec) => ['cards', 'promos', 'boxes', 'spotlight', 'menu', 'flavors'].includes(sec.kind);
  const isGrouped = (sec) => Array.isArray(sec.groups);
  const singleGroup = (sec, g) => sec.kind === 'drinks' && g && (g.id === 'blended' || g.id === 'shakes');
  const fixedItems = (sec, g) => sec.kind === 'feature' || singleGroup(sec, g);
  const listOf = (sec, gi) => (isGrouped(sec) ? sec.groups[gi].items : sec.items);
  const secById = (id) => R.findSection(state.draft, id);
  function findRow(ref) {
    const [sid, iid] = String(ref).split('/');
    const sec = secById(sid);
    if (!sec) return null;
    if (isGrouped(sec)) {
      for (let gi = 0; gi < sec.groups.length; gi++) {
        const ii = sec.groups[gi].items.findIndex((x) => x.id === iid);
        if (ii > -1) return { sec, gi, ii, it: sec.groups[gi].items[ii], list: sec.groups[gi].items, g: sec.groups[gi] };
      }
      return null;
    }
    const ii = sec.items.findIndex((x) => x.id === iid);
    return ii > -1 ? { sec, gi: 0, ii, it: sec.items[ii], list: sec.items, g: null } : null;
  }
  function uniqueItemId(sec, name, except) {
    const used = new Set(R.itemsOf(sec).filter((x) => x !== except).map((x) => x.id));
    const base = slugify(name);
    let s = base, n = 2;
    while (used.has(s)) s = `${base}-${n++}`;
    return s;
  }
  function availOf(it) {
    if (it.hidden) return 'hidden';
    if (R.isSoldOut(it, today())) return it.soldOutUntil ? 'today' : 'soldout';
    return 'on';
  }
  function setAvail(it, v) {
    delete it.hidden; delete it.soldOut; delete it.soldOutUntil;
    if (v === 'hidden') it.hidden = true;
    else if (v === 'soldout') it.soldOut = true;
    else if (v === 'today') { it.soldOut = true; it.soldOutUntil = R.addDays(today(), 1); }
  }
  const AVAIL_LABEL = { on: 'Available', today: 'Sold out today', soldout: 'Sold out', hidden: 'Hidden' };
  function availSelect(it, id, label) {
    const cur = availOf(it);
    const opts = ['on', 'today', 'soldout'].concat(isOwner() || cur === 'hidden' ? ['hidden'] : []);
    return `<label class="sr-only" for="${id}">Availability of ${esc(label)}</label>` +
      `<select class="input input--sm avail avail--${cur}" id="${id}" data-field="avail"${!isOwner() && cur === 'hidden' ? ' disabled' : ''}>` +
      opts.map((k) => `<option value="${k}"${k === cur ? ' selected' : ''}>${AVAIL_LABEL[k]}</option>`).join('') + '</select>';
  }
  function priceSummary(it) {
    const ps = it.prices || [];
    if (!ps.length) return 'No price';
    if (ps.length === 1) return `${ps[0].label ? `${ps[0].label} ` : ''}${ps[0].price || 'no price'}`;
    const vals = ps.map((p) => R.priceValue(p.price)).filter((v) => v != null);
    return vals.length ? `${plural(ps.length, 'size')} · from ${R.fmtMoney(Math.min.apply(null, vals))}` : plural(ps.length, 'size');
  }
  const isSinglePrice = (it) => (it.prices || []).length === 1;
  function onHome(sec, it) { return (state.draft.home.cards || []).includes(`${sec.id}/${it.id}`); }

  function rowHTML(it, sec, gi, ii, len, g) {
    const ref = `${sec.id}/${it.id}`;
    const rid = `r-${sec.id}-${it.id}`;
    const name = it.name || 'Untitled item';
    const ph = (it.photos || [])[0];
    const thumb = ph ? photoUrl(ph, 'm') : '';
    const av = availOf(it);
    const badges = [];
    if (av === 'today') badges.push(['warn', 'Sold out today']);
    else if (av === 'soldout') badges.push(['warn', 'Sold out']);
    if (av === 'hidden') badges.push(['muted', 'Hidden']);
    if (onHome(sec, it)) badges.push(['gold', 'On home page']);
    (it.tags || []).forEach((t) => badges.push(['', t]));
    if ((it.photos || []).length > 1) badges.push(['', plural(it.photos.length, 'photo')]);
    const search = fold([it.name, it.desc, it.kicker, it.opts, (it.prices || []).map((p) => p.label).join(' '), sec.name, g ? g.title : ''].join(' '));
    const flags = [av === 'today' || av === 'soldout' ? 'soldout' : '', av === 'hidden' ? 'hidden' : '', hasPhotos(sec) && !ph ? 'nophoto' : ''].join(' ');
    const movable = isOwner() && !fixedItems(sec, g);
    const pv = isSinglePrice(it) ? priceInputValue(it.prices[0].price) : '';
    const price = isOwner() && isSinglePrice(it)
      ? (it.prices[0].label ? `<span class="row__plabel">${esc(it.prices[0].label)}</span>` : '') +
        `<label class="sr-only" for="${rid}-price">Price of ${esc(name)}${it.prices[0].label ? ` (${esc(it.prices[0].label)})` : ''}</label><span class="${moneyClass(pv)}"><input class="input input--price input--row${pv.length > 7 ? ' is-wide' : ''}" id="${rid}-price" data-field="price" autocomplete="off" value="${esc(pv)}"></span>`
      : isOwner() ? `<button type="button" class="link-btn" data-act="edit-item">${esc(priceSummary(it))}<span class="sr-only">, edit ${esc(name)}</span></button>`
        : `<span class="muted">${esc(priceSummary(it))}</span>`;
    return `<li class="row${av === 'hidden' ? ' is-hidden' : ''}${av === 'today' || av === 'soldout' ? ' is-soldout' : ''}" data-row="${esc(ref)}" data-gi="${gi}" data-ii="${ii}" data-search="${esc(search)}" data-flags="${flags}">` +
      (hasPhotos(sec) ? `<span class="row__img">${thumb ? `<img src="${esc(thumb)}" alt="" width="56" height="56" loading="lazy">` : icon('photo')}</span>` : '<span class="row__img row__img--none" aria-hidden="true"></span>') +
      '<div class="row__main">' +
        (isOwner() ? `<button type="button" class="row__name" data-act="edit-item" id="${rid}-name">${esc(name)}<span class="sr-only"> (edit)</span></button>` : `<span class="row__name row__name--plain">${esc(name)}</span>`) +
        (badges.length ? `<ul class="badges">${badges.map(([k, t]) => `<li class="badge${k ? ` badge--${k}` : ''}">${esc(t)}</li>`).join('')}</ul>` : '') +
      '</div>' +
      '<div class="row__ctl">' +
        `<div class="row__price">${price}</div>` +
        `<div class="row__avail">${availSelect(it, `${rid}-av`, name)}</div>` +
      '</div>' +
      '<div class="row__tools">' + (movable
        ? `<button type="button" class="icon-btn" data-act="item-up" aria-label="Move ${esc(name)} up"${ii === 0 ? ' disabled' : ''}>${icon('up')}</button>` +
          `<button type="button" class="icon-btn" data-act="item-down" aria-label="Move ${esc(name)} down"${ii === len - 1 ? ' disabled' : ''}>${icon('down')}</button>` +
          `<button type="button" class="icon-btn icon-btn--danger" data-act="del-item" aria-label="Delete ${esc(name)}">${icon('trash')}</button>`
        : '') + '</div></li>';
  }

  function secHTML(sec) {
    const collapsed = !!state.collapsed[sec.id];
    const bodyId = `sec-body-${sec.id}`;
    const n = R.itemsOf(sec).length;
    const meta = [KINDS[sec.kind] ? KINDS[sec.kind].label : sec.kind, plural(n, 'item')];
    if (isGrouped(sec) && sec.kind === 'menu') meta.push(plural(sec.groups.length, 'section'));
    const canAdd = isOwner() && !isGrouped(sec) && !fixedItems(sec, null);
    const groupBlock = (g, gi) => `<div class="sec" data-grp="${gi}">` +
      `<h4 class="sec__title">${esc(g.title || 'Untitled section')}${sec.kind === 'drinks' && (g.cols || []).filter(Boolean).length ? ` <span class="muted small">(${esc(g.cols.join(' / '))})</span>` : ''}</h4>` +
      (g.items.length ? `<ul class="rows">${g.items.map((it, ii) => rowHTML(it, sec, gi, ii, g.items.length, g)).join('')}</ul>` : '<p class="muted small sec__empty">No items yet.</p>') +
      (isOwner() && !singleGroup(sec, g) ? `<button type="button" class="btn btn--quiet btn--sm add-here" data-act="add-here">${icon('plus')}Add to ${esc(g.title)}</button>` : '') +
      '</div>';
    return `<section class="cat card" data-sec="${esc(sec.id)}" aria-labelledby="sec-title-${esc(sec.id)}">` +
      '<header class="cat__head">' +
        `<button type="button" class="cat__toggle" data-act="toggle-sec" aria-expanded="${!collapsed}" aria-controls="${bodyId}">` +
          `<svg class="i chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg><span class="sr-only">Show or hide ${esc(sec.name)}</span></button>` +
        `<h3 id="sec-title-${esc(sec.id)}" tabindex="-1">${esc(sec.name)}</h3>` +
        `<span class="cat__meta">${esc(meta.join(' · '))}</span>` +
        '<div class="cat__tools">' +
          (canAdd ? `<button type="button" class="btn btn--quiet btn--sm" data-act="add-item">${icon('plus')}Add item</button>` : '') +
          (isOwner() && sec.kind === 'menu' ? `<button type="button" class="btn btn--quiet btn--sm" data-act="edit-groups">${icon('menu')}Sections</button>` : '') +
          (isOwner() ? `<button type="button" class="btn btn--quiet btn--sm" data-act="bulk">${icon('percent')}Change prices</button>` : '') +
        '</div></header>' +
      `<div class="cat__body" id="${bodyId}"${collapsed ? ' hidden' : ''}>` +
        (isGrouped(sec) ? sec.groups.map(groupBlock).join('') + (sec.kind === 'menu' && isOwner() ? '' : '')
          : (sec.items.length ? `<ul class="rows">${sec.items.map((it, ii) => rowHTML(it, sec, 0, ii, sec.items.length, null)).join('')}</ul>` : '<p class="muted small sec__empty">No items yet.</p>')) +
      '</div></section>';
  }

  function menuPages() {
    const d = state.draft;
    const pages = [];
    R.PAGES.forEach(([slug, label]) => {
      const secs = d.sections.filter((s) => s.page === slug);
      if (secs.length) pages.push({ slug, label, secs });
    });
    return pages;
  }

  function viewMenu(main) {
    const d = state.draft;
    let items = 0, so = 0, hid = 0;
    R.eachItem(d, (it) => { items++; if (R.isSoldOut(it, today())) so++; if (it.hidden) hid++; });
    const pages = menuPages();
    const view = doc.createElement('div');
    view.className = 'view view--menu';
    view.innerHTML =
      '<div class="view__head"><div><h1 tabindex="-1">Menu & prices</h1>' +
        `<p class="muted">${plural(items, 'item')} on ${plural(pages.length, 'page')}${so ? ` · ${so} sold out` : ''}${hid ? ` · ${hid} hidden` : ''}. ` +
        (isOwner() ? 'Change a price right in the list, or select an item’s name to edit everything (photos, sizes, description).' : 'Use each item’s menu to mark it sold out — just for today, or until you change it back.') + '</p></div></div>' +
      '<div class="toolbar">' +
        `<div class="search">${icon('search')}<label class="sr-only" for="menu-find">Find an item</label>` +
          `<input class="input" id="menu-find" type="search" placeholder="Find an item" autocomplete="off" value="${esc(state.search)}"></div>` +
        '<label class="sr-only" for="menu-page">Page</label><select class="input input--auto" id="menu-page"><option value="">All pages</option>' +
          pages.map((p) => `<option value="${p.slug}"${state.page === p.slug ? ' selected' : ''}>${esc(p.label)}</option>`).join('') + '</select>' +
        '<div class="chips" role="group" aria-label="Filter items">' +
          [['all', 'All'], ['soldout', 'Sold out'], ['hidden', 'Hidden'], ['nophoto', 'No photo']]
            .map(([k, l]) => `<button type="button" class="chip" data-filter="${k}" aria-pressed="${state.filter === k}">${l}</button>`).join('') +
        '</div>' +
        '<div class="toolbar__end"><button type="button" class="btn btn--quiet btn--sm" data-act="expand-all">Expand all</button>' +
          '<button type="button" class="btn btn--quiet btn--sm" data-act="collapse-all">Collapse all</button></div>' +
      '</div>' +
      '<p class="sr-only" data-find-status aria-live="polite"></p>' +
      pages.map((p) => `<section class="pagegrp" data-page="${p.slug}" aria-labelledby="pg-${p.slug}">` +
        `<header class="pagegrp__head"><h2 id="pg-${p.slug}">${esc(p.label)}</h2>` +
        `<a class="link-btn small" href="${esc(siteLink(p.slug))}" target="_blank" rel="noopener">View page${icon('external')}<span class="sr-only"> (opens in a new tab)</span></a>` +
        (isOwner() ? `<button type="button" class="link-btn small" data-act="preview-page" data-page="${p.slug}">Preview changes${icon('eye')}</button>` : '') + '</header>' +
        p.secs.map(secHTML).join('') + '</section>').join('') +
      '<p class="empty" data-find-empty hidden>No items match. <button type="button" class="link-btn" data-act="clear-find">Show all items</button></p>';
    main.appendChild(view);
    applyMenuFilter(view);

    view.addEventListener('input', (e) => {
      const t = e.target;
      if (t.id === 'menu-find') { state.search = t.value; applyMenuFilter(view, true); return; }
      if (t.getAttribute('data-field') === 'price') {
        const f = findRow(t.closest('[data-row]').getAttribute('data-row'));
        if (!f) return;
        f.it.prices[0].price = t.value;
        syncMoney(t);
        fieldError(t, priceOk(t.value) ? '' : 'Enter a price, like 4.50');
        changed();
      }
    });
    view.addEventListener('focusout', (e) => {
      const t = e.target;
      if (t.getAttribute('data-field') !== 'price') return;
      const f = findRow(t.closest('[data-row]').getAttribute('data-row'));
      if (!f || !priceOk(t.value)) return;
      const tidy = tidyPrice(t.value);
      if (tidy !== f.it.prices[0].price) { f.it.prices[0].price = tidy; changed(); }
      if (priceInputValue(tidy) !== t.value) { t.value = priceInputValue(tidy); syncMoney(t); }
    });
    view.addEventListener('change', (e) => {
      const t = e.target;
      if (t.id === 'menu-page') { state.page = t.value; applyMenuFilter(view, true); return; }
      if (t.getAttribute('data-field') !== 'avail') return;
      const li = t.closest('[data-row]');
      const f = findRow(li.getAttribute('data-row'));
      if (!f) return;
      setAvail(f.it, t.value);
      replaceRow(li, '[data-field="avail"]');
      changed();
      const msg = { on: 'available again', today: 'sold out for today (back on tomorrow automatically)', soldout: 'sold out until you change it', hidden: 'hidden from the website' }[t.value];
      toast(`${f.it.name}: ${msg}. Publish to update the website.`);
    });
    view.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.getAttribute('data-field') === 'price') { e.preventDefault(); e.target.blur(); }
    });
    view.addEventListener('click', async (e) => {
      const chip = e.target.closest('[data-filter]');
      if (chip) {
        state.filter = chip.getAttribute('data-filter');
        $$('[data-filter]', view).forEach((b) => b.setAttribute('aria-pressed', String(b === chip)));
        applyMenuFilter(view, true);
        return;
      }
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      const secEl = btn.closest('[data-sec]');
      const sec = secEl ? secById(secEl.getAttribute('data-sec')) : null;
      const rowEl = btn.closest('[data-row]');
      const f = rowEl ? findRow(rowEl.getAttribute('data-row')) : null;
      if (act === 'toggle-sec') {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        state.collapsed[sec.id] = !open;
        btn.setAttribute('aria-expanded', String(open));
        $('.cat__body', secEl).hidden = !open;
      } else if (act === 'expand-all' || act === 'collapse-all') {
        d.sections.forEach((x) => { state.collapsed[x.id] = act === 'collapse-all'; });
        renderTab(`[data-act="${act}"]`);
      } else if (act === 'clear-find') {
        state.search = ''; state.filter = 'all'; state.page = '';
        renderTab('#menu-find');
      } else if (act === 'preview-page') openPreview(btn.getAttribute('data-page'));
      else if (act === 'edit-item' && f) openItemEditor(f);
      else if (act === 'add-item') openItemEditor(null, { sec, gi: 0 });
      else if (act === 'add-here') openItemEditor(null, { sec, gi: Number(btn.closest('[data-grp]').getAttribute('data-grp')) });
      else if (act === 'edit-groups') openGroupsEditor(sec);
      else if (act === 'bulk') openBulkPrices(sec);
      else if ((act === 'item-up' || act === 'item-down') && f) {
        const to = act === 'item-up' ? f.ii - 1 : f.ii + 1;
        if (to < 0 || to >= f.list.length) return;
        [f.list[f.ii], f.list[to]] = [f.list[to], f.list[f.ii]];
        const edge = act === 'item-up' ? to === 0 : to === f.list.length - 1;
        const keep = edge ? (act === 'item-up' ? 'item-down' : 'item-up') : act;
        changed({ rerender: true, focus: `[data-row="${f.sec.id}/${f.it.id}"] [data-act="${keep}"]` });
      } else if (act === 'del-item' && f) deleteItem(f);
    });
  }

  async function deleteItem(f, dlg) {
    const homeRef = `${f.sec.id}/${f.it.id}`;
    const onHomePage = (state.draft.home.cards || []).includes(homeRef);
    const ok = await ask({
      title: `Delete “${f.it.name}”?`, ok: 'Delete item', danger: true,
      text: `It will be removed from the website when you publish.${onHomePage ? ' It’s also taken off the home page.' : ''}`,
    });
    if (!ok) return false;
    const snap = clone(state.draft);
    f.list.splice(f.ii, 1);
    if (onHomePage) state.draft.home.cards = state.draft.home.cards.filter((r) => r !== homeRef);
    if (dlg) dlg.close(true);
    const next = f.list.length ? `[data-row="${f.sec.id}/${f.list[Math.min(f.ii, f.list.length - 1)].id}"] [data-act="edit-item"]` : `[data-sec="${f.sec.id}"] h3`;
    changed({ rerender: true, focus: next });
    withUndo(`Deleted “${f.it.name}”.`, snap);
    return true;
  }

  function replaceRow(li, focusSel) {
    const f = findRow(li.getAttribute('data-row'));
    if (!f) return;
    const tmp = doc.createElement('ul');
    tmp.innerHTML = rowHTML(f.it, f.sec, f.gi, f.ii, f.list.length, f.g);
    const fresh = tmp.firstElementChild;
    li.replaceWith(fresh);
    if (focusSel) { const el = $(focusSel, fresh); if (el) el.focus(); }
    const view = fresh.closest('.view');
    if (view) applyMenuFilter(view);
  }

  function applyMenuFilter(view, announce) {
    const words = fold(state.search.trim()).split(/\s+/).filter(Boolean);
    const filter = state.filter;
    const active = words.length > 0 || filter !== 'all';
    let shown = 0;
    $$('.pagegrp', view).forEach((pg) => { pg.hidden = !!state.page && pg.getAttribute('data-page') !== state.page; });
    $$('.row', view).forEach((li) => {
      const hay = li.getAttribute('data-search');
      const flags = li.getAttribute('data-flags').split(' ');
      const ok = words.every((w) => hay.includes(w)) && (filter === 'all' || flags.includes(filter));
      li.hidden = !ok;
      if (ok && !li.closest('.pagegrp').hidden) shown++;
    });
    $$('.sec', view).forEach((s) => {
      const any = $$('.row', s).some((li) => !li.hidden);
      s.hidden = active && !any;
      const add = $('.add-here', s);
      if (add) add.hidden = active;
    });
    $$('.cat', view).forEach((c) => {
      const any = $$('.row', c).some((li) => !li.hidden);
      c.hidden = active && !any;
      const body = $('.cat__body', c);
      body.hidden = active ? false : !!state.collapsed[c.getAttribute('data-sec')];
      $('.cat__toggle', c).setAttribute('aria-expanded', String(!body.hidden));
    });
    $$('.pagegrp', view).forEach((pg) => { if (active && !pg.hidden) pg.hidden = !$$('.cat', pg).some((c) => !c.hidden); });
    $('[data-find-empty]', view).hidden = !active || shown > 0;
    if (announce) $('[data-find-status]', view).textContent = active || state.page ? `${plural(shown, 'item')} shown` : 'Showing all items';
  }

  /* ---------- café menu sections (add, rename, reorder) ---------- */
  function openGroupsEditor(sec) {
    let groups = sec.groups.map((g, i) => ({ title: g.title, id: g.id, from: i, count: g.items.length }));
    const body = '<p class="muted">The café menu is split into sections (each one is also a button at the top of the menu page).</p><div data-groups></div>' +
      '<p class="form-error" data-editor-error role="alert" hidden></p>';
    const snapshot = () => canon(groups);
    let initial = null;
    const dlg = openDialog({
      title: `Sections of “${sec.name}”`, size: 'md', body,
      foot: '<button type="button" class="btn btn--quiet" data-dlg-close>Cancel</button><button type="submit" class="btn btn--primary">Save sections</button>',
      confirmClose: () => initial !== null && initial !== snapshot(),
      onSubmit: () => save(),
    });
    const box = dlg.box;
    function draw(focus) {
      $('[data-groups]', box).innerHTML = '<ul class="sec-list">' + groups.map((g, i) =>
        `<li data-i="${i}"><label class="sr-only" for="ge-${i}">Section ${i + 1} name</label>` +
        `<input class="input" id="ge-${i}" maxlength="60" value="${esc(g.title)}" placeholder="Section name">` +
        `<span class="muted small nowrap">${plural(g.count, 'item')}</span>` +
        `<button type="button" class="icon-btn" data-act="g-up" aria-label="Move section ${i + 1} up"${i === 0 ? ' disabled' : ''}>${icon('up')}</button>` +
        `<button type="button" class="icon-btn" data-act="g-down" aria-label="Move section ${i + 1} down"${i === groups.length - 1 ? ' disabled' : ''}>${icon('down')}</button>` +
        `<button type="button" class="icon-btn icon-btn--danger" data-act="g-del" aria-label="Remove section ${i + 1}"${g.count || groups.length === 1 ? ' disabled' : ''}>${icon('trash')}</button></li>`).join('') + '</ul>' +
        `<button type="button" class="btn btn--quiet btn--sm" data-act="g-add">${icon('plus')}Add section</button>` +
        '<p class="hint">A section can be removed once it has no items (move items with each item’s Section setting).</p>';
      if (focus) { const el = $(focus, box); if (el) el.focus(); }
    }
    draw();
    initial = snapshot();
    box.addEventListener('input', (e) => {
      const li = e.target.closest('.sec-list li');
      if (li) groups[Number(li.getAttribute('data-i'))].title = e.target.value;
      if (e.target.getAttribute('aria-invalid')) fieldError(e.target, '');
    });
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.getAttribute('data-act');
      const li = b.closest('.sec-list li');
      const i = li ? Number(li.getAttribute('data-i')) : -1;
      if (act === 'g-add') { groups.push({ title: '', id: '', from: null, count: 0 }); draw(`#ge-${groups.length - 1}`); }
      else if (act === 'g-del') { groups.splice(i, 1); draw('[data-act="g-add"]'); }
      else if (act === 'g-up' || act === 'g-down') {
        const to = act === 'g-up' ? i - 1 : i + 1;
        [groups[i], groups[to]] = [groups[to], groups[i]];
        draw(`li[data-i="${to}"] input`);
      }
    });
    function save() {
      const err = $('[data-editor-error]', box);
      err.hidden = true;
      const bad = [];
      const seen = new Set();
      groups.forEach((g, i) => {
        const el = $(`#ge-${i}`, box);
        const t = g.title.trim();
        if (!t) { fieldError(el, 'Name this section.'); bad.push(el); }
        else if (seen.has(t.toLowerCase())) { fieldError(el, 'Two sections have this name.'); bad.push(el); }
        seen.add(t.toLowerCase());
      });
      if (bad.length) { err.textContent = 'Please fix the highlighted fields.'; err.hidden = false; bad[0].focus(); return; }
      const ids = new Set();
      sec.groups = groups.map((g) => {
        let id = g.id || slugify(g.title);
        let n = 2;
        const base = id;
        while (ids.has(id)) id = `${base}-${n++}`;
        ids.add(id);
        return { id, title: g.title.trim(), items: g.from != null ? sec.groups[g.from].items : [] };
      });
      dlg.close(true);
      changed({ rerender: true, focus: `[data-sec="${sec.id}"] h3` });
      toast('Sections saved. Publish when you’re ready.', 'ok');
    }
  }

  /* ---------- change many prices at once ---------- */
  function roundPrice(v, how) {
    if (how === 'cent') return Math.round(v * 100) / 100;
    if (how === '95' || how === '99') {
      const end = Number(how) / 100;
      const a = Math.floor(v) + end, b = Math.floor(v) - 1 + end;
      return Math.abs(a - v) <= Math.abs(v - b) ? a : Math.max(end, b);
    }
    const step = Number(how);
    return Math.max(step, Math.round((v * 100) / step) * step) / 100;
  }
  function openBulkPrices(sec) {
    const rows = [];
    const collect = () => {
      rows.length = 0;
      R.itemsOf(sec).forEach((it) => (it.prices || []).forEach((p, pi) => { if (R.isMoney(p.price)) rows.push({ it, pi, p }); }));
    };
    collect();
    if (!rows.length) { toast(`“${sec.name}” has no prices to change.`); return; }
    const body =
      `<p class="muted">Change every price in “${esc(sec.name)}” by the same percentage. Prices written as text (like “12 lb”) aren’t touched.</p>` +
      '<div class="grid-3">' +
        '<div class="field"><label for="bp-dir">Change</label><select class="input" id="bp-dir"><option value="up">Raise prices</option><option value="down">Lower prices</option></select></div>' +
        '<div class="field"><label for="bp-pct">By (%)</label><input class="input input--num" id="bp-pct" type="number" min="0" max="100" step="0.5" value="5" inputmode="decimal"></div>' +
        `<div class="field"><label for="bp-round">Round</label><select class="input" id="bp-round">${ROUNDING.map(([k, l]) => `<option value="${k}"${k === '5' ? ' selected' : ''}>${l}</option>`).join('')}</select></div>` +
      '</div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Item</th><th scope="col">Now</th><th scope="col">New</th></tr></thead><tbody data-bp-rows></tbody></table></div>';
    const dlg = openDialog({
      title: `Change prices · ${sec.name}`, size: 'md', body,
      foot: '<button type="button" class="btn btn--quiet" data-dlg-close>Cancel</button><button type="submit" class="btn btn--primary" data-ok>Apply</button>',
      focus: '#bp-pct', onSubmit: () => apply(),
    });
    const box = dlg.box;
    const calc = () => {
      const pct = Number($('#bp-pct', box).value);
      if (!(pct >= 0 && pct <= 100)) return null;
      const k = ($('#bp-dir', box).value === 'down' ? -1 : 1) * pct / 100;
      const how = $('#bp-round', box).value;
      return rows.map((r) => {
        const old = R.priceValue(r.p.price);
        const n = roundPrice(old * (1 + k), how);
        return { r, old, next: R.fmtMoney(n, /\./.test(r.p.price) || Math.round(n * 100) % 100 !== 0) };
      });
    };
    const draw = () => {
      const out = calc();
      $('[data-ok]', box).disabled = !out;
      if (!out) { $('[data-bp-rows]', box).innerHTML = '<tr><td colspan="3">Enter a percentage from 0 to 100.</td></tr>'; return; }
      $('[data-bp-rows]', box).innerHTML = out.map((x) => `<tr${x.next === x.r.p.price ? ' class="muted"' : ''}><td>${esc(x.r.it.name)}${x.r.p.label ? ` <span class="muted">(${esc(x.r.p.label)})</span>` : ''}</td><td>${esc(x.r.p.price)}</td><td><strong>${esc(x.next)}</strong></td></tr>`).join('');
      const n = out.filter((x) => x.next !== x.r.p.price).length;
      $('[data-ok]', box).textContent = n ? `Apply to ${plural(n, 'price')}` : 'No change';
      $('[data-ok]', box).disabled = !n;
    };
    draw();
    box.addEventListener('input', draw);
    box.addEventListener('change', draw);
    function apply() {
      const out = calc();
      if (!out) return;
      const snap = clone(state.draft);
      let n = 0;
      out.forEach((x) => { if (x.next !== x.r.p.price) { x.r.it.prices[x.r.pi].price = x.next; n++; } });
      dlg.close(true);
      changed({ rerender: true, focus: `[data-sec="${sec.id}"] h3` });
      withUndo(`Changed ${plural(n, 'price')} in “${sec.name}”. Publish when you’re ready.`, snap);
    }
  }

  /* ---------- item editor ---------- */
  const FIELD_LABELS = {
    kicker: ['Small label above the name', 'e.g. Holiday gift'],
    ribbon: ['Ribbon on the photo', 'e.g. New!'],
    note: ['Note under the price', 'e.g. Available in 4 sizes'],
    extra: ['Add-on line', 'e.g. Add smoked salmon +$2.50'],
    opts: ['Flavors or options', 'e.g. Marble, Chocolate, Plain'],
    size: ['Size', 'e.g. 9 in.'],
  };
  function findOriginalItem(secId, itemId) {
    const f = state.original ? R.findItem(state.original, `${secId}/${itemId}`) : null;
    return f ? f.item : null;
  }
  /* The preview frame shows the item exactly as the website draws it, using the website's own styles. */
  function previewCtx() {
    const b = state.backend;
    return {
      today: today(), assetBase: state.assetBase,
      upload: (id, v) => b.imageUrl(id, v === 'm' ? 'm' : 'full'),
    };
  }
  function previewDoc(inner, wide) {
    const css = `${state.assetBase}assets/css/site.css`;
    const own = IS_SERVER ? '/preview.css' : 'assets/admin/preview.css';
    return '<!doctype html><html><head><meta charset="utf-8">' +
      `<link rel="stylesheet" href="${esc(css)}"><link rel="stylesheet" href="${esc(own)}"></head>` +
      `<body class="pv${wide ? ' pv--wide' : ''}"><div class="pv__in">${inner}</div></body></html>`;
  }
  function fitFrame(frame) {
    const fit = () => {
      try {
        const d = frame.contentDocument;
        if (d && d.body) frame.style.height = `${Math.min(2400, Math.max(120, d.documentElement.scrollHeight))}px`;
      } catch (e) { /* ignore */ }
    };
    fit();
    try {
      $$('img', frame.contentDocument).forEach((im) => { if (!im.complete) im.addEventListener('load', fit, { once: true }); });
      if (frame.contentDocument.fonts) frame.contentDocument.fonts.ready.then(fit);
    } catch (e) { /* ignore */ }
    [300, 1000, 2500].forEach((ms) => setTimeout(fit, ms));
  }

  function openItemEditor(f, where) {
    const d = state.draft;
    const isNew = !f;
    const sec = isNew ? where.sec : f.sec;
    let gi = isNew ? (where.gi || 0) : f.gi;
    const kind = sec.kind;
    const fields = (KINDS[kind] || KINDS.cards).fields;
    const group = isGrouped(sec) ? sec.groups[gi] : null;
    const src = isNew ? { id: '', name: '', prices: [{ label: '', price: '' }] } : f.it;
    const work = clone(src);
    const noPrice = !work.prices || !work.prices.length;
    if (noPrice) work.prices = [{ label: '', price: '' }];
    const orig = isNew ? null : findOriginalItem(sec.id, src.id);
    const multiPhoto = fields.includes('photos');
    const anyPhoto = multiPhoto || fields.includes('photo');
    const hasPrices = fields.includes('prices');
    let photos = clone(work.photos || []);
    const cols = kind === 'drinks' && group ? (group.cols || ['']) : null;
    const showPills = fields.includes('pills') && (kind !== 'drinks' || singleGroup(sec, group)) && (kind !== 'feature' || (work.pills || []).length);
    const showNote = fields.includes('note') && (kind !== 'feature' || work.note);
    const homeable = R.HOLIDAY_PAGES.includes(sec.page) && ['cards', 'promos', 'boxes', 'spotlight'].includes(kind);
    const ref0 = isNew ? '' : `${sec.id}/${src.id}`;
    const wasOnHome = !isNew && (d.home.cards || []).includes(ref0);
    let sizes = work.prices.map((p) => ({ label: p.label || '', price: priceInputValue(p.price) }));
    const multi = cols ? cols.length > 1 : !(sizes.length === 1 && !sizes[0].label);
    const av = availOf(work);
    const text = (k, max, rows) => {
      const [label, ph] = FIELD_LABELS[k] || [k, ''];
      const v = work[k] || '';
      return `<div class="field"><label for="ie-${k}">${label}</label>` + (rows
        ? `<textarea class="input" id="ie-${k}" rows="${rows}" maxlength="${max}" placeholder="${esc(ph)}">${esc(v)}</textarea>`
        : `<input class="input" id="ie-${k}" maxlength="${max}" placeholder="${esc(ph)}" value="${esc(v)}">`) + '</div>';
    };
    const L = R.LIMITS;
    const body =
      '<div class="editor"><div class="editor__main">' +
        (fields.includes('kicker') ? text('kicker', L.kicker) : '') +
        `<div class="field"><label for="ie-name">Name <span class="req" aria-hidden="true">*</span></label><input class="input" id="ie-name" maxlength="${L.name}" required value="${esc(work.name)}"></div>` +
        (fields.includes('desc') ? `<div class="field"><label for="ie-desc">Description</label><textarea class="input" id="ie-desc" rows="3" maxlength="${L.desc}" aria-describedby="ie-desc-count">${esc(work.desc || '')}</textarea>${counter('ie-desc', work.desc, L.desc)}</div>` : '') +
        (fields.includes('opts') ? text('opts', L.opts) : '') +
        (fields.includes('size') ? text('size', L.size) : '') +
        (hasPrices ? '<fieldset class="field"><legend>Price</legend>' +
          (cols ? '' : '<div class="seg">' +
            `<label><input type="radio" name="ie-pricing" value="one"${!noPrice && !multi ? ' checked' : ''}><span>One price</span></label>` +
            `<label><input type="radio" name="ie-pricing" value="sizes"${!noPrice && multi ? ' checked' : ''}><span>Different sizes</span></label>` +
            `<label><input type="radio" name="ie-pricing" value="none"${noPrice ? ' checked' : ''}><span>No price</span></label></div>`) +
          '<div class="field" data-one-price><label for="ie-price" class="sr-only">Price</label>' +
            `<span class="${moneyClass(multi ? '' : sizes[0].price)}"><input class="input input--price" id="ie-price" autocomplete="off" value="${esc(multi ? '' : sizes[0].price)}" placeholder="0.00"></span>` +
            '<p class="hint">Type an amount like 4.50, a range like 2.40 – 2.99, or text like “Market price”.</p></div>' +
          '<div data-sizes><table class="sizes"><thead><tr><th scope="col">Size</th><th scope="col">Price</th><th scope="col"><span class="sr-only">Move or remove</span></th></tr></thead><tbody data-size-rows></tbody></table>' +
            (cols ? '' : `<button type="button" class="btn btn--quiet btn--sm" data-act="add-size">${icon('plus')}Add size</button>`) + '</div>' +
        '</fieldset>' : '') +
        (showNote ? text('note', L.note) : '') +
        (fields.includes('extra') ? text('extra', L.extra) : '') +
        (showPills ? `<div class="field"><label for="ie-pills">${kind === 'boxes' ? 'What’s inside' : 'Flavors'} <span class="muted">(one per line)</span></label>` +
          `<textarea class="input" id="ie-pills" rows="4">${esc((work.pills || []).join('\n'))}</textarea></div>` : '') +
        (fields.includes('ribbon') ? text('ribbon', L.ribbon) : '') +
        (fields.includes('tags') ? '<fieldset class="field"><legend>Labels</legend><div class="checks checks--row">' +
          R.TAG_PRESETS.map((t) => `<label class="check"><input type="checkbox" name="ie-tag" value="${esc(t)}"${(work.tags || []).includes(t) ? ' checked' : ''}><span>${esc(t)}</span></label>`).join('') +
          `</div><div class="field field--gap"><label for="ie-tag-more">Other label <span class="muted">(optional)</span></label><input class="input" id="ie-tag-more" maxlength="${L.tag}" value="${esc((work.tags || []).filter((t) => !R.TAG_PRESETS.includes(t)).join(', '))}"></div></fieldset>` : '') +
      '</div><div class="editor__side">' +
        (anyPhoto ? `<div class="field"><span class="label">${multiPhoto ? 'Photos' : 'Photo'}</span><div class="photo-mgr" data-photos></div>` +
          '<div class="btn-row">' +
            `<label class="btn btn--quiet btn--sm file-btn">${icon('upload')}<span>Upload</span>` +
              `<input type="file" class="sr-only" data-photo-input${multiPhoto ? ' multiple' : ''} accept="image/jpeg,image/png,image/webp,image/heic,image/heif" aria-describedby="ie-photo-status"></label>` +
            `<button type="button" class="btn btn--quiet btn--sm" data-act="pick-photo">${icon('photo')}Website photos</button>` +
            `<button type="button" class="btn btn--quiet btn--sm" data-act="photo-restore" hidden>${icon('undo')}Original</button>` +
          '</div><p class="hint" id="ie-photo-status" data-photo-status aria-live="polite">JPG, PNG or WebP. Photos are resized for you.</p></div>' : '') +
        (kind === 'menu' && isGrouped(sec) ? `<div class="field"><label for="ie-grp">Section</label><select class="input" id="ie-grp">${sec.groups.map((g, i) => `<option value="${i}"${i === gi ? ' selected' : ''}>${esc(g.title)}</option>`).join('')}</select></div>` : '') +
        '<fieldset class="field"><legend>Availability</legend><div class="radios">' +
          [['on', 'On the website'], ['today', 'Sold out today <span class="muted small">(back tomorrow by itself)</span>'], ['soldout', 'Sold out <span class="muted small">(until you change it)</span>'], ['hidden', 'Hidden <span class="muted small">(not shown)</span>']]
            .map(([k, l]) => `<label class="check"><input type="radio" name="ie-avail" value="${k}"${av === k ? ' checked' : ''}><span>${l}</span></label>`).join('') +
        '</div></fieldset>' +
        (homeable ? `<label class="check"><input type="checkbox" id="ie-home"${wasOnHome ? ' checked' : ''}><span>Show on the home page <span class="muted small">(holiday section)</span></span></label>` : '') +
        '<div class="field preview-field"><span class="label">Preview</span><iframe class="pv-frame" title="Preview of this item" sandbox="allow-same-origin" data-preview></iframe></div>' +
      '</div></div>' +
      '<p class="form-error" data-editor-error role="alert" hidden></p>';
    const canDelete = !isNew && !fixedItems(sec, group);
    const foot = (canDelete ? `<button type="button" class="btn btn--danger-quiet" data-act="delete">${icon('trash')}Delete</button>` : '') +
      '<span class="spacer"></span><button type="button" class="btn btn--quiet" data-dlg-close>Cancel</button>' +
      `<button type="submit" class="btn btn--primary">${isNew ? 'Add item' : 'Save item'}</button>`;

    let initial = null;
    const dlg = openDialog({
      title: isNew ? `Add to “${group ? group.title : sec.name}”` : `Edit “${src.name}”`, size: 'lg', body, foot, focus: '#ie-name',
      confirmClose: () => initial !== null && initial !== canon(collect(true)),
      onSubmit: () => save(),
    });
    const box = dlg.box;
    const q = (s) => $(s, box);
    const sizeRows = q('[data-size-rows]');
    const labelFor = (i) => (cols ? cols[i] || '' : '');
    if (cols) sizes = cols.map((c, i) => ({ label: c, price: priceInputValue((work.prices[i] && work.prices[i].price) || '') }));

    function drawSizes(focus) {
      if (!sizeRows) return;
      sizeRows.innerHTML = sizes.map((s, i) =>
        `<tr data-i="${i}"><td>${cols ? `<span>${esc(labelFor(i) || 'Price')}</span>` : `<label class="sr-only" for="ie-sz-${i}">Size ${i + 1} name</label><input class="input" id="ie-sz-${i}" data-sz="label" maxlength="${L.label}" value="${esc(s.label)}" placeholder="e.g. 8&quot;">`}</td>` +
        `<td><label class="sr-only" for="ie-szp-${i}">Size ${i + 1} price</label><span class="${moneyClass(s.price)}"><input class="input input--price" id="ie-szp-${i}" data-sz="price" autocomplete="off" value="${esc(s.price)}"></span></td>` +
        '<td class="nowrap">' + (cols ? '' :
          `<button type="button" class="icon-btn" data-act="sz-up" aria-label="Move size ${i + 1} up"${i === 0 ? ' disabled' : ''}>${icon('up')}</button>` +
          `<button type="button" class="icon-btn" data-act="sz-down" aria-label="Move size ${i + 1} down"${i === sizes.length - 1 ? ' disabled' : ''}>${icon('down')}</button>` +
          `<button type="button" class="icon-btn icon-btn--danger" data-act="sz-del" aria-label="Remove size ${i + 1}"${sizes.length === 1 ? ' disabled' : ''}>${icon('trash')}</button>`) +
        '</td></tr>').join('');
      if (focus) { const el = $(focus, sizeRows); if (el) el.focus(); }
    }
    const pricing = () => { const x = $('input[name="ie-pricing"]:checked', box); return x ? x.value : 'one'; };
    const isMulti = () => (cols ? cols.length > 1 : pricing() === 'sizes');
    const isNone = () => !cols && hasPrices && pricing() === 'none';
    function drawPricing() {
      if (!hasPrices) return;
      q('[data-one-price]').hidden = isMulti() || isNone();
      q('[data-sizes]').hidden = !isMulti();
    }
    function drawPhotos() {
      const box2 = q('[data-photos]');
      if (!box2) return;
      box2.innerHTML = photos.length ? `<ol class="photo-list">${photos.map((p, i) =>
        `<li data-pi="${i}"><div class="photo-list__img"><img src="${esc(photoUrl(p, 'm'))}" alt="">${i === 0 && photos.length > 1 ? '<span class="badge badge--gold">Main</span>' : ''}</div>` +
        `<div class="field"><label class="sr-only" for="ie-alt-${i}">Description of photo ${i + 1}</label><input class="input input--sm" id="ie-alt-${i}" data-alt maxlength="${L.alt}" value="${esc(p.alt || '')}" placeholder="Describe the photo (optional)"></div>` +
        '<div class="photo-list__acts">' +
          (multiPhoto && photos.length > 1 ? `<button type="button" class="icon-btn" data-act="ph-up" aria-label="Move photo ${i + 1} earlier"${i === 0 ? ' disabled' : ''}>${icon('left')}</button>` +
            `<button type="button" class="icon-btn" data-act="ph-down" aria-label="Move photo ${i + 1} later"${i === photos.length - 1 ? ' disabled' : ''}>${icon('right')}</button>` : '') +
          `<button type="button" class="icon-btn icon-btn--danger" data-act="ph-del" aria-label="Remove photo ${i + 1}">${icon('trash')}</button>` +
        '</div></li>').join('')}</ol>` : `<div class="photo-box__empty">${icon('photo')}<span>No photo</span></div>`;
      const r = q('[data-act="photo-restore"]');
      if (r) r.hidden = !(orig && (orig.photos || []).length && canon(orig.photos) !== canon(photos));
      const inp = q('[data-photo-input]');
      if (inp) inp.closest('label').querySelector('span').textContent = photos.length && !multiPhoto ? 'Replace' : 'Upload';
    }
    function collect(loose) {
      const out = { id: work.id };
      out.name = q('#ie-name').value.trim();
      ['kicker', 'ribbon', 'note', 'extra', 'opts', 'size'].forEach((k) => { const el = q(`#ie-${k}`); const v = el ? el.value.trim() : work[k]; if (v) out[k] = v; });
      const desc = q('#ie-desc');
      if (desc && desc.value.trim()) out.desc = desc.value.trim(); else if (!desc && work.desc) out.desc = work.desc;
      if (!hasPrices || isNone()) out.prices = [];
      else if (isMulti()) out.prices = sizes.map((s, i) => ({ label: cols ? labelFor(i) : s.label.trim(), price: loose ? s.price : tidyPrice(s.price) }));
      else out.prices = [{ label: cols ? (cols[0] || '') : '', price: loose ? q('#ie-price').value : tidyPrice(q('#ie-price').value) }];
      const pills = q('#ie-pills');
      const pl = pills ? pills.value.split('\n').map((x) => x.trim()).filter(Boolean) : (work.pills || []);
      if (pl.length) out.pills = pl;
      if (q('[name="ie-tag"]')) {
        const tags = $$('input[name="ie-tag"]:checked', box).map((x) => x.value)
          .concat(q('#ie-tag-more').value.split(',').map((x) => x.trim()).filter(Boolean));
        if (tags.length) out.tags = Array.from(new Set(tags)).slice(0, R.LIMITS.tags);
      } else if (work.tags) out.tags = work.tags;
      if (photos.length) out.photos = clone(photos);
      setAvail(out, $('input[name="ie-avail"]:checked', box).value);
      if (loose) { out._gi = gi; out._home = q('#ie-home') ? q('#ie-home').checked : null; }
      return out;
    }
    let pvTimer = 0;
    function drawPreview() {
      clearTimeout(pvTimer);
      pvTimer = setTimeout(() => {
        const frame = q('[data-preview]');
        if (!frame) return;
        const it = collect(false);
        it.id = it.id || 'new';
        it.name = it.name || 'Name';
        let html = '';
        try { html = R.renderItem(sec, it, previewCtx()); } catch (e) { html = ''; }
        frame.onload = () => fitFrame(frame);
        frame.srcdoc = previewDoc(html, kind === 'menu' || kind === 'table');
        setTimeout(() => fitFrame(frame), 400);
      }, 180);
    }
    async function save() {
      const err = q('[data-editor-error]');
      err.hidden = true;
      $$('[aria-invalid]', box).forEach((el) => fieldError(el, ''));
      const it = collect(false);
      const bad = [];
      if (!it.name) { fieldError(q('#ie-name'), 'Enter a name.'); bad.push(q('#ie-name')); }
      if (!hasPrices || isNone()) { /* no price shown */ } else if (isMulti()) {
        const seen = new Set();
        it.prices.forEach((s, i) => {
          const nameEl = q(`#ie-sz-${i}`), priceEl = q(`#ie-szp-${i}`);
          if (!cols) {
            if (!s.label) { fieldError(nameEl, 'Name this size.'); bad.push(nameEl); }
            else if (seen.has(s.label.toLowerCase())) { fieldError(nameEl, 'This size is listed twice.'); bad.push(nameEl); }
            seen.add(s.label.toLowerCase());
          }
          if (!s.price) { fieldError(priceEl, 'Enter a price, like 4.50'); bad.push(priceEl); }
        });
      } else if (!it.prices[0].price) { fieldError(q('#ie-price'), 'Enter a price, like 4.50'); bad.push(q('#ie-price')); }
      if (bad.length) {
        err.textContent = bad.length === 1 ? 'Please fix the highlighted field.' : `Please fix the ${bad.length} highlighted fields.`;
        err.hidden = false;
        bad[0].focus();
        return;
      }
      const target = listOf(sec, gi);
      if (isNew) {
        it.id = uniqueItemId(sec, it.name);
        target.push(it);
      } else {
        const moved = gi !== f.gi;
        if (!moved) f.list[f.ii] = it;
        else { f.list.splice(f.ii, 1); target.push(it); }
      }
      const ref = `${sec.id}/${it.id}`;
      const wantHome = q('#ie-home') ? q('#ie-home').checked : null;
      if (wantHome === true && !(d.home.cards || []).includes(ref)) {
        if ((d.home.cards || []).length >= R.LIMITS.cards) toast(`The home page shows up to ${R.LIMITS.cards} cards. Remove one in Home page first.`, 'error');
        else d.home.cards = (d.home.cards || []).concat(ref);
      } else if (wantHome === false) d.home.cards = (d.home.cards || []).filter((r) => r !== ref);
      state.collapsed[sec.id] = false;
      dlg.close(true);
      changed({ rerender: true, focus: state.tab === 'menu' ? `[data-row="${ref}"] [data-act="edit-item"]` : null });
      toast(`${isNew ? 'Added' : 'Saved'} “${it.name}”. Publish when you’re ready.`, 'ok');
    }
    async function addFiles(files) {
      const status = q('[data-photo-status]');
      const room = multiPhoto ? MAX_PHOTOS - photos.length : 1;
      const todo = files.slice(0, Math.max(1, room));
      box.classList.add('is-busy');
      let added = 0, failed = '';
      for (let n = 0; n < todo.length; n++) {
        status.textContent = todo.length > 1 ? `Preparing photo ${n + 1} of ${todo.length}…` : 'Preparing the photo…';
        try {
          const { ref } = await uploadPhoto(todo[n], '');
          if (multiPhoto) photos.push(ref); else photos = [ref];
          added++;
          drawPhotos();
          drawPreview();
        } catch (ex) {
          failed = ex.code === 'signed_out' ? 'Your login ended. Log in again to upload.' : (ex.message || 'A photo couldn’t be uploaded.');
          if (ex.code === 'signed_out') break;
        }
      }
      box.classList.remove('is-busy');
      status.textContent = [added ? `${plural(added, 'photo')} added. Save the item to keep ${added > 1 ? 'them' : 'it'}.` : '', failed,
        files.length > todo.length ? `The limit is ${MAX_PHOTOS} photos.` : ''].filter(Boolean).join(' ');
    }

    drawSizes();
    drawPricing();
    drawPhotos();
    initial = canon(collect(true));
    drawPreview();

    box.addEventListener('input', (e) => {
      const t = e.target;
      const cnt = $(`[data-count-for="${t.id}"]`, box);
      if (cnt) cnt.textContent = t.value.length;
      const sz = t.getAttribute('data-sz');
      if (sz) sizes[Number(t.closest('tr').getAttribute('data-i'))][sz] = t.value;
      if (t.hasAttribute('data-alt')) photos[Number(t.closest('[data-pi]').getAttribute('data-pi'))].alt = t.value;
      if (t.id === 'ie-price' || sz === 'price') syncMoney(t);
      if (t.getAttribute('aria-invalid')) fieldError(t, '');
      drawPreview();
    });
    box.addEventListener('focusout', (e) => {
      const t = e.target;
      if (t.id === 'ie-price' || t.getAttribute('data-sz') === 'price') {
        const v = priceInputValue(tidyPrice(t.value));
        if (v !== t.value) { t.value = v; if (t.getAttribute('data-sz')) sizes[Number(t.closest('tr').getAttribute('data-i'))].price = v; syncMoney(t); }
      }
    });
    box.addEventListener('change', async (e) => {
      const t = e.target;
      if (t.name === 'ie-pricing') {
        if (t.value === 'sizes' && sizes.length === 1 && !sizes[0].label && !sizes[0].price && q('#ie-price').value) sizes[0].price = q('#ie-price').value;
        if (t.value === 'one' && !q('#ie-price').value && sizes[0] && sizes[0].price) q('#ie-price').value = sizes[0].price;
        drawPricing();
        drawSizes();
      } else if (t.id === 'ie-grp') {
        gi = Number(t.value);
      } else if (t.hasAttribute('data-photo-input')) {
        const files = Array.from(t.files || []);
        t.value = '';
        if (files.length) await addFiles(files);
      }
      drawPreview();
    });
    box.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.getAttribute('data-act');
      if (act === 'add-size') {
        sizes.push({ label: '', price: '' });
        drawSizes(`#ie-sz-${sizes.length - 1}`);
      } else if (act === 'sz-up' || act === 'sz-down' || act === 'sz-del') {
        const i = Number(b.closest('tr').getAttribute('data-i'));
        if (act === 'sz-del') { sizes.splice(i, 1); drawSizes(`#ie-sz-${Math.min(i, sizes.length - 1)}`); }
        else {
          const to = act === 'sz-up' ? i - 1 : i + 1;
          [sizes[i], sizes[to]] = [sizes[to], sizes[i]];
          const edge = act === 'sz-up' ? to === 0 : to === sizes.length - 1;
          drawSizes(`tr[data-i="${to}"] [data-act="${edge ? (act === 'sz-up' ? 'sz-down' : 'sz-up') : act}"]`);
        }
      } else if (act === 'ph-del' || act === 'ph-up' || act === 'ph-down') {
        const i = Number(b.closest('[data-pi]').getAttribute('data-pi'));
        if (act === 'ph-del') photos.splice(i, 1);
        else { const to = act === 'ph-up' ? i - 1 : i + 1; [photos[i], photos[to]] = [photos[to], photos[i]]; }
        drawPhotos();
        q('[data-photo-status]').textContent = act === 'ph-del' ? 'Photo removed. Save the item to keep this change.' : 'Photo moved. The first photo is the one shown on the website.';
      } else if (act === 'pick-photo') {
        const p = await pickPhoto({ title: `Choose a photo for “${q('#ie-name').value || 'this item'}”` });
        if (!p) return;
        if (multiPhoto) { if (photos.length < MAX_PHOTOS) photos.push(p); } else photos = [p];
        drawPhotos();
        q('[data-photo-status]').textContent = 'Photo added. Save the item to keep it.';
      } else if (act === 'photo-restore') {
        photos = clone(orig.photos || []);
        drawPhotos();
        q('[data-photo-status]').textContent = 'Original photos are back. Save the item to keep them.';
      } else if (act === 'delete') {
        await deleteItem(f, dlg);
        return;
      }
      drawPreview();
    });
  }

  /* ------------------------------------------------------------------ home page */
  const CARD_KINDS = ['promos', 'cards', 'boxes', 'spotlight'];
  function cardCandidates() {
    const out = [];
    state.draft.sections.forEach((sec) => {
      if (!CARD_KINDS.includes(sec.kind)) return;
      (sec.items || []).forEach((it) => out.push({ sec, it, ref: `${sec.id}/${it.id}` }));
    });
    return out;
  }
  function suggestedCards(page) {
    return cardCandidates().filter((x) => x.sec.page === page && !x.it.hidden).slice(0, 4).map((x) => x.ref);
  }

  function viewHome(main) {
    const h = state.draft.home;
    const b = h.banner || (h.banner = { show: true });
    const view = doc.createElement('div');
    view.className = 'view';
    const preset = HOLIDAY_PRESETS[h.page] || HOLIDAY_PRESETS['rosh-hashanah'];
    const cards = (h.cards || []).map((ref) => ({ ref, f: R.findItem(state.draft, ref) }));
    const input = (id, label, value, max, ph) => `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" maxlength="${max}" value="${esc(value || '')}"${ph ? ` placeholder="${esc(ph)}"` : ''}></div>`;
    view.innerHTML =
      '<div class="view__head"><div><h1 tabindex="-1">Home page</h1>' +
        '<p class="muted">The holiday section near the top of the home page. When a new holiday comes, pick it below and the text and cards are filled in for you.</p></div>' +
        `<div class="view__actions"><button type="button" class="btn btn--quiet" data-act="preview-home">${icon('eye')}Preview the home page</button></div></div>` +

      '<section class="card" aria-labelledby="hm-title"><h2 id="hm-title">Holiday section</h2>' +
        `<label class="switch"><input type="checkbox" id="hm-show"${h.show ? ' checked' : ''}><span>Show the holiday section on the home page</span></label>` +
        '<div class="grid-2 field--gap">' +
          `<div class="field"><label for="hm-page">Holiday</label><select class="input" id="hm-page">${R.HOLIDAY_PAGES.map((p) => `<option value="${p}"${h.page === p ? ' selected' : ''}>${esc(HOLIDAY_PRESETS[p].label)}</option>`).join('')}</select>` +
            '<p class="hint">The buttons in this section link to that holiday’s page.</p></div>' +
          `<div class="field field--end"><button type="button" class="btn btn--quiet" data-act="apply-preset">${icon('star')}Fill in ${esc(preset.label)} text and cards</button></div>` +
        '</div>' +
      '</section>' +

      '<section class="card" aria-labelledby="hb-title"><h2 id="hb-title">Greeting banner</h2>' +
        `<label class="switch"><input type="checkbox" id="hb-show"${b.show ? ' checked' : ''}><span>Show the greeting banner</span></label>` +
        '<div class="banner-edit field--gap">' +
          `<div class="banner-edit__img"><div class="photo-box">${b.img ? `<img src="${esc(photoUrl(b.img, 'm'))}" alt="">` : `<div class="photo-box__empty">${icon('photo')}<span>No picture</span></div>`}</div>` +
            '<div class="btn-row">' +
              `<button type="button" class="btn btn--quiet btn--sm" data-act="banner-pick">${icon('photo')}Website photos</button>` +
              `<label class="btn btn--quiet btn--sm file-btn">${icon('upload')}<span>Upload</span><input type="file" class="sr-only" data-banner-input accept="image/jpeg,image/png,image/webp,image/heic,image/heif"></label>` +
            '</div><p class="hint" data-banner-status aria-live="polite"></p></div>' +
          '<div class="banner-edit__text">' +
            '<div class="grid-3">' + input('hb-l1', 'First line', b.line1, 30, 'HAPPY') + input('hb-l2', 'Big line', b.line2, 30, 'HOLIDAYS') + input('hb-l3', 'Third line', b.line3, 40, 'SHANA TOVA') + '</div>' +
            input('hb-wish', 'Wish', b.wish, 160) + input('hb-bold', 'Wish, in bold', b.wishBold, 80) +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="card" aria-labelledby="hh-title"><h2 id="hh-title">Heading and buttons</h2>' +
        '<div class="grid-2">' + input('hh-eyebrow', 'Small label', h.eyebrow, 40, 'Holiday menu') + input('hh-title', 'Title', h.title, 80, 'For your holiday table') + '</div>' +
        `<div class="field"><label for="hh-lead">Text under the title</label><textarea class="input" id="hh-lead" rows="2" maxlength="240">${esc(h.lead || '')}</textarea></div>` +
        '<div class="grid-2">' + input('hh-link', 'Text of the menu button', h.linkText, 40, 'See the full holiday menu') +
          input('hh-subject', 'Subject of the order e-mail', h.orderSubject, 60, 'Holiday order') + '</div>' +
      '</section>' +

      '<section class="card" aria-labelledby="hc-title"><h2 id="hc-title">Cards</h2>' +
        `<p class="muted">Items from your holiday menus, shown as cards (up to ${R.LIMITS.cards}). Prices and photos come from each item, so change them in Menu & prices.</p>` +
        (cards.length ? `<ol class="pick-list">${cards.map((c, i) => {
          const it = c.f && c.f.item;
          const ph = it && (it.photos || [])[0];
          return `<li data-ci="${i}"><span class="row__img">${ph ? `<img src="${esc(photoUrl(ph, 'm'))}" alt="" width="48" height="48">` : icon('photo')}</span>` +
            `<span class="pick-list__main"><strong>${esc(it ? it.name : 'Deleted item')}</strong><span class="muted small">${it ? `${esc(R.pageLabel(c.f.sec.page))} · ${esc(priceSummary(it))}${it.hidden ? ' · hidden, not shown' : R.isSoldOut(it, today()) ? ' · sold out' : ''}` : 'This item no longer exists'}</span></span>` +
            `<span class="pick-list__acts">${it ? `<button type="button" class="btn btn--quiet btn--sm" data-act="card-edit">${icon('edit')}Edit item</button>` : ''}` +
            `<button type="button" class="icon-btn" data-act="card-up" aria-label="Move card ${i + 1} up"${i === 0 ? ' disabled' : ''}>${icon('up')}</button>` +
            `<button type="button" class="icon-btn" data-act="card-down" aria-label="Move card ${i + 1} down"${i === cards.length - 1 ? ' disabled' : ''}>${icon('down')}</button>` +
            `<button type="button" class="icon-btn icon-btn--danger" data-act="card-del" aria-label="Remove card ${i + 1}">${icon('close')}</button></span></li>`;
        }).join('')}</ol>` : '<p class="empty">No cards. The section shows only the greeting and buttons.</p>') +
        `<button type="button" class="btn btn--quiet btn--sm" data-act="card-add"${cards.length >= R.LIMITS.cards ? ' disabled' : ''}>${icon('plus')}Add a card</button>` +
      '</section>' +

      '<section class="card" aria-labelledby="hp-title"><h2 id="hp-title">Preview</h2>' +
        '<iframe class="pv-frame pv-frame--wide" title="Preview of the home page holiday section" sandbox="allow-same-origin" data-preview></iframe></section>';
    main.appendChild(view);

    let pvTimer = 0;
    const drawPreview = () => {
      clearTimeout(pvTimer);
      pvTimer = setTimeout(() => {
        const frame = $('[data-preview]', view);
        if (!frame) return;
        const html = h.show ? `<section class="section cream" id="holidays">${R.renderSlot('home', state.draft, previewCtx())}</section>` : '<p class="pv-note">The holiday section is turned off.</p>';
        frame.onload = () => { fitFrame(frame); setTimeout(() => fitFrame(frame), 600); };
        frame.srcdoc = previewDoc(html, true);
      }, 200);
    };
    drawPreview();

    const bind = { 'hb-l1': 'line1', 'hb-l2': 'line2', 'hb-l3': 'line3', 'hb-wish': 'wish', 'hb-bold': 'wishBold' };
    const bindH = { 'hh-eyebrow': 'eyebrow', 'hh-title': 'title', 'hh-lead': 'lead', 'hh-link': 'linkText', 'hh-subject': 'orderSubject' };
    view.addEventListener('input', (e) => {
      const t = e.target;
      if (bind[t.id]) b[bind[t.id]] = t.value;
      else if (bindH[t.id]) h[bindH[t.id]] = t.value;
      else return;
      changed();
      drawPreview();
    });
    view.addEventListener('change', async (e) => {
      const t = e.target;
      if (t.id === 'hm-show') { h.show = t.checked; changed(); drawPreview(); }
      else if (t.id === 'hb-show') { b.show = t.checked; changed(); drawPreview(); }
      else if (t.id === 'hm-page') {
        h.page = t.value;
        changed({ rerender: true, focus: '#hm-page' });
      } else if (t.hasAttribute('data-banner-input')) {
        const file = t.files && t.files[0];
        t.value = '';
        if (!file) return;
        const st = $('[data-banner-status]', view);
        st.textContent = 'Preparing the photo…';
        try {
          const { ref } = await uploadPhoto(file, '');
          b.img = ref;
          changed({ rerender: true });
          toast('Banner picture changed. Publish when you’re ready.', 'ok');
        } catch (ex) { st.textContent = ex.message || 'The photo couldn’t be uploaded.'; }
      }
    });
    view.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      const li = btn.closest('[data-ci]');
      const i = li ? Number(li.getAttribute('data-ci')) : -1;
      if (act === 'preview-home') openPreview('index');
      else if (act === 'apply-preset') {
        const p = HOLIDAY_PRESETS[h.page];
        const ok = await ask({ title: `Fill in ${p.label}?`, text: `The greeting, heading and cards are replaced with suggestions for ${p.label}. You can change anything afterwards, and nothing goes live until you publish.`, ok: 'Fill it in' });
        if (!ok) return;
        const snap = clone(state.draft);
        Object.assign(b, { show: true, line1: p.line1, line2: p.line2, line3: p.line3, wish: p.wish, wishBold: p.wishBold });
        Object.assign(h, { show: true, eyebrow: p.eyebrow, title: p.title, lead: p.lead, orderSubject: p.subject, linkText: `See the full ${p.label} menu` });
        h.cards = suggestedCards(h.page);
        if (h.page === 'rosh-hashanah' && state.original.home.banner.img) b.img = clone(state.original.home.banner.img);
        else {
          const first = h.cards.map((r) => R.findItem(state.draft, r)).find((x) => x && (x.item.photos || []).length);
          if (first) b.img = clone(first.item.photos[0]);
        }
        changed({ rerender: true, focus: 'h1' });
        withUndo(`Filled in ${p.label}. Check the preview, then publish.`, snap);
      } else if (act === 'banner-pick') {
        const p = await pickPhoto({ title: 'Choose the banner picture' });
        if (!p) return;
        b.img = p;
        changed({ rerender: true });
      } else if (act === 'card-add') {
        const ref = await pickCard();
        if (!ref) return;
        h.cards = (h.cards || []).concat(ref).slice(0, R.LIMITS.cards);
        changed({ rerender: true, focus: '[data-act="card-add"]' });
      } else if (act === 'card-del') {
        h.cards.splice(i, 1);
        changed({ rerender: true, focus: '[data-act="card-add"]' });
      } else if (act === 'card-up' || act === 'card-down') {
        const to = act === 'card-up' ? i - 1 : i + 1;
        [h.cards[i], h.cards[to]] = [h.cards[to], h.cards[i]];
        const edge = act === 'card-up' ? to === 0 : to === h.cards.length - 1;
        changed({ rerender: true, focus: `[data-ci="${to}"] [data-act="${edge ? (act === 'card-up' ? 'card-down' : 'card-up') : act}"]` });
      } else if (act === 'card-edit') {
        const f = findRow(h.cards[i]);
        if (f) openItemEditor(f);
      }
    });
  }

  function pickCard() {
    return new Promise((resolve) => {
      const all = cardCandidates().filter((x) => !(state.draft.home.cards || []).includes(x.ref));
      const body = `<div class="search">${icon('search')}<label class="sr-only" for="pc-find">Find an item</label>` +
        '<input class="input" id="pc-find" type="search" placeholder="Find an item" autocomplete="off"></div><ul class="pick-list pick-list--choose" data-pc-list></ul>';
      const dlg = openDialog({
        title: 'Add a card to the home page', size: 'md', body, closeOnBackdrop: true,
        foot: '<button type="button" class="btn btn--quiet" data-dlg-close>Cancel</button>', focus: '#pc-find', onClose: (r) => resolve(r || null),
      });
      const draw = () => {
        const words = fold($('#pc-find', dlg.box).value).split(/\s+/).filter(Boolean);
        const hits = all.filter((x) => words.every((w) => fold(`${x.it.name} ${x.sec.name} ${R.pageLabel(x.sec.page)}`).includes(w)));
        const holidayFirst = hits.sort((a, b) => (R.HOLIDAY_PAGES.includes(b.sec.page) ? 1 : 0) - (R.HOLIDAY_PAGES.includes(a.sec.page) ? 1 : 0));
        $('[data-pc-list]', dlg.box).innerHTML = holidayFirst.slice(0, 80).map((x) => {
          const ph = (x.it.photos || [])[0];
          return `<li><button type="button" class="pick-list__btn" data-ref="${esc(x.ref)}"><span class="row__img">${ph ? `<img src="${esc(photoUrl(ph, 'm'))}" alt="" width="40" height="40" loading="lazy">` : icon('photo')}</span>` +
            `<span class="pick-list__main"><strong>${esc(x.it.name)}</strong><span class="muted small">${esc(R.pageLabel(x.sec.page))} · ${esc(priceSummary(x.it))}</span></span></button></li>`;
        }).join('') || '<li class="muted">Nothing matches.</li>';
      };
      draw();
      dlg.box.addEventListener('input', draw);
      dlg.box.addEventListener('click', (e) => { const b = e.target.closest('[data-ref]'); if (b) dlg.close(b.getAttribute('data-ref')); });
    });
  }
  /* ------------------------------------------------------------------ photo galleries */
  const GALLERY_LIMIT = R.LIMITS.galleryItems;
  const OWN = 'own';

  function galleryMeta(g) {
    const photos = g.items.filter((x) => !x.video).length, vids = g.items.length - photos, hid = g.items.filter((x) => x.hidden).length;
    return [plural(photos, 'photo'), vids ? plural(vids, 'video') : '', hid ? `${hid} hidden` : ''].filter(Boolean).join(' · ');
  }
  function galleryPlace(g) {
    if (g.page === OWN) return 'Its own page · on the Specialty Cakes page and menu';
    return `At the end of the “${R.pageLabel(g.page)}” page`;
  }
  function galleryTile(x, i, len) {
    const label = x.video ? (x.label || 'Video') : (x.alt || `Photo ${i + 1}`);
    const src = x.video ? videoPoster(x) : photoUrl(x, 'm');
    return `<li class="gtile${x.hidden ? ' is-hidden' : ''}" data-gi="${i}">` +
      `<div class="gtile__img">${src ? `<img src="${esc(src)}" alt="" loading="lazy">` : icon('photo')}` +
        `<span class="gtile__num" aria-hidden="true">${i + 1}</span>` +
        (x.video ? `<span class="badge badge--dark gtile__badge">${icon('video')}Video</span>` : '') +
        (x.hidden ? '<span class="badge badge--muted gtile__badge">Hidden</span>' : '') + '</div>' +
      (x.video ? `<p class="gtile__cap muted small">${esc(label)}</p>`
        : `<div class="field"><label class="sr-only" for="gt-${i}">Description of photo ${i + 1}</label><input class="input input--sm" id="gt-${i}" data-alt maxlength="${R.LIMITS.alt}" value="${esc(x.alt || '')}" placeholder="Describe the photo"></div>`) +
      '<div class="gtile__acts">' +
        `<button type="button" class="icon-btn" data-act="g-left" aria-label="Move ${esc(label)} one place earlier" title="One place earlier"${i === 0 ? ' disabled' : ''}>${icon('left')}</button>` +
        `<button type="button" class="icon-btn" data-act="g-right" aria-label="Move ${esc(label)} one place later" title="One place later"${i === len - 1 ? ' disabled' : ''}>${icon('right')}</button>` +
        `<button type="button" class="icon-btn" data-act="g-move" aria-label="Move ${esc(label)} to another spot or gallery" title="Move to another spot or gallery">${icon('move')}</button>` +
        `<button type="button" class="icon-btn" data-act="g-hide" aria-pressed="${!!x.hidden}" aria-label="${x.hidden ? 'Show' : 'Hide'} ${esc(label)}" title="${x.hidden ? 'Show on the website' : 'Hide from the website'}">${icon('eye')}</button>` +
        `<button type="button" class="icon-btn icon-btn--danger" data-act="g-del" aria-label="Remove ${esc(label)}" title="Remove">${icon('trash')}</button>` +
      '</div></li>';
  }
  const LEGEND = '<p class="gal__legend">' +
    `<span>${icon('left')}${icon('right')} one place earlier or later</span>` +
    `<span>${icon('move')} move to a spot (like first or last) or to another gallery</span>` +
    `<span>${icon('eye')} hide or show on the website</span>` +
    `<span>${icon('trash')} remove</span>` +
    '<span>New photos go first. Type a short description under each photo.</span></p>';

  function galleryCard(g) {
    const open = !!state.openGalleries[g.id];
    const shown = g.items.filter((x) => !x.hidden);
    const preview = shown.slice(0, 8).map((x) => { const s = x.video ? videoPoster(x) : photoUrl(x, 'm'); return s ? `<img src="${esc(s)}" alt="" loading="lazy">` : ''; }).join('');
    const more = shown.length > 8 ? `<span class="gal__more">+${shown.length - 8}</span>` : '';
    return `<section class="cat card gal${open ? ' is-open' : ''}" data-gal="${esc(g.id)}" aria-labelledby="gal-${esc(g.id)}">` +
      '<header class="cat__head gal__head">' +
        `<div class="gal__title"><h2 id="gal-${esc(g.id)}" tabindex="-1">${esc(g.name)}</h2><span class="cat__meta">${esc(galleryMeta(g))}</span>` +
          (g.custom ? `<span class="badge badge--gold">${g.page === OWN ? 'Own page' : 'Added by you'}</span>` : '') + '</div>' +
        '<div class="cat__tools gal__tools">' +
          `<button type="button" class="btn btn--sm ${open ? 'btn--primary' : 'btn--quiet'}" data-act="toggle-gal" aria-expanded="${open}" aria-controls="gal-body-${esc(g.id)}">${open ? `${icon('check')}Done` : `${icon('edit')}Edit photos`}</button>` +
          `<label class="btn btn--quiet btn--sm file-btn">${icon('upload')}<span>Add photos</span><input type="file" class="sr-only" multiple data-gal-input accept="image/jpeg,image/png,image/webp,image/heic,image/heif"></label>` +
          (g.custom ? `<button type="button" class="btn btn--quiet btn--sm" data-act="gal-settings">${icon('tag')}Name &amp; place</button>` : '') +
          (g.custom && g.page === OWN ? `<button type="button" class="btn btn--quiet btn--sm" data-act="gal-preview">${icon('eye')}Preview</button>` : '') +
          `<button type="button" class="btn btn--danger-quiet btn--sm" data-act="gal-del">${icon('trash')}Delete gallery</button>` +
        '</div>' +
      '</header>' +
      (g.custom ? `<p class="gal__place muted small">${esc(galleryPlace(g))}${g.lead ? ` · “${esc(g.lead)}”` : ''}</p>` : '') +
      (open ? '' : (shown.length
        ? `<button type="button" class="gal__strip" data-act="toggle-gal" aria-label="Edit the photos of ${esc(g.name)}">${preview}${more}<span class="gal__strip-cta"><span>${icon('edit')}Edit photos</span></span></button>`
        : `<p class="gal__empty">${g.items.length ? 'All photos are hidden, so this gallery doesn’t show on the website.' : 'No photos yet. Select <strong>Add photos</strong>. A gallery shows on the website once it has photos and you publish.'}</p>`)) +
      `<div class="cat__body" id="gal-body-${esc(g.id)}"${open ? '' : ' hidden'}>` +
        '<p class="hint" data-gal-status role="status" aria-live="polite"></p>' +
        (open ? (g.items.length ? LEGEND + `<ol class="gtiles">${g.items.map((x, i) => galleryTile(x, i, g.items.length)).join('')}</ol>` +
          `<p class="gal__done"><button type="button" class="btn btn--primary btn--sm" data-act="toggle-gal" aria-expanded="true" aria-controls="gal-body-${esc(g.id)}">${icon('check')}Done</button></p>`
          : '<p class="gal__empty">No photos yet. Select <strong>Add photos</strong> above.</p>') : '') +
      '</div></section>';
  }

  function viewGalleries(main) {
    const gals = state.draft.galleries;
    const view = doc.createElement('div');
    view.className = 'view';
    const live = gals.filter((g) => !g.removed);
    const groups = [];
    const own = live.filter((g) => g.custom && g.page === OWN);
    if (own.length) groups.push({ slug: OWN, label: 'Your gallery pages', note: 'Each one has its own page, a tile on the Specialty Cakes page and a link in the Specialty Cakes menu.', list: own });
    R.PAGES.forEach(([slug, label]) => {
      const list = live.filter((g) => g.page === slug && !g.custom).concat(live.filter((g) => g.page === slug && g.custom));
      if (list.length) groups.push({ slug, label, list });
    });
    const removed = gals.filter((g) => g.removed);
    view.innerHTML =
      '<div class="view__head"><div><h1 tabindex="-1">Photo galleries</h1>' +
        '<p class="muted">The photo walls on the website. Select <strong>Edit photos</strong> on a gallery to change the order, hide or remove photos, or move them to another gallery. ' +
        'Add a gallery for a new kind of cake, and delete the ones you don’t want on the website.</p></div>' +
        `<div class="view__acts"><button type="button" class="btn btn--primary" data-act="gal-add">${icon('plus')}Add a gallery</button></div></div>` +
      groups.map((p) => `<section class="pagegrp" aria-labelledby="gp-${p.slug}"><header class="pagegrp__head"><h2 id="gp-${p.slug}">${esc(p.label)}</h2>` +
        (p.slug === OWN ? '' : `<a class="link-btn small" href="${esc(siteLink(p.slug))}" target="_blank" rel="noopener">View page${icon('external')}<span class="sr-only"> (opens in a new tab)</span></a>`) +
        (p.note ? `<p class="muted small pagegrp__note">${esc(p.note)}</p>` : '') + '</header>' +
        p.list.map(galleryCard).join('') + '</section>').join('') +
      (removed.length ? '<section class="card gal-removed" aria-labelledby="gal-removed-title"><h2 id="gal-removed-title">Deleted galleries</h2>' +
        '<p class="muted">These came with the website and aren’t on it now. Bring one back to show it again (with its photos).</p><ul class="gal-removed__list">' +
        removed.map((g) => `<li data-gal="${esc(g.id)}"><span><strong>${esc(g.name)}</strong> <span class="muted small">${esc(R.pageLabel(g.page))} · ${esc(galleryMeta(g))}</span></span>` +
          `<button type="button" class="btn btn--quiet btn--sm" data-act="gal-restore">${icon('undo')}Bring back</button></li>`).join('') +
        '</ul></section>' : '');
    main.appendChild(view);

    const galOf = (el) => { const s = el.closest('[data-gal]'); return s ? gals.find((g) => g.id === s.getAttribute('data-gal')) : null; };
    view.addEventListener('input', (e) => {
      const t = e.target;
      if (!t.hasAttribute('data-alt')) return;
      const g = galOf(t);
      const i = Number(t.closest('[data-gi]').getAttribute('data-gi'));
      g.items[i].alt = t.value;
      fieldError(t, t.value.trim() ? '' : 'Add a short description.');
      changed();
    });
    view.addEventListener('change', async (e) => {
      const t = e.target;
      if (!t.hasAttribute('data-gal-input')) return;
      const g = galOf(t);
      const files = Array.from(t.files || []);
      t.value = '';
      if (!files.length || !g) return;
      state.openGalleries[g.id] = true;
      state.lastGallery = g.id;
      const secEl = t.closest('[data-gal]');
      const body = $('.cat__body', secEl);
      body.hidden = false;
      const status = $('[data-gal-status]', secEl);
      const room = GALLERY_LIMIT - g.items.length;
      const todo = files.slice(0, Math.max(0, room));
      let added = 0, failed = '';
      secEl.classList.add('is-busy');
      for (let n = 0; n < todo.length; n++) {
        status.textContent = todo.length > 1 ? `Preparing photo ${n + 1} of ${todo.length}…` : 'Preparing the photo…';
        try {
          const count = g.items.filter((x) => !x.video).length;
          const { ref } = await uploadPhoto(todo[n], `${g.altBase || g.name} ${count + 1}`);
          g.items.splice(added, 0, ref);
          added++;
        } catch (ex) {
          failed = ex.code === 'signed_out' ? 'Your login ended. Log in again to upload.' : (ex.message || 'A photo couldn’t be uploaded.');
          if (ex.code === 'signed_out') break;
        }
      }
      secEl.classList.remove('is-busy');
      const msg = [added ? `${plural(added, 'photo')} added at the start of the gallery. Check the descriptions, then publish.` : '', failed,
        files.length > todo.length ? `The limit is ${GALLERY_LIMIT} photos per gallery.` : ''].filter(Boolean).join(' ');
      if (added) {
        changed({ rerender: true, focus: `[data-gal="${g.id}"] [data-gi="0"] input` });
        const st = $(`[data-gal="${g.id}"] [data-gal-status]`);
        if (st) st.textContent = msg;
      } else status.textContent = msg;
    });
    view.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.getAttribute('data-act');
      if (act === 'gal-add') { openGallerySettings(null); return; }
      const g = galOf(b);
      if (!g) return;
      state.lastGallery = g.id;
      if (act === 'toggle-gal') {
        state.openGalleries[g.id] = !state.openGalleries[g.id];
        renderTab(`[data-gal="${g.id}"] [data-act="toggle-gal"]`);
        return;
      }
      if (act === 'gal-settings') { openGallerySettings(g); return; }
      if (act === 'gal-preview') { openPreview('gallery', `g=${encodeURIComponent(g.id)}`); return; }
      if (act === 'gal-del') { deleteGallery(g); return; }
      if (act === 'gal-restore') {
        delete g.removed;
        changed({ rerender: true, focus: `[data-gal="${g.id}"] h2` });
        toast(`“${g.name}” is back. Publish to show it on the website again.`, 'ok');
        return;
      }
      const tileEl = b.closest('[data-gi]');
      if (!tileEl) return;
      const i = Number(tileEl.getAttribute('data-gi'));
      const x = g.items[i];
      if (act === 'g-left' || act === 'g-right') {
        const to = act === 'g-left' ? i - 1 : i + 1;
        if (to < 0 || to >= g.items.length) return;
        [g.items[i], g.items[to]] = [g.items[to], g.items[i]];
        const edge = act === 'g-left' ? to === 0 : to === g.items.length - 1;
        changed({ rerender: true, focus: `[data-gal="${g.id}"] [data-gi="${to}"] [data-act="${edge ? (act === 'g-left' ? 'g-right' : 'g-left') : act}"]` });
      } else if (act === 'g-move') {
        openMovePhoto(g, i);
      } else if (act === 'g-hide') {
        if (x.hidden) delete x.hidden; else x.hidden = true;
        changed({ rerender: true, focus: `[data-gal="${g.id}"] [data-gi="${i}"] [data-act="g-hide"]` });
      } else if (act === 'g-del') {
        const snap = clone(state.draft);
        g.items.splice(i, 1);
        const next = g.items.length ? `[data-gal="${g.id}"] [data-gi="${Math.min(i, g.items.length - 1)}"] [data-act="g-del"]` : `[data-gal="${g.id}"] h2`;
        changed({ rerender: true, focus: next });
        withUndo(`Removed a ${x.video ? 'video' : 'photo'} from “${g.name}”.`, snap);
      }
    });
  }

  /* Add a gallery, or change the name and place of one the owner added. */
  function openGallerySettings(g) {
    const isNew = !g;
    const cur = g || { name: '', lead: '', page: OWN };
    const pages = R.PAGES.map(([slug, label]) => `<option value="${slug}"${cur.page === slug ? ' selected' : ''}>${esc(label)}</option>`).join('');
    const onPage = cur.page !== OWN;
    const dlg = openDialog({
      title: isNew ? 'Add a gallery' : `“${cur.name}”: name and place`, size: 'md',
      body:
        `<div class="field"><label for="ng-name">Name</label><input class="input" id="ng-name" maxlength="${R.LIMITS.galleryName}" value="${esc(cur.name)}" placeholder="For example: Baby shower cakes" autocomplete="off"></div>` +
        '<fieldset class="field plain"><legend>Where it shows on the website</legend>' +
          `<label class="check"><input type="radio" name="ng-place" value="own"${onPage ? '' : ' checked'}><span>On its own page <span class="muted small">— with a tile on the Specialty Cakes page and a link in the Specialty Cakes menu</span></span></label>` +
          `<label class="check"><input type="radio" name="ng-place" value="page"${onPage ? ' checked' : ''}><span>At the end of a page</span></label>` +
          `<div class="field ng-page"${onPage ? '' : ' hidden'}><label class="sr-only" for="ng-page">Page</label><select class="input" id="ng-page">${pages}</select></div>` +
        '</fieldset>' +
        `<div class="field"><label for="ng-lead">Short description <span class="muted">(optional)</span></label><input class="input" id="ng-lead" maxlength="${R.LIMITS.galleryLead}" value="${esc(cur.lead || '')}" placeholder="Shown under the name" autocomplete="off"></div>` +
        (isNew ? '<p class="hint">Next, add photos to it. It shows on the website once it has photos and you publish.</p>' : ''),
      foot: '<button type="button" class="btn btn--quiet" data-dlg-close>Cancel</button>' +
        `<button type="submit" class="btn btn--primary">${isNew ? `${icon('plus')}Add gallery` : 'Save'}</button>`,
      focus: '#ng-name',
      confirmClose: () => $('#ng-name', dlg.box).value.trim() !== cur.name,
      onSubmit: (d) => {
        const nameEl = $('#ng-name', d.box);
        const name = R.cleanText(nameEl.value, R.LIMITS.galleryName);
        if (!name) { fieldError(nameEl, 'Give the gallery a name.'); nameEl.focus(); return; }
        const taken = state.draft.galleries.some((x) => x !== g && !x.removed && x.name.toLowerCase() === name.toLowerCase());
        if (taken) { fieldError(nameEl, 'Another gallery has this name. Pick a different one.'); nameEl.focus(); return; }
        if (isNew && state.draft.galleries.filter((x) => x.custom).length >= R.LIMITS.customGalleries) {
          fieldError(nameEl, `You can add up to ${R.LIMITS.customGalleries} galleries. Delete one you don’t use first.`); return;
        }
        const place = $('input[name="ng-place"]:checked', d.box).value;
        const page = place === 'own' ? OWN : $('#ng-page', d.box).value;
        const lead = R.cleanText($('#ng-lead', d.box).value, R.LIMITS.galleryLead);
        let target = g;
        if (isNew) {
          const base = `c-${R.slugify(name).slice(0, 40)}`.replace(/-+$/, '');
          let id = base, n = 2;
          while (state.draft.galleries.some((x) => x.id === id)) id = `${base}-${n++}`;
          target = { id, custom: true, page, name, altBase: name, items: [] };
          state.draft.galleries.push(target);
          state.openGalleries[id] = false;
        } else {
          target.page = page;
          target.name = name;
          target.altBase = name;
        }
        if (lead) target.lead = lead; else delete target.lead;
        state.lastGallery = target.id;
        d.close(true);
        changed({ rerender: true, focus: `[data-gal="${target.id}"] ${isNew ? '.file-btn input' : 'h2'}` });
        toast(isNew ? `Added the gallery “${name}”. Add photos to it, then publish.` : 'Saved. Publish to update the website.', 'ok');
      },
    });
    dlg.box.addEventListener('change', (e) => {
      if (e.target.name === 'ng-place') $('.ng-page', dlg.box).hidden = e.target.value !== 'page';
    });
  }

  async function deleteGallery(g) {
    const n = g.items.length;
    const pageGallery = !g.custom && R.GALLERY_PAGES.includes(g.id);
    const what = g.custom
      ? (g.page === OWN ? 'Its page, its tile on the Specialty Cakes page and its menu link go too.' : '')
      : pageGallery ? `The “${R.pageLabel(g.page)}” page also leaves the menu and the Specialty Cakes page.` : '';
    const back = g.custom ? 'You can undo right after.' : 'You can undo right after, or bring it back later from “Deleted galleries” at the bottom of this page.';
    const ok = await ask({
      title: `Delete the gallery “${g.name}”?`, danger: true, ok: 'Delete gallery',
      text: `${n ? `Its ${plural(n, 'photo')} come${n === 1 ? 's' : ''} off the website when you publish.` : 'It comes off the website when you publish.'} ${what} ${back}`.replace(/\s+/g, ' ').trim(),
    });
    if (!ok) return;
    const snap = clone(state.draft);
    if (g.custom) state.draft.galleries.splice(state.draft.galleries.indexOf(g), 1);
    else g.removed = true;
    delete state.openGalleries[g.id];
    changed({ rerender: true, focus: 'h1' });
    withUndo(`Deleted the gallery “${g.name}”.`, snap);
  }

  /* Move a photo to a spot in its gallery (first, last, a number) or into another gallery. */
  function openMovePhoto(g, i) {
    const x = g.items[i];
    const label = x.video ? (x.label || 'Video') : (x.alt || `Photo ${i + 1}`);
    const src = x.video ? videoPoster(x) : photoUrl(x, 'm');
    const targets = state.draft.galleries.filter((t) => !t.removed);
    const posOptions = (t) => {
      const count = t === g ? t.items.length : t.items.length + 1;
      let o = `<option value="0">First</option>`;
      for (let n = 2; n < count; n++) o += `<option value="${n - 1}">Number ${n}</option>`;
      if (count > 1) o += `<option value="${count - 1}">Last (number ${count})</option>`;
      return o;
    };
    const dlg = openDialog({
      title: 'Move photo', size: 'sm',
      body:
        `<div class="move-photo">${src ? `<img src="${esc(src)}" alt="">` : ''}<p>${esc(label)}<br><span class="muted small">Now number ${i + 1} in “${esc(g.name)}”</span></p></div>` +
        `<div class="field"><label for="mv-gal">Gallery</label><select class="input" id="mv-gal">${targets.map((t) =>
          `<option value="${esc(t.id)}"${t === g ? ' selected' : ''}>${esc(t.name)}${t === g ? ' (this gallery)' : ''}</option>`).join('')}</select></div>` +
        `<div class="field"><label for="mv-pos">Spot</label><select class="input" id="mv-pos">${posOptions(g)}</select></div>`,
      foot: '<button type="button" class="btn btn--quiet" data-dlg-close>Cancel</button><button type="submit" class="btn btn--primary">Move</button>',
      focus: '#mv-pos',
      onSubmit: (d) => {
        const t = targets.find((y) => y.id === $('#mv-gal', d.box).value) || g;
        let to = Number($('#mv-pos', d.box).value) || 0;
        if (t !== g && t.items.length >= GALLERY_LIMIT) { toast(`“${t.name}” is full (${GALLERY_LIMIT} photos).`, 'error'); return; }
        if (t !== g && x.video && t.items.some((y) => y.video === x.video)) { toast(`“${t.name}” already has this video.`, 'error'); return; }
        const snap = clone(state.draft);
        g.items.splice(i, 1);
        to = Math.max(0, Math.min(to, t.items.length));
        t.items.splice(to, 0, x);
        d.close(true);
        if (t === g) {
          changed({ rerender: true, focus: `[data-gal="${g.id}"] [data-gi="${to}"] [data-act="g-move"]` });
          toast(`Moved to number ${to + 1}.`, 'ok');
        } else {
          changed({ rerender: true, focus: g.items.length ? `[data-gal="${g.id}"] [data-gi="${Math.min(i, g.items.length - 1)}"] [data-act="g-move"]` : `[data-gal="${g.id}"] h2` });
          withUndo(`Moved the ${x.video ? 'video' : 'photo'} to “${t.name}” (number ${to + 1}).`, snap);
        }
      },
    });
    dlg.box.addEventListener('change', (e) => {
      if (e.target.id !== 'mv-gal') return;
      const t = targets.find((y) => y.id === e.target.value) || g;
      const pos = $('#mv-pos', dlg.box);
      pos.innerHTML = posOptions(t);
      if (t !== g) pos.value = '0';
    });
  }

  /* ------------------------------------------------------------------ hours and holidays */
  function specialLabel(s) {
    const to = s.to || s.from;
    const when = to !== s.from ? `${fmtDateY(s.from)} – ${fmtDateY(to)}` : fmtDateY(s.from, true);
    const what = s.closed ? 'Closed' : `${R.fmtTime(s.open)} – ${R.fmtTime(s.close)}`;
    return `${when} · ${what}${s.note ? ` — ${s.note}` : ''}`;
  }
  function covered(special, from, to) {
    return special.some((s) => s.from <= from && (s.to || s.from) >= to);
  }

  function viewHours(main) {
    const h = state.draft.hours;
    const info = state.draft.info;
    const now = today();
    const owner = isOwner();
    const view = doc.createElement('div');
    view.className = 'view';
    const week = R.weekHours(state.draft);
    const upcoming = h.special.filter((s) => (s.to || s.from) >= now);
    const past = h.special.filter((s) => (s.to || s.from) < now);
    const horizon = R.addDays(now, 400);
    const holidays = YOM_TOV.filter(([from, to]) => to >= now && from <= horizon);
    view.innerHTML =
      '<div class="view__head"><div><h1 tabindex="-1">Hours & holidays</h1>' +
        '<p class="muted">Store hours drive the “Open now” label on every page. Closed days and holiday hours show on the contact and home pages, and change the “Open now” label on those days.</p></div>' +
        `<div class="view__actions"><button type="button" class="btn btn--quiet" data-act="preview-contact">${icon('eye')}Preview the contact page</button></div></div>` +

      '<section class="card" aria-labelledby="sd-title"><h2 id="sd-title" tabindex="-1">Closed days & holiday hours</h2>' +
        '<form class="special-form" data-add-special novalidate>' +
          '<div class="grid-4">' +
            `<div class="field"><label for="sp-from">From</label><input class="input" id="sp-from" type="date" min="${now}" required></div>` +
            `<div class="field"><label for="sp-to">To <span class="muted">(optional)</span></label><input class="input" id="sp-to" type="date" min="${now}"></div>` +
            '<fieldset class="field"><legend>That day</legend><div class="seg seg--small">' +
              '<label><input type="radio" name="sp-kind" value="closed" checked><span>Closed</span></label>' +
              '<label><input type="radio" name="sp-kind" value="hours"><span>Special hours</span></label></div></fieldset>' +
            '<div class="field" data-sp-times hidden><span class="label">Hours</span><div class="time-pair">' +
              '<label class="sr-only" for="sp-open">Opens</label><input class="input" id="sp-open" type="time" step="900" value="07:00">' +
              '<span aria-hidden="true">–</span><label class="sr-only" for="sp-close">Closes</label><input class="input" id="sp-close" type="time" step="900" value="14:00"></div></div>' +
          '</div>' +
          '<div class="field"><label for="sp-note">Reason <span class="muted">(shown on the website)</span></label><input class="input" id="sp-note" maxlength="80" placeholder="e.g. Yom Kippur, or Erev Pesach — closing early"></div>' +
          `<button type="submit" class="btn btn--primary">${icon('plus')}Add</button>` +
        '</form>' +
        (upcoming.length ? `<ul class="list">${upcoming.map((s) => `<li><span>${icon('calendar')}<strong>${esc(specialLabel(s))}</strong></span>` +
            `<button type="button" class="btn btn--quiet btn--sm" data-act="del-special" data-i="${h.special.indexOf(s)}">${icon('trash')}Remove<span class="sr-only"> ${esc(specialLabel(s))}</span></button></li>`).join('')}</ul>`
          : '<p class="empty">No closed days or holiday hours coming up.</p>') +
        (past.length ? `<p class="hint">${plural(past.length, 'past day')} still on the list (not shown on the website). <button type="button" class="link-btn" data-act="clear-past">Remove past days</button></p>` : '') +
      '</section>' +

      (holidays.length ? '<section class="card" aria-labelledby="jh-title"><h2 id="jh-title" tabindex="-1">Upcoming Jewish holidays</h2>' +
        '<p class="muted">Yom Tov days (outside Israel). Add the ones the bakery is closed with one click.</p>' +
        `<ul class="list">${holidays.map(([from, to, name], i) => {
          const have = covered(h.special, from, to);
          const when = from === to ? fmtDateY(from, true) : `${fmtDateY(from)} – ${fmtDateY(to)}`;
          return `<li><span><strong>${esc(name)}</strong> <span class="muted">· ${esc(when)}</span></span>` +
            (have ? `<span class="badge badge--ok">${icon('check')}On the list</span>` : `<button type="button" class="btn btn--quiet btn--sm" data-act="add-yt" data-i="${i}">${icon('plus')}Closed</button>`) + '</li>';
        }).join('')}</ul>` +
        (holidays.some(([f, t]) => !covered(h.special, f, t)) ? `<button type="button" class="btn btn--quiet btn--sm" data-act="add-yt-all">Add all as closed</button>` : '') +
      '</section>' : '') +

      '<section class="card" aria-labelledby="wh-title"><h2 id="wh-title">Weekly hours</h2>' +
        (owner ? '' : '<p class="note">Only the owner can change the weekly hours.</p>') +
        '<div class="hours-grid">' +
        WEEK.map((day) => {
          const x = week.find((w) => w.day === day);
          const open = !!(x.open && x.close);
          const dis = owner ? '' : ' disabled';
          return `<fieldset class="hours-row" data-day="${day}"><legend>${DAY[day]}</legend>` +
            `<label class="switch"><input type="checkbox" data-h="isopen"${open ? ' checked' : ''}${dis}><span>Open<span class="sr-only"> on ${DAY[day]}</span></span></label>` +
            `<div class="field"><label for="h-${day}-o">Opens</label><input class="input" id="h-${day}-o" type="time" step="900" data-h="open" value="${esc(x.open || '07:00')}"${open && owner ? '' : ' disabled'}></div>` +
            `<div class="field"><label for="h-${day}-c">Closes</label><input class="input" id="h-${day}-c" type="time" step="900" data-h="close" value="${esc(x.close || '17:00')}"${open && owner ? '' : ' disabled'}></div>` +
            `<span class="muted small hours-row__sum" data-sum>${open ? `${R.fmtTime(x.open)} – ${R.fmtTime(x.close)}` : 'Closed'}</span>` +
            '</fieldset>';
        }).join('') + '</div>' +
        '<div class="grid-2 field--gap">' +
          `<div class="field"><label for="hn-note">Note under the hours <span class="muted">(contact page)</span></label><input class="input" id="hn-note" maxlength="160" value="${esc(h.note || '')}"${owner ? '' : ' disabled'} placeholder="e.g. Friday winter hours: until 3:00 pm."></div>` +
          `<div class="field"><label for="hn-cafe">The café menu is served from</label><input class="input" id="hn-cafe" maxlength="80" value="${esc(info.cafeHours || '')}"${owner ? '' : ' disabled'} placeholder="7:00 am to 2:00 pm"></div>` +
        '</div>' +
      '</section>';
    main.appendChild(view);

    const kindSel = () => $('input[name="sp-kind"]:checked', view).value;
    const syncKind = () => { $('[data-sp-times]', view).hidden = kindSel() !== 'hours'; };
    const rowState = (fs) => {
      const day = Number(fs.getAttribute('data-day'));
      const x = h.week.find((w) => w.day === day);
      const isOpen = $('[data-h="isopen"]', fs).checked;
      const o = $('[data-h="open"]', fs), c = $('[data-h="close"]', fs);
      o.disabled = c.disabled = !isOpen;
      fieldError(c, '');
      if (!isOpen) { x.open = ''; x.close = ''; $('[data-sum]', fs).textContent = 'Closed'; return; }
      x.open = o.value; x.close = c.value;
      if (!o.value || !c.value) { fieldError(c, 'Enter both times.'); return; }
      if (c.value <= o.value) { fieldError(c, 'Must be after the opening time.'); return; }
      $('[data-sum]', fs).textContent = `${R.fmtTime(x.open)} – ${R.fmtTime(x.close)}`;
    };
    view.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'sp-kind') { syncKind(); return; }
      if (t.id === 'sp-from') { const to = $('#sp-to', view); to.min = t.value || now; if (to.value && to.value < t.value) to.value = ''; return; }
      const fs = t.closest('.hours-row');
      if (fs && owner) { rowState(fs); changed(); }
    });
    view.addEventListener('input', (e) => {
      const t = e.target;
      if (t.id === 'hn-note') { h.note = t.value; changed(); return; }
      if (t.id === 'hn-cafe') { info.cafeHours = t.value; changed(); return; }
      const fs = t.closest('.hours-row');
      if (fs && owner && t.type === 'time') { rowState(fs); changed(); }
    });
    $('[data-add-special]', view).addEventListener('submit', (e) => {
      e.preventDefault();
      const from = $('#sp-from', view), to = $('#sp-to', view);
      [from, to, $('#sp-close', view)].forEach((el) => fieldError(el, ''));
      if (!R.validDate(from.value)) { fieldError(from, 'Choose a date.'); from.focus(); return; }
      const end = to.value || from.value;
      if (end < from.value) { fieldError(to, 'Must be on or after the first day.'); to.focus(); return; }
      const closed = kindSel() === 'closed';
      const open = $('#sp-open', view).value, close = $('#sp-close', view).value;
      if (!closed && !(R.validTime(open) && R.validTime(close) && close > open)) { fieldError($('#sp-close', view), 'Closing must be after opening.'); $('#sp-close', view).focus(); return; }
      if (h.special.some((s) => !(end < s.from || from.value > (s.to || s.from)))) {
        fieldError(from, 'These dates overlap a day that’s already on the list.'); from.focus(); return;
      }
      const s = { from: from.value, to: end, closed, open: closed ? '' : open, close: closed ? '' : close, note: $('#sp-note', view).value.trim() };
      h.special.push(s);
      h.special.sort((a, b) => (a.from < b.from ? -1 : 1));
      changed({ rerender: true, focus: '#sp-from' });
      toast(`Added ${specialLabel(s)}.`, 'ok');
    });
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.getAttribute('data-act');
      if (act === 'preview-contact') openPreview('contact');
      else if (act === 'del-special') {
        const snap = clone(state.draft);
        const s = h.special.splice(Number(b.getAttribute('data-i')), 1)[0];
        changed({ rerender: true, focus: '#sp-from' });
        withUndo(`Removed ${specialLabel(s)}.`, snap);
      } else if (act === 'clear-past') {
        h.special = h.special.filter((s) => (s.to || s.from) >= now);
        changed({ rerender: true, focus: '#sp-from' });
        toast('Removed past days.');
      } else if (act === 'add-yt' || act === 'add-yt-all') {
        const list = act === 'add-yt' ? [holidays[Number(b.getAttribute('data-i'))]] : holidays.filter(([f, t]) => !covered(h.special, f, t));
        let n = 0;
        list.forEach(([from, to, name]) => {
          if (covered(h.special, from, to)) return;
          h.special = h.special.filter((s) => !(s.from >= from && (s.to || s.from) <= to));
          h.special.push({ from, to, closed: true, open: '', close: '', note: name });
          n++;
        });
        h.special.sort((a, c) => (a.from < c.from ? -1 : 1));
        changed({ rerender: true, focus: act === 'add-yt' ? '#jh-title' : '#sd-title' });
        toast(`Added ${plural(n, 'holiday')} as closed. Publish to show ${n > 1 ? 'them' : 'it'} on the website.`, 'ok');
      }
    });
  }

  /* ------------------------------------------------------------------ announcement and contact */
  const LINK_PAGES = [['', 'No link'], ['index.html', 'Home page'], ['online-ordering.html', 'Order online'], ['menu.html', 'Café menu']]
    .concat(R.PAGES.filter(([s]) => s !== 'index').map(([s, l]) => [`${s}.html`, l]))
    .concat([['contact.html', 'Contact & hours'], ['catering.html', 'Catering'], ['custom', 'Another website address…']]);

  function viewInfo(main) {
    const a = state.draft.announcement;
    const info = state.draft.info;
    const owner = isOwner();
    const now = today();
    const view = doc.createElement('div');
    view.className = 'view';
    const pageLink = LINK_PAGES.some(([v]) => v && v !== 'custom' && v === a.link);
    const linkMode = !a.link ? '' : pageLink ? a.link : 'custom';
    const schedule = () => {
      if (!a.text.trim()) return 'The bar is hidden (no text).';
      if (a.until && a.until < now) return `The bar ended on ${R.fmtDate(a.until, true)}, so it’s hidden.`;
      if (a.from && a.from > now) return `The bar will appear on ${R.fmtDate(a.from, true)}${a.until ? ` and disappear after ${R.fmtDate(a.until, true)}` : ''}.`;
      return a.until ? `The bar shows until the end of ${R.fmtDate(a.until, true)}.` : 'The bar shows on every page until you change it.';
    };
    view.innerHTML =
      '<div class="view__head"><div><h1 tabindex="-1">Announcement & contact</h1></div>' +
        `<div class="view__actions"><button type="button" class="btn btn--quiet" data-act="preview-home">${icon('eye')}Preview</button></div></div>` +
      '<section class="card" aria-labelledby="ann-title"><h2 id="ann-title">Announcement bar</h2>' +
        '<p class="muted">A gold bar at the very top of every page — for holiday closures, order deadlines or news. Leave it empty to hide the bar. Visitors can close it.</p>' +
        '<div class="field"><label for="an-text">Announcement</label>' +
          `<textarea class="input" id="an-text" rows="2" maxlength="${R.LIMITS.announcement}" aria-describedby="an-text-count" placeholder="e.g. Order your Rosh Hashanah challah by Sunday, Sept 10">${esc(a.text)}</textarea>${counter('an-text', a.text, R.LIMITS.announcement)}</div>` +
        '<div class="grid-3">' +
          `<div class="field"><label for="an-page">Link <span class="muted">(optional)</span></label><select class="input" id="an-page">${LINK_PAGES.map(([v, l]) => `<option value="${esc(v)}"${linkMode === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>` +
          `<div class="field" data-custom-link${linkMode === 'custom' ? '' : ' hidden'}><label for="an-link">Website address</label><input class="input" id="an-link" type="url" maxlength="${R.LIMITS.url}" placeholder="https://" value="${esc(linkMode === 'custom' ? a.link : '')}"></div>` +
          `<div class="field" data-link-text${a.link ? '' : ' hidden'}><label for="an-ltext">Link text</label><input class="input" id="an-ltext" maxlength="${R.LIMITS.linkText}" placeholder="Learn more" value="${esc(a.linkText)}"></div>` +
        '</div>' +
        '<div class="grid-3">' +
          `<div class="field"><label for="an-from">Show from <span class="muted">(optional)</span></label><input class="input" id="an-from" type="date" value="${esc(a.from)}"></div>` +
          `<div class="field"><label for="an-until">Until the end of <span class="muted">(optional)</span></label><input class="input" id="an-until" type="date" value="${esc(a.until)}"></div>` +
          `<div class="field field--end"><button type="button" class="btn btn--quiet btn--sm" data-act="clear-ann"${a.text ? '' : ' disabled'}>${icon('close')}Clear the announcement</button></div>` +
        '</div>' +
        '<p class="label">Preview</p><div class="ann-preview" data-ann-preview></div><p class="hint" data-ann-when></p>' +
      '</section>' +
      (owner ? '<section class="card" aria-labelledby="ct-title"><h2 id="ct-title">Contact details & links</h2>' +
        '<p class="muted">Used in the header, footer, buttons and forms on every page.</p>' +
        '<div class="grid-2">' +
          `<div class="field"><label for="in-phone">Phone</label><input class="input" id="in-phone" type="tel" maxlength="30" value="${esc(info.phone)}" autocomplete="off"></div>` +
          `<div class="field"><label for="in-email">E-mail <span class="muted">(orders and the contact form go here)</span></label><input class="input" id="in-email" type="email" maxlength="80" value="${esc(info.email)}" autocomplete="off"></div>` +
        '</div>' +
        `<div class="field"><label for="in-order">Online ordering link <span class="muted">(the “Order online” buttons)</span></label><input class="input" id="in-order" type="url" maxlength="${R.LIMITS.url}" value="${esc(info.orderUrl)}"></div>` +
      '</section>' : '');
    main.appendChild(view);

    const drawAnn = () => {
      const html = R.renderSlot('announce', state.draft, {});
      $('[data-ann-preview]', view).innerHTML = html ? html.replace(/<button[\s\S]*?<\/button>/, '') : '<em>The bar is hidden.</em>';
      $('[data-ann-preview]', view).classList.toggle('is-off', !html);
      $$('[data-ann-preview] a', view).forEach((x) => x.addEventListener('click', (ev) => ev.preventDefault()));
      $('[data-ann-when]', view).textContent = schedule();
      const cl = $('[data-act="clear-ann"]', view);
      if (cl) cl.disabled = !a.text;
    };
    drawAnn();
    view.addEventListener('input', (e) => {
      const t = e.target;
      const cnt = $(`[data-count-for="${t.id}"]`, view);
      if (cnt) cnt.textContent = t.value.length;
      if (t.id === 'an-text') a.text = t.value;
      else if (t.id === 'an-link') { a.link = t.value.trim(); fieldError(t, !a.link || R.safeLink(a.link) ? '' : 'Use a full address starting with https://'); }
      else if (t.id === 'an-ltext') a.linkText = t.value;
      else if (t.id === 'in-phone') { info.phone = t.value; fieldError(t, t.value.replace(/\D/g, '').length >= 10 ? '' : 'Enter the full phone number.'); }
      else if (t.id === 'in-email') { info.email = t.value.trim(); fieldError(t, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email) ? '' : 'Enter an e-mail address like name@example.com'); }
      else if (t.id === 'in-order') { info.orderUrl = t.value.trim(); fieldError(t, /^https:\/\/\S+$/.test(info.orderUrl) ? '' : 'Use a full address starting with https://'); }
      else return;
      changed();
      drawAnn();
    });
    view.addEventListener('change', (e) => {
      const t = e.target;
      if (t.id === 'an-page') {
        const custom = t.value === 'custom';
        $('[data-custom-link]', view).hidden = !custom;
        a.link = custom ? $('#an-link', view).value.trim() : t.value;
        $('[data-link-text]', view).hidden = !(custom || t.value);
        if ((custom || t.value) && !a.linkText) { a.linkText = 'Learn more'; $('#an-ltext', view).value = a.linkText; }
        if (custom) $('#an-link', view).focus();
      } else if (t.id === 'an-from' || t.id === 'an-until') {
        a.from = $('#an-from', view).value;
        a.until = $('#an-until', view).value;
        fieldError($('#an-until', view), a.from && a.until && a.until < a.from ? 'Must be on or after the start date.' : '');
      } else return;
      changed();
      drawAnn();
    });
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.getAttribute('data-act') === 'preview-home') openPreview('index');
      if (b.getAttribute('data-act') === 'clear-ann') {
        const snap = clone(state.draft);
        Object.assign(a, { text: '', link: '', linkText: '', from: '', until: '' });
        changed({ rerender: true, focus: '#an-text' });
        withUndo('Announcement cleared. Publish to hide the bar.', snap);
      }
    });
  }

  /* ------------------------------------------------------------------ history and backup */
  function viewHistory(main) {
    const view = doc.createElement('div');
    view.className = 'view';
    view.innerHTML =
      '<div class="view__head"><div><h1 tabindex="-1">History & backup</h1>' +
        '<p class="muted">Every publish is saved here. Restoring a version publishes it again, so it goes live right away.</p></div></div>' +
      '<section class="card" aria-labelledby="hist-title"><h2 id="hist-title">Published versions</h2><div data-versions aria-busy="true"><p class="muted">Loading…</p></div></section>' +
      '<section class="card" aria-labelledby="bk-title"><h2 id="bk-title">Backup</h2>' +
        '<p class="muted">Download a copy of everything in the panel (including changes you haven’t published), or load one back in to review and publish.</p>' +
        '<div class="btn-row">' +
          `<button type="button" class="btn btn--quiet" data-act="download">${icon('download')}Download backup</button>` +
          `<label class="btn btn--quiet file-btn">${icon('upload')}<span>Load a backup</span><input type="file" class="sr-only" accept="application/json,.json" data-backup-input></label>` +
          `<button type="button" class="btn btn--quiet" data-act="reset-original">${icon('undo')}Start again from the website files</button>` +
        '</div><p class="hint" data-backup-status aria-live="polite"></p></section>';
    main.appendChild(view);
    const box = $('[data-versions]', view);
    let versions = [];
    state.backend.history().then((list) => {
      versions = list;
      box.removeAttribute('aria-busy');
      if (!list.length) {
        box.innerHTML = '<p class="empty">Nothing published yet. The website shows what’s in its own files.</p>';
        return;
      }
      box.innerHTML = `<ul class="list list--versions">${list.map((v, i) => `<li data-v="${v.version}"><div class="list__row"><span><strong>Version ${v.version}</strong>${i === 0 ? ' <span class="badge badge--ok">Live now</span>' : ''}` +
        `<br><span class="muted small">${esc(fmtStamp(v.savedAt))}${v.by ? ` · ${esc(v.by)}` : ''}${v.note ? ` · ${esc(v.note)}` : ''}</span></span>` +
        '<span class="btn-row btn-row--tight">' +
          `<button type="button" class="btn btn--quiet btn--sm" data-act="diff" aria-expanded="false">What changed</button>` +
          (i === 0 ? '' : `<button type="button" class="btn btn--quiet btn--sm" data-act="restore">${icon('history')}Restore<span class="sr-only"> version ${v.version}</span></button>`) +
        '</span></div><div class="list__more" hidden></div></li>').join('')}</ul>`;
    }).catch((ex) => {
      box.removeAttribute('aria-busy');
      box.innerHTML = `<p class="form-error">${esc(ex.message)}</p>`;
    });
    view.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.getAttribute('data-act');
      const li = b.closest('[data-v]');
      const v = li ? Number(li.getAttribute('data-v')) : 0;
      if (act === 'diff') {
        const more = $('.list__more', li);
        const open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(open));
        more.hidden = !open;
        if (!open || more.dataset.done) return;
        more.innerHTML = '<p class="muted small">Loading…</p>';
        try {
          const cur = await state.backend.getVersion(v);
          const idx = versions.findIndex((x) => x.version === v);
          const prevMeta = versions[idx + 1];
          const prev = prevMeta ? await state.backend.getVersion(prevMeta.version) : { doc: state.original };
          const lines = R.describeChanges(normalized(prev.doc), normalized(cur.doc), today());
          more.innerHTML = lines.length ? `<ul class="change-list">${lines.slice(0, 40).map((l) => `<li>${esc(l)}</li>`).join('')}${lines.length > 40 ? `<li>…and ${lines.length - 40} more</li>` : ''}</ul>` +
            (prevMeta ? '' : '<p class="muted small">Compared with the website’s own files.</p>') : '<p class="muted small">No visible changes.</p>';
          more.dataset.done = '1';
        } catch (ex) { more.innerHTML = `<p class="form-error">${esc(ex.message)}</p>`; }
      } else if (act === 'restore') {
        const ok = await ask({
          title: `Restore version ${v}?`, ok: 'Restore and publish',
          text: isDirty() ? `This publishes version ${v} right away and replaces your unpublished changes.` : `This publishes version ${v} right away. You can undo it by restoring the current version afterwards.`,
        });
        if (!ok) return;
        b.disabled = true;
        try {
          const res = await state.backend.restore(v);
          await state.backend.preload([res.doc]);
          state.published = { version: res.version, savedAt: res.savedAt, doc: normalized(res.doc) };
          state.draft = clone(state.published.doc);
          store.del(DRAFT_KEY());
          changed({ rerender: true, focus: 'h1' });
          toast(`Restored version ${v}. It’s live now.`, 'ok');
        } catch (ex) {
          b.disabled = false;
          if (ex.code === 'signed_out') handleSaveError(ex); else toast(ex.message, 'error');
        }
      } else if (act === 'download') {
        const data = JSON.stringify({ app: 'delice-admin', exportedAt: new Date().toISOString(), doc: normalized(state.draft) }, null, 1);
        const a = doc.createElement('a');
        a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        a.download = `delice-backup-${today()}.json`;
        doc.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        $('[data-backup-status]', view).textContent = 'Backup downloaded.';
      } else if (act === 'reset-original') {
        const ok = await ask({ title: 'Start again from the website files?', text: 'Your draft is replaced with what’s in the website’s own files. Nothing changes on the website until you publish.', ok: 'Start again', danger: true });
        if (!ok) return;
        const snap = clone(state.draft);
        state.draft = clone(state.original);
        changed({ rerender: true, focus: 'h1' });
        withUndo('Draft reset to the website files. Publish to make it live.', snap);
      }
    });
    $('[data-backup-input]', view).addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      const status = $('[data-backup-status]', view);
      if (!file) return;
      try {
        if (file.size > 8 * 1024 * 1024) throw new Error('That file is too large to be a backup.');
        const parsed = JSON.parse(await file.text());
        const d = parsed && parsed.doc;
        if (!d || !Array.isArray(d.sections) || !d.hours || !d.info) throw new Error('That file isn’t a Delice Bakery admin backup.');
        const ok = await ask({ title: 'Load this backup?', text: `It replaces your current draft (backup from ${fmtStamp(Date.parse(parsed.exportedAt)) || 'an unknown date'}). Nothing changes on the website until you publish.`, ok: 'Load backup' });
        if (!ok) return;
        state.draft = normalized(d);
        await state.backend.preload([d]);
        changed({ rerender: true, focus: 'h1' });
        const problems = R.problemsIn(state.draft);
        toast(problems.length ? `Backup loaded. ${plural(problems.length, 'thing needs', 'things need')} fixing before you can publish.` : 'Backup loaded. Review it, then publish.', problems.length ? 'error' : 'ok');
      } catch (ex) {
        status.textContent = ex instanceof SyntaxError ? 'That file isn’t a Delice Bakery admin backup.' : ex.message;
      }
    });
  }

  /* ------------------------------------------------------------------ logins and security */
  const WORDS = ['almond', 'apricot', 'baguette', 'berry', 'brioche', 'butter', 'caramel', 'challah', 'cherry', 'cinnamon', 'cocoa', 'coffee', 'crumble', 'custard', 'donut', 'eclair', 'fig', 'ganache', 'hazelnut', 'honey', 'lemon', 'macaron', 'mango', 'maple', 'meringue', 'mocha', 'napoleon', 'nutmeg', 'orange', 'pastry', 'peach', 'pecan', 'pistachio', 'praline', 'raisin', 'sesame', 'sourdough', 'sugar', 'tart', 'toffee', 'vanilla', 'walnut'];
  function suggestPasscode() {
    const r = crypto.getRandomValues(new Uint32Array(4));
    return `${WORDS[r[0] % WORDS.length]}-${WORDS[r[1] % WORDS.length]}-${WORDS[r[2] % WORDS.length]}-${10 + (r[3] % 90)}`;
  }
  function passcodeProblem(p, user) {
    if (p.length < 12) return 'Use at least 12 characters.';
    if (new Set(p).size < 5) return 'Use more different characters.';
    if (user && p.toLowerCase().includes(String(user).toLowerCase())) return 'Don’t include the username.';
    if (/^(.)\1+$/.test(p) || /^(0123456789|1234567890)/.test(p) || /password|delice|bakery/i.test(p) && p.length < 16) return 'That passcode is too easy to guess.';
    return '';
  }
  const ACTIONS = { login: 'Logged in', login_failed: 'Wrong passcode', login_blocked: 'Login blocked (too many tries)', publish: 'Published', restore: 'Restored a version', photo_upload: 'Photo uploaded', logout_all: 'Logged out everywhere', user_add: 'Staff login added', user_update: 'Staff passcode changed', user_remove: 'Staff login removed', password: 'Changed own passcode', preview: 'Made a preview' };

  function viewSecurity(main) {
    const test = state.backend.kind === 'local';
    const owner = isOwner();
    const view = doc.createElement('div');
    view.className = 'view';
    const passForm = (prefix, withCurrent, label) =>
      `<form class="pass-form" data-form="${prefix}" novalidate>` +
        (withCurrent ? `<div class="field"><label for="${prefix}-cur">Current passcode</label><input class="input" id="${prefix}-cur" type="password" autocomplete="current-password" maxlength="200"></div>` : '') +
        `<div class="field"><label for="${prefix}-new">New passcode</label><div class="pass"><input class="input" id="${prefix}-new" type="text" autocomplete="new-password" spellcheck="false" maxlength="200" aria-describedby="${prefix}-hint">` +
          `<button type="button" class="btn btn--quiet btn--sm" data-act="suggest" data-for="${prefix}-new">Suggest one</button></div>` +
          `<p class="hint" id="${prefix}-hint">At least 12 characters. Several words with a number are easy to type and hard to guess.</p></div>` +
        `<button type="submit" class="btn btn--primary">${label}</button></form>`;
    view.innerHTML =
      '<div class="view__head"><div><h1 tabindex="-1">Logins & security</h1></div></div>' +
      (test
        ? '<section class="card"><h2>Test mode</h2>' +
            '<p>You’re using test mode on this computer: <code>admin</code> (owner) or <code>staff</code>, both with the passcode <code>1234</code>. It only saves in this browser. The live panel uses your own passcodes, at least 12 characters long.</p>' +
            `<label class="switch"><input type="checkbox" data-act="preview-toggle"${localBackend.previewOn() ? ' checked' : ''}><span>Show published test changes on this copy of the website</span></label>` +
            `<p class="btn-row"><button type="button" class="btn btn--danger-quiet" data-act="reset-test">${icon('trash')}Reset test data</button></p></section>`
        : '<section class="card" aria-labelledby="me-title"><h2 id="me-title">Your login</h2>' +
            `<p>Logged in as <strong>${esc(state.user)}</strong> (${owner ? 'owner' : 'staff'}). Logins end after 60 minutes without activity, or after 8 hours.</p>` +
            passForm('me', true, 'Change my passcode') +
            (owner ? '<p class="hint">Forgot it? Double-click “Set admin passcode” in the admin-panel folder on your computer to set a new one.</p>' : '<p class="hint">Forgot it? Ask the owner to give you a new passcode.</p>') +
          '</section>') +
      (owner && !test ? '<section class="card" aria-labelledby="st-title"><h2 id="st-title">Staff logins</h2>' +
          '<p class="muted">Give a login to staff at the counter. Staff can mark items sold out (or sold out today), add closed days and holiday hours, and change the announcement. They can’t change prices, items, photos or logins.</p>' +
          '<div data-users aria-busy="true"><p class="muted">Loading…</p></div>' +
          '<details class="add-user"><summary class="btn btn--quiet btn--sm">' + icon('plus') + 'Add a staff login</summary>' +
            '<form class="pass-form" data-form="nu" novalidate><div class="field"><label for="nu-name">Username</label>' +
            '<input class="input" id="nu-name" maxlength="40" autocapitalize="none" spellcheck="false" autocomplete="off" placeholder="e.g. counter"></div>' +
            '<div class="field"><label for="nu-new">Passcode</label><div class="pass"><input class="input" id="nu-new" type="text" autocomplete="new-password" spellcheck="false" maxlength="200">' +
            '<button type="button" class="btn btn--quiet btn--sm" data-act="suggest" data-for="nu-new">Suggest one</button></div>' +
            '<p class="hint">Give the passcode to the person in person, not by e-mail.</p></div>' +
            '<button type="submit" class="btn btn--primary">Add staff login</button></form></details>' +
        '</section>' : '') +
      (owner && !test ? '<section class="card" aria-labelledby="dev-title"><h2 id="dev-title">Logged-in devices</h2><div data-sessions aria-busy="true"><p class="muted">Loading…</p></div>' +
          `<p class="btn-row"><button type="button" class="btn btn--quiet" data-act="logout-all">${icon('logout')}Log out on all devices</button></p></section>` +
        '<section class="card" aria-labelledby="act-title"><h2 id="act-title">Recent activity</h2><div data-activity aria-busy="true"><p class="muted">Loading…</p></div></section>' : '') +
      '<section class="card"><h2>How the panel is protected</h2><ul class="bullets">' +
        '<li>Passcodes are checked on the server. Staff passcodes are stored only as a salted hash.</li>' +
        '<li>After 5 wrong tries, logins from that network are locked for 15 minutes, and longer each time it happens again. Phones and computers that have logged in before have their own limit, so other people’s wrong tries can’t lock you out.</li>' +
        '<li>Your login is kept in a secure cookie that scripts can’t read, and it ends on its own.</li>' +
        '<li>Changes are only accepted from this panel, and every change is checked on the server before it’s saved.</li>' +
        '<li>Uploaded files must be real JPG, PNG or WebP photos.</li>' +
      '</ul><p class="muted small">Use passcodes you don’t use anywhere else, and don’t share them by text or e-mail.</p></section>';
    main.appendChild(view);

    const loadUsers = () => {
      const box = $('[data-users]', view);
      if (!box) return;
      state.backend.users().then((users) => {
        box.removeAttribute('aria-busy');
        const staff = users.filter((u) => u.role === 'staff');
        box.innerHTML = staff.length ? `<ul class="list">${staff.map((u) => `<li data-user="${esc(u.name)}"><span>${icon('user')}<strong>${esc(u.name)}</strong>` +
          `<span class="muted small"> · ${u.lastLogin ? `last login ${esc(fmtAgo(u.lastLogin))}` : 'never logged in'}</span></span>` +
          '<span class="btn-row btn-row--tight">' +
            `<button type="button" class="btn btn--quiet btn--sm" data-act="user-pass">New passcode</button>` +
            `<button type="button" class="btn btn--danger-quiet btn--sm" data-act="user-del">${icon('trash')}Remove</button></span></li>`).join('')}</ul>`
          : '<p class="empty">No staff logins yet.</p>';
      }).catch((ex) => { box.removeAttribute('aria-busy'); box.innerHTML = `<p class="form-error">${esc(ex.message)}</p>`; });
    };
    const loadActivity = () => {
      const act = $('[data-activity]', view), ses = $('[data-sessions]', view);
      if (!act) return;
      state.backend.activity().then((r) => {
        act.removeAttribute('aria-busy');
        ses.removeAttribute('aria-busy');
        act.innerHTML = r.events.length
          ? `<div class="table-wrap"><table class="table"><thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">What</th><th scope="col">Network</th></tr></thead><tbody>${r.events.map((ev) =>
            `<tr class="${ev.action === 'login_failed' || ev.action === 'login_blocked' ? 'is-warn' : ''}"><td class="nowrap">${esc(fmtStamp(ev.at))}</td><td>${esc(ev.user || '—')}</td><td>${esc(ACTIONS[ev.action] || ev.action)}${ev.detail ? ` · ${esc(ev.detail)}` : ''}</td><td><code>${esc(ev.ip)}</code></td></tr>`).join('')}</tbody></table></div>`
          : '<p class="empty">No activity yet.</p>';
        ses.innerHTML = r.sessions.length
          ? `<ul class="list">${r.sessions.map((s) => `<li><span>${icon('user')}<strong>${esc(s.user)}</strong> <span class="muted small">· ${esc(browserName(s.agent))} · active ${esc(fmtAgo(s.lastSeen))} · <code>${esc(s.ip)}</code>${s.current ? ' · this device' : ''}</span></span></li>`).join('')}</ul>`
          : '<p class="empty">Nobody else is logged in.</p>';
      }).catch((ex) => { act.removeAttribute('aria-busy'); act.innerHTML = `<p class="form-error">${esc(ex.message)}</p>`; });
    };
    loadUsers();
    loadActivity();

    view.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const kind = form.getAttribute('data-form');
      const btn = $('button[type="submit"]', form);
      if (kind === 'me') {
        const cur = $('#me-cur', view), nw = $('#me-new', view);
        fieldError(cur, cur.value ? '' : 'Enter your current passcode.');
        const prob = passcodeProblem(nw.value, state.user);
        fieldError(nw, prob);
        if (!cur.value) { cur.focus(); return; }
        if (prob) { nw.focus(); return; }
        btn.disabled = true;
        try {
          await state.backend.changePassword(cur.value, nw.value);
          cur.value = ''; nw.value = '';
          toast('Passcode changed. Other devices using this login were logged out.', 'ok');
        } catch (ex) {
          if (ex.code === 'invalid') fieldError(cur, 'That isn’t your current passcode.'); else toast(ex.message, 'error');
        } finally { btn.disabled = false; }
      } else if (kind === 'nu') {
        const name = $('#nu-name', view), pw = $('#nu-new', view);
        const n = name.value.trim().toLowerCase();
        fieldError(name, /^[a-z0-9][a-z0-9._-]{1,39}$/.test(n) ? '' : 'Use 2 to 40 letters or numbers (no spaces).');
        const prob = passcodeProblem(pw.value, n);
        fieldError(pw, prob);
        if (!/^[a-z0-9][a-z0-9._-]{1,39}$/.test(n)) { name.focus(); return; }
        if (prob) { pw.focus(); return; }
        btn.disabled = true;
        try {
          await state.backend.saveUser(n, pw.value);
          name.value = ''; pw.value = '';
          $('details.add-user', view).open = false;
          toast(`Staff login “${n}” added.`, 'ok');
          loadUsers();
        } catch (ex) { toast(ex.message, 'error'); } finally { btn.disabled = false; }
      }
    });
    view.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.getAttribute('data-act');
      const li = b.closest('[data-user]');
      const name = li ? li.getAttribute('data-user') : '';
      if (act === 'suggest') {
        const inp = $(`#${b.getAttribute('data-for')}`, view);
        inp.value = suggestPasscode();
        fieldError(inp, '');
        inp.focus();
        inp.select();
      } else if (act === 'user-pass') {
        const pw = suggestPasscode();
        const ok = await ask({ title: `New passcode for “${name}”?`, text: 'They’ll be logged out and need this new passcode:', html: `<p class="big-code"><code>${esc(pw)}</code></p><p class="muted small">Write it down or give it to them in person before you close this.</p>`, ok: 'Set this passcode' });
        if (!ok) return;
        try { await state.backend.saveUser(name, pw); toast(`New passcode set for “${name}”.`, 'ok'); loadUsers(); } catch (ex) { toast(ex.message, 'error'); }
      } else if (act === 'user-del') {
        const ok = await ask({ title: `Remove “${name}”?`, text: 'They’re logged out right away and can’t log in again.', ok: 'Remove login', danger: true });
        if (!ok) return;
        try { await state.backend.deleteUser(name); toast(`Removed “${name}”.`); loadUsers(); loadActivity(); } catch (ex) { toast(ex.message, 'error'); }
      } else if (act === 'logout-all') {
        const ok = await ask({ title: 'Log out on all devices?', text: 'Everyone using the admin panel, including you, will need to log in again, and every phone or computer counts as new until it does. Use this if a device is lost.', ok: 'Log out everywhere', danger: true });
        if (!ok) return;
        try { await state.backend.logoutAll(); } catch (ex) { /* ignore */ }
        saveDraftNow();
        state.draft = null;
        renderLogin({ message: 'You’re logged out on all devices.' });
      } else if (act === 'reset-test') {
        const ok = await ask({ title: 'Reset test data?', text: 'All test changes, history and photos in this browser are deleted. The live website isn’t affected.', ok: 'Reset test data', danger: true });
        if (!ok) return;
        await localBackend.reset();
        store.del(DRAFT_KEY());
        await startApp();
        state.tab = 'security';
        renderTab('h1');
        toast('Test data reset.');
      }
    });
    view.addEventListener('change', (e) => {
      if (e.target.getAttribute('data-act') === 'preview-toggle') {
        localBackend.setPreview(e.target.checked);
        toast(e.target.checked ? 'This copy of the website shows your published test changes.' : 'This copy of the website shows its own files.');
      }
    });
  }
  function browserName(ua) {
    ua = String(ua || '');
    const dev = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : '';
    const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    return dev ? `${br} on ${dev}` : br;
  }

  /* ------------------------------------------------------------------ start */
  async function startTestMode() {
    state.backend = localBackend;
    setSite('');
    const s = await localBackend.session();
    if (s.authenticated) { state.user = s.user; state.role = s.role; await startApp(); } else renderLogin();
  }

  async function boot() {
    const bootMsg = $('[data-boot]');
    try {
      if (!R) throw new Error('The shared renderer (render.js) didn’t load.');
      if (IS_SERVER) {
        state.backend = serverBackend;
        const s = await serverBackend.session();
        setSite(s.siteUrl || '');
        state.user = s.user || '';
        state.role = s.role || 'owner';
        if (s.authenticated) await startApp(); else renderLogin({ setup: s.setup });
        return;
      }
      const live = adminUrlFromSite();
      if (!IS_LOCAL) { renderLinkPage(live); return; }
      if (live) { renderChooser(live); return; }
      await startTestMode();
    } catch (ex) {
      if (bootMsg) bootMsg.textContent = `The admin panel couldn’t start: ${ex.message}`;
      else app().innerHTML = `<p class="boot">The admin panel couldn’t start: ${esc(ex.message)}</p>`;
    }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();
