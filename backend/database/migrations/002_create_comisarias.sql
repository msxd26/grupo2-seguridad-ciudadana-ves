-- Comisarías básicas de la PNP con ubicación GPS.
-- Fuente: MININTER - Relación de comisarías básicas (noviembre 2019), Plataforma Nacional de Datos Abiertos.
CREATE TABLE IF NOT EXISTS comisarias (
  codigo_cpnp  VARCHAR(10)  PRIMARY KEY,
  nombre       VARCHAR(120) NOT NULL,
  distrito     VARCHAR(60)  NOT NULL,
  tipo         CHAR(1)      NULL,
  divpol       VARCHAR(40)  NULL,
  lat          DECIMAL(10,7) NOT NULL,
  lng          DECIMAL(10,7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
