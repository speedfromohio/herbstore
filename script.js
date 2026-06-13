/* ======================================================================
   HERBS STORE — Vanilla JS Frontend
   Replaces the React/Vite app. Handles routing, cart, auth, checkout
   and order history while reusing the existing Supabase + Razorpay +
   Express/email backend.
   ====================================================================== */

/* ============ SUPABASE CLIENT ============
   Same values as src/supabaseClient.ts. Loaded via CDN script in index.html
   (creates a global `supabase` object with `.createClient`). */
const SUPABASE_URL = "https://jvieclitexpqffivnakh.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_EKfSozrqeJ5T4bveQPMbmQ_M2yOEsMM";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

/* ============ PRODUCT DATA ============
   Mirrors src/data/products.ts. Images now live in /images. */
const PRODUCTS = [
  {
    id: "1",
    name: "Aloe Vera",
    description: "Natural skin care and healing properties.",
    price: 150,
    image: "images/aloe-vera.jpg",
    category: "Healing"
  },
  {
    id: "2",
    name: "Ashwagandha",
    description: "Stress relief and energy booster.",
    price: 450,
    image: "images/ashwagandha.jpg",
    category: "Stress Relief"
  },
  {
    id: "3",
    name: "Brahmi",
    description: "Enhances memory and cognitive function.",
    price: 320,
    image: "images/brahmi.webp",
    category: "Brain Health"
  },
  {
    id: "4",
    name: "Giloy",
    description: "Natural immunity booster and detoxifier.",
    price: 280,
    image: "images/giloy.webp",
    category: "Immunity"
  },
  {
    id: "5",
    name: "Mint",
    description: "Fresh aroma and digestive aid.",
    price: 80,
    image: "images/mint.jpg",
    category: "Digestive"
  },
  {
    id: "6",
    name: "Neem Leafs",
    description: "Purifies blood and treats skin issues.",
    price: 120,
    image: "images/neem-leafs.jpg",
    category: "Skin Care"
  },
  {
    id: "7",
    name: "Rosemary",
    description: "Excellent for hair growth and focus.",
    price: 200,
    image: "images/rosemary.webp",
    category: "Hair Care"
  },
  {
    id: "8",
    name: "Tulsi",
    description: "Holy Basil for respiratory health and peace.",
    price: 180,
    image: "images/tulsi.jpg",
    category: "Holistic"
  }
];

const HERO_IMAGE = "images/hero.jpg";

/* ======================================================================
   CART (replaces CartContext.tsx) — persisted to localStorage
   ====================================================================== */
const CART_KEY = "herbs_cart";

function getCart() {
  const saved = localStorage.getItem(CART_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
}

function updateQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  const cart = getCart().map((item) =>
    item.id === productId ? { ...item, quantity } : item
  );
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function cartTotalCount() {
  return getCart().reduce((count, item) => count + item.quantity, 0);
}

function cartTotalPrice() {
  return getCart().reduce((total, item) => total + item.price * item.quantity, 0);
}

function updateCartBadge() {
  const count = cartTotalCount();
  const badge = document.getElementById("cartCount");
  const badgeMobile = document.getElementById("cartCountMobile");
  [badge, badgeMobile].forEach((el) => {
    if (!el) return;
    el.textContent = count;
    el.classList.toggle("hidden", count === 0);
  });
}

/* ======================================================================
   SUPABASE SERVICE (replaces src/services/supabaseService.ts)
   ====================================================================== */
const supabaseService = {
  async createOrder(userId, orderData, items) {
    const { data: order, error: orderError } = await sb
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: orderData.name,
        email: orderData.email,
        mobile: orderData.mobile,
        address: orderData.address,
        total_price: orderData.total_price
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      price_at_time: item.price,
      quantity: item.quantity,
      image_url: item.image
    }));

    const { error: itemsError } = await sb.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    return order;
  },

  async getUserOrders() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return [];

    const { data, error } = await sb
      .from("orders")
      .select(`*, order_items(*)`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
};

/* ======================================================================
   ROUTER
   ====================================================================== */
const ROUTES = ["home", "cart", "auth", "checkout", "orders"];
const app = document.getElementById("app");

function navigate(page) {
  if (!ROUTES.includes(page)) page = "home";

  // Guard: checkout requires non-empty cart
  if (page === "checkout" && getCart().length === 0) {
    page = "cart";
  }

  window.location.hash = page;
}

