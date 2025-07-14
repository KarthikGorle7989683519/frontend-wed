// DOM Elements
const cartCountElement = document.getElementById('cart-count');



// Initialize cart if not exists
function initializeCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}

// Update cart count in navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const count = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// Add to cart function
function addToCart(productId, productTitle, productPrice, productImage, quantity = 1) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            title: productTitle,
            price: productPrice,
            image: productImage,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    if (typeof showAlert === 'function') {
        showAlert('Product added to cart!', 'success');
    }
}

// Remove from cart function
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
    }
}

// Update quantity in cart
function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = parseInt(newQuantity);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        if (window.location.pathname.includes('cart.html')) {
            updateCartTotals();
        }
    }
}

// Check if user is logged in
function checkLogin() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const currentPage = window.location.pathname.split('/').pop();
    
    if ((currentPage === 'admin.html' || currentPage === 'user.html') && !token) {
        window.location.href = 'login.html';
    }
    
    if (currentPage === 'login.html' && token) {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'user.html';
        }
    }
    
    if (currentPage === 'user.html' && user) {
        const userData = JSON.parse(user);
        document.getElementById('username-display').textContent = userData.username;
        document.getElementById('user-username').textContent = userData.username;
    }
}

// Logout function
function setupLogout() {
    const logoutButtons = document.querySelectorAll('#logout-btn');
    if (logoutButtons) {
        logoutButtons.forEach(button => {
            button.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            });
        });
    }
}

// Show alert message
function showAlert(message, type = 'danger') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.prepend(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 3000);
}

// Handle authenticated requests
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!options.headers) {
        options.headers = {};
    }
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, options);
    
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
    }
    
    return response;
}

// Initialize functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    updateCartCount();
    checkLogin();
    setupLogout();
    
    // Check token expiration
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
            }
        } catch (e) {
            console.error('Token parsing error:', e);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
});