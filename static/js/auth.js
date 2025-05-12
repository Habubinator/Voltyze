class Auth {
    constructor() {
        this.API_URL = 'https://api.voltyze.com/v1';
        this.TOKEN_KEY = 'voltyze_token';
        this.USER_KEY = 'voltyze_user';
        this.isAuthenticated = false;
        this.currentUser = null;

        // Initialize auth state
        this.loadUserFromStorage();

        // Bind event listeners
        this.bindEvents();
    }

    /**
     * Initialize auth state from localStorage
     */
    loadUserFromStorage() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const user = localStorage.getItem(this.USER_KEY);

        if (token && user) {
            this.isAuthenticated = true;
            this.currentUser = JSON.parse(user);
            this.verifyToken();
        }
    }

    /**
     * Verify if the stored token is still valid
     */
    async verifyToken() {
        try {
            const response = await fetch(`${this.API_URL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(this.TOKEN_KEY)}`
                }
            });
            const data = await response.json();
            if (data.success) {
                this.isAuthenticated = true;
            } else {
                this.isAuthenticated = false;
            }
        } catch (error) {
            console.error('Error verifying token', error);
            this.isAuthenticated = false;
        }
    }

    /**
     * Register a new user
     * @param {Object} userData - User data including name, email, and password
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (data.success) {
                this.login(userData.email, userData.password);
            } else {
                console.error('Registration failed', data.message);
            }
        } catch (error) {
            console.error('Error registering user', error);
        }
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem(this.TOKEN_KEY, data.token);
                localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
                this.isAuthenticated = true;
                this.currentUser = data.user;
                this.loadUserFromStorage();
                this.updateUIForAuthenticatedUser();
            } else {
                console.error('Login failed', data.message);
            }
        } catch (error) {
            console.error('Error logging in', error);
        }
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.isAuthenticated = false;
        this.currentUser = null;
        this.updateUIForUnauthenticatedUser();
    }

    /**
     * Update UI when user is authenticated
     */
    updateUIForAuthenticatedUser() {
        // Show user info and logout button
        document.getElementById('auth-section').innerHTML = `
            <button id="logout-btn">Вийти</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    }

    /**
     * Update UI when user is not authenticated
     */
    updateUIForUnauthenticatedUser() {
        // Show login/register buttons
        document.getElementById('auth-section').innerHTML = `
            <button id="login-btn">Увійти</button>
            <button id="register-btn">Зареєструватися</button>
        `;
        document.getElementById('login-btn').addEventListener('click', () => this.showLoginModal());
        document.getElementById('register-btn').addEventListener('click', () => this.showRegisterModal());
    }

    /**
     * Show the login modal
     */
    showLoginModal() {
        document.getElementById('login-modal').style.display = 'block';
    }

    /**
     * Show the register modal
     */
    showRegisterModal() {
        document.getElementById('register-modal').style.display = 'block';
    }

    /**
     * Bind events for handling form submissions
     */
    bindEvents() {
        // Handle login form submit
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            this.login(email, password);
        });

        // Handle register form submit
        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm').value;

            if (password === passwordConfirm) {
                this.register({ name, email, password });
            } else {
                alert('Паролі не співпадають');
            }
        });
    }
}

const auth = new Auth();
