document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginView = document.getElementById('login-view');
    const posView = document.getElementById('pos-view');
    const userDisplay = document.getElementById('user-display');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn'); 

    // Función auxiliar para extraer el token CSRF de las cookies de Django
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // LÓGICA DE INICIO DE SESIÓN
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value.trim();

            try {
                const response = await fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken') // Requerido por Django para peticiones POST
                    },
                    body: JSON.stringify({
                        username: usernameInput,
                        password: passwordInput
                    })
                });

                const data = await response.json();

                if (data.success) {
                    if (loginView) loginView.style.display = 'none';
                    if (posView) posView.style.display = 'flex';
                    
                    if (userDisplay) {
                        userDisplay.textContent = `Cajero: ${data.username || usernameInput}`;
                    }
                } else {
                    if (loginError) {
                        loginError.textContent = data.error || "Usuario o contraseña incorrectos";
                        loginError.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Error en la petición:', error);
                if (loginError) {
                    loginError.textContent = "Error de conexión con el servidor";
                    loginError.style.display = 'block';
                }
            }
        });
    }

    // LÓGICA DE CIERRE DE SESIÓN
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (posView) posView.style.display = 'none';
            if (loginView) loginView.style.display = 'block';
            if (loginForm) loginForm.reset();
        });
    }
});