const ACENTOS = ['#E8432F', '#2F6E63', '#D9A02C'];
const FOTOS = {
    'Camiseta Anime Go': 'img/anime-go.jpg',
    'Camiseta Rock Classic': 'img/rock-classic.jpg',
    'Camiseta Minimalist Black': 'img/minimalist-black.jpg',
    'Camiseta Urban Oversize': 'img/urban-oversize.jpg'
};

async function cargarCatalogo() {
    const grid = document.getElementById('grid-productos');
    const conteo = document.getElementById('conteo-productos');
    try {
        const res = await fetch('/api/camisetas');
        const camisetas = await res.json();

        // Agrupar variantes (talla) por nombre de diseño
        const disenos = {};
        camisetas.forEach(c => {
            if (!disenos[c.nombre_diseño]) disenos[c.nombre_diseño] = [];
            disenos[c.nombre_diseño].push(c);
        });

        const nombres = Object.keys(disenos);
        conteo.textContent = `${nombres.length} diseños`;
        grid.innerHTML = '';

        nombres.forEach((nombre, i) => {
            const variantes = disenos[nombre];
            const acento = ACENTOS[i % ACENTOS.length];
            const card = document.createElement('div');
            card.className = 'card-producto';

            const variantesOrdenadas = [...variantes].sort((a, b) => a.talla.localeCompare(b.talla));
            let seleccionada = variantesOrdenadas.find(v => v.stock > 0) || variantesOrdenadas[0];

            const foto = FOTOS[nombre];
            card.innerHTML = `
                <div class="swatch" style="--acento:${acento}">
                    ${foto ? `<img src="${foto}" alt="${nombre}" class="foto-producto">` : `<span class="letra">${nombre.charAt(0)}</span>`}
                </div>
                <div class="card-body">
                    <h3>${nombre}</h3>
                    <span class="precio-tag precio-actual">${formatoCOP(seleccionada.precio)}</span>
                    <div class="tallas">
                        ${variantesOrdenadas.map(v => `
                            <button class="talla-chip ${v.camiseta_id === seleccionada.camiseta_id ? 'selected' : ''}"
                                    data-id="${v.camiseta_id}" ${v.stock === 0 ? 'disabled' : ''}>
                                ${v.talla}
                            </button>
                        `).join('')}
                    </div>
                    <button class="btn btn-agregar">Agregar al carrito</button>
                </div>
            `;

            const chips = card.querySelectorAll('.talla-chip');
            const precioActual = card.querySelector('.precio-actual');
            const btnAgregar = card.querySelector('.btn-agregar');

            function actualizarBoton() {
                btnAgregar.disabled = seleccionada.stock === 0;
                btnAgregar.textContent = seleccionada.stock === 0 ? 'Sin stock' : 'Agregar al carrito';
            }

            chips.forEach(chip => {
                chip.addEventListener('click', () => {
                    if (chip.disabled) return;
                    const id = Number(chip.dataset.id);
                    seleccionada = variantesOrdenadas.find(v => v.camiseta_id === id);
                    chips.forEach(c => c.classList.remove('selected'));
                    chip.classList.add('selected');
                    precioActual.textContent = formatoCOP(seleccionada.precio);
                    actualizarBoton();
                });
            });

            btnAgregar.addEventListener('click', () => {
                agregarAlCarrito({
                    camiseta_id: seleccionada.camiseta_id,
                    nombre_diseño: nombre,
                    talla: seleccionada.talla,
                    precio: Number(seleccionada.precio),
                    cantidad: 1
                });
                btnAgregar.textContent = 'Agregado ✓';
                setTimeout(actualizarBoton, 900);
            });

            actualizarBoton();
            grid.appendChild(card);
        });
    } catch (err) {
        grid.innerHTML = '<p>No se pudo conectar con el servidor. Verifica que el backend esté corriendo y que la base de datos tienda_camisetas exista.</p>';
        console.error(err);
    }
}

cargarCatalogo();
