# jnc — tienda de camisetas estampadas

Proyecto formativo (SENA): catálogo, carrito y checkout **simulado** (sin pasarela de pago real), con backend en Node.js/Express y base de datos MySQL.

## Qué necesitas instalar antes de empezar

1. **Node.js** (versión 18 o superior) — https://nodejs.org
2. **MySQL Server** + **MySQL Workbench** (para crear y ver la base de datos)

## Paso 1: Crear la base de datos

1. Abre MySQL Workbench y conéctate a tu servidor local.
2. Abre el archivo `db/schema.sql` de este proyecto y ejecútalo completo (ícono del rayo ⚡ o `Ctrl+Shift+Enter`).
   Esto crea la base `tienda_camisetas`, las tablas `clientes`, `camisetas`, `ventas`, los datos de ejemplo y el procedimiento `RegistrarVenta`.

## Paso 2: Configurar la conexión

1. En la carpeta del proyecto, copia `.env.example` y renómbralo a `.env`.
2. Edita `.env` con tu usuario y contraseña reales de MySQL:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=tienda_camisetas
DB_PORT=3306
PORT=3000
```

## Paso 3: Instalar dependencias y ejecutar

Abre una terminal en la carpeta del proyecto:

```bash
npm install
npm start
```

Verás el mensaje `jnc corriendo en http://localhost:3000`. Abre esa dirección en tu navegador.

## Estructura del proyecto

```
jnc/
├── db/
│   └── schema.sql          # script de creación de la BD (el que hiciste en Workbench)
├── server/
│   ├── db.js                # conexión a MySQL
│   └── server.js             # servidor Express + rutas de la API
├── public/
│   ├── index.html            # catálogo
│   ├── carrito.html          # carrito + checkout simulado
│   ├── reportes.html          # las 5 consultas requeridas por la guía
│   ├── css/style.css
│   └── js/
│       ├── carrito-storage.js  # carrito compartido (localStorage)
│       ├── main.js              # lógica del catálogo
│       ├── carrito.js            # lógica del carrito y checkout
│       └── reportes.js            # lógica de reportes
├── .env.example
└── package.json
```

## Cómo funciona el pedido simulado

Cuando confirmas un pedido en el carrito:
1. Se busca el cliente por email; si no existe, se crea en `clientes`.
2. Se valida que haya stock suficiente para cada camiseta.
3. Se llama al procedimiento almacenado `RegistrarVenta` por cada producto del carrito, que inserta la venta y descuenta el stock automáticamente.
4. No se procesa ningún pago real — el estado queda registrado como una venta de práctica.

## Notas

- Los "diseños" en el catálogo son las mismas filas de `camisetas` agrupadas por `nombre_diseño`; cada talla es una fila distinta con su propio stock.
- La página de Reportes ejecuta en vivo las 5 consultas SQL exigidas por la guía (LIKE/BETWEEN, GROUP BY/HAVING, IN/ORDER BY, JOIN con agregación, subconsulta).
