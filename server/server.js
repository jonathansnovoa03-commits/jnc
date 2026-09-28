require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- CATÁLOGO ----------

// Devuelve todas las camisetas (cada fila = un diseño + talla específicos)
app.get('/api/camisetas', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM camisetas ORDER BY nombre_diseño, FIELD(talla, "S","M","L","XL")'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'No se pudo cargar el catálogo.' });
    }
});

// ---------- CHECKOUT SIMULADO ----------
// body: { nombre, email, ciudad, items: [{ camiseta_id, cantidad }] }
app.post('/api/checkout', async (req, res) => {
    const { nombre, email, ciudad, items } = req.body;

    if (!nombre || !email || !ciudad || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Faltan datos del cliente o el carrito está vacío.' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Buscar o crear el cliente por email
        let [clienteRows] = await conn.query('SELECT cliente_id FROM clientes WHERE email = ?', [email]);
        let clienteId;
        if (clienteRows.length > 0) {
            clienteId = clienteRows[0].cliente_id;
        } else {
            const [result] = await conn.query(
                'INSERT INTO clientes (nombre, email, ciudad) VALUES (?, ?, ?)',
                [nombre, email, ciudad]
            );
            clienteId = result.insertId;
        }

        // 2. Verificar stock y calcular total antes de registrar nada
        let total = 0;
        const detalles = [];
        for (const item of items) {
            const [camisetaRows] = await conn.query(
                'SELECT * FROM camisetas WHERE camiseta_id = ?',
                [item.camiseta_id]
            );
            if (camisetaRows.length === 0) {
                throw new Error(`El producto ${item.camiseta_id} ya no existe.`);
            }
            const camiseta = camisetaRows[0];
            if (camiseta.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para "${camiseta.nombre_diseño}" (talla ${camiseta.talla}).`);
            }
            total += Number(camiseta.precio) * item.cantidad;
            detalles.push({ camiseta, cantidad: item.cantidad });
        }

        // 3. Registrar cada venta con el procedimiento almacenado RegistrarVenta
        for (const item of items) {
            await conn.query('CALL RegistrarVenta(?, ?, ?)', [clienteId, item.camiseta_id, item.cantidad]);
        }

        await conn.commit();
        res.json({
            mensaje: 'Pedido simulado registrado correctamente.',
            cliente_id: clienteId,
            total,
            detalles: detalles.map(d => ({
                diseño: d.camiseta.nombre_diseño,
                talla: d.camiseta.talla,
                cantidad: d.cantidad,
                precio_unitario: d.camiseta.precio
            }))
        });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(400).json({ error: err.message || 'No se pudo procesar el pedido.' });
    } finally {
        conn.release();
    }
});

// ---------- REPORTES (las 5 consultas requeridas por la guía) ----------

app.get('/api/reportes/rango-precio', async (req, res) => {
    const [rows] = await pool.query(
        `SELECT * FROM camisetas
         WHERE nombre_diseño LIKE '%Camiseta%' AND precio BETWEEN 40000.00 AND 60000.00`
    );
    res.json(rows);
});

app.get('/api/reportes/clientes-por-ciudad', async (req, res) => {
    const [rows] = await pool.query(
        `SELECT ciudad, COUNT(*) AS total_clientes
         FROM clientes GROUP BY ciudad HAVING COUNT(*) >= 1`
    );
    res.json(rows);
});

app.get('/api/reportes/por-talla', async (req, res) => {
    const [rows] = await pool.query(
        `SELECT * FROM camisetas WHERE talla IN ('M','L','XL') ORDER BY precio DESC`
    );
    res.json(rows);
});

app.get('/api/reportes/total-gastado', async (req, res) => {
    const [rows] = await pool.query(
        `SELECT c.nombre AS cliente, COUNT(v.venta_id) AS compras_realizadas,
                SUM(v.cantidad * cam.precio) AS total_gastado
         FROM clientes c
         JOIN ventas v ON c.cliente_id = v.cliente_id
         JOIN camisetas cam ON v.camiseta_id = cam.camiseta_id
         GROUP BY c.cliente_id, c.nombre
         ORDER BY total_gastado DESC`
    );
    res.json(rows);
});

app.get('/api/reportes/sobre-promedio', async (req, res) => {
    const [rows] = await pool.query(
        `SELECT nombre_diseño, precio FROM camisetas
         WHERE precio > (SELECT AVG(precio) FROM camisetas)`
    );
    res.json(rows);
});

app.listen(PORT, () => {
    console.log(`jnc corriendo en http://localhost:${PORT}`);
});
