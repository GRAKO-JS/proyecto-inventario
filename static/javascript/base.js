document.addEventListener('DOMContentLoaded', () => {
    // Referencias del DOM - Login y elementos generales
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn'); 

    // Referencias del DOM - Mostrar/Ocultar contraseña
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');

    // Función auxiliar para extraer el token CSRF de las cookies de Django (Vital para las peticiones POST)
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

    // 1. LÓGICA PARA MOSTRAR / OCULTAR CONTRASEÑA
    // Cambia el tipo del input entre 'password' y 'text' al hacer clic en el botón de ver
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Actualiza el ícono visual y el texto de ayuda (title) del botón
            togglePasswordBtn.textContent = type === 'password' ? '🕶️' : '👀';
            togglePasswordBtn.setAttribute('title', type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
        });
    }

    // 2. LÓGICA DE INICIO DE SESIÓN (PETICIÓN ASÍNCRONA AL BACKEND)
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            // Previene el comportamiento por defecto del formulario para controlarlo por JavaScript
            e.preventDefault();
            
            const usernameInput = document.getElementById('username').value.trim();
            const passwordInputVal = passwordInput.value.trim();

            // Limpia y oculta cualquier mensaje de error anterior antes de reintentar
            if (loginError) {
                loginError.style.display = 'none';
                loginError.classList.add('hidden');
                loginError.textContent = '';
            }

            try {
                // Envía las credenciales mediante Fetch a la API de inicio de sesión de Django
                const response = await fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken') // Token de seguridad requerido por Django
                    },
                    body: JSON.stringify({
                        username: usernameInput,
                        password: passwordInputVal
                    })
                });

                const data = await response.json();

                // Si la autenticación en la base de datos es exitosa (200 OK y success: true)
                // Si la autenticación en la base de datos es exitosa (200 OK y success: true)
if (response.ok && data.success) {
    // Redirige dinámicamente a la URL que decidió el backend según el rol
    window.location.href = data.redirect_url; 
} else {
                    // Si las credenciales fallan, muestra el mensaje de error correspondiente
                    if (loginError) {
                        loginError.textContent = data.error || "Usuario o contraseña incorrectos";
                        loginError.style.display = 'block';
                        loginError.classList.remove('hidden');
                    }
                    
                    // Aplica una animación visual de sacudida al formulario para denotar error
                    loginForm.classList.add('animate-shake');
                    setTimeout(() => {
                        loginForm.classList.remove('animate-shake');
                    }, 400);
                }
            } catch (error) {
                // Captura errores de red o caídas del servidor
                console.error('Error en la petición de login:', error);
                if (loginError) {
                    loginError.textContent = "Error de conexión con el servidor";
                    loginError.style.display = 'block';
                    loginError.classList.remove('hidden');
                }

                // Aplica la animación de sacudida también en caso de fallo de red
                loginForm.classList.add('animate-shake');
                setTimeout(() => {
                    loginForm.classList.remove('animate-shake');
                }, 400);
            }
        });
    }

    // 3. LÓGICA DE CIERRE DE SESIÓN (Por si se requiere limpiar datos locales en esta vista)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (loginForm) loginForm.reset();
        });
    }
});
// Prevenir la memoria caché del navegador (BFCache) al cerrar sesión
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        window.location.reload();
    }
});