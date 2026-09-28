// Carrito compartido entre páginas usando localStorage
const CARRITO_KEY = 'jnc_carrito';

function leerCarrito() {
    try {
        return JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
    } catch {
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function agregarAlCarrito(item) {
    const carrito = leerCarrito();
    const existente = carrito.find(p => p.camiseta_id === item.camiseta_id);
    if (existente) {
        existente.cantidad += item.cantidad;
    } else {
        carrito.push(item);
    }
    guardarCarrito(carrito);
}

function actualizarContadorCarrito() {
    const el = document.getElementById('cart-count');
    if (!el) return;
    const total = leerCarrito().reduce((sum, p) => sum + p.cantidad, 0);
    el.textContent = total;
}

function formatoCOP(valor) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
}

document.addEventListener('DOMContentLoaded', actualizarContadorCarrito);
