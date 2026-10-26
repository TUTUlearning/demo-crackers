/* Homepage-only sections and compact right-side cart drawer. */
(function () {
  'use strict';
  let products = (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) ? PRODUCTS : [];
  const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');

  function readCart() {
    try {
      const value = JSON.parse(localStorage.getItem('ci_cart') || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (_) { return {}; }
  }

  function renderCategories() {
    const order = ['GIFT BOXES', 'SPARKLERS', 'FLOWER POTS', 'MULTICOLOUR SHOTS', 'GROUND CHAKKARS', 'BOMB', 'ROCKET', 'SPECIAL FANCY NOVELTIES'];
    const labels = {
      'GIFT BOXES': 'Combo Packs', 'SPARKLERS': 'Sparklers', 'FLOWER POTS': 'Flower Pots',
      'MULTICOLOUR SHOTS': 'Sky Shots', 'GROUND CHAKKARS': 'Chakkar', 'BOMB': 'Atom Bomb',
      'ROCKET': 'Rockets', 'SPECIAL FANCY NOVELTIES': 'Fancy Items'
    };
    const container = document.getElementById('categoryStrip');
    if (!container) return;
    container.innerHTML = order.map(category => {
      const product = products.find(item => item.category === category);
      if (!product) return '';
      return `<a class="category-tile" href="order.html#${encodeURIComponent(category)}"><span class="category-emoji">${product.icon || '🎆'}</span><b>${labels[category] || category}</b><small>Explore products →</small></a>`;
    }).join('');
  }

  function updateCartUI() {
    const cart = readCart();
    const validEntries = Object.entries(cart).filter(([id, qty]) => products[Number(id)] && Number(qty) > 0);
    const total = validEntries.reduce((sum, [id, qty]) => sum + Number(products[Number(id)].discountPrice || 0) * Number(qty), 0);
    const count = validEntries.reduce((sum, [, qty]) => sum + Number(qty), 0);
    const headerTotal = document.getElementById('headerTotal');
    const cartCount = document.getElementById('cartCount');
    const drawerTotal = document.getElementById('drawerTotal');
    const toolbarTotal = document.getElementById('toolbarTotal');
    if (headerTotal) headerTotal.textContent = money(total);
    if (toolbarTotal) toolbarTotal.textContent = money(total);
    if (cartCount) cartCount.textContent = String(count);
    if (drawerTotal) drawerTotal.textContent = money(total);
    const warning = document.getElementById('drawerWarning');
    if (warning) warning.textContent = total < 3000
      ? `Minimum order ₹3,000 — add ${money(3000 - total)} more to reach the minimum.`
      : 'Minimum order reached. Final order is an enquiry only.';

    const miniCart = document.getElementById('miniCart');
    if (!miniCart) return;
    if (!validEntries.length) {
      miniCart.innerHTML = '<p class="cart-empty home-mini-empty">Your cart is empty. Browse products and tap + to add items.</p>';
      return;
    }
    miniCart.innerHTML = '<div class="mini-items">' + validEntries.map(([id, qty]) => {
      const product = products[Number(id)];
      const price = Number(product.discountPrice || 0);
      return `<div class="mini-row"><div class="mini-product-info"><b>${product.name}</b><small>${money(price)} each</small>
        <div class="mini-qty"><button type="button" data-action="minus" data-id="${id}" aria-label="Decrease ${product.name}">−</button><span>${qty}</span><button type="button" data-action="plus" data-id="${id}" aria-label="Increase ${product.name}">+</button><button type="button" class="mini-remove" data-action="remove" data-id="${id}">Remove</button></div></div>
        <strong class="mini-line-total">${money(price * Number(qty))}</strong></div>`;
    }).join('') + '</div>';
  }

  window.updateCartUI = updateCartUI;
  renderCategories();
  updateCartUI();
  window.addEventListener('ci-products-loaded', event => {
    products = Array.isArray(event.detail) ? event.detail : (Array.isArray(window.PRODUCTS) ? window.PRODUCTS : products);
    renderCategories();
    updateCartUI();
  });
  window.addEventListener('ci-cart-updated', updateCartUI);
  window.addEventListener('storage', event => { if (event.key === 'ci_cart') updateCartUI(); });
})();
