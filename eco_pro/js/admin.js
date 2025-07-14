// Fetch products for admin dashboard
function fetchAdminProducts() {
    return $.ajax({
        url: 'http://localhost:3001/api/products',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).fail(function () {
        console.error('Error fetching products');
        showAlert('Failed to load products', 'danger');
    });
}

// Render products table
function renderProductsTable(products) {
    const productsTable = $('#products-table');
    productsTable.empty();

    products.forEach(product => {
        const row = $(`
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: contain;"></td>
                <td>${product.title}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.category}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
        productsTable.append(row);
    });

    $('.delete-product').on('click', function () {
        const productId = $(this).data('id');

        $.ajax({
            url: `http://localhost:3001/api/products/${productId}`,
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: async function () {
                showAlert('Product deleted successfully', 'success');
                const products = await fetchAdminProducts();
                renderProductsTable(products);
                updateAdminStats(products);
            },
            error: function () {
                showAlert('Failed to delete product', 'danger');
            }
        });
    });
}

// Update admin stats
function updateAdminStats(products) {
    $('#total-products').text(products.length);
    $('#total-users').text('Loading...');
    $('#total-orders').text('Loading...');

    $.ajax({
        url: 'http://localhost:3001/api/stats',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (stats) {
            $('#total-users').text(stats.users || 0);
            $('#total-orders').text(stats.orders || 0);
        },
        error: function () {
            console.error('Error fetching stats');
            $('#total-users').text('N/A');
            $('#total-orders').text('N/A');
        }
    });
}

// Setup add product form
function setupAddProductForm() {
    $('#add-product-form').on('submit', function (e) {
        e.preventDefault();

        const title = $('#product-title').val();
        const price = parseFloat($('#product-price').val());
        const category = $('#product-category').val();
        const image = $('#product-image').val();
        const description = $('#product-description').val();

        $.ajax({
            url: 'http://localhost:3001/api/products',
            method: 'POST',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            data: JSON.stringify({ title, price, category, image, description }),
            success: async function () {
                showAlert('Product added successfully', 'success');
                $('#add-product-form')[0].reset();
                const products = await fetchAdminProducts();
                renderProductsTable(products);
                updateAdminStats(products);
            },
            error: function () {
                showAlert('Failed to add product', 'danger');
            }
        });
    });
}

// Initialize admin dashboard
$(document).ready(async function () {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    try {
        const products = await fetchAdminProducts();
        renderProductsTable(products);
        updateAdminStats(products);
        setupAddProductForm();
    } catch (error) {
        console.error('Admin dashboard initialization error:', error);
    }
});