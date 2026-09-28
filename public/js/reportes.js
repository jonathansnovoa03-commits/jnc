const REPORTES = [
    {
        titulo: '1. Camisetas entre $40.000 y $60.000',
        endpoint: '/api/reportes/rango-precio',
        sql: `SELECT * FROM camisetas
WHERE nombre_diseño LIKE '%Camiseta%' AND precio BETWEEN 40000.00 AND 60000.00;`
    },
    {
        titulo: '2. Clientes agrupados por ciudad',
        endpoint: '/api/reportes/clientes-por-ciudad',
        sql: `SELECT ciudad, COUNT(*) AS total_clientes
FROM clientes GROUP BY ciudad HAVING COUNT(*) >= 1;`
    },
    {
        titulo: '3. Camisetas en talla M, L o XL, de mayor a menor precio',
        endpoint: '/api/reportes/por-talla',
        sql: `SELECT * FROM camisetas WHERE talla IN ('M','L','XL') ORDER BY precio DESC;`
    },
    {
        titulo: '4. Total gastado por cliente',
        endpoint: '/api/reportes/total-gastado',
        sql: `SELECT c.nombre, COUNT(v.venta_id) AS compras, SUM(v.cantidad * cam.precio) AS total_gastado
FROM clientes c
JOIN ventas v ON c.cliente_id = v.cliente_id
JOIN camisetas cam ON v.camiseta_id = cam.camiseta_id
GROUP BY c.cliente_id, c.nombre
ORDER BY total_gastado DESC;`
    },
    {
        titulo: '5. Camisetas con precio sobre el promedio',
        endpoint: '/api/reportes/sobre-promedio',
        sql: `SELECT nombre_diseño, precio FROM camisetas
WHERE precio > (SELECT AVG(precio) FROM camisetas);`
    }
];

function renderTabla(filas) {
    if (!filas || filas.length === 0) return '<p>Sin resultados.</p>';
    const columnas = Object.keys(filas[0]);
    return `
        <table class="tabla-reporte">
            <thead><tr>${columnas.map(c => `<th>${c}</th>`).join('')}</tr></thead>
            <tbody>
                ${filas.map(fila => `<tr>${columnas.map(c => `<td>${fila[c]}</td>`).join('')}</tr>`).join('')}
            </tbody>
        </table>`;
}

async function cargarReportes() {
    const cont = document.getElementById('reportes');
    for (const r of REPORTES) {
        const bloque = document.createElement('div');
        bloque.innerHTML = `
            <div class="consulta-titulo"><h3>${r.titulo}</h3></div>
            <pre class="consulta-sql">${r.sql}</pre>
            <div class="resultado-${REPORTES.indexOf(r)}">Cargando...</div>
        `;
        cont.appendChild(bloque);

        try {
            const res = await fetch(r.endpoint);
            const datos = await res.json();
            bloque.querySelector(`.resultado-${REPORTES.indexOf(r)}`).innerHTML = renderTabla(datos);
        } catch (err) {
            bloque.querySelector(`.resultado-${REPORTES.indexOf(r)}`).innerHTML = '<p>No se pudo cargar (verifica el backend).</p>';
        }
    }
}

cargarReportes();
