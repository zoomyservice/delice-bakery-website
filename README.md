# Delice Bakery website

New website for Delice Bakery (delicebakery.com), 8583 W. Pico Blvd, Los Angeles.
Built by Zoomy LLC to replace the Wix site. Every page, price, photo and video from the
old site is here, and the page addresses match the old ones (/cake-1, /challah, /menu …),
so existing links and Google results keep working.

## Pages
Home · Holidays (Rosh Hashanah, Hanukkah, Purim, Passover, Shavuot, Thanksgiving) ·
Cakes & Tarts · Macarons · Specialty cakes (wedding, croquembouche, letter, birthday,
towers, custom) · Café menu & online ordering · Drinks · Croissants · Bread · Challah ·
Catering · Gluten free · Kosher · Contact · About

## Hosting
Static site (plain HTML/CSS/JS) served from GitHub Pages. To use delicebakery.com, add a
`CNAME` file containing `www.delicebakery.com`, then point the domain's DNS at GitHub Pages.

## Ordering and forms
- "Order online" buttons go to the bakery's ChowNow page.
- Contact and newsletter forms open the visitor's email app addressed to
  delicebakery26@gmail.com. To receive them automatically instead, create a free form at
  formspree.io and set `"provider": "formspree"` and the `"endpoint"` in the `delice-config`
  script near the bottom of each page.

## Admin panel
Menus and prices, holiday cards, photo galleries, hours and closed days, and the
announcement bar are edited in the admin panel at https://delice-admin.pages.dev
(owner and staff logins). Its code and setup scripts are in the `admin-panel` folder next
to this one.
- Published changes show on the website within about a minute: `assets/js/live.js` asks
  the panel for the latest version and redraws only what changed. If the panel can't be
  reached, pages simply show what's in their files.
- Every 15 minutes a GitHub Action (`.github/workflows/bake.yml`, running `tools/bake.mjs`)
  writes the latest published version into the pages, `assets/data/site.json` and
  `assets/img/u/`, and commits it. Run `git pull` before editing files here.
  GitHub pauses scheduled actions after 60 days without commits; if that happens, turn it
  back on in the repository's Actions tab.
- The editable spots in the pages are marked `<!--slot:...-->`; the content comes from
  `assets/data/site.json`, not from hand edits in those spots.
- `admin.html` links to the panel. Opened from this folder on your own computer, it also
  offers a test mode (admin / 1234) that saves only in that browser.
