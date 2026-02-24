/* =============================================
   AVVA'S HOME FOODS — Application JavaScript
   Cart, Products, Orders, and Interactivity
   ============================================= */

const API_BASE = 'http://localhost:8080/api';

// Prevent browser from restoring scroll position on refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    if (!window.location.hash) {
        window.scrollTo(0, 0);
    }
});

// ==================== GLOBAL STATE ====================
const productCache = {};

// ==================== FALLBACK DATA ====================
// Used when backend is not running
const FALLBACK_PRODUCTS = [];

// ==================== CART MANAGEMENT ====================
function getCart() {
    const cartJson = localStorage.getItem('avvaCart');
    if (!cartJson) return [];
    try {
        let cart = JSON.parse(cartJson);
        // Filter out invalid items (fixes undefined/NaN issues)
        const validCart = cart.filter(item => item.productId && item.productName && item.productName !== 'undefined' && !isNaN(item.price));
        if (validCart.length !== cart.length) {
            console.log('Cleaned up invalid cart items');
            saveCart(validCart);
            return validCart;
        }
        return cart;
    } catch (e) {
        console.error('Error parsing cart:', e);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('avvaCart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(id, name, price, weight, imageUrl, quantity = 1) {
    // Handle object passed (legacy support)
    if (typeof id === 'object') {
        const product = id;
        id = product.id;
        name = product.name;
        price = product.price;
        weight = product.weight;
        imageUrl = product.imageUrl;
        quantity = product.quantity || 1;
    }

    const cart = getCart();
    // Unique ID for variant: productId + weight
    // If weight is missing/null, use productId as variantId (or default weight)
    const variantId = weight ? `${id}-${weight}` : id;

    const existing = cart.find(item => item.variantId === variantId || (item.productId === id && item.weight === weight));

    if (existing) {
        existing.quantity += quantity;
        showToast(`Quantity updated in cart!`);
    } else {
        cart.push({
            variantId: variantId,
            productId: id,
            productName: name,
            price: price,
            weight: weight,
            imageUrl: imageUrl,
            quantity: quantity
        });
        showToast(`${name} ${weight ? '(' + weight + ')' : ''} added to cart!`);
    }

    saveCart(cart);
    updateProductCardUI(id);
}

function addToCartVariant(productId) {
    const product = productCache[productId];
    if (!product) return;

    // Get selected weight
    const select = document.getElementById(`weight-${productId}`);
    let selectedWeight = product.weight;
    let selectedPrice = product.price;

    if (select) {
        selectedWeight = select.value;
        if (product.weightPrices && product.weightPrices[selectedWeight]) {
            selectedPrice = product.weightPrices[selectedWeight];
        } else {
            // Fallback logic if needed, or keeping base price
        }
    }

    const cart = getCart();
    // Unique ID for variant: productId + weight
    const variantId = `${productId}-${selectedWeight}`;

    const existing = cart.find(item => item.variantId === variantId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            variantId: variantId, // New unique key
            productId: product.id,
            productName: product.name,
            price: selectedPrice,
            weight: selectedWeight,
            imageUrl: product.imageUrl,
            quantity: 1
        });
    }
    saveCart(cart);
    updateProductCardUI(productId);
    showToast(`${product.name} (${selectedWeight}) added to cart!`);
}

function removeFromCart(variantId) {
    let cart = getCart();
    cart = cart.filter(item => item.variantId !== variantId);
    saveCart(cart);
    loadCartPage();
    // We need to find the productId from variantId to update the card UI
    const productId = variantId.split('-')[0];
    if (productId) updateProductCardUI(productId);
}

function updateQuantity(variantId, delta) {
    let cart = getCart();
    const item = cart.find(item => item.variantId === variantId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(variantId);
            return;
        }
    }
    saveCart(cart);
    loadCartPage();
    // Update card UI if visible
    const productId = variantId ? variantId.split('-')[0] : null;
    if (productId) updateProductCardUI(productId);
}

// ==================== CARD QUANTITY CONTROLS ====================
// ==================== CARD QUANTITY CONTROLS ====================
// This needs to know WHICH variant is selected in the dropdown
function updateCardQuantity(productId, delta) {
    const product = productCache[productId];
    // Get currently selected weight from DOM
    const select = document.getElementById(`weight-${productId}`);
    let selectedWeight = product.weight;
    if (select) selectedWeight = select.value;

    const variantId = `${productId}-${selectedWeight}`;
    updateQuantity(variantId, delta);
}

