// Handle login form submission
async function handleLogin(username, password) {
    try {
        const loginBtn = document.querySelector('#login-form button[type="submit"]');
        const originalBtnText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
        loginBtn.disabled = true;

        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'user.html';
        }
        
    } catch (error) {
        console.error('Login error:', error);
        const loginError = document.getElementById('login-error');
        loginError.textContent = 'Invalid username or password';
        
        const loginBtn = document.querySelector('#login-form button[type="submit"]');
        loginBtn.innerHTML = 'Login';
        loginBtn.disabled = false;
    }
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                document.getElementById('login-error').textContent = 'Please enter both username and password';
                return;
            }
            
            handleLogin(username, password);
        });
    }
}

// Check if user is already logged in
function checkExistingLogin() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'user.html';
        }
    }
}

// Initialize login page
document.addEventListener('DOMContentLoaded', function() {
    checkExistingLogin();
    setupLoginForm();
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('reg-username').value;
            const password = document.getElementById('reg-password').value;
            const email = document.getElementById('reg-email').value;
            
            if (!username || !password || !email) {
                showAlert('Please fill all fields', 'danger');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3001/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, email })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Registration failed');
                }
                
                showAlert('Registration successful! Please login.', 'success');
                registerForm.reset();
            } catch (error) {
                showAlert(error.message || 'Registration failed', 'danger');
            }
        });
    }
});