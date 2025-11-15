// Ohana Boutique front-end cart & filters
const CART_KEY = "ohana_cart_v1";

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(name, price) {
  const cart = getCart();
  const existing = cart.find((i) => i.name === name && i.price === price);
  if (existing) existing.qty += 1;
  else cart.push({ name, price, qty: 1 });
  saveCart(cart);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
}

function clearCart() {
  saveCart([]);
  renderCartPage();
}

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const cart = getCart();
  el.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function formatPrice(v) {
  return "€" + v.toFixed(2).replace(".", ",");
}

function initAddToCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price || "0");
      addToCart(name, price);
      btn.textContent = "Aggiunto ✔";
      setTimeout(() => {
        btn.textContent = "Aggiungi al carrello";
      }, 1200);
    });
  });
}

function renderCartPage() {
  const body = document.getElementById("cart-items");
  const emptyBox = document.getElementById("cart-empty");
  const contentBox = document.getElementById("cart-content");
  const totalEl = document.getElementById("cart-total");
  if (!body || !emptyBox || !contentBox || !totalEl) return;

  const cart = getCart();
  if (!cart.length) {
    emptyBox.style.display = "inline-flex";
    contentBox.hidden = true;
    return;
  }
  emptyBox.style.display = "none";
  contentBox.hidden = false;

  body.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    const line = item.price * item.qty;
    total += line;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${formatPrice(item.price)}</td>
      <td>
        <input type="number" min="1" value="${item.qty}" data-index="${index}" class="ob-cart-qty" />
      </td>
      <td>${formatPrice(line)}</td>
      <td><button class="ob-link-btn ob-cart-remove" data-index="${index}">Rimuovi</button></td>
    `;
    body.appendChild(tr);
  });
  totalEl.textContent = formatPrice(total);

  document.querySelectorAll(".ob-cart-qty").forEach((input) => {
    input.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const val = Math.max(1, parseInt(e.target.value || "1", 10));
      const cart = getCart();
      cart[idx].qty = val;
      saveCart(cart);
      renderCartPage();
    });
  });

  document.querySelectorAll(".ob-cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(parseInt(btn.dataset.index, 10));
    });
  });
}

function initCartButtons() {
  const clearBtn = document.getElementById("clear-cart-btn");
  if (clearBtn) clearBtn.addEventListener("click", () => {
    if (confirm("Vuoi svuotare il carrello?")) clearCart();
  });

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", () => {
    alert("Demo Ohana Boutique: qui potrai collegare il tuo sistema di pagamento reale (Stripe, Shopify, WooCommerce).");
  });
}

function initShopFilters() {
  const categorySelect = document.getElementById("filter-category");
  const sortSelect = document.getElementById("filter-sort");
  const categoryButtons = document.querySelectorAll(".ob-shop-sidebar [data-category]");
  const products = Array.from(document.querySelectorAll("#product-list [data-product]"));
  if (!products.length) return;

  function applyFilters() {
    const category = (categorySelect && categorySelect.value) || "all";
    const sort = (sortSelect && sortSelect.value) || "default";

    products.forEach((card) => (card.style.display = ""));
    if (category !== "all") {
      products.forEach((card) => {
        card.style.display = card.dataset.category === category ? "" : "none";
      });
    }

    if (sort !== "default") {
      const parent = document.getElementById("product-list");
      const visible = products.filter((c) => c.style.display !== "none");
      visible.sort((a, b) => {
        const pa = parseFloat(a.dataset.price || "0");
        const pb = parseFloat(b.dataset.price || "0");
        return sort === "price-asc" ? pa - pb : pb - pa;
      }).forEach((c) => parent.appendChild(c));
    }
  }

  if (categorySelect) categorySelect.addEventListener("change", applyFilters);
  if (sortSelect) sortSelect.addEventListener("change", applyFilters);

  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category || "all";
      if (categorySelect) categorySelect.value = cat;
      applyFilters();
    });
  });
}

function setYear() {
  const span = document.getElementById("year");
  if (span) span.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  initAddToCartButtons();
  renderCartPage();
  initCartButtons();
  initShopFilters();
  setYear();
});