function handleRouteChange() {
  const page = (window.location.hash || "#home").replace("#", "") || "home";
  renderPage(ROUTES.includes(page) ? page : "home");
  setActiveNav(page);
  document.getElementById("mobileMenu").classList.add("hidden");
  window.scrollTo(0, 0);
}

function setActiveNav(page) {
  document.querySelectorAll(".nav-link, .mobile-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}

function renderPage(page) {
  switch (page) {
    case "home":
      renderHome();
      break;
    case "cart":
      renderCart();
      break;
    case "auth":
      renderAuth();
      break;
    case "checkout":
      if (getCart().length === 0) {
        window.location.hash = "cart";
        return;
      }
      renderCheckout();
      break;
    case "orders":
      renderOrders();
      break;
  }
}

/* ======================================================================
   HOME PAGE (replaces pages/Home.tsx + components/ProductCard.tsx)
   ====================================================================== */
function renderHome(searchTerm = "") {
  const filtered = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productsHTML = filtered.length
    ? `<div class="products-grid">${filtered.map(productCardHTML).join("")}</div>`
    : `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No herbs found</h3>
        <p>Try searching for something else, like "Tulsi" or "Mint".</p>
      </div>
    `;

  app.innerHTML = `
    <div>
      <!-- Hero -->
      <section class="hero">
        <img src="${HERO_IMAGE}" alt="Hero Background" class="hero-bg" referrerpolicy="no-referrer" />
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title">Natural Herbs for a <em>Healthy Life</em></h1>
          <p class="hero-subtitle">
            Discover the healing power of nature with our handpicked collection of fresh, organic Ayurvedic herbs.
          </p>
          <a href="#products" class="hero-btn">
            <span>Explore Collection</span>
            <span>→</span>
          </a>
        </div>
      </section>

      <!-- Products -->
      <section id="products" class="products-section">
        <div class="container">
          <div class="products-header">
            <h2 class="products-title">Our Herbal Selection</h2>
            <div class="search-wrapper">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                id="searchInput"
                class="search-input"
                placeholder="Search herbs..."
                value="${escapeAttr(searchTerm)}"
              />
            </div>
          </div>
          <div id="productsGrid">${productsHTML}</div>
        </div>
      </section>
    </div>
  `;

  // Search handler — re-render just the grid + header, keep focus
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value;
    const filteredNow = PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(value.toLowerCase())
    );
    document.getElementById("productsGrid").innerHTML = filteredNow.length
      ? `<div class="products-grid">${filteredNow.map(productCardHTML).join("")}</div>`
      : `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No herbs found</h3>
          <p>Try searching for something else, like "Tulsi" or "Mint".</p>
        </div>
      `;
    attachAddToCartHandlers();
  });

  attachAddToCartHandlers();
}

