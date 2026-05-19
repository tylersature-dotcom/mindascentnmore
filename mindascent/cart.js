/* ============================================================
   MINDASCENT N MORE (MOS)
   cart.js — Full Cart System with LocalStorage Persistence
   ============================================================ */

'use strict';

/* ============================================================
   1. CART STATE
   ============================================================ */

// The WhatsApp number for checkout (replace with real number)
const WHATSAPP_NUMBER = '2348075139979';

// Load cart from localStorage or start with empty array
let cart = loadCartFromStorage();

// Global variable to store confirmed delivery address
let deliveryAddress = loadAddressFromStorage();

/* ============================================================
   2. LOCALSTORAGE HELPERS
   ============================================================ */

/**
 * Load cart array from localStorage
 * Returns an empty array if nothing is stored yet
 */
function loadCartFromStorage() {
  try {
    const stored = localStorage.getItem('mos_cart');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('MOS Cart: Could not load from localStorage.', e);
    return [];
  }
}

/**
 * Save the current cart array to localStorage
 */
function saveCartToStorage() {
  try {
    localStorage.setItem('mos_cart', JSON.stringify(cart));
  } catch (e) {
    console.warn('MOS Cart: Could not save to localStorage.', e);
  }
}

// New: Address storage functions
function loadAddressFromStorage() {
  try {
    const stored = localStorage.getItem('mos_delivery_address');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('MOS Cart: Could not load address from localStorage.', e);
    return null;
  }
}

function saveAddressToStorage(address) {
  try {
    localStorage.setItem('mos_delivery_address', JSON.stringify(address));
  } catch (e) {
    console.warn('MOS Cart: Could not save address to localStorage.', e);
  }
}

function clearAddressFromStorage() {
  localStorage.removeItem('mos_delivery_address');
}

/* ============================================================
   3. CART CORE FUNCTIONS
   ============================================================ */

/**
 * Add a product to the cart
 * If it already exists, increase quantity by 1
 * @param {Object} product - { id, name, price, image }
 */
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id:       product.id,
      name:     product.name,
      price:    parseFloat(product.price),
      image:    product.image,
      quantity: 1
    });
  }

  saveCartToStorage();
  updateCartBadge();
  showToast(`${product.name} added to cart`);
}

/**
 * Remove a product completely from the cart by id
 * @param {string} productId
 */
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToStorage();
  updateCartBadge();
  // If cart becomes empty, clear address as well
  if (cart.length === 0) {
    clearAddressFromStorage();
  }
}

/**
 * Update the quantity of a cart item
 * If quantity drops to 0 or below, remove the item entirely
 * @param {string} productId
 * @param {number} newQuantity
 */
function updateQuantity(productId, newQuantity) {
  const item = cart.find(item => item.id === productId);

  if (!item) return;

  if (newQuantity <= 0) {
    removeFromCart(productId);
  } else {
    item.quantity = newQuantity;
    saveCartToStorage();
    updateCartBadge();
  }
}

/**
 * Clear the entire cart
 */
function clearCart() {
  cart = [];
  saveCartToStorage();
  updateCartBadge();
  // Clear address when cart is cleared
  deliveryAddress = null;
  clearAddressFromStorage();
}

/**
 * Get total number of items in the cart (sum of all quantities)
 * @returns {number}
 */
function getCartCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Get total price of all items in cart
 * @returns {number}
 */
function getCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Format a number as Nigerian Naira currency string
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  return '₦' + amount.toLocaleString('en-NG');
}


/* ============================================================
   4. CART BADGE UPDATE
   ============================================================ */

/**
 * Update all cart badge elements on the page
 * Works on both index.html and cart.html
 */
