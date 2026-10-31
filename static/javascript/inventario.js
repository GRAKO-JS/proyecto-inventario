// 2. Botón de eliminar conectado a Django mediante fetch
if (tableBody) {
    tableBody.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete-action');
        
        if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            if (row) {
                const productName = row.querySelector('td:nth-child(2)').textContent.trim();
                // Asegúrate de guardar el ID o el código del producto en un atributo data-id de la fila o del botón
                const productoId = deleteBtn.dataset.id; 

                if (confirm(`¿Estás seguro de eliminar el producto "${productName}" de la base de datos?`)) {
                    
                    // Petición AJAX a Django
                    fetch(`/inventario/eliminar/${productoId}/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'), // Necesario para seguridad en Django
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            row.remove(); // Borra la fila visualmente solo si el servidor respondió bien
                        } else {
                            alert('Hubo un error al eliminar el producto.');
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            }
        }
    });
}

// Función auxiliar requerida por Django para obtener el token CSRF en peticiones POST
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