-- Denuncias policiales (SIDPOL) agregadas por mes y modalidad.
-- Fuente: MININTER - Plataforma Nacional de Datos Abiertos del Perú.
CREATE TABLE IF NOT EXISTS denuncias_policiales (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  anio          SMALLINT UNSIGNED NOT NULL,
  mes           TINYINT UNSIGNED  NOT NULL,
  departamento  VARCHAR(60)  NOT NULL,
  provincia     VARCHAR(60)  NOT NULL,
  distrito      VARCHAR(60)  NOT NULL,
  ubigeo        CHAR(6)      NOT NULL,
  modalidad     VARCHAR(100) NOT NULL,
  cantidad      INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_denuncia (ubigeo, anio, mes, modalidad),
  KEY idx_ubigeo_anio (ubigeo, anio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