function productCardHTML(product) {
  return `
    <div class="product-card">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${escapeAttr(product.name)}" class="product-image" referrerpolicy="no-referrer" />
      </div>
      <div class="product-body">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">₹${product.price}</span>
          <button class="add-btn" data-add-id="${product.id}">
            <span>+</span>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function attachAddToCartHandlers() {
  document.querySelectorAll("[data-add-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = PRODUCTS.find((p) => p.id === btn.dataset.addId);
      if (!product) return;
      addToCart(product);
      showToast(`${product.name} added to cart! 🌿`);
    });
  });
}

/* ======================================================================
   TOAST
   ====================================================================== */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  toastText.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add("hidden"), 3000);
}

/* ======================================================================
   CART PAGE (replaces pages/CartPage.tsx)
   ====================================================================== */
function renderCart() {
  const cart = getCart();

  if (cart.length === 0) {
    app.innerHTML = `
      <div class="center-card-wrap">
        <div class="center-card">
          <div class="center-card-icon">🌿</div>
          <h2>Your cart is empty 🌿</h2>
          <p>Looks like you haven't added any herbs yet. Time to explore our natural sanctuary!</p>
          <a href="#home" class="primary-btn" data-link="home">
            <span>←</span>
            <span>Go Back Home</span>
          </a>
        </div>
      </div>
    `;
    return;
  }

  const itemsHTML = cart.map((item) => `
    <div class="cart-item" data-item-id="${item.id}">
      <img src="${item.image}" alt="${escapeAttr(item.name)}" class="cart-item-img" referrerpolicy="no-referrer" />
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
      </div>
      <div class="qty-control">
        <button class="qty-btn" data-qty-action="dec" data-id="${item.id}">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn" data-qty-action="inc" data-id="${item.id}">+</button>
      </div>
      <button class="remove-btn" data-remove-id="${item.id}">🗑</button>
    </div>
  `).join("");

  app.innerHTML = `
    <div class="page container">
      <div class="page-header">
        <a href="#home" class="back-btn">←</a>
        <h1 class="page-title">Your Herb Sanctuary</h1>
      </div>

      <div class="cart-grid">
        <div class="cart-items">${itemsHTML}</div>

        <div class="summary-card">
          <h2 class="summary-title">Order Summary</h2>
          <div class="summary-row">
            <span>Total Items</span>
            <span>${cartTotalCount()}</span>
          </div>
          <div class="summary-row free">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-total">
            <span>Grand Total</span>
            <span>₹${cartTotalPrice()}</span>
          </div>
          <a href="#checkout" class="primary-btn" style="width:100%;">
            <span>🛍</span>
            <span>Checkout Now</span>
          </a>
          <p class="summary-footer">
            <span>🌿</span>
            <span>100% Organic &amp; Sustainably Packed</span>
          </p>
        </div>
      </div>
    </div>
  `;

  // Quantity buttons
  app.querySelectorAll("[data-qty-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const action = btn.dataset.qtyAction;
      const item = getCart().find((i) => i.id === id);
      if (!item) return;
      const newQty = action === "inc" ? item.quantity + 1 : item.quantity - 1;
      updateQuantity(id, newQty);
      renderCart();
    });
  });

  // Remove buttons
  app.querySelectorAll("[data-remove-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.removeId);
      renderCart();
    });
  });
}

/* ======================================================================
   AUTH PAGE (replaces pages/AuthPage.tsx) — Supabase login/signup
   ====================================================================== */
function renderAuth(isLogin = true) {
  app.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-card">
        <!-- Decorative side -->
        <div class="auth-side">
          <div class="auth-side-brand">
            <span>🌿</span>
            <span>Herbs Store</span>
          </div>
          <h2>A journey to <em>holistic wellness</em> starts here.</h2>
          <div class="auth-features">
            <div class="auth-feature">
              <span class="auth-feature-icon">✓</span>
              <span>100% Organic certified products</span>
            </div>
            <div class="auth-feature">
              <span class="auth-feature-icon">✓</span>
              <span>Ethically sourced from local farms</span>
            </div>
            <div class="auth-feature">
              <span class="auth-feature-icon">✓</span>
              <span>Sustainably packed and delivered</span>
            </div>
          </div>
          <div class="auth-quote">
            "Let food be thy medicine and medicine be thy food."
          </div>
        </div>

        <!-- Form side -->
        <div class="auth-form-side">
          <div class="auth-heading">
            <h1>${isLogin ? "Welcome Back" : "Join Our Sanctuary"}</h1>
            <p>${isLogin ? "Sign in to access your profile" : "Start your herbal journey today"}</p>
          </div>

          <div id="authAlert"></div>

          <form id="authForm">
            ${!isLogin ? `
              <div class="form-group">
                <label>Username</label>
                <input type="text" name="username" class="form-input" placeholder="Your herb name" />
              </div>
            ` : ""}

            <div class="form-group">
              <label>Email Address</label>
              <input type="email" name="email" class="form-input" placeholder="name@example.com" />
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" name="password" class="form-input" placeholder="••••••••" />
            </div>

            <button type="submit" class="primary-btn" style="width:100%;" id="authSubmitBtn">
              <span>${isLogin ? "Sign In" : "Create Account"}</span>
              <span>→</span>
            </button>
          </form>

          <div class="auth-switch">
            ${isLogin ? "Don't have an account?" : "Already a member?"}
            <button type="button" id="authToggle">${isLogin ? "Sign up for free" : "Sign in now"}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("authToggle").addEventListener("click", () => {
    renderAuth(!isLogin);
  });

  document.getElementById("authForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById("authAlert");
    const submitBtn = document.getElementById("authSubmitBtn");
    alertBox.innerHTML = "";

    const formData = new FormData(e.target);
    const email = formData.get("email")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";
    const username = formData.get("username")?.toString().trim() || "";

    // Basic validation (mirrors AuthPage.tsx)
    if (!email || !password || (!isLogin && !username)) {
      alertBox.innerHTML = alertHTML("error", "Oops! Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      alertBox.innerHTML = alertHTML("error", "Oops! Password must be at least 6 characters.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<div class="spinner-sm"></div>`;

    try {
      if (isLogin) {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        alertBox.innerHTML = alertHTML("success", "Login successful! Welcome back. 🌿");
        setTimeout(() => { window.location.hash = "home"; }, 1500);
      } else {
        const { error } = await sb.auth.signUp({
          email,
          password,
          options: { data: { username } }
        });
        if (error) throw error;
        alertBox.innerHTML = alertHTML("success", "Account created successfully! Please check your email to verify. 🌿");
        setTimeout(() => { window.location.hash = "home"; }, 3000);
      }
    } catch (err) {
      alertBox.innerHTML = alertHTML("error", `Oops! ${err.message || "An error occurred during authentication."}`);
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>${isLogin ? "Sign In" : "Create Account"}</span><span>→</span>`;
    }
  });
}

function alertHTML(type, message) {
  return `<div class="alert alert-${type}">${message}</div>`;
}

/* ======================================================================
   CHECKOUT PAGE (replaces pages/CheckoutPage.tsx)
   Razorpay + Supabase order creation + email confirmation
   ====================================================================== */
let checkoutFormData = { name: "", email: "", mobile: "", address: "" };
let checkoutErrors = {};
let checkoutSubmitting = false;
let checkoutSuccess = false;
let checkoutEmailStatus = "";

function renderCheckout() {
  if (checkoutSuccess) {
    renderCheckoutSuccess();
    return;
  }

  const cart = getCart();
  const totalPrice = cartTotalPrice();

  const itemsHTML = cart.map((item) => `
    <div class="order-item-row">
      <img src="${item.image}" alt="${escapeAttr(item.name)}" class="order-item-img" />
      <div class="order-item-info">
        <p>${item.name}</p>
        <p>Qty: ${item.quantity}</p>
      </div>
      <p class="order-item-price">₹${item.price * item.quantity}</p>
    </div>
  `).join("");

  app.innerHTML = `
    <div class="page page-medium">
      <div class="page-header">
        <a href="#cart" class="back-btn">←</a>
        <h1 class="page-title">Complete Purchase</h1>
      </div>

      <div class="checkout-grid">
        <div class="checkout-form-wrap">
          <form id="checkoutForm" class="checkout-form">
            <div>
              <h3 class="section-title" style="margin-bottom:2rem;">
                <span class="section-icon">🚚</span>
                <span>Shipping Details</span>
              </h3>
              <div class="checkout-fields">
                <div>
                  <label class="form-label" style="display:block;font-size:0.875rem;font-weight:700;color:var(--emerald-900);margin-bottom:0.5rem;margin-left:0.25rem;">Full Name</label>
                  <input name="name" type="text" placeholder="Enter your name" class="form-input ${checkoutErrors.name ? "error" : ""}" value="${escapeAttr(checkoutFormData.name)}" />
                  ${checkoutErrors.name ? `<p class="field-error">${checkoutErrors.name}</p>` : ""}
                </div>
                <div>
                  <label class="form-label" style="display:block;font-size:0.875rem;font-weight:700;color:var(--emerald-900);margin-bottom:0.5rem;margin-left:0.25rem;">Email Address</label>
                  <input name="email" type="email" placeholder="name@example.com" class="form-input ${checkoutErrors.email ? "error" : ""}" value="${escapeAttr(checkoutFormData.email)}" />
                  ${checkoutErrors.email ? `<p class="field-error">${checkoutErrors.email}</p>` : ""}
                </div>
                <div>
                  <label class="form-label" style="display:block;font-size:0.875rem;font-weight:700;color:var(--emerald-900);margin-bottom:0.5rem;margin-left:0.25rem;">Mobile Number</label>
                  <input name="mobile" type="tel" placeholder="10-digit mobile number" class="form-input ${checkoutErrors.mobile ? "error" : ""}" value="${escapeAttr(checkoutFormData.mobile)}" />
                  ${checkoutErrors.mobile ? `<p class="field-error">${checkoutErrors.mobile}</p>` : ""}
                </div>
                <div>
                  <label class="form-label" style="display:block;font-size:0.875rem;font-weight:700;color:var(--emerald-900);margin-bottom:0.5rem;margin-left:0.25rem;">Complete Address</label>
                  <textarea name="address" rows="4" placeholder="House No, Street, Landmark, City, Pincode" class="form-textarea ${checkoutErrors.address ? "error" : ""}">${escapeHTML(checkoutFormData.address)}</textarea>
                  ${checkoutErrors.address ? `<p class="field-error">${checkoutErrors.address}</p>` : ""}
                </div>
              </div>
            </div>

            ${(checkoutErrors.auth || checkoutErrors.submit) ? `
              <div class="alert alert-error">
                ${checkoutErrors.auth || checkoutErrors.submit}
                ${checkoutErrors.auth ? `<a href="#auth">Login here</a>` : ""}
              </div>
            ` : ""}

            <button type="submit" class="primary-btn" style="width:100%;" ${checkoutSubmitting ? "disabled" : ""}>
              ${checkoutSubmitting
                ? `<div class="spinner-sm"></div><span>Processing...</span>`
                : `<span>✓</span><span>Pay ₹${totalPrice} Now</span>`
              }
            </button>
          </form>

          <div class="trust-row">
            <span>💳 Secure SSL</span>
            <span>🚚 Fast Delivery</span>
            <span>🌿 Sustainable</span>
          </div>
        </div>

        <div class="order-summary-card">
          <h4 class="order-summary-title">
            <span>In your basket</span>
            <span>(${cart.length} items)</span>
          </h4>
          <div class="order-items-list">${itemsHTML}</div>
          <div class="order-summary-divider"></div>
          <div class="order-summary-totals">
            <div class="order-summary-row">
              <span>Subtotal</span>
              <span>₹${totalPrice}</span>
            </div>
            <div class="order-summary-row">
              <span>Tax &amp; Duty</span>
              <span>₹0</span>
            </div>
            <div class="order-summary-row free">
              <span>Standard Delivery</span>
              <span>FREE</span>
            </div>
          </div>
          <div class="order-summary-grand-divider"></div>
          <div class="order-summary-grand-total">
            <span>Total</span>
            <span>₹${totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("checkoutForm").addEventListener("submit", handleCheckoutSubmit);
}

function renderCheckoutSuccess() {
  const isEmailSent = checkoutEmailStatus.includes("successfully");

  app.innerHTML = `
    <div class="center-card-wrap" style="background-color: rgba(244,243,240,0.2);">
      <div class="center-card" style="max-width:32rem; border-radius:3rem;">
        <div class="success-icon">✓</div>
        <h2 style="font-size:2.25rem; font-weight:800; letter-spacing:-0.02em; font-family:var(--font-serif);">Order Confirmed!</h2>

        ${checkoutEmailStatus ? `
          <div class="email-status ${isEmailSent ? "sent" : "failed"}">
            ${checkoutEmailStatus} ${isEmailSent ? "🌿" : "⚠️"}
          </div>
        ` : ""}

        <p style="font-size:1.125rem;">
          Thank you for choosing <strong>Herbs Store</strong>. Your journey to wellness is on its way! 🌿
        </p>

        <div class="order-details-box">
          <h4>Order Details:</h4>
          <p>Name: <strong>${escapeHTML(checkoutFormData.name)}</strong></p>
          <p>Email: <strong>${escapeHTML(checkoutFormData.email)}</strong></p>
          <p>Delivering to: <strong>${escapeHTML(checkoutFormData.address)}</strong></p>
        </div>

        <a href="#home" class="primary-btn">
          <span>Continue Shopping</span>
        </a>
      </div>
    </div>
  `;

  // Reset state so a fresh checkout starts clean next time
  checkoutSuccess = false;
  checkoutFormData = { name: "", email: "", mobile: "", address: "" };
  checkoutErrors = {};
  checkoutEmailStatus = "";
}

function validateCheckout(formData) {
  const errors = {};
  if (!formData.name.trim()) errors.name = "Name is required";

  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Invalid email address";
  }

  if (!formData.mobile.trim()) {
    errors.mobile = "Mobile number is required";
  } else if (!/^\d{10}$/.test(formData.mobile)) {
    errors.mobile = "Mobile number must be 10 digits";
  }

  if (!formData.address.trim()) errors.address = "Address is required";

  return errors;
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const fd = new FormData(e.target);
  checkoutFormData = {
    name: fd.get("name")?.toString() || "",
    email: fd.get("email")?.toString() || "",
    mobile: fd.get("mobile")?.toString() || "",
    address: fd.get("address")?.toString() || ""
  };

  const errors = validateCheckout(checkoutFormData);
  if (Object.keys(errors).length > 0) {
    checkoutErrors = errors;
    renderCheckout();
    return;
  }

  checkoutSubmitting = true;
  checkoutErrors = {};
  renderCheckout();

  const totalPrice = cartTotalPrice();
  const cart = getCart();

  try {
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
      checkoutErrors = { auth: "You must be signed in to place an order." };
      checkoutSubmitting = false;
      renderCheckout();
      return;
    }

    // 1. Create Razorpay order on backend
    const resOrder = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalPrice })
    });

    let rzpOrderData;
    const resOrderType = resOrder.headers.get("content-type");
    if (resOrderType && resOrderType.includes("application/json")) {
      rzpOrderData = await resOrder.json();
    } else {
      const text = await resOrder.text();
      console.error("Server responded with non-JSON response:", text);
      if (resOrder.status === 404) {
        throw new Error("The payment endpoint was not found (404). Please ensure the backend server has loaded properly and that your Razorpay keys are configured.");
      } else {
        throw new Error(`Server error (${resOrder.status}). The payment gateway failed to initialize. Please check backend server configuration.`);
      }
    }

    if (!resOrder.ok) {
      throw new Error(rzpOrderData?.error || "Failed to initialize Razorpay payment order.");
    }

    // 2. Razorpay checkout.js is loaded via <script> in index.html already
    if (!window.Razorpay) {
      throw new Error("Could not load Razorpay payment gateway. Please check your network connection.");
    }

    // 3. Open Razorpay payment modal
    const options = {
      key: rzpOrderData.key_id,
      amount: rzpOrderData.amount,
      currency: rzpOrderData.currency || "INR",
      name: "Herbs Store",
      description: "Organic & sustainably sourced wellness herbs",
      order_id: rzpOrderData.id,
      prefill: {
        name: checkoutFormData.name,
        email: checkoutFormData.email,
        contact: checkoutFormData.mobile
      },
      theme: { color: "#047857" },
      handler: async function (response) {
        try {
          checkoutSubmitting = true;
          renderCheckout();

          // 4. Verify payment signature on backend
          const rzpVerifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          let verifyData;
          const rzpVerifyType = rzpVerifyRes.headers.get("content-type");
          if (rzpVerifyType && rzpVerifyType.includes("application/json")) {
            verifyData = await rzpVerifyRes.json();
          } else {
            const text = await rzpVerifyRes.text();
            console.error("Verify payment responded with non-JSON response:", text);
            throw new Error(`Server returned an invalid response (${rzpVerifyRes.status}) during payment verification.`);
          }

          if (!rzpVerifyRes.ok) {
            throw new Error(verifyData?.error || "Payment signature verification failed.");
          }
          if (!verifyData.success) {
            throw new Error("Payment signature verification unsuccessful.");
          }

          // 5. Save order in Supabase (only on successful verification)
          const order = await supabaseService.createOrder(user.id, {
            ...checkoutFormData,
            total_price: totalPrice
          }, cart);

          // 6. Send order confirmation email (Supabase Edge Function -> Express fallback)
          let emailSent = false;
          const emailPayload = {
            userName: checkoutFormData.name,
            userEmail: checkoutFormData.email,
            userNumber: checkoutFormData.mobile,
            userAddress: checkoutFormData.address,
            orderId: order.id,
            orderedItems: cart.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            totalPrice: totalPrice
          };

          try {
            const { data, error: emailError } = await sb.functions.invoke("send-order-email", {
              body: emailPayload
            });
            if (emailError) throw emailError;
            if (data && data.error) throw new Error(data.error);
            emailSent = true;
          } catch (err) {
            console.warn("Supabase Edge function invocation failed, trying server-side API fallback...", err);
            try {
              const mailResponse = await fetch("/api/send-order-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emailPayload)
              });
              if (mailResponse.ok) {
                const result = await mailResponse.json();
                if (result.success) emailSent = true;
              }
            } catch (fallbackErr) {
              console.error("Fallback email sending failed:", fallbackErr);
            }
          }

          checkoutEmailStatus = emailSent
            ? "Order placed successfully. Confirmation email sent."
            : "Order placed successfully, but email could not be sent.";

          checkoutSuccess = true;
          clearCart();
          checkoutSubmitting = false;
          renderCheckout();
        } catch (verificationError) {
          checkoutErrors = { submit: verificationError.message || "Payment verification failed. Your card was not charged." };
          checkoutSubmitting = false;
          renderCheckout();
        }
      },
      modal: {
        ondismiss: function () {
          checkoutSubmitting = false;
          checkoutErrors = { submit: "Payment window was closed. Try clicking pay again to finalize." };
          renderCheckout();
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (resp) {
      console.error("Razorpay payment execution failed", resp.error);
      checkoutErrors = { submit: resp.error.description || "Payment transaction encountered an error. Please try again." };
      checkoutSubmitting = false;
      renderCheckout();
    });

    rzp.open();
    checkoutSubmitting = false; // form re-enabled while Razorpay modal is open
  } catch (err) {
    checkoutErrors = { submit: err.message || "Failed to initialize payment process. Please try again." };
    checkoutSubmitting = false;
    renderCheckout();
  }
}

