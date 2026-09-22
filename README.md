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
  formspree.io and set `provider: "formspree"` and the endpoint in the `window.DELICE`
  line near the bottom of each page.
