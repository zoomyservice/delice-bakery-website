#!/usr/bin/env node
/* Delice Bakery — "bake" the website's editable parts into the HTML files.

   node tools/bake.mjs --local            redraw every page from assets/data/site.json (used by the build)
   node tools/bake.mjs --remote [URL]     fetch what was last published in the admin panel, download new photos,
                                          redraw the pages and update assets/data/site.json (used by the GitHub Action)

   Every editable spot in a page is marked like  <!--slot:list:cakes#hash--> ... <!--/slot:list:cakes-->
   and blocks that disappear when their item is hidden carry  data-show="section/item".
   Without the admin panel the website still works from these files; with it, pages also pick up
   newer changes in the browser (assets/js/live.js). */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const R = require(path.join(ROOT, "assets/js/render.js"));
const DATA = path.join(ROOT, "assets/data/site.json");
const UP_DIR = path.join(ROOT, "assets/img/u");

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i > -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : ""; };

const SLOT = /<!--slot:([^#>]+?)(?:#[a-z0-9]+)?-->[\s\S]*?<!--\/slot:\1-->/g;
const SHOW = /data-show="([a-z0-9-]+\/[a-z0-9-]+)"( hidden)?/g;
const CONFIG = /<script type="application\/json" id="delice-config">[\s\S]*?<\/script>/;

function htmlFiles() {
  return fs.readdirSync(ROOT).filter((f) => f.endsWith(".html")).map((f) => path.join(ROOT, f));
}
function readSite() { return JSON.parse(fs.readFileSync(DATA, "utf8")); }
/* The same data as a script, so the admin panel's test mode also works when opened straight from the files. */
function writeSite(site) {
  fs.writeFileSync(DATA, JSON.stringify(site, null, 1));
  fs.writeFileSync(DATA.replace(/\.json$/, ".js"), "window.DELICE_SEED = " + JSON.stringify(site).replace(/</g, "\\u003c") + ";\n");
}
function pageConfig(html) {
  const m = CONFIG.exec(html);
  if (!m) return null;
  try { return JSON.parse(m[0].replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "")); } catch (e) { return null; }
}

/* Photos uploaded in the admin panel are copied into assets/img/u/ so the pages don't depend on the panel. */
function uploadPath(id, variant, t) {
  return `assets/img/u/${id}${variant === "m" ? "-m" : ""}.${t || "webp"}`;
}
function uploadTypes(doc) {
  const types = {};
  R.eachPhoto(doc, (p) => { if (/^upload:/.test(String(p.src))) types[p.src.slice(7)] = p.t || "webp"; });
  return types;
}
export function bakeCtx(doc, today) {
  const types = uploadTypes(doc);
  return { today, upload: (id, variant) => uploadPath(id, variant, types[id]) };
}

async function download(base, doc) {
  const types = uploadTypes(doc);
  fs.mkdirSync(UP_DIR, { recursive: true });
  let n = 0;
  for (const [id, t] of Object.entries(types)) {
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(id)) throw new Error(`bad photo id ${id}`);
    for (const variant of ["full", "m"]) {
      const file = path.join(ROOT, uploadPath(id, variant, t));
      if (fs.existsSync(file)) continue;
      const res = await fetch(`${base}/img/${id}${variant === "m" ? "?v=m" : ""}`);
      if (!res.ok) throw new Error(`photo ${id} (${variant}): HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) throw new Error(`photo ${id} (${variant}) is empty`);
      fs.writeFileSync(file, buf);
      n++;
    }
  }
  return n;
}

function replaceAllText(html, a, b) { return a && b && a !== b ? html.split(a).join(b) : html; }
function digits(s) { return String(s || "").replace(/\D/g, ""); }

/* Contact details that appear all over the pages (links, buttons, footer) follow the data too. */
function swapInfo(html, oldInfo, newInfo) {
  if (!oldInfo || !newInfo) return html;
  if (oldInfo.phone !== newInfo.phone && newInfo.phone) {
    const ot = "+1" + digits(oldInfo.phone).slice(-10), nt = "+1" + digits(newInfo.phone).slice(-10);
    html = replaceAllText(html, `tel:${ot}`, `tel:${nt}`);
    html = replaceAllText(html, oldInfo.phone, newInfo.phone);
  }
  if (oldInfo.email !== newInfo.email && newInfo.email) html = replaceAllText(html, oldInfo.email, newInfo.email);
  if (oldInfo.orderUrl !== newInfo.orderUrl && newInfo.orderUrl) {
    html = replaceAllText(html, R.esc(oldInfo.orderUrl), R.esc(newInfo.orderUrl));
  }
  return html;
}

export function bakeHtml(html, doc, ctx, version, oldInfo) {
  let slots = 0;
  html = html.replace(SLOT, (all, id) => {
    const out = R.renderSlot(id, doc, ctx);
    if (out == null) return all;
    slots++;
    return `<!--slot:${id}#${R.hash(out)}-->${out}<!--/slot:${id}-->`;
  });
  html = html.replace(SHOW, (all, ref) => `data-show="${ref}"${R.showState(ref, doc) ? "" : " hidden"}`);
  html = html.replace(/(<html[^>]*?) data-v="\d+"/, `$1 data-v="${version}"`);
  const cfg = pageConfig(html);
  if (cfg) {
    cfg.v = version;
    cfg.hours = R.hoursConfig(doc);
    cfg.info = { phone: doc.info.phone, email: doc.info.email, orderUrl: doc.info.orderUrl };
    html = html.replace(CONFIG, `<script type="application/json" id="delice-config">${JSON.stringify(cfg).replace(/</g, "\\u003c")}</script>`);
  }
  html = swapInfo(html, oldInfo, doc.info);
  return { html, slots };
}

function bakeAll(site, oldInfo) {
  const doc = site.doc;
  const ctx = bakeCtx(doc, R.laToday());
  let pages = 0, slots = 0;
  for (const file of htmlFiles()) {
    const before = fs.readFileSync(file, "utf8");
    if (!before.includes("<!--slot:") && !before.includes('id="delice-config"')) continue;
    const r = bakeHtml(before, doc, ctx, site.version || 0, oldInfo);
    slots += r.slots;
    if (r.html !== before) { fs.writeFileSync(file, r.html); pages++; }
  }
  return { pages, slots };
}

async function main() {
  const current = readSite();
  if (flag("--local")) {
    const r = bakeAll(current, null);
    writeSite(current);
    console.log(`Baked ${r.slots} spots, ${r.pages} pages changed (version ${current.version || 0}).`);
    return;
  }
  if (flag("--remote")) {
    let base = opt("--remote");
    if (!base) {
      const cfg = pageConfig(fs.readFileSync(path.join(ROOT, "index.html"), "utf8")) || {};
      base = cfg.admin || "";
    }
    base = base.replace(/\/+$/, "");
    if (!/^https:\/\/|^http:\/\/(localhost|127\.0\.0\.1)[:/]/.test(base)) { console.log("No admin panel address set; nothing to do."); return; }
    const res = await fetch(`${base}/api/public?full=1`, { headers: { "Cache-Control": "no-cache" } });
    if (!res.ok) throw new Error(`The admin panel answered ${res.status}`);
    const pub = await res.json();
    if (!pub || !pub.version) { console.log("Nothing has been published yet."); return; }
    if (pub.version <= (current.version || 0) && !flag("--force")) { console.log(`Already up to date (version ${current.version}).`); return; }
    if (!pub.doc || !Array.isArray(pub.doc.sections)) throw new Error("The published data looks wrong; not baking it.");
    const n = await download(base, pub.doc);
    const next = { version: pub.version, savedAt: pub.savedAt || null, doc: pub.doc };
    const r = bakeAll(next, current.doc && current.doc.info);
    writeSite(next);
    console.log(`Baked version ${pub.version}: ${r.slots} spots, ${r.pages} pages changed, ${n} photos downloaded.`);
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${pub.version}\n`);
    return;
  }
  console.log("Use --local or --remote [admin panel address].");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e.message || e); process.exit(1); });
}
