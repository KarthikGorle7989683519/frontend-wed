// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:8081/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        showAlert('Failed to load products. Please try again later.', 'danger');
        return [];
    }
}

// Render products to the page
function renderProducts(products) {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<div class="col-12 text-center py-5"><h5>No products found</h5></div>';
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col-md-4 col-lg-3 mb-4';
        productCard.innerHTML = `
            <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: contain;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text">$${product.price.toFixed(2)}</p>
                    <button class="btn btn-primary mt-auto add-to-cart" 
                            data-id="${product.id}" 
                            data-title="${product.title}" 
                            data-price="${product.price}" 
                            data-image="${product.image}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productTitle = this.getAttribute('data-title');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');
            
            addToCart(productId, productTitle, productPrice, productImage);
        });
    });
}

// Search products
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');
    
    let allProducts = [];
    
    fetchProducts().then(products => {
        allProducts = products;
        renderProducts(products);
    });
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm.trim()) {
            renderProducts(allProducts);
            return;
        }
        
        const filteredProducts = allProducts.filter(product => 
            product.title.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    }
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Initialize home page
document.addEventListener('DOMContentLoaded', function() {
    setupSearch();
});