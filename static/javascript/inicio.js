document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const modal = document.getElementById('modal-cajero');
    const form = document.getElementById('form-cajero');
    const errorDiv = document.getElementById('mensaje-error');
    const tablaCajeros = document.getElementById('cajeros-tabla');
    
    const btnAbrirModal = document.getElementById('btn-abrir-modal');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');

    // Funciones del Modal
    function abrirModal() {
        modal.classList.remove('hidden');
    }

    function cerrarModal() {
        modal.classList.add('hidden');
        form.reset();
        errorDiv.classList.add('hidden');
    }

    if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirModal);
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);

    // 1. CARGAR CAJEROS AL INICIAR LA PÁGINA
    async function cargarCajeros() {
        try {
            const response = await fetch('/api/cajeros/');
            const data = await response.json();

            if (data.success) {
                tablaCajeros.innerHTML = ''; // Limpiar tabla
                
                if (data.cajeros.length === 0) {
                    tablaCajeros.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-gray-500">No hay cajeros registrados.</td></tr>`;
                    return;
                }

                data.cajeros.forEach(cajero => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td class="font-bold">${cajero.username}</td>
                        <td>${cajero.nombre || 'Sin nombre'}</td>
                        <td><span class="badge badge-success">Activo</span></td>
                        <td class="text-center">
                            <button class="btn-icon-danger" onclick="eliminarCajero(${cajero.id})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tablaCajeros.appendChild(fila);
                });
            }
        } catch (error) {
            console.error('Error al cargar cajeros:', error);
        }
    }

    // 2. CREAR NUEVO CAJERO
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombre').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/crear-cajero/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, username, password })
                });

                const data = await response.json();

                if (data.success) {
                    cerrarModal();
                    cargarCajeros(); // Recargar la tabla dinámicamente
                } else {
                    errorDiv.textContent = data.error;
                    errorDiv.classList.remove('hidden');
                }
            } catch (error) {
                errorDiv.textContent = 'Ocurrió un error en el servidor.';
                errorDiv.classList.remove('hidden');
            }
        });
    }

    // Ejecutar carga inicial
    cargarCajeros();
});

// 3. ELIMINAR CAJERO (Global para que funcione desde el botón inline)
async function eliminarCajero(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este cajero?')) return;

    try {
        const response = await fetch(`/api/eliminar-cajero/${id}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.success) {
            location.reload(); // Refresca para actualizar la lista
        } else {
            alert(data.error || 'No se pudo eliminar el cajero.');
        }
    } catch (error) {
        alert('Error de conexión con el servidor.');
    }
}
// Verificar la sesión con el servidor al volver a la pestaña o usar "Atrás"
window.addEventListener('pageshow', function(event) {
    chequearEstadoSesion();
});

window.addEventListener('focus', function(event) {
    chequearEstadoSesion();
});

function chequearEstadoSesion() {
    // Hacemos una petición silenciosa a la propia página actual
    fetch(window.location.href, { 
        method: 'GET', 
        cache: 'no-store',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => {
        // Si Django detecta que no hay sesión, normalmente redirige al login 
        // o la URL de respuesta cambia/contiene el login. 
        // También podemos validar si la respuesta dio un código de acceso denegado.
        if (response.redirected || response.url.includes('login') || response.status === 401 || response.status === 403) {
            window.location.href = '/'; // Redirige a la pantalla de login o raíz
        }
    })
    .catch(() => {
        // Si falla la red, por seguridad recargamos la página
        window.location.reload();
    });
}
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // Oculta la pantalla al instante para que no se vea el parpadeo
        document.body.style.display = 'none';
        // Fuerza la recarga inmediata para que el servidor actúe
        window.location.reload();
    }
});