function updateCartBadge() {
  const count = getCartCount();
  const badges = document.querySelectorAll(
    '#cart-badge, #cart-badge-mobile, #cart-badge-page'
  );

  badges.forEach(badge => {
    if (badge) {
      badge.textContent = count;
      // Show/hide badge based on count
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  });
}


/* ============================================================
   5. TOAST NOTIFICATION
   ============================================================ */

let toastTimer = null;

/**
 * Show a toast notification message
 * Auto-hides after 3 seconds
 * @param {string} message
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  if (!toast || !toastMsg) return;

  // Clear any existing timer
  if (toastTimer) clearTimeout(toastTimer);

  toastMsg.textContent = message;
  toast.setAttribute('aria-hidden', 'false');
  toast.classList.add('is-visible');

  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.setAttribute('aria-hidden', 'true');
  }, 3000);
}


/* ============================================================
   6. ADD TO CART BUTTONS — EVENT LISTENERS (index.html)
   ============================================================ */

/**
 * Attach click listeners to all Add to Cart buttons
 * Reads product data from data-* attributes on the button
 */
function initAddToCartButtons() {
  const buttons = document.querySelectorAll('.add-to-cart-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      const product = {
        id:    this.dataset.id,
        name:  this.dataset.name,
        price: this.dataset.price,
        image: this.dataset.image
      };

      addToCart(product);

      // Button feedback animation
      this.classList.add('btn--added');
      const originalHTML = this.innerHTML;
      this.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Added';
      this.disabled = true;

      setTimeout(() => {
        this.innerHTML = originalHTML;
        this.disabled = false;
        this.classList.remove('btn--added');
      }, 1500);
    });
  });
}


/* ============================================================
   7. WISHLIST BUTTONS — EVENT LISTENERS
   ============================================================ */

/**
 * Toggle wishlist heart icon on product cards
 */
function initWishlistButtons() {
  const buttons = document.querySelectorAll('.product-card__wishlist');

  buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      this.classList.toggle('is-wished');
      const icon = this.querySelector('i');
      if (icon) {
        if (this.classList.contains('is-wished')) {
          icon.classList.replace('fa-regular', 'fa-solid');
          showToast('Added to wishlist');
        } else {
          icon.classList.replace('fa-solid', 'fa-regular');
          showToast('Removed from wishlist');
        }
      }
    });
  });
}


/* ============================================================
   8. CART PAGE — RENDER CART ITEMS (cart.html)
   ============================================================ */

/**
 * Render the full cart page UI
 * Called only when on cart.html
 */
