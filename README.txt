CRACKERS ICON WEBSITE — FULL CODE AUDIT / MOBILE CART FIX

Files are at the ZIP root. There is no separate assets folder: the logo and hero banner are embedded in the HTML.

Included files:
- index.html
- order.html
- style.css
- home.js
- order.js
- legal.js
- products.js
- products.json

Corrections made after reviewing the existing code:
- Unified the cart button handling so View Cart opens the correct right-side drawer on both pages.
- Rebuilt the homepage drawer to show individual cart items, quantities, remove controls, line totals, grand total, minimum-order notice, and enquiry button.
- Made cart quantity changes update the catalogue, cart table/drawer, and totals together.
- Removed overlapping touch/pointer handlers that could trigger the legal popup button more than once.
- Added mobile touch-action and 44px minimum tap targets for quantity controls to reduce accidental browser zoom and missed taps.
- Forced category buttons to wrap into multiple rows instead of requiring horizontal scrolling.
- Kept product data in sync: products.js and products.json contain the same 129 entries.
- Kept the cart persistent per browser profile using localStorage. It is not synced across devices and does not distinguish multiple people sharing one browser profile.

Checks performed:
- Node syntax checks passed for home.js, order.js, legal.js, and products.js.
- HTML checked for duplicate IDs and missing embedded image data.
- CSS parsed with no parser errors.
- products.js and products.json compared and matched (129 products).
- Required cart/category controls and IDs checked on both HTML pages.

Note: Static/code checks were performed. A real-device live GitHub Pages test still needs to be done after uploading these files.

Upload instructions:
1. Extract this ZIP.
2. Open the extracted folder.
3. Upload all files in this folder to the root of the existing GitHub repository, replacing the same-named files.
4. Commit changes.
5. Open the live site and hard refresh. On mobile, fully close and reopen the browser tab if the old version is cached.


UPDATE NOTES:
- WhatsApp order target set to +91 93426 17318.
- Checkout asks customer name, mobile, full delivery address, optional area/PIN and notes.
- The customer reviews and manually sends the WhatsApp message; no automatic send occurs.
- Static ZIP does NOT provide secure admin login or save real orders to a database. Production admin needs backend/database setup and secret credentials supplied by the owner through their own account.

CHECKOUT FIX V2:
If customer clicks the WhatsApp order button from the homepage cart, the website now sends them to order.html#checkout. The cart is preserved in browser localStorage, the cart drawer opens automatically, and the customer details form scrolls into view. Use the new ZIP and open it through the same local server.