function getCartItemQuantity(productId, weight) {
    const cart = getCart();
    // If weight is provided, check for specific variant
    if (weight) {
        const variantId = `${productId}-${weight}`;
        const item = cart.find(i => i.variantId === variantId);
        return item ? item.quantity : 0;
    }

    // Fallback or aggregate? For card UI we need specific variant quantity
    return 0;
}

function onWeightChange(productId) {
    const product = productCache[productId];
    const select = document.getElementById(`weight-${productId}`);
    const priceEl = document.getElementById(`price-${productId}`);

    if (product && select && priceEl) {
        const weight = select.value;
        const newPrice = product.weightPrices[weight];
        priceEl.textContent = `₹${newPrice}`;

        // Update button state (Add to Cart vs Qty)
        updateProductCardUI(productId);
    }
}

function getCartItemQuantity(productId) {
    const cart = getCart();
    const item = cart.find(i => i.productId === productId);
    return item ? item.quantity : 0;
}

function renderProductActions(productId) {
    const product = productCache[productId];

    // Determine selected weight
    let selectedWeight = product.weight;
    // Check if DOM element exists to get current selection (during re-render/update)
    const select = document.getElementById(`weight-${productId}`);
    if (select) {
        selectedWeight = select.value;
    } else if (product.weightPrices) {
        // Default to first key if available and no DOM yet
        const keys = Object.keys(product.weightPrices);
        if (keys.length > 0) selectedWeight = keys[0];
    }

    const qty = getCartItemQuantity(productId, selectedWeight);

    if (!product.inStock) {
        return `
            <button class="btn btn-primary btn-sm btn-disabled">
                Out of Stock
            </button>
        `;
    }

    if (qty > 0) {
        return `
            <div class="qty-control">
                <button class="qty-btn-card" onclick="updateCardQuantity('${productId}', -1)">−</button>
                <span class="qty-val-card">${qty}</span>
                <button class="qty-btn-card" onclick="updateCardQuantity('${productId}', 1)">+</button>
            </div>
        `;
    } else {
        if (!product) return ''; // Should not happen
        return `
            <button class="btn btn-primary btn-sm" onclick="addToCartVariant('${productId}')">
                🛒 Add to Cart
            </button>
        `;
    }
}

function updateProductCardUI(productId) {
    const container = document.getElementById(`btn-container-${productId}`);
    if (container) {
        container.innerHTML = renderProductActions(productId);
    }
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElements = document.querySelectorAll('#cartCount');
    countElements.forEach(el => el.textContent = count);
}

function getCartSubtotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ==================== PRODUCT FETCHING ====================
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error('API error');
        return await response.json();
    } catch (error) {
        console.log('Backend not available. Please start the server to view products.');
        return [];
    }
}

// ==================== RENDER PRODUCT CARD ====================
function renderProductCard(product) {
    // Cache product for later access
    productCache[product.id] = product;

    const starsHtml = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '½' : '');
    return `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image-wrapper">
                <a href="product-details.html?id=${product.id}">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-image"
                         onerror="this.src='https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'">
                </a>
                ${product.inStock
            ? '<span class="product-badge">In Stock</span>'
            : '<span class="product-badge out-of-stock">Out of Stock</span>'}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <a href="product-details.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                    <h3 class="product-name">${product.name}</h3>
                </a>
                <p class="product-desc">${product.description}</p>
                <div class="product-rating">
                    <span class="rating-stars">${starsHtml}</span>
                    <span>${product.rating} (${product.reviewCount} reviews)</span>
                </div>
                <div class="product-meta">
                    <span class="product-price" id="price-${product.id}">₹${product.price}</span>
                    ${renderWeightSelector(product)}
                </div>
                <div class="product-actions">
                    <div id="btn-container-${product.id}" style="flex: 1;">
                        ${renderProductActions(product.id)}
                    </div>

                </div>
            </div>
        </div>
    `;
}

function renderWeightSelector(product) {
    if (product.weightPrices && Object.keys(product.weightPrices).length > 0) {
        const available = Object.keys(product.weightPrices);

        const options = available.map(w => `<option value="${w}">${w}</option>`).join('');

        return `
            <select id="weight-${product.id}" class="weight-select" onchange="onWeightChange('${product.id}')">
            ${options}
            </select>
        `;
    }
    return `<span class="product-weight">${product.weight}</span>`;
}

// ==================== LOAD FEATURED PRODUCTS (Home page) ====================
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    const products = await fetchProducts();
    const featured = products.slice(0, 4); // Show first 4 as featured
    container.innerHTML = featured.map(renderProductCard).join('');
}