function renderCartPage() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartEmptyMessage   = document.getElementById('cart-empty');
  const cartSummaryBlock   = document.getElementById('cart-summary');

  if (!cartItemsContainer) return; // Not on cart page

  if (cart.length === 0) {
    // Show empty state
    if (cartEmptyMessage)   cartEmptyMessage.style.display  = 'flex';
    if (cartSummaryBlock)   cartSummaryBlock.style.display  = 'none';
    cartItemsContainer.innerHTML = '';
    return;
  }

  // Hide empty state, show summary
  if (cartEmptyMessage)  cartEmptyMessage.style.display  = 'none';
  if (cartSummaryBlock)  cartSummaryBlock.style.display  = 'block';

  // Build cart items HTML
  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">

      <div class="cart-item__image-wrap">
        <img
          src="${item.image}"
          alt="${item.name}"
          class="cart-item__image"
          loading="lazy"
        />
      </div>

      <div class="cart-item__details">
        <h3 class="cart-item__name">${item.name}</h3>
        <p class="cart-item__unit-price">${formatCurrency(item.price)} each</p>
      </div>

      <div class="cart-item__quantity">
        <button
          class="cart-item__qty-btn qty-decrease"
          data-id="${item.id}"
          aria-label="Decrease quantity of ${item.name}"
        >
          <i class="fa-solid fa-minus" aria-hidden="true"></i>
        </button>
        <span class="cart-item__qty-display">${item.quantity}</span>
        <button
          class="cart-item__qty-btn qty-increase"
          data-id="${item.id}"
          aria-label="Increase quantity of ${item.name}"
        >
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
      </div>

      <div class="cart-item__subtotal">
        ${formatCurrency(item.price * item.quantity)}
      </div>

      <button
        class="cart-item__remove"
        data-id="${item.id}"
        aria-label="Remove ${item.name} from cart"
      >
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>

    </div>
  `).join('');

  // Update summary totals
  updateCartSummary();

  // Attach quantity and remove button listeners
  attachCartItemListeners();
}

/**
 * Update the order summary totals panel
 */
function updateCartSummary() {
  const subtotalEl  = document.getElementById('cart-subtotal');
  const totalEl     = document.getElementById('cart-total');
  const itemCountEl = document.getElementById('cart-item-count');

  const total = getCartTotal();
  const count = getCartCount();

  if (subtotalEl)  subtotalEl.textContent  = formatCurrency(total);
  if (totalEl)     totalEl.textContent     = formatCurrency(total);
  if (itemCountEl) itemCountEl.textContent =
    count === 1 ? '1 item' : `${count} items`;
}

/**
 * Attach event listeners to quantity controls and remove buttons
 * on the rendered cart items
 */
function attachCartItemListeners() {

  // Decrease quantity
  document.querySelectorAll('.qty-decrease').forEach(btn => {
    btn.addEventListener('click', function () {
      const id   = this.dataset.id;
      const item = cart.find(i => i.id === id);
      if (item) {
        updateQuantity(id, item.quantity - 1);
        renderCartPage();
      }
    });
  });

  // Increase quantity
  document.querySelectorAll('.qty-increase').forEach(btn => {
    btn.addEventListener('click', function () {
      const id   = this.dataset.id;
      const item = cart.find(i => i.id === id);
      if (item) {
        updateQuantity(id, item.quantity + 1);
        renderCartPage();
      }
    });
  });

  // Remove item
  document.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', function () {
      const id   = this.dataset.id;
      const item = cart.find(i => i.id === id);
      if (item) showToast(`${item.name} removed from cart`);
      removeFromCart(id);
      renderCartPage();
    });
  });
}


/* ============================================================
   9. CLEAR CART BUTTON (cart.html)
   ============================================================ */

function initClearCartButton() {
  const clearBtn = document.getElementById('clear-cart-btn');
  if (!clearBtn) return;

  clearBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    clearCart();
    renderCartPage();
    showToast('Cart cleared');
  });
}


/* ============================================================
   10. ADDRESS AND PAYMENT METHOD LOGIC
   ============================================================ */

// New: Initialize and handle address form
function initAddressForm() {
  const addressForm = document.getElementById('address-form');
  const addressFormContainer = document.getElementById('address-details-form');
  const paymentOptionsGroup = document.getElementById('payment-options-group');

  if (!addressForm) return;

  // Pre-fill if address is already saved
  if (deliveryAddress) {
    document.getElementById('full-name').value = deliveryAddress.fullName || '';
    document.getElementById('phone-number').value = deliveryAddress.phoneNumber || '';
    document.getElementById('email-address').value = deliveryAddress.email || '';
    document.getElementById('street-address').value = deliveryAddress.streetAddress || '';
    document.getElementById('city').value = deliveryAddress.city || '';
    document.getElementById('state').value = deliveryAddress.state || '';
    document.getElementById('postal-code').value = deliveryAddress.postalCode || '';
  }

  addressForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('full-name').value.trim();
    const phoneNumber = document.getElementById('phone-number').value.trim();
    const email = document.getElementById('email-address').value.trim();
    const streetAddress = document.getElementById('street-address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const postalCode = document.getElementById('postal-code').value.trim();

    if (!fullName || !phoneNumber || !streetAddress || !city || !state) {
      showToast('Please fill in all required address fields.');
      return;
    }

    // Basic phone number validation (e.g., starts with 0 and has 11 digits for Nigerian numbers)
    if (!/^(0|\+234)[789]\d{9}$/.test(phoneNumber) && !/^\d{11}$/.test(phoneNumber)) {
      showToast('Please enter a valid Nigerian phone number (e.g., 08012345678).');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    deliveryAddress = {
      fullName,
      phoneNumber,
      email,
      streetAddress,
      city,
      state,
      postalCode
    };
    saveAddressToStorage(deliveryAddress);
    showToast('Delivery address saved!');

    // Hide address form, show payment options
    addressFormContainer.style.display = 'none';
    paymentOptionsGroup.style.display = 'flex';
  });
}

/**
 * Toggle payment methods visibility (after address is confirmed)
 */
function initPaymentMethodToggle() {
  const toggleBtn = document.getElementById('payment-methods-toggle');
  const methodsGroupInner = document.getElementById('payment-methods-group-inner');

  if (!toggleBtn || !methodsGroupInner) return;

  toggleBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    if (!deliveryAddress) { // New: Check if address is saved
      showToast('Please save your delivery address first.');
      document.getElementById('address-details-form').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // Hide the toggle and show the options
    toggleBtn.style.display = 'none'; // Hide the main toggle button
    methodsGroupInner.style.display = 'flex'; // Show the inner payment options
  });
}

/**
 * Build and send a formatted WhatsApp order message
 * Called when the checkout button is clicked
 */
function initWhatsAppCheckout() {
  const checkoutBtn = document.getElementById('whatsapp-checkout-btn');
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    if (!deliveryAddress) { // New: Check if address is saved
      showToast('Please save your delivery address first.');
      document.getElementById('address-details-form').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const message = buildWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    const url     = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

/**
 * Handle Card payment checkout via Paystack
 * Shows the on-page card form then triggers secure Paystack payment
 */
function initPaystackCheckout() {
  const paystackBtn = document.getElementById('paystack-checkout-btn');
  const cardForm = document.getElementById('card-payment-form');
  const paymentForm = document.getElementById('payment-form');
  const cancelBtn = document.getElementById('cancel-payment');
  const paymentOptionsGroupInner = document.getElementById('payment-methods-group-inner');

  if (!paystackBtn || !cardForm || !paymentForm) return;

  // Show the card details form when "Pay with Card" is clicked
  paystackBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    if (!deliveryAddress) {
      showToast('Please save your delivery address first.');
      document.getElementById('address-details-form').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Pre-fill email and name from delivery address
    const emailInput = document.getElementById('customer-email');
    const nameInput = document.getElementById('card-name');
    if (emailInput) emailInput.value = deliveryAddress.email || '';
    if (nameInput) nameInput.value = deliveryAddress.fullName || '';

    // Hide inner payment options and show card form
    if (paymentOptionsGroupInner) paymentOptionsGroupInner.style.display = 'none';
    cardForm.style.display = 'block';
    cardForm.scrollIntoView({ behavior: 'smooth' });
  });

  cancelBtn.addEventListener('click', () => {
    cardForm.style.display = 'none';
    if (paymentOptionsGroupInner) paymentOptionsGroupInner.style.display = 'flex';
    document.getElementById('payment-methods-toggle').style.display = 'block';
  });

  // Auto-format card number (spacing)
  document.getElementById('card-number')?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    e.target.value = val.replace(/(\d{4})(?=\d)/g, '$1 ');
  });

  // Auto-format CVV (numbers only)
  document.getElementById('cvv')?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // Process payment on form submit
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const total = getCartTotal() * 100; // Paystack uses kobo
    const email = document.getElementById('customer-email').value;

    const handler = PaystackPop.setup({
      key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your actual Paystack Public Key
      email: email,
      amount: total,
      currency: "NGN",
      ref: 'MOS_' + Math.floor((Math.random() * 1000000000) + 1),
      callback: function(response) {
        showToast('Payment successful! Ref: ' + response.reference);
        clearCart();
        renderCartPage();
        cardForm.style.display = 'none';
        if (paymentOptionsGroupInner) paymentOptionsGroupInner.style.display = 'flex';
      },
      onClose: function() {
        showToast('Payment window closed');
      }
    });

    handler.openIframe();
  });
}

/**
 * Handle FCMB Transfer checkout
 * Shows account details for FCMB transfer
 */
function initFCMBTransferCheckout() {
  const fcmbBtn = document.getElementById('fcmb-transfer-btn');
  const fcmbDetails = document.getElementById('fcmb-payment-details');
  const cancelFcmbBtn = document.getElementById('cancel-fcmb');
  const confirmFcmbBtn = document.getElementById('confirm-fcmb-payment');
  const copyAccountBtn = document.getElementById('copy-account');
  const amountDisplay = document.getElementById('fcmb-amount');
  const paymentOptionsGroupInner = document.getElementById('payment-methods-group-inner'); // New: Get inner payment options

  if (!fcmbBtn || !fcmbDetails) return;

  // Show FCMB details when clicked
  fcmbBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    if (!deliveryAddress) {
      showToast('Please save your delivery address first.');
      document.getElementById('address-details-form').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Update amount
    const total = getCartTotal();
    amountDisplay.textContent = formatCurrency(total);

    // Hide inner options and show details
    if (paymentOptionsGroupInner) paymentOptionsGroupInner.style.display = 'none';
    fcmbDetails.style.display = 'block';

    // Scroll
    fcmbDetails.scrollIntoView({ behavior: 'smooth' });
  });


  // Hide details
  cancelFcmbBtn.addEventListener('click', () => {
    fcmbDetails.style.display = 'none';
    if (paymentOptionsGroupInner) paymentOptionsGroupInner.style.display = 'flex'; // Show inner payment options again
    document.getElementById('payment-methods-toggle').style.display = 'block'; // Show the main toggle button
  });

  // Copy account number functionality
  copyAccountBtn.addEventListener('click', async () => {
    const accountNumber = '2001983464';
    try {
      await navigator.clipboard.writeText(accountNumber);
      showToast('Account number copied to clipboard');
      copyAccountBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => {
        copyAccountBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = accountNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Account number copied to clipboard');
    }
  });

  // Handle payment confirmation
  confirmFcmbBtn.addEventListener('click', () => {
    const total = getCartTotal();
    const message = `Hi! I've made an FCMB transfer to account 2001983464 (Mindascent 'N' More) for ${formatCurrency(total)}. Here's my order details:\n\n${buildWhatsAppMessage()}`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

    // Clear cart after confirmation
    cart = [];
    deliveryAddress = null; // Clear address after successful payment
    saveCartToStorage();
    clearAddressFromStorage();
    renderCartPage();
    updateCartBadge();

    // Hide FCMB details
    fcmbDetails.style.display = 'none';
    if (paymentOptionsGroupInner) paymentOptionsGroupInner.style.display = 'flex'; // Show inner payment options again

    showToast('Redirecting to WhatsApp for confirmation...');

    // Open WhatsApp
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 1000);
  });
}

/**
 * Build the formatted WhatsApp order message string
 * @returns {string}
 */
function buildWhatsAppMessage() {
  const divider   = '─────────────────────';
  const itemLines = cart.map(item =>
    `• ${item.name}\n  Qty: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`
  ).join('\n\n');

  const total = formatCurrency(getCartTotal());
  const date  = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric'
  });

  // New: Include delivery address in the message
  let addressDetails = '';
  if (deliveryAddress) {
    addressDetails = `
