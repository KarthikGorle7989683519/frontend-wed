// Render cart items
async function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    try {
        const response = await fetchWithAuth('http://localhost:3001/api/cart');
        if (!response.ok) throw new Error('Failed to fetch cart');
        const cart = await response.json();
        
        if (!cart || cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-5">
                    <h5>Your cart is empty</h5>
                    <a href="index.html" class="btn btn-primary mt-3">Continue Shopping</a>
                </div>
            `;
            updateCartTotals();
            return;
        }
        
        cartItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item d-flex justify-content-between align-items-center mb-3 p-3 border-bottom';
            cartItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.image}" class="cart-item-img me-3" alt="${item.title}" style="width: 80px; height: 80px; object-fit: contain;">
                    <div>
                        <h6 class="mb-1">${item.title}</h6>
                        <p class="mb-0">$${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <div class="quantity-control me-3">
                        <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${item.id}">-</button>
                        <input type="number" class="form-control form-control-sm quantity-input mx-1" 
                               value="${item.quantity}" min="1" data-id="${item.id}" style="width: 50px;">
                        <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${item.id}">+</button>
                    </div>
                    <p class="mb-0 me-3">$${(item.price * item.quantity).toFixed(2)}</p>
                    <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        
        setupCartEventListeners();
        updateCartTotals();
    } catch (error) {
        console.error('Error loading cart:', error);
        cartItemsContainer.innerHTML = `
            <div class="alert alert-danger">
                Failed to load cart. Please try again.
            </div>
        `;
    }
}

function setupCartEventListeners() {
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
    
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const input = this.nextElementSibling;
            const newQuantity = parseInt(input.value) - 1;
            if (newQuantity >= 1) {
                input.value = newQuantity;
                updateCartItemQuantity(productId, newQuantity);
            }
        });
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const input = this.previousElementSibling;
            const newQuantity = parseInt(input.value) + 1;
            input.value = newQuantity;
            updateCartItemQuantity(productId, newQuantity);
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.getAttribute('data-id');
            const newQuantity = parseInt(this.value);
            if (newQuantity >= 1) {
                updateCartItemQuantity(productId, newQuantity);
            } else {
                this.value = 1;
            }
        });
    });
}

// Update cart totals
function updateCartTotals() {
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    const cartItems = document.querySelectorAll('.cart-item');
    if (cartItems.length === 0) {
        subtotalElement.textContent = '$0.00';
        totalElement.textContent = '$0.00';
        return;
    }
    
    let subtotal = 0;
    cartItems.forEach(item => {
        const priceText = item.querySelector('p.mb-0:nth-child(2)').textContent;
        const price = parseFloat(priceText.replace('$', ''));
        subtotal += price;
    });
    
    const shipping = 5.00;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Setup checkout button
function setupCheckout() {
    const checkoutButton = document.getElementById('checkout-btn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', async function() {
            const user = localStorage.getItem('user');
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            
            try {
                const response = await fetchWithAuth('http://localhost:3001/api/orders/checkout', {
                    method: 'POST'
                });
                
                if (response.ok) {
                    showAlert('Order placed successfully!', 'success');
                    localStorage.setItem('cart', JSON.stringify([]));
                    updateCartCount();
                    setTimeout(() => window.location.href = 'user.html', 2000);
                } else {
                    throw new Error('Checkout failed');
                }
            } catch (error) {
                showAlert('Checkout failed. Please try again.', 'danger');
            }
        });
    }
}

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    renderCartItems();
    setupCheckout();
});