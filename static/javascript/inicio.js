document.addEventListener('DOMContentLoaded', () => {
    let carrito = [];

    // 1. Lógica del Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            
            errorDiv.classList.add('hidden');

            try {
                const response = await fetch('/api/usuarios/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();

                if (data.success) {
                    document.getElementById('login-view').classList.add('hidden');
                    document.getElementById('pos-view').classList.remove('hidden');
                    document.getElementById('user-display').textContent = `Cajero: ${data.username}`;
                } else {
                    errorDiv.textContent = data.error || 'Credenciales incorrectas';
                    errorDiv.classList.remove('hidden');
                }
            } catch (err) {
                errorDiv.textContent = 'Error de conexión con el servidor';
                errorDiv.classList.remove('hidden');
            }
        });
    }

    // 2. Lógica de Búsqueda de Productos en el POS
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (searchInput) {
        searchInput.addEventListener('input', async function(e) {
            const query = e.target.value;
            if (query.length > 1) {
                try {
                    const res = await fetch(`/api/buscar-producto/?q=${query}`);
                    const data = await res.json();
                    
                    searchResults.innerHTML = '';
                    if (data.productos && data.productos.length > 0) {
                        data.productos.forEach(p => {
                            const div = document.createElement('div');
                            div.className = 'p-3 hover:bg-indigo-50 cursor-pointer flex justify-between border-b';
                            div.innerHTML = `<span>${p.nombre}</span> <span class="font-bold text-indigo-600">$${p.precio}</span>`;
                            div.onclick = () => agregarAlCarrito(p);
                            searchResults.appendChild(div);
                        });
                        searchResults.classList.remove('hidden');
                    } else {
                        searchResults.classList.add('hidden');
                    }
                } catch (err) {
                    console.error("Error al buscar", err);
                }
            } else {
                searchResults.classList.add('hidden');
            }
        });
    }

    // 3. Manejo del Carrito
    window.agregarAlCarrito = function(producto) {
        carrito.push({ ...producto, cantidad: 1 });
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.classList.add('hidden');
        actualizarCarritoUI();
    };

    function actualizarCarritoUI() {
        const cartContainer = document.getElementById('cart-items');
        if (!cartContainer) return;

        if (carrito.length === 0) {
            cartContainer.innerHTML = '<p class="text-slate-400 text-sm text-center mt-10">No hay productos en el carrito</p>';
            return;
        }

        cartContainer.innerHTML = '';
        carrito.forEach((item) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex justify-between items-center border-b pb-2';
            itemDiv.innerHTML = `
                <div>
                    <p class="font-medium text-slate-800">${item.nombre}</p>
                    <p class="text-xs text-slate-500">$${item.precio} x ${item.cantidad}</p>
                </div>
                <span class="font-bold text-slate-700">$${item.precio * item.cantidad}</span>
            `;
            cartContainer.appendChild(itemDiv);
        });
    }

    // 4. Procesar Venta
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async function() {
            if (carrito.length === 0) {
                alert('El carrito está vacío');
                return;
            }

            try {
                const res = await fetch('/api/procesar-venta/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: carrito })
                });
                const data = await res.json();

                if (data.success) {
                    alert('¡Venta procesada con éxito!');
                    carrito = [];
                    actualizarCarritoUI();
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (err) {
                alert('Error de red al procesar la venta');
            }
        });
    }
});