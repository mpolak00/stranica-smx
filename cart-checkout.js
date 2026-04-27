(function () {
  'use strict';

  var STORAGE_KEYS = {
    cart: 'nexo_cart',
    lastCheckout: 'nexo_last_checkout_ts',
    checkoutEmail: 'nexo_checkout_email',
    complianceLog: 'nexo_checkout_events'
  };

  var DEFAULT_CONFIG = {
    mode: 'storefront',
    storeDomain: 'SHOPIFY_STORE_DOMAIN',
    storefrontAccessToken: 'SHOPIFY_STOREFRONT_API_TOKEN',
    apiVersion: '2025-10',
    buyButtonFallbackUrl: '',
    supportEmail: 'care@nexoresearch.com',
    shippingRegion: 'AUTO',
    openCartOnAdd: true,
    locale: 'en-IE'
  };

  var PRODUCTS = {
    semax30: {
      id: 'semax30',
      title: 'Semax Nasal Spray 30mg',
      price: 149,
      currency: 'EUR',
      variantId: 'PRODUCT_VARIANT_ID_SEMAX_30'
    },
    semax60: {
      id: 'semax60',
      title: 'Semax Nasal Spray 60mg',
      price: 249,
      currency: 'EUR',
      variantId: 'PRODUCT_VARIANT_ID_SEMAX_60'
    }
  };

  var CART_FRAGMENT = [
    'id',
    'checkoutUrl',
    'updatedAt',
    'cost {',
    '  subtotalAmount { amount currencyCode }',
    '}',
    'lines(first: 20) {',
    '  edges {',
    '    node {',
    '      id',
    '      quantity',
    '      attributes { key value }',
    '      merchandise {',
    '        ... on ProductVariant {',
    '          id',
    '          title',
    '          price { amount currencyCode }',
    '          product { title }',
    '        }',
    '      }',
    '    }',
    '  }',
    '}'
  ].join('\n');

  var state = {
    config: null,
    items: [],
    cartId: '',
    checkoutUrl: '',
    isDrawerOpen: false,
    isLoading: false,
    mode: 'unavailable',
    statusMessage: '',
    activeElementBeforeOpen: null,
    toastTimer: null,
    closeTimer: null
  };

  var refs = {
    drawer: null,
    overlay: null,
    loading: null,
    items: null,
    empty: null,
    subtotal: null,
    shipping: null,
    status: null,
    toast: null,
    countBadges: [],
    checkoutButtons: []
  };

  function init() {
    state.config = mergeConfig();
    state.mode = resolveMode();
    cacheDom();
    hydrateFromStorage();
    bindEvents();
    renderCart();
    syncRemoteCartOnLoad();
  }

  function mergeConfig() {
    var incoming = window.NEXO_CHECKOUT_CONFIG || {};
    var merged = {};
    Object.keys(DEFAULT_CONFIG).forEach(function (key) {
      merged[key] = Object.prototype.hasOwnProperty.call(incoming, key) ? incoming[key] : DEFAULT_CONFIG[key];
    });
    return merged;
  }

  function cacheDom() {
    refs.drawer = document.querySelector('[data-cart-drawer]');
    refs.overlay = document.querySelector('[data-cart-overlay]');
    refs.loading = document.querySelector('[data-cart-loading]');
    refs.items = document.querySelector('[data-cart-items]');
    refs.empty = document.querySelector('[data-cart-empty]');
    refs.subtotal = document.querySelector('[data-cart-subtotal]');
    refs.shipping = document.querySelector('[data-cart-shipping]');
    refs.status = document.querySelector('[data-cart-status]');
    refs.toast = document.querySelector('[data-cart-toast]');
    refs.countBadges = Array.prototype.slice.call(document.querySelectorAll('[data-cart-count]'));
    refs.checkoutButtons = Array.prototype.slice.call(document.querySelectorAll('[data-checkout]'));
  }

  function bindEvents() {
    document.querySelectorAll('[data-add-to-cart]').forEach(function (button) {
      button.addEventListener('click', function () {
        addToCart(button.getAttribute('data-add-to-cart'));
      });
    });

    document.querySelectorAll('[data-open-cart]').forEach(function (button) {
      button.addEventListener('click', function () {
        openCart();
      });
    });

    document.querySelectorAll('[data-close-cart]').forEach(function (button) {
      button.addEventListener('click', function () {
        closeCart();
      });
    });

    if (refs.overlay) {
      refs.overlay.addEventListener('click', closeCart);
    }

    if (refs.items) {
      refs.items.addEventListener('click', handleCartItemClick);
    }

    refs.checkoutButtons.forEach(function (button) {
      button.addEventListener('click', proceedToCheckout);
    });

    document.addEventListener('keydown', handleGlobalKeydown);

    document.querySelectorAll('[data-checkout-email]').forEach(function (input) {
      input.value = sessionStorage.getItem(STORAGE_KEYS.checkoutEmail) || '';
      input.addEventListener('change', function () {
        setCheckoutEmail(input.value);
      });
      input.addEventListener('blur', function () {
        setCheckoutEmail(input.value);
      });
    });
  }

  function handleCartItemClick(event) {
    var actionButton = event.target.closest('[data-cart-action]');
    if (!actionButton) {
      return;
    }

    var action = actionButton.getAttribute('data-cart-action');
    var lineId = actionButton.getAttribute('data-line-id');
    var item = findItemByLineId(lineId);

    if (!item) {
      return;
    }

    if (action === 'increment') {
      updateQuantity(lineId, item.quantity + 1);
    }

    if (action === 'decrement') {
      updateQuantity(lineId, item.quantity - 1);
    }

    if (action === 'remove') {
      removeFromCart(lineId);
    }
  }

  function handleGlobalKeydown(event) {
    if (!state.isDrawerOpen) {
      return;
    }

    if (event.key === 'Escape') {
      closeCart();
      return;
    }

    if (event.key === 'Tab' && refs.drawer) {
      trapFocus(event);
    }
  }

  function trapFocus(event) {
    var focusable = getFocusableElements();
    if (!focusable.length) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function getFocusableElements() {
    if (!refs.drawer) {
      return [];
    }

    return Array.prototype.slice.call(
      refs.drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (element) {
      return !element.hasAttribute('disabled') && element.offsetParent !== null;
    });
  }

  function hydrateFromStorage() {
    var raw = sessionStorage.getItem(STORAGE_KEYS.cart);
    if (!raw) {
      return;
    }

    try {
      var stored = JSON.parse(raw);
      state.cartId = stored.cartId || '';
      state.checkoutUrl = stored.checkoutUrl || '';
      state.items = Array.isArray(stored.items) ? stored.items.map(normalizeStoredItem).filter(Boolean) : [];
    } catch (error) {
      state.items = [];
      state.cartId = '';
      state.checkoutUrl = '';
    }
  }

  function normalizeStoredItem(item) {
    if (!item || !item.productId || !PRODUCTS[item.productId]) {
      return null;
    }

    var product = PRODUCTS[item.productId];
    var quantity = normalizeQuantity(item.quantity);
    if (!quantity) {
      return null;
    }

    return {
      lineId: item.lineId || buildLocalLineId(item.productId),
      productId: item.productId,
      title: item.title || product.title,
      variantTitle: item.variantTitle || 'Research Grade',
      price: Number(item.price || product.price),
      currency: item.currency || product.currency,
      quantity: quantity,
      variantId: item.variantId || product.variantId
    };
  }

  function persistState() {
    var payload = {
      cartId: state.cartId,
      checkoutUrl: state.checkoutUrl,
      items: state.items.map(function (item) {
        return {
          lineId: item.lineId,
          productId: item.productId,
          title: item.title,
          variantTitle: item.variantTitle,
          price: item.price,
          currency: item.currency,
          quantity: item.quantity,
          variantId: item.variantId
        };
      })
    };

    sessionStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(payload));
  }

  function recordEvent(name, detail) {
    var entries = [];
    try {
      entries = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.complianceLog) || '[]');
    } catch (error) {
      entries = [];
    }

    entries.push({
      name: name,
      at: new Date().toISOString(),
      detail: detail || {}
    });

    sessionStorage.setItem(STORAGE_KEYS.complianceLog, JSON.stringify(entries.slice(-50)));
  }

  function buildLocalLineId(productId) {
    return 'local:' + productId;
  }

  function resolveMode() {
    var configuredMode = String(state.config && state.config.mode || DEFAULT_CONFIG.mode).toLowerCase();

    if (configuredMode === 'buybutton' && state.config.buyButtonFallbackUrl) {
      return 'buybutton';
    }

    if (hasStorefrontConfig()) {
      return 'storefront';
    }

    if (state.config.buyButtonFallbackUrl) {
      return 'buybutton';
    }

    return 'unavailable';
  }

  function hasStorefrontConfig() {
    return !hasPlaceholder(state.config.storeDomain) &&
      !hasPlaceholder(state.config.storefrontAccessToken) &&
      !hasPlaceholder(PRODUCTS.semax30.variantId) &&
      !hasPlaceholder(PRODUCTS.semax60.variantId);
  }

  function hasPlaceholder(value) {
    return !value || /SHOPIFY_|PRODUCT_VARIANT_ID_/.test(String(value));
  }

  function isApiUnavailableMode() {
    return state.mode === 'unavailable';
  }

  function getProduct(productOrId) {
    if (typeof productOrId === 'string') {
      return PRODUCTS[productOrId] || null;
    }

    if (productOrId && productOrId.id && PRODUCTS[productOrId.id]) {
      return PRODUCTS[productOrId.id];
    }

    return null;
  }

  function formatMoney(amount, currency) {
    return new Intl.NumberFormat(state.config.locale || DEFAULT_CONFIG.locale, {
      style: 'currency',
      currency: currency || 'EUR',
      maximumFractionDigits: 2
    }).format(Number(amount || 0));
  }

  function getItemCount() {
    return state.items.reduce(function (total, item) {
      return total + item.quantity;
    }, 0);
  }

  function getSubtotal() {
    return state.items.reduce(function (total, item) {
      return total + (item.price * item.quantity);
    }, 0);
  }

  function getShippingMessage() {
    var subtotal = getSubtotal();
    var region = String(state.config.shippingRegion || 'AUTO').toUpperCase();

    if (region === 'HR' || region === 'CROATIA') {
      if (subtotal >= 150) {
        return 'Croatia shipping: Free on this order. Orders under EUR 150 ship for EUR 5.';
      }
      return 'Croatia shipping: EUR 5. Free shipping unlocks above EUR 150.';
    }

    if (region === 'EU') {
      return 'EU shipping estimate: EUR 15 flat rate. Final taxes and shipping are confirmed by Shopify.';
    }

    if (region === 'INTL' || region === 'INTERNATIONAL') {
      return 'International shipping estimate: EUR 25 flat rate. Final destination charges are confirmed by Shopify.';
    }

    return 'Shipping: Croatia free over EUR 150, otherwise EUR 5; EU EUR 15; International EUR 25.';
  }

  function setStatus(message) {
    state.statusMessage = message || '';
    renderStatus();
  }

  function renderStatus() {
    if (refs.status) {
      refs.status.textContent = state.statusMessage;
    }
  }

  function showToast(message) {
    if (!refs.toast) {
      return;
    }

    refs.toast.textContent = message;
    refs.toast.hidden = false;
    refs.toast.classList.add('is-visible');

    if (state.toastTimer) {
      window.clearTimeout(state.toastTimer);
    }

    state.toastTimer = window.setTimeout(function () {
      refs.toast.classList.remove('is-visible');
      refs.toast.hidden = true;
    }, 2200);
  }

  function openCart() {
    if (!refs.drawer || !refs.overlay) {
      return;
    }

    state.isDrawerOpen = true;
    state.activeElementBeforeOpen = document.activeElement;

    if (state.closeTimer) {
      window.clearTimeout(state.closeTimer);
    }

    refs.drawer.hidden = false;
    refs.overlay.hidden = false;

    window.requestAnimationFrame(function () {
      refs.drawer.classList.add('is-open');
      refs.overlay.classList.add('is-open');
      refs.drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nexo-cart-open');

      var focusable = getFocusableElements();
      if (focusable.length) {
        focusable[0].focus();
      } else {
        refs.drawer.focus();
      }
    });
  }

  function closeCart() {
    if (!refs.drawer || !refs.overlay) {
      return;
    }

    state.isDrawerOpen = false;
    refs.drawer.classList.remove('is-open');
    refs.overlay.classList.remove('is-open');
    refs.drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nexo-cart-open');

    state.closeTimer = window.setTimeout(function () {
      refs.drawer.hidden = true;
      refs.overlay.hidden = true;
    }, 180);

    if (state.activeElementBeforeOpen && typeof state.activeElementBeforeOpen.focus === 'function') {
      state.activeElementBeforeOpen.focus();
    }
  }

  function renderCart() {
    var count = getItemCount();
    var subtotal = getSubtotal();
    var isEmpty = count === 0;
    var checkoutDisabled = isEmpty || state.isLoading || isApiUnavailableMode();

    refs.countBadges.forEach(function (badge) {
      badge.textContent = String(count);
      badge.hidden = count === 0;
    });

    if (refs.loading) {
      refs.loading.hidden = !state.isLoading;
    }

    if (refs.empty) {
      refs.empty.hidden = !isEmpty;
    }

    if (refs.items) {
      refs.items.innerHTML = isEmpty ? '' : state.items.map(renderCartLine).join('');
    }

    if (refs.subtotal) {
      refs.subtotal.textContent = formatMoney(subtotal, 'EUR');
    }

    if (refs.shipping) {
      refs.shipping.textContent = getShippingMessage();
    }

    refs.checkoutButtons.forEach(function (button) {
      button.disabled = checkoutDisabled;
      button.setAttribute('aria-disabled', checkoutDisabled ? 'true' : 'false');
    });

    if (isApiUnavailableMode() && !state.statusMessage) {
      setStatus('Checkout is temporarily unavailable. Please try again later or contact ' + state.config.supportEmail);
    }

    if (!isApiUnavailableMode() && state.statusMessage.indexOf('temporarily unavailable') !== -1) {
      setStatus('');
    }

    renderStatus();
    persistState();
  }

  function renderCartLine(item) {
    var initials = item.productId === 'semax60' ? '60' : '30';
    return [
      '<article class="cart-line">',
      '  <div class="cart-line__image" aria-hidden="true">S' + initials + '</div>',
      '  <div class="cart-line__body">',
      '    <div class="cart-line__top">',
      '      <div>',
      '        <h3 class="cart-line__title">' + escapeHtml(item.title) + '</h3>',
      '        <p class="cart-line__variant">' + escapeHtml(item.variantTitle || 'Research Grade') + '</p>',
      '      </div>',
      '      <strong class="cart-line__price">' + formatMoney(item.price, item.currency) + '</strong>',
      '    </div>',
      '    <div class="cart-line__actions">',
      '      <div class="cart-qty" role="group" aria-label="Quantity controls for ' + escapeHtml(item.title) + '">',
      '        <button type="button" class="cart-qty__button" data-cart-action="decrement" data-line-id="' + escapeHtml(item.lineId) + '" aria-label="Decrease quantity">-</button>',
      '        <span class="cart-qty__value">' + item.quantity + '</span>',
      '        <button type="button" class="cart-qty__button" data-cart-action="increment" data-line-id="' + escapeHtml(item.lineId) + '" aria-label="Increase quantity">+</button>',
      '      </div>',
      '      <button type="button" class="cart-line__remove" data-cart-action="remove" data-line-id="' + escapeHtml(item.lineId) + '">Remove</button>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeQuantity(quantity) {
    var next = parseInt(quantity, 10);
    if (Number.isNaN(next) || next < 1) {
      return 0;
    }
    return Math.min(next, 99);
  }

  function findItemByLineId(lineId) {
    return state.items.find(function (item) {
      return item.lineId === lineId;
    }) || null;
  }

  function findItemByProductId(productId) {
    return state.items.find(function (item) {
      return item.productId === productId;
    }) || null;
  }

  function addToCart(productOrId) {
    var product = getProduct(productOrId);
    if (!product) {
      setStatus('Unable to add this item right now.');
      return Promise.resolve();
    }

    setStatus('');
    recordEvent('cart_add_clicked', { productId: product.id });

    if (state.mode === 'storefront') {
      return addToStorefrontCart(product, 1);
    }

    return addToLocalCart(product, 1);
  }

  function addToLocalCart(product, quantity) {
    var existing = findItemByProductId(product.id);
    if (existing) {
      existing.quantity = normalizeQuantity(existing.quantity + quantity);
    } else {
      state.items.push({
        lineId: buildLocalLineId(product.id),
        productId: product.id,
        title: product.title,
        variantTitle: 'Research Grade',
        price: product.price,
        currency: product.currency,
        quantity: normalizeQuantity(quantity),
        variantId: product.variantId
      });
    }

    recordEvent('cart_line_added', { productId: product.id, mode: state.mode, quantity: quantity });
    renderCart();
    showToast('Added to cart');
    if (state.config.openCartOnAdd) {
      openCart();
    }
    return Promise.resolve();
  }

  function removeFromCart(lineId) {
    var item = findItemByLineId(lineId);
    if (!item) {
      return Promise.resolve();
    }

    if (state.mode === 'storefront' && state.cartId && item.lineId.indexOf('local:') !== 0) {
      return mutateRemote('cart_remove_started', function () {
        return cartLinesRemove(state.cartId, [item.lineId]).then(syncFromShopifyCart);
      });
    }

    state.items = state.items.filter(function (entry) {
      return entry.lineId !== lineId;
    });
    recordEvent('cart_line_removed', { productId: item.productId });
    renderCart();
    return Promise.resolve();
  }

  function updateQuantity(lineId, quantity) {
    var item = findItemByLineId(lineId);
    var nextQty = normalizeQuantity(quantity);

    if (!item) {
      return Promise.resolve();
    }

    if (!nextQty) {
      return removeFromCart(lineId);
    }

    if (state.mode === 'storefront' && state.cartId && item.lineId.indexOf('local:') !== 0) {
      return mutateRemote('cart_line_updated', function () {
        return cartLinesUpdate(state.cartId, [{ id: item.lineId, quantity: nextQty }]).then(syncFromShopifyCart);
      });
    }

    item.quantity = nextQty;
    recordEvent('cart_line_updated', { productId: item.productId, quantity: nextQty });
    renderCart();
    return Promise.resolve();
  }

  function setCheckoutEmail(email) {
    var trimmed = String(email || '').trim();
    if (trimmed) {
      sessionStorage.setItem(STORAGE_KEYS.checkoutEmail, trimmed);
      recordEvent('checkout_email_saved', { hasValue: true });
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.checkoutEmail);
    }
  }

  function proceedToCheckout() {
    if (!state.items.length) {
      setStatus('Your cart is empty.');
      return Promise.resolve();
    }

    if (state.mode === 'buybutton') {
      sessionStorage.setItem(STORAGE_KEYS.lastCheckout, new Date().toISOString());
      recordEvent('checkout_started', { mode: 'buybutton', itemCount: getItemCount(), subtotal: getSubtotal() });
      window.location.assign(state.config.buyButtonFallbackUrl);
      return Promise.resolve();
    }

    if (state.mode === 'unavailable') {
      setStatus('Checkout is temporarily unavailable. Please try again later or contact ' + state.config.supportEmail);
      recordEvent('checkout_unavailable', { itemCount: getItemCount() });
      openCart();
      return Promise.resolve();
    }

    return mutateRemote('checkout_started', function () {
      if (!state.cartId || state.items.some(function (item) { return item.lineId.indexOf('local:') === 0; })) {
        return rebuildRemoteCartFromLocalState();
      }

      return fetchCart(state.cartId).then(syncFromShopifyCart);
    }).then(function () {
      if (!state.checkoutUrl) {
        throw new Error('Missing checkout URL.');
      }

      sessionStorage.setItem(STORAGE_KEYS.lastCheckout, new Date().toISOString());
      recordEvent('checkout_redirected', {
        mode: 'storefront',
        itemCount: getItemCount(),
        subtotal: getSubtotal()
      });
      window.location.assign(state.checkoutUrl);
    }).catch(function () {
      setStatus('Checkout is temporarily unavailable. Please try again later or contact ' + state.config.supportEmail);
      renderCart();
      openCart();
    });
  }

  function mutateRemote(eventName, mutationFn) {
    state.isLoading = true;
    setStatus('');
    renderCart();

    return mutationFn().then(function (result) {
      state.isLoading = false;
      renderCart();
      recordEvent(eventName, { itemCount: getItemCount(), subtotal: getSubtotal() });
      return result;
    }).catch(function (error) {
      state.isLoading = false;
      setStatus(error && error.message ? error.message : 'Network error. Please try again.');
      renderCart();
      recordEvent('cart_error', {
        event: eventName,
        message: error && error.message ? error.message : 'Unknown error'
      });
      throw error;
    });
  }

  function addToStorefrontCart(product, quantity) {
    return mutateRemote('cart_line_added', function () {
      var existing = findItemByProductId(product.id);

      if (!state.cartId) {
        return createRemoteCartFromLocalState(product, quantity);
      }

      if (existing && existing.lineId.indexOf('local:') !== 0) {
        return cartLinesUpdate(state.cartId, [{
          id: existing.lineId,
          quantity: normalizeQuantity(existing.quantity + quantity)
        }]).then(syncFromShopifyCart);
      }

      return cartLinesAdd(state.cartId, [{
        merchandiseId: product.variantId,
        quantity: quantity,
        attributes: [
          { key: 'source', value: 'vercel-cart' },
          { key: 'product_id', value: product.id }
        ]
      }]).then(syncFromShopifyCart);
    }).then(function () {
      showToast('Added to cart');
      if (state.config.openCartOnAdd) {
        openCart();
      }
    }).catch(function () {
      openCart();
    });
  }

  function createRemoteCartFromLocalState(extraProduct, extraQuantity) {
    var lines = [];

    state.items.forEach(function (item) {
      lines.push({
        merchandiseId: item.variantId,
        quantity: item.quantity,
        attributes: [
          { key: 'source', value: 'vercel-cart' },
          { key: 'product_id', value: item.productId }
        ]
      });
    });

    if (extraProduct) {
      var merged = false;
      lines.forEach(function (line) {
        if (line.merchandiseId === extraProduct.variantId) {
          line.quantity += extraQuantity;
          merged = true;
        }
      });

      if (!merged) {
        lines.push({
          merchandiseId: extraProduct.variantId,
          quantity: extraQuantity,
          attributes: [
            { key: 'source', value: 'vercel-cart' },
            { key: 'product_id', value: extraProduct.id }
          ]
        });
      }
    }

    return cartCreate(lines).then(syncFromShopifyCart);
  }

  function rebuildRemoteCartFromLocalState() {
    return createRemoteCartFromLocalState();
  }

  function syncRemoteCartOnLoad() {
    if (state.mode !== 'storefront' || !state.cartId) {
      return;
    }

    fetchCart(state.cartId).then(syncFromShopifyCart).catch(function () {
      state.cartId = '';
      state.checkoutUrl = '';
      state.items = state.items.map(function (item) {
        item.lineId = buildLocalLineId(item.productId);
        return item;
      });
      persistState();
      renderCart();
    });
  }

  function syncFromShopifyCart(cart) {
    if (!cart) {
      throw new Error('Shopify cart payload missing.');
    }

    state.cartId = cart.id || '';
    state.checkoutUrl = cart.checkoutUrl || '';
    state.items = mapShopifyCartLines(cart.lines && cart.lines.edges ? cart.lines.edges : []);
    persistState();
    renderCart();
    return cart;
  }

  function mapShopifyCartLines(edges) {
    return edges.map(function (edge) {
      var line = edge.node;
      var variant = line.merchandise;
      var productId = getProductIdFromVariantId(variant.id) || getProductIdFromAttributes(line.attributes);
      var product = PRODUCTS[productId] || PRODUCTS.semax30;
      var variantTitle = variant.title && variant.title !== 'Default Title' ? variant.title : 'Research Grade';

      return {
        lineId: line.id,
        productId: productId || product.id,
        title: variant.product && variant.product.title ? variant.product.title : product.title,
        variantTitle: variantTitle,
        price: Number(variant.price.amount),
        currency: variant.price.currencyCode || product.currency,
        quantity: line.quantity,
        variantId: variant.id
      };
    });
  }

  function getProductIdFromVariantId(variantId) {
    return Object.keys(PRODUCTS).find(function (key) {
      return PRODUCTS[key].variantId === variantId;
    }) || '';
  }

  function getProductIdFromAttributes(attributes) {
    var productAttribute = (attributes || []).find(function (entry) {
      return entry.key === 'product_id';
    });
    return productAttribute ? productAttribute.value : '';
  }

  function storefrontRequest(query, variables) {
    if (!hasStorefrontConfig()) {
      return Promise.reject(new Error('Checkout is temporarily unavailable. Please try again later or contact ' + state.config.supportEmail));
    }

    return fetch('https://' + state.config.storeDomain + '/api/' + state.config.apiVersion + '/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': state.config.storefrontAccessToken
      },
      body: JSON.stringify({
        query: query,
        variables: variables || {}
      })
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('Checkout is temporarily unavailable. Please try again later or contact ' + state.config.supportEmail);
      }
      return response.json();
    }).then(function (payload) {
      if (payload.errors && payload.errors.length) {
        throw new Error(payload.errors[0].message || 'Shopify storefront error.');
      }
      return payload.data;
    });
  }

  function cartCreate(lines) {
    var mutation = [
      'mutation CartCreate($input: CartInput) {',
      '  cartCreate(input: $input) {',
      '    cart {',
      CART_FRAGMENT,
      '    }',
      '    userErrors { field message }',
      '    warnings { code message target }',
      '  }',
      '}'
    ].join('\n');

    return storefrontRequest(mutation, {
      input: {
        lines: lines
      }
    }).then(function (data) {
      return extractCartPayload(data.cartCreate);
    });
  }

  function cartLinesAdd(cartId, lines) {
    var mutation = [
      'mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {',
      '  cartLinesAdd(cartId: $cartId, lines: $lines) {',
      '    cart {',
      CART_FRAGMENT,
      '    }',
      '    userErrors { field message }',
      '    warnings { code message target }',
      '  }',
      '}'
    ].join('\n');

    return storefrontRequest(mutation, {
      cartId: cartId,
      lines: lines
    }).then(function (data) {
      return extractCartPayload(data.cartLinesAdd);
    });
  }

  function cartLinesUpdate(cartId, lines) {
    var mutation = [
      'mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {',
      '  cartLinesUpdate(cartId: $cartId, lines: $lines) {',
      '    cart {',
      CART_FRAGMENT,
      '    }',
      '    userErrors { field message }',
      '    warnings { code message target }',
      '  }',
      '}'
    ].join('\n');

    return storefrontRequest(mutation, {
      cartId: cartId,
      lines: lines
    }).then(function (data) {
      return extractCartPayload(data.cartLinesUpdate);
    });
  }

  function cartLinesRemove(cartId, lineIds) {
    var mutation = [
      'mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {',
      '  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {',
      '    cart {',
      CART_FRAGMENT,
      '    }',
      '    userErrors { field message }',
      '    warnings { code message target }',
      '  }',
      '}'
    ].join('\n');

    return storefrontRequest(mutation, {
      cartId: cartId,
      lineIds: lineIds
    }).then(function (data) {
      return extractCartPayload(data.cartLinesRemove);
    });
  }

  function fetchCart(cartId) {
    var query = [
      'query Cart($cartId: ID!) {',
      '  cart(id: $cartId) {',
      CART_FRAGMENT,
      '  }',
      '}'
    ].join('\n');

    return storefrontRequest(query, { cartId: cartId }).then(function (data) {
      if (!data.cart) {
        throw new Error('Cart session expired.');
      }
      return data.cart;
    });
  }

  function extractCartPayload(payload) {
    var errorMessages = (payload.userErrors || []).map(function (entry) {
      return entry.message;
    });

    if (errorMessages.length) {
      throw new Error(errorMessages[0]);
    }

    if (!payload.cart) {
      throw new Error('Checkout is temporarily unavailable. Please try again later or contact ' + state.config.supportEmail);
    }

    return payload.cart;
  }

  window.NexoCart = {
    PRODUCTS: PRODUCTS,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQuantity: updateQuantity,
    openCart: openCart,
    closeCart: closeCart,
    renderCart: renderCart,
    setCheckoutEmail: setCheckoutEmail,
    getState: function () {
      return {
        mode: state.mode,
        items: state.items.slice(),
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
        subtotal: getSubtotal()
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