/* ======================================================================
   ORDERS PAGE (replaces pages/OrdersPage.tsx)
   ====================================================================== */
async function renderOrders() {
  app.innerHTML = `
    <div class="spinner-wrap">
      <div class="spinner"></div>
    </div>
  `;

  let orders = [];
  try {
    orders = await supabaseService.getUserOrders();
  } catch (err) {
    console.error("Failed to fetch orders:", err);
  }

  if (orders.length === 0) {
    app.innerHTML = `
      <div class="page page-wide">
        <div class="page-header">
          <a href="#home" class="back-btn">←</a>
          <h1 class="page-title">Order History</h1>
        </div>
        <div class="center-card" style="max-width:none;">
          <div class="center-card-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Your herbal journey history will appear here once you place an order.</p>
          <a href="#home" class="primary-btn">Go Shopping</a>
        </div>
      </div>
    `;
    return;
  }

  const ordersHTML = orders.map((order) => {
    const itemsHTML = (order.order_items || []).map((item) => `
      <div class="order-card-item">
        <img src="${item.image_url}" alt="${escapeAttr(item.product_name)}" class="order-card-item-img" />
        <div class="order-card-item-info">
          <p>${item.product_name}</p>
          <p>Qty: ${item.quantity} × ₹${item.price_at_time}</p>
        </div>
        <p class="order-card-item-price">₹${item.price_at_time * item.quantity}</p>
      </div>
    `).join("");

    return `
      <div class="order-card">
        <div class="order-card-header">
          <div class="order-card-id">
            <div class="order-card-icon">📦</div>
            <div>
              <p class="order-card-id-label">Order ID</p>
              <p class="order-card-id-value">#${order.id.slice(0, 8)}</p>
            </div>
          </div>
          <div class="order-card-meta">
            <div>
              <p>📅 Date</p>
              <p>${new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p>Total</p>
              <p>₹${order.total_price}</p>
            </div>
            <div class="order-status-badge">${order.status}</div>
          </div>
        </div>
        <div class="order-card-body">
          <div class="order-card-items">${itemsHTML}</div>
          <div class="order-card-footer">
            <p class="address">🛡 Delivering to: ${escapeHTML(order.address)}</p>
            <button class="back-btn" style="background:none; color:var(--emerald-700); font-weight:700; padding:0;">View Details →</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <div class="page page-wide">
      <div class="page-header">
        <a href="#home" class="back-btn">←</a>
        <h1 class="page-title">Order History</h1>
      </div>
      <div class="orders-list">${ordersHTML}</div>
      <div class="orders-quote">
        <div style="font-size:2.5rem;">🌿</div>
        <p>"Every leaf tells a story of health and tradition."</p>
      </div>
    </div>
  `;
}

/* ======================================================================
   HELPERS
   ====================================================================== */
function escapeHTML(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return escapeHTML(str).replace(/"/g, "&quot;");
}

/* ======================================================================
   NAVBAR / GLOBAL CLICK HANDLERS
   ====================================================================== */
function initNavbar() {
  // Hash-based links (data-page)
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("[data-page]");
    if (link) {
      e.preventDefault();
      navigate(link.dataset.page);
    }
  });

  // Mobile menu toggle
  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("mobileMenu").classList.toggle("hidden");
  });
}

/* ======================================================================
   INIT
   ====================================================================== */
window.addEventListener("hashchange", handleRouteChange);
window.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  updateCartBadge();
  handleRouteChange();
});
