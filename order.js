/* Crackers Icon catalogue + cart controller. Shared by index.html and order.html. */
(function () {
  'use strict';

  const WA_NUMBER = '919342617318';
  const CART_KEY = 'ci_cart';
  let products = (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) ? PRODUCTS : [];
  let cart = readCart();
  let filteredProducts = [];

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      const clean = {};
      Object.entries(parsed).forEach(([id, qty]) => {
        const index = Number(id);
        const amount = Number(qty);
        if (Number.isInteger(index) && index >= 0 && products[index] && Number.isFinite(amount) && amount > 0) {
          clean[index] = Math.floor(amount);
        }
      });
      return clean;
    } catch (_) { return {}; }
  }

  const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const entries = () => Object.entries(cart).filter(([id, qty]) => Number(qty) > 0 && products[Number(id)]);
  const totalCart = () => entries().reduce((sum, [id, qty]) => sum + Number(products[Number(id)].discountPrice || 0) * Number(qty), 0);
  const countCart = () => entries().reduce((sum, [, qty]) => sum + Number(qty), 0);

  function persistCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) {}
    renderProducts();
    renderCart();
    updateTotals();
    window.dispatchEvent(new CustomEvent('ci-cart-updated'));
    if (typeof window.updateCartUI === 'function') window.updateCartUI();
  }

  function updateTotals() {
    const total = totalCart();
    const count = countCart();
    ['headerTotal', 'toolbarTotal', 'grandTotal', 'cartGrandTotal', 'drawerTotal'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = money(total);
    });
    const countElement = document.getElementById('cartCount');
    if (countElement) countElement.textContent = String(count);
    const warning = document.getElementById('minimumWarning');
    if (warning) warning.textContent = total < 3000
      ? `Minimum order value is ₹3,000. Add ${money(3000 - total)} more to submit your enquiry.`
      : 'Minimum order reached. You can submit your enquiry.';
    const empty = document.getElementById('cartEmpty');
    if (empty) empty.style.display = count ? 'none' : 'block';
    const drawerWarning = document.getElementById('drawerWarning');
    if (drawerWarning) drawerWarning.textContent = total < 3000
      ? `Minimum order ₹3,000 — add ${money(3000 - total)} more.`
      : 'Minimum order reached. Final order is an enquiry only.';
  }

  function qtyControl(index, value, className = 'qty-control') {
    return `<div class="${className}" aria-label="Quantity controls for ${escapeHtml(products[index].name)}">
      <button type="button" data-action="minus" data-id="${index}" aria-label="Decrease quantity">−</button>
      <span aria-live="polite">${value}</span>
      <button type="button" data-action="plus" data-id="${index}" aria-label="Increase quantity">+</button>
    </div>`;
  }

  function categorySlug(value) {
    return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function renderCategoryNav() {
    const nav = document.getElementById('catalogCategoryNav');
    if (!nav) return;
    const categories = [...new Set(products.map(product => product.category))];
    nav.innerHTML = `<button type="button" class="category-pill active" data-category="">All Products</button>` +
      categories.map(category => `<button type="button" class="category-pill" data-jump-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
    nav.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
      const search = document.getElementById('productSearch');
      const filter = document.getElementById('categoryFilter');
      if (search) search.value = '';
      if (filter) filter.value = '';
      const url = new URL(location.href); url.searchParams.delete('q'); history.replaceState(null, '', url.pathname + url.hash);
      renderProducts(); scrollToProducts();
    }));
    nav.querySelectorAll('[data-jump-category]').forEach(button => button.addEventListener('click', () => {
      const filter = document.getElementById('categoryFilter');
      const search = document.getElementById('productSearch');
      if (search) search.value = '';
      if (filter) filter.value = button.dataset.jumpCategory;
      const url = new URL(location.href); url.searchParams.delete('q'); history.replaceState(null, '', url.pathname + url.hash);
      renderProducts(); scrollToProducts();
    }));
  }

  function scrollToProducts() {
    const toolbar = document.querySelector('.order-toolbar');
    if (toolbar) toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderProducts() {
    const container = document.getElementById('categoryColumns');
    if (!container) return;
    const searchInput = document.getElementById('productSearch');
    const categoryInput = document.getElementById('categoryFilter');
    const query = ((searchInput && searchInput.value) || '').toLowerCase().trim();
    const category = categoryInput ? categoryInput.value : '';
    filteredProducts = products.filter(product => (!category || product.category === category) &&
      (!query || `${product.name} ${product.category}`.toLowerCase().includes(query)));
    const groups = [];
    filteredProducts.forEach(product => {
      let group = groups.find(item => item.category === product.category);
      if (!group) { group = { category: product.category, icon: product.icon || '🎆', items: [] }; groups.push(group); }
      group.items.push(product);
    });
    container.innerHTML = groups.length ? groups.map(group => `<section class="category-panel" id="category-${categorySlug(group.category)}">
      <div class="category-head"><span>${escapeHtml(group.icon)}</span>${escapeHtml(group.category)}<small>${group.items.length} items</small></div>
      <div class="category-products">${group.items.map(product => {
        const index = products.indexOf(product);
        const qty = Number(cart[index] || 0);
        return `<article class="product-row"><div class="product-info"><div class="product-sno">S. No. ${index + 1}</div>
          <div class="product-name">${escapeHtml(product.name)}</div><div class="product-price-line"><span class="mrp">${money(product.mrp)}</span>
          <span class="discount-price">${money(product.discountPrice)}</span>${product.discountPercent ? `<span class="discount-tag">${product.discountPercent}% OFF</span>` : ''}</div></div>
          ${qtyControl(index, qty)}<div class="row-total"><span>Item total</span><strong>${money(Number(product.discountPrice || 0) * qty)}</strong></div></article>`;
      }).join('')}</div></section>`).join('') : '<p class="no-products">No products found. Try another search.</p>';

    const nav = document.getElementById('catalogCategoryNav');
    if (nav) nav.querySelectorAll('.category-pill').forEach(button => {
      const selected = category && button.dataset.jumpCategory === category;
      const allSelected = !category && !query && button.hasAttribute('data-category');
      button.classList.toggle('active', Boolean(selected || allSelected));
    });
    updateTotals();
  }

  function renderCart() {
    const tableBody = document.getElementById('cartTableBody');
    if (tableBody) tableBody.innerHTML = entries().map(([id, qty], rowIndex) => {
      const product = products[Number(id)];
      return `<tr><td>${rowIndex + 1}</td><td>${escapeHtml(product.name)}</td><td>${money(product.discountPrice)}</td>
        <td>${qtyControl(Number(id), qty, 'cart-qty')}</td><td><b>${money(Number(product.discountPrice || 0) * Number(qty))}</b></td>
        <td><button type="button" class="remove-item" data-action="remove" data-id="${id}">Remove</button></td></tr>`;
    }).join('');
    updateTotals();
  }

  function changeQuantity(button) {
    const index = Number(button.dataset.id);
    const action = button.dataset.action;
    if (!Number.isInteger(index) || !products[index]) return;
    const current = Number(cart[index] || 0);
    if (action === 'plus') cart[index] = current + 1;
    else if (action === 'minus') cart[index] = Math.max(0, current - 1);
    else if (action === 'remove') cart[index] = 0;
    if (!cart[index]) delete cart[index];
    persistCart();
  }

  function openCart() {
    renderCart();
    if (document.body.classList.contains('order-page')) {
      const drawer = document.getElementById('cart-section');
      const backdrop = document.getElementById('cartDrawerBackdrop');
      if (!drawer || !backdrop) return;
      document.body.classList.add('cart-drawer-open');
      drawer.setAttribute('aria-hidden', 'false');
      backdrop.setAttribute('aria-hidden', 'false');
      return;
    }
    const backdrop = document.getElementById('cartBackdrop');
    if (backdrop) {
      if (typeof window.updateCartUI === 'function') window.updateCartUI();
      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.classList.add('home-cart-open');
    }
  }

  function closeCart() {
    if (document.body.classList.contains('order-page')) {
      const drawer = document.getElementById('cart-section');
      const backdrop = document.getElementById('cartDrawerBackdrop');
      if (drawer) drawer.setAttribute('aria-hidden', 'true');
      if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('cart-drawer-open');
    } else {
      const backdrop = document.getElementById('cartBackdrop');
      if (backdrop) { backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden', 'true'); }
      document.body.classList.remove('home-cart-open');
    }
  }

  function orderId() {
    const date = new Date();
    const pad = value => String(value).padStart(2, '0');
    return `CI-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  function makeOrderText() {
    const list = entries();
    if (!list.length) return '';
    const customerName = document.getElementById('customerName')?.value.trim() || '';
    const customerPhone = document.getElementById('customerPhone')?.value.trim() || '';
    const customerAddress = document.getElementById('customerAddress')?.value.trim() || '';
    const deliveryArea = document.getElementById('deliveryArea')?.value.trim() || '';
    const notes = document.getElementById('orderNotes')?.value.trim() || '';
    const id = orderId();
    const lines = ['🎆 *CRACKERS ICON — NEW ORDER ENQUIRY*', `Order ID: ${id}`, '', '*CUSTOMER DETAILS*',
      `Name: ${customerName}`, `Mobile: ${customerPhone}`, `Address: ${customerAddress}`, `Area / PIN code: ${deliveryArea || 'Not provided'}`, '',
      '*ORDER DETAILS*', 'S.No. | Product | Price | Qty | Total', '--------------------------------'];
    list.forEach(([productId, qty], rowIndex) => {
      const product = products[Number(productId)];
      lines.push(`${rowIndex + 1}. ${product.name} | ₹${product.discountPrice} | ${qty} | ₹${Number(product.discountPrice || 0) * Number(qty)}`);
    });
    lines.push('--------------------------------', `*TOTAL ITEMS: ${countCart()}*`, `*GRAND TOTAL: ${money(totalCart())}*`,
      'Payment: Customer and owner to arrange directly; no online payment on website.',
      `Additional notes: ${notes || 'None'}`, '', 'Please confirm stock, delivery availability and final payment arrangements.');
    return lines.join('\n');
  }

  function sendWhatsApp() {
    if (!countCart()) { alert('Please add at least one product to your cart.'); return; }
    if (totalCart() < 3000) { alert('Minimum order value is ₹3,000. Please add more products before submitting your enquiry.'); return; }
    const name = document.getElementById('customerName');
    const phone = document.getElementById('customerPhone');
    const address = document.getElementById('customerAddress');
    // The homepage cart drawer has no customer fields. Send the customer to
    // the order page, where the same cart is restored and the checkout form exists.
    if (!name || !phone || !address) {
      if (!document.body.classList.contains('order-page')) {
        location.href = 'order.html#checkout';
        return;
      }
      alert('Checkout fields could not be found. Please refresh the order page and try again.');
      return;
    }
    if (!name.value.trim() || !phone.value.trim() || !address.value.trim()) {
      alert('Please enter your name, mobile number and full delivery address.');
      (!name.value.trim() ? name : (!phone.value.trim() ? phone : address)).focus();
      return;
    }
    const digits = phone.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) { alert('Please enter a valid mobile number.'); phone.focus(); return; }
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(makeOrderText())}`, '_blank', 'noopener');
  }

  function downloadPdf() {
    if (!countCart()) { alert('Your cart is empty.'); return; }
    const sheet = document.getElementById('printSheet');
    if (!sheet) { alert('Print summary is unavailable on this page.'); return; }
    const logo = document.querySelector('.brand img');
    const rows = entries().map(([id, qty], rowIndex) => {
      const product = products[Number(id)];
      return `<tr><td>${rowIndex + 1}</td><td>${escapeHtml(product.name)}</td><td>${money(product.discountPrice)}</td><td>${qty}</td><td>${money(Number(product.discountPrice || 0) * Number(qty))}</td></tr>`;
    }).join('');
    sheet.innerHTML = `<div class="print-order"><img class="print-logo" src="${logo ? logo.src : ''}" alt="Crackers Icon"><h1>CRACKERS ICON — ORDER ENQUIRY</h1>
      <p>Order ID: ${orderId()} | Date: ${new Date().toLocaleString('en-IN')}</p><table><thead><tr><th>S.No.</th><th>Product</th><th>Discount Price</th><th>Quantity</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody><tfoot><tr><td colspan="4">GRAND TOTAL</td><td>${money(totalCart())}</td></tr></tfoot></table>
      <p>Please save this page as PDF from the print dialog. Share the PDF manually through WhatsApp if needed.</p></div>`;
    window.print();
  }

  document.addEventListener('click', event => {
    const quantityButton = event.target.closest('[data-action]');
    if (quantityButton) { event.preventDefault(); changeQuantity(quantityButton); return; }
    if (event.target.closest('#openCart, #jumpCart, [data-open-cart]')) { event.preventDefault(); openCart(); return; }
    if (event.target.closest('#closeCart, #closeCartDrawer, #continueShopping')) { event.preventDefault(); closeCart(); return; }
    if (event.target.closest('#drawerSendWhatsApp')) { event.preventDefault(); sendWhatsApp(); return; }
    if (event.target.closest('#drawerDownloadPdf')) { event.preventDefault(); downloadPdf(); return; }
    if (event.target.id === 'cartBackdrop' || event.target.id === 'cartDrawerBackdrop') { closeCart(); }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCart(); });
  document.getElementById('productSearch')?.addEventListener('input', renderProducts);
  document.getElementById('categoryFilter')?.addEventListener('change', renderProducts);
  document.getElementById('sendWhatsApp')?.addEventListener('click', sendWhatsApp);
  document.getElementById('downloadPdf')?.addEventListener('click', downloadPdf);
  document.getElementById('homeSearchBtn')?.addEventListener('click', () => {
    const input = document.getElementById('homeSearch');
    const query = input ? input.value.trim() : '';
    location.href = 'order.html' + (query ? '?q=' + encodeURIComponent(query) : '');
  });
  document.getElementById('homeSearch')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') document.getElementById('homeSearchBtn')?.click();
  });
  window.addEventListener('ci-cart-updated', () => { if (typeof window.updateCartUI === 'function') window.updateCartUI(); });
  window.addEventListener('ci-products-loaded', () => { products = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : products); cart = readCart(); const select = document.getElementById('categoryFilter'); if (select) { const current = select.value; select.innerHTML = '<option value="">All categories</option>'; [...new Set(products.map(p => p.category))].forEach(category => { const option=document.createElement('option'); option.value=category; option.textContent=category; select.appendChild(option); }); select.value=current; } renderCategoryNav(); renderProducts(); renderCart(); updateTotals(); });
  window.addEventListener('storage', event => {
    if (event.key === CART_KEY) { cart = readCart(); renderProducts(); renderCart(); if (typeof window.updateCartUI === 'function') window.updateCartUI(); }
  });

  const searchInput = document.getElementById('productSearch');
  const initialQuery = new URLSearchParams(location.search).get('q');
  if (searchInput && initialQuery && !searchInput.value) searchInput.value = initialQuery;

  const categorySelect = document.getElementById('categoryFilter');
  if (categorySelect) [...new Set(products.map(product => product.category))].forEach(category => {
    if (![...categorySelect.options].some(option => option.value === category)) {
      const option = document.createElement('option'); option.value = category; option.textContent = category; categorySelect.appendChild(option);
    }
  });
  renderCategoryNav();
  renderProducts();
  renderCart();

  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash && hash.toLowerCase() !== 'checkout') {
    const match = products.find(product => product.category.toLowerCase() === hash.toLowerCase());
    if (match && categorySelect) categorySelect.value = match.category;
    renderProducts();
  }
  updateTotals();
  if (document.body.classList.contains('order-page') && hash.toLowerCase() === 'checkout') {
    setTimeout(() => {
      openCart();
      setTimeout(() => document.querySelector('.customer-checkout')?.scrollIntoView({behavior:'smooth', block:'center'}), 250);
    }, 150);
  }
})();
