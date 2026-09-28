function renderCarrito() {
    const cont = document.getElementById('contenido-carrito');
    const carrito = leerCarrito();

    if (carrito.length === 0) {
        cont.innerHTML = `
            <div class="vacio">
                <p>Tu carrito está vacío.</p>
                <a class="btn" href="index.html">Ver catálogo</a>
            </div>`;
        return;
    }

    const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

    cont.innerHTML = `
        <table class="tabla-carrito">
            <thead>
                <tr><th>Diseño</th><th>Talla</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
            </thead>
            <tbody>
                ${carrito.map((p, i) => `
                    <tr>
                        <td>${p.nombre_diseño}</td>
                        <td>${p.talla}</td>
                        <td>${formatoCOP(p.precio)}</td>
                        <td><input type="number" min="1" class="cantidad-input" data-i="${i}" value="${p.cantidad}"></td>
                        <td>${formatoCOP(p.precio * p.cantidad)}</td>
                        <td><button class="quitar" data-i="${i}">Quitar</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="resumen-total"><span>Total</span><span>${formatoCOP(total)}</span></div>

        <form class="form-checkout" id="form-checkout">
            <h3 style="font-family:Inter; font-size:19px;">Datos para el pedido simulado</h3>
            <div>
                <label for="nombre">Nombre completo</label>
                <input type="text" id="nombre" required>
            </div>
            <div>
                <label for="email">Correo electrónico</label>
                <input type="email" id="email" required>
            </div>
            <div>
                <label for="ciudad">Ciudad</label>
                <input type="text" id="ciudad" required>
            </div>
            <button type="submit" class="btn">Confirmar pedido simulado</button>
        </form>
        <div id="resultado-checkout"></div>
    `;

    cont.querySelectorAll('.cantidad-input').forEach(input => {
        input.addEventListener('change', () => {
            const carrito = leerCarrito();
            const i = Number(input.dataset.i);
            carrito[i].cantidad = Math.max(1, Number(input.value));
            guardarCarrito(carrito);
            renderCarrito();
        });
    });

    cont.querySelectorAll('.quitar').forEach(btn => {
        btn.addEventListener('click', () => {
            const carrito = leerCarrito();
            carrito.splice(Number(btn.dataset.i), 1);
            guardarCarrito(carrito);
            renderCarrito();
        });
    });

    document.getElementById('form-checkout').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type=submit]');
        btn.disabled = true;
        btn.textContent = 'Procesando...';

        const body = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            ciudad: document.getElementById('ciudad').value,
            items: leerCarrito().map(p => ({ camiseta_id: p.camiseta_id, cantidad: p.cantidad }))
        };

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            const resultado = document.getElementById('resultado-checkout');

            if (!res.ok) {
                resultado.innerHTML = `<p style="color:var(--red); font-weight:600; margin-top:16px;">${data.error}</p>`;
                btn.disabled = false;
                btn.textContent = 'Confirmar pedido simulado';
                return;
            }

            guardarCarrito([]);
            document.querySelector('.form-checkout').style.display = 'none';
            resultado.innerHTML = `
                <div class="confirmacion" style="margin-top:24px;">
                    <h3>Pedido simulado #${data.cliente_id}-${Date.now().toString().slice(-4)} confirmado</h3>
                    <p>Gracias, ${body.nombre}. Este es un pedido de práctica: no se realizó ningún cobro.</p>
                    <p style="font-family:'Anton', sans-serif; font-size:22px; margin-top:10px;">Total: ${formatoCOP(data.total)}</p>
                    <a class="btn secundario" style="margin-top:14px; display:inline-block;" href="index.html">Volver al catálogo</a>
                </div>`;
        } catch (err) {
            console.error(err);
            btn.disabled = false;
            btn.textContent = 'Confirmar pedido simulado';
        }
    });
}

renderCarrito();