*DELIVERY ADDRESS:*
${divider}
Name: ${deliveryAddress.fullName}
Phone: ${deliveryAddress.phoneNumber}
Email: ${deliveryAddress.email}
Address: ${deliveryAddress.streetAddress}, ${deliveryAddress.city}, ${deliveryAddress.state}
${deliveryAddress.postalCode ? `Postal Code: ${deliveryAddress.postalCode}` : ''}
${divider}
`;
  }

  const message =
`*MINDASCENT N MORE (MOS)*
*New Order Request*
${divider}

*Date:* ${date}

${addressDetails}
*ORDER DETAILS:*
${divider}

${itemLines}

${divider}
*ORDER TOTAL: ${total}*
${divider}

Please confirm availability and provide payment details.

Thank you for choosing MOS — Where Scent Becomes Identity.`;

  return message;
}


/* ============================================================
   11. INITIALISE CART MODULE
   ============================================================ */

/**
 * Main cart initialiser
 * Runs on DOMContentLoaded for both index.html and cart.html
 */
function initCart() {
  updateCartBadge();
  initAddToCartButtons();
  initWishlistButtons();

  // Cart page specific
  renderCartPage();
  initClearCartButton();
  initAddressForm(); // New: Initialize address form logic
  initPaymentMethodToggle();
  initWhatsAppCheckout();
  initFCMBTransferCheckout();
  initPaystackCheckout();
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', initCart);