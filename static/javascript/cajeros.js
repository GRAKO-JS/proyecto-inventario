document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. ESTADO GLOBAL DEL TICKET (CARRITO)
    // ==========================================
    let cart = [];
    let currentTicketId = 1024;

    // Referencias a elementos del DOM
    const productGrid = document.getElementById('product-grid');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');
    const searchInput = document.getElementById('product-search');

    // ==========================================
    // 2. AGREGAR PRODUCTOS AL CLIC O BÚSQUEDA
    // ==========================================
    productGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;

        const productId = card.getAttribute('data-id');
        const productName = card.querySelector('.p-name').textContent;
        // Limpiamos el signo de moneda para convertirlo a número
        const productPrice = parseFloat(card.querySelector('.p-price').textContent.replace('$', ''));

        addToCart(productId, productName, productPrice);
    });

    function addToKey(id, name, price) {
        // Lógica interna para manejar si el producto ya está en el ticket
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: price,
                quantity: 1
            });
        }
        renderCart();
    }

    // Exportamos o unificamos la función para usarla también en el evento de clic
    function addToCart(id, name, price) {
        addToKey(id, name, price);
    }

    // ==========================================
    // 3. RENDERIZAR EL TICKET Y CALCULOS
    // ==========================================
    function renderCart() {
        cartItemsList.innerHTML = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>
                    <button class="btn-qty-minus" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-qty-plus" data-index="${index}">+</button>
                </td>
                <td>$${itemSubtotal.toFixed(2)}</td>
                <td>
                    <button class="btn-delete-item" data-index="${index}" title="Eliminar">❌</button>
                </td>
            `;
            cartItemsList.appendChild(row);
        });

        // Cálculos de impuestos (ejemplo: 19% de IVA o ajustable)
        const tax = subtotal * 0.19;
        const total = subtotal + tax;

        // Actualizar textos en pantalla
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTax.textContent = `$${tax.toFixed(2)}`;
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    // ==========================================
    // 4. MANEJO DE CANTIDADES Y ELIMINACIÓN
    // ==========================================
    cartItemsList.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (index === null) return;

        if (e.target.classList.contains('btn-qty-plus')) {
            cart[index].quantity += 1;
        } else if (e.target.classList.contains('btn-qty-minus')) {
            cart[index].quantity -= 1;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
        } else if (e.target.classList.contains('btn-delete-item')) {
            cart.splice(index, 1);
        }
        renderCart();
    });

    // ==========================================
    // 5. ACCIONES DE LOS BOTONES DE CAJA
    // ==========================================
    
    // Botón Cancelar Venta (Esc)
    document.getElementById('btn-cancel-sale').addEventListener('click', () => {
        if (cart.length === 0) return;
        if (confirm('¿Estás seguro de cancelar el ticket actual?')) {
            cart = [];
            renderCart();
        }
    });

    // Botón Cobrar (F12 o Clic)
    document.getElementById('btn-charge').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('El ticket está vacío. Agrega productos antes de cobrar.');
            return;
        }
        const totalPagar = cartTotal.textContent;
        alert(`¡Venta cobrada con éxito! Total procesado: ${totalPagar}`);
        
        // Limpiar ticket y avanzar de número de ticket
        cart = [];
        currentTicketId += 1;
        document.getElementById('ticket-id').textContent = currentTicketId;
        renderCart();
        searchInput.focus();
    });

    // Botón Abrir Caja Registradora física (Simulado)
    document.getElementById('btn-cash-drawer').addEventListener('click', () => {
        alert('💵 [Pulso enviado]: La gaveta de dinero se ha abierto.');
    });

    // ==========================================
    // 6. ATAJOS DE TECLADO RÁPIDOS (PRO)
    // ==========================================
    window.addEventListener('keydown', (e) => {
        // F12 para cobrar rápido
        if (e.key === 'F12') {
            e.preventDefault();
            document.getElementById('btn-charge').click();
        }
        // Escape para cancelar
        if (e.key === 'Escape') {
            document.getElementById('btn-cancel-sale').click();
        }
        // F2 para enfocar de una vez la barra de búsqueda / lector de códigos
        if (e.key === 'F2') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });

    // Mantener el foco en la barra de búsqueda por defecto
    searchInput.focus();
});