// ==================== LOAD CATEGORIES FOR FILTERS ====================
async function loadCategoriesForFilters() {
    const tabsContainer = document.getElementById('filterTabs');
    if (!tabsContainer) return;

    try {
        // Use API_BASE which is defined at the top
        const res = await fetch(`${API_BASE}/categories`);
        if (!res.ok) return;

        const cats = await res.json();
        if (!cats || cats.length === 0) return;

        // Rebuild tabs
        tabsContainer.innerHTML = '<button class="filter-tab active" data-category="all">All Products</button>';

        cats.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'filter-tab';
            btn.dataset.category = c.name;
            btn.textContent = c.name;
            tabsContainer.appendChild(btn);
        });
    } catch (e) {
        console.warn("Could not load categories for filters, using defaults.");
    }
}

// ==================== LOAD ALL PRODUCTS (Products page) ====================
let allProducts = [];

async function loadAllProducts() {
    const container = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    if (!container) return;

    // Load dynamic categories for filters
    await loadCategoriesForFilters();

    allProducts = await fetchProducts();
    renderFilteredProducts(allProducts);

    // Setup filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.dataset.category;
            const filtered = category === 'all'
                ? allProducts
                : allProducts.filter(p => p.category === category);
            renderFilteredProducts(filtered);
        });
    });

    // Setup search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allProducts.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
            renderFilteredProducts(filtered);
        });
    }
}

function renderFilteredProducts(products) {
    const container = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    if (!container) return;

    if (products.length === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    } else {
        container.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        container.innerHTML = products.map(renderProductCard).join('');
    }
}

// ==================== LOAD CART PAGE ====================
function loadCartPage() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartSummary = document.getElementById('cartSummary');
    const orderFormWrapper = document.getElementById('orderFormWrapper');

    if (!cartItemsContainer) return;

    // Pre-fill email from logged-in user
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const emailField = document.getElementById('email');
        if (emailField && !emailField.value) {
            emailField.value = user.email || user.username || '';
        }
    }

    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        if (orderFormWrapper) orderFormWrapper.style.display = 'none';
    } else {
        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';
        if (orderFormWrapper) orderFormWrapper.style.display = 'block';

        cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.imageUrl}" alt="${item.productName}" class="cart-item-image"
                onerror="this.src='https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.productName}</div>
                    <div class="cart-item-price">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity('${item.variantId || item.productId}', -1)">−</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.variantId || item.productId}', 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.variantId || item.productId}')" title="Remove">✕</button>
            </div>
    `).join('');

        // Update summary
        const subtotal = getCartSubtotal();
        const deliveryFee = parseInt(localStorage.getItem('avvaDeliveryCharge') || '50');
        const freeThreshold = parseInt(localStorage.getItem('avvaFreeDeliveryThreshold') || '500');
        const delivery = subtotal >= freeThreshold ? 0 : deliveryFee;
        const total = subtotal + delivery;

        document.getElementById('subtotal').textContent = `₹${subtotal} `;
        document.getElementById('deliveryCharge').textContent = delivery === 0 ? `FREE (orders above ₹${freeThreshold})` : `₹${delivery} `;
        document.getElementById('totalAmount').textContent = `₹${total} `;
    }
}

// ==================== ORDER SUBMISSION ====================
function setupOrderForm() {
    const form = document.getElementById('orderForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cart = getCart();
        if (cart.length === 0) {
            showToast('Your cart is empty!');
            return;
        }

        const subtotal = getCartSubtotal();
        const deliveryFee = parseInt(localStorage.getItem('avvaDeliveryCharge') || '50');
        const freeThreshold = parseInt(localStorage.getItem('avvaFreeDeliveryThreshold') || '500');
        const delivery = subtotal >= freeThreshold ? 0 : deliveryFee;
        const totalAmount = subtotal + delivery;

        const orderData = {
            customerName: document.getElementById('customerName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            pincode: document.getElementById('pincode').value,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
            items: cart.map(item => ({
                productId: item.productId,
                productName: item.productName + (item.weight ? ` (${item.weight})` : ''),
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: totalAmount
        };

        // Try to submit via API
        try {
            const response = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const order = await response.json();
                // Clear cart only on success
                localStorage.removeItem('avvaCart');
                updateCartCount();
                showOrderSuccess(order.id);
            } else {
                throw new Error('API error');
            }
        } catch (error) {
            // Fallback: save order to localStorage so it appears in My Orders
            const mockId = 'AVH-' + Date.now().toString().slice(-6);
            const fallbackOrders = JSON.parse(localStorage.getItem('avvaLocalOrders') || '[]');
            fallbackOrders.unshift({
                ...orderData,
                id: mockId,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('avvaLocalOrders', JSON.stringify(fallbackOrders));
            // Clear cart
            localStorage.removeItem('avvaCart');
            updateCartCount();
            showOrderSuccess(mockId);
        }
    });
}

function showOrderSuccess(orderId) {
    const modal = document.getElementById('orderSuccessModal');
    const orderIdEl = document.getElementById('modalOrderId');
    if (modal) {
        orderIdEl.textContent = `#${orderId}`;
        modal.classList.add('active');
    }
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message) {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">✅</span> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// ==================== NAVBAR SCROLL EFFECT ====================
function setupNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Theme Handling removed - Enforcing Dark Mode
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.style.display = 'none';

    // Ensure dark theme is set
    document.body.classList.remove('light-theme');
    localStorage.removeItem('theme');

    // Auth State Management
    const user = JSON.parse(localStorage.getItem('user'));
    const authActions = document.getElementById('authActions');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user && userProfile && authActions) {
        authActions.style.display = 'none';
        userProfile.style.display = 'flex';
        userProfile.style.alignItems = 'center';
        userName.textContent = user.name || user.username;

        // If Admin, show dashboard link
        if (user.role === 'ADMIN') {
            const adminLink = document.getElementById('adminLink');
            if (adminLink) adminLink.style.display = 'inline-block';
            userName.textContent += ' (Admin)';
        } else {
            // For regular users, add My Orders link to Nav
            const navLinks = document.getElementById('navLinks');
            const myOrdersLi = document.createElement('li');
            myOrdersLi.innerHTML = '<a href="my-orders.html">My Orders</a>';
            // Insert before the last item (assuming "Contact" or "Admin Login" is last)
            // Actually, simply appending is fine or insert before the last item
            navLinks.insertBefore(myOrdersLi, navLinks.lastElementChild);
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.reload();
        });
    }

    // Mobile menu toggle
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

