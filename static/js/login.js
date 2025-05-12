
// Handle switching between login and registration forms
const loginBox = document.getElementById('login-box');
const registerBox = document.getElementById('register-box');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

showRegisterLink.addEventListener('click', () => {
    loginBox.style.display = 'none';
    registerBox.style.display = 'block';
});

showLoginLink.addEventListener('click', () => {
    registerBox.style.display = 'none';
    loginBox.style.display = 'block';
});

// Mockup login and register form submission
document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    alert(`Увійшли з email: ${email}, пароль: ${password}`);
});

document.getElementById('register-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;

    if (password === confirmPassword) {
        alert(`Зареєстровано з ім'ям: ${name}, email: ${email}`);
    } else {
        alert('Паролі не співпадають!');
    }
});