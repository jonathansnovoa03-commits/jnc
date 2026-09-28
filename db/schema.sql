-- 1. CREACIÓN DE LA BASE DE DATOS Y TABLAS (DDL)
CREATE DATABASE tienda_camisetas;
USE tienda_camisetas;

-- Tabla de Clientes
CREATE TABLE clientes (
    cliente_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    ciudad VARCHAR(50) NOT NULL
);

-- Tabla de Camisetas
CREATE TABLE camisetas (
    camiseta_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_diseño VARCHAR(100) NOT NULL,
    talla VARCHAR(5) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL
);

-- Tabla de Ventas
CREATE TABLE ventas (
    venta_id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    camiseta_id INT,
    cantidad INT NOT NULL,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id),
    FOREIGN KEY (camiseta_id) REFERENCES camisetas(camiseta_id)
);

-- ============================================================
-- 1. INSERCIÓN DE DATOS DE EJEMPLO (DML)
-- ============================================================

INSERT INTO clientes (nombre, email, ciudad) VALUES
('Carlos Gómez', 'carlos@email.com', 'Bogotá'),
('Ana Martínez', 'ana@email.com', 'Medellín'),
('Luisa Fernanda', 'luisa@email.com', 'Cali'),
('Pedro Pascal', 'pedro@email.com', 'Bogotá');

INSERT INTO camisetas (nombre_diseño, talla, precio, stock) VALUES
('Camiseta Anime Go', 'M', 45000.00, 20),
('Camiseta Rock Classic', 'L', 50000.00, 15),
('Camiseta Minimalist Black', 'S', 38000.00, 30),
('Camiseta Urban Oversize', 'XL', 60000.00, 10);

INSERT INTO ventas (cliente_id, camiseta_id, cantidad) VALUES
(1, 1, 2),
(2, 2, 1),
(3, 3, 3),
(1, 4, 1);

-- ============================================================
-- 2. EJEMPLOS DE ACTUALIZACIÓN Y BORRADO
-- ============================================================

-- Actualizar el stock de una camiseta
UPDATE camisetas
SET stock = stock - 2
WHERE camiseta_id = 1;

-- Borrar un cliente sin compras asociadas
DELETE FROM clientes
WHERE cliente_id = 4;

-- ============================================================
-- 3. CONSULTAS REQUERIDAS POR LA GUÍA
-- ============================================================

-- Consulta 1: Filtro avanzado con LIKE y BETWEEN
SELECT * FROM camisetas
WHERE nombre_diseño LIKE '%Camiseta%'
  AND precio BETWEEN 40000.00 AND 60000.00;

-- Consulta 2: Agrupación y filtro con GROUP BY y HAVING
SELECT ciudad, COUNT(*) AS total_clientes
FROM clientes
GROUP BY ciudad
HAVING COUNT(*) >= 1;

-- Consulta 3: Uso de IN y ORDER BY
SELECT * FROM camisetas
WHERE talla IN ('M', 'L', 'XL')
ORDER BY precio DESC;

-- Consulta 4: JOIN con Funciones de Agregación (Total Gastado)
SELECT 
    c.nombre AS Cliente,
    COUNT(v.venta_id) AS Compras_Realizadas,
    SUM(v.cantidad * cam.precio) AS Total_Gastado
FROM clientes c
JOIN ventas v ON c.cliente_id = v.cliente_id
JOIN camisetas cam ON v.camiseta_id = cam.camiseta_id
GROUP BY c.cliente_id, c.nombre
ORDER BY Total_Gastado DESC;

-- Consulta 5: Subconsulta (Camisetas vendidas por encima del precio promedio)
SELECT nombre_diseño, precio
FROM camisetas
WHERE precio > (SELECT AVG(precio) FROM camisetas);

-- ============================================================
-- 4. PROCEDIMIENTO ALMACENADO (STORED PROCEDURE)
-- ============================================================

DELIMITER //
CREATE PROCEDURE RegistrarVenta(
    IN p_cliente_id INT,
    IN p_camiseta_id INT,
    IN p_cantidad INT
)
BEGIN
    -- Registrar la venta
    INSERT INTO ventas (cliente_id, camiseta_id, cantidad)
    VALUES (p_cliente_id, p_camiseta_id, p_cantidad);

    -- Descontar el stock automáticamente
    UPDATE camisetas
    SET stock = stock - p_cantidad
    WHERE camiseta_id = p_camiseta_id;
END //
DELIMITER ;