// ==================== COUNTER ANIMATION ====================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// ==================== SCROLL REVEAL ====================
function setupScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.feature-card, .product-card, .step-card, .testimonial-card, .about-grid, .reveal, .reveal-left, .reveal-right, .section-title, .section-subtitle, .product-desc, .hero-title, .hero-subtitle'
    );

    revealElements.forEach(el => {
        // Default to reveal-up if no specific class
        if (!el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
            el.classList.add('reveal');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before element is fully in view
    });

    revealElements.forEach(el => observer.observe(el));
}

// ==================== HERO PARTICLES ====================
function createParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(200, 150, 46, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 4 + 3}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        container.appendChild(particle);
    }
}

// ==================== REVIEWS MANAGEMENT ====================
async function fetchReviews() {
    try {
        const response = await fetch(`${API_BASE}/reviews/top`);
        if (!response.ok) throw new Error('API error');
        return await response.json();
    } catch (error) {
        console.log('Backend not available for reviews');
        return [];
    }
}

function renderReviewCard(review) {
    const starsHtml = '★'.repeat(review.rating);
    // Get first letter of name for avatar
    const initial = review.customerName ? review.customerName.charAt(0).toUpperCase() : 'A';

    return `
        <div class="testimonial-card reveal visible">
            <div class="testimonial-stars">${starsHtml}</div>
            <p class="testimonial-text">"${review.comment}"</p>
            <div class="testimonial-author">
                <div class="author-avatar">${initial}</div>
                <div>
                    <strong>${review.customerName}</strong>
                    <span>Verified Customer</span>
                </div>
            </div>
        </div>
    `;
}

async function loadReviews() {
    const container = document.getElementById('testimonialsGrid');
    if (!container) return;

    const reviews = await fetchReviews();

    if (reviews.length === 0) {
        container.innerHTML = '<div class="loading-reviews">No reviews yet. Be the first to share your experience!</div>';
    } else {
        container.innerHTML = reviews.map(renderReviewCard).join('');
    }
}

function setupReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const reviewData = {
            customerName: document.getElementById('reviewName').value,
            rating: parseInt(document.querySelector('input[name="rating"]:checked').value),
            comment: document.getElementById('reviewComment').value
        };

        try {
            const response = await fetch(`${API_BASE}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                showToast('Review submitted successfully!');
                form.reset();
                loadReviews();
            } else {
                throw new Error('Failed to submit');
            }
        } catch (error) {
            showToast('Error submitting review. Please try again.');
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    setupNavbar();
    setupOrderForm();
    setupReviewForm();
    animateCounters();
    setupScrollReveal();
    createParticles();

    // Load featured products on home page
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }

    // Load reviews on home page - DISABLED per request
    if (document.getElementById('testimonialsGrid')) {
        // loadReviews(); 
    }
});
