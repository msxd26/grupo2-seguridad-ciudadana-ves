-- Reportes ciudadanos de incidentes (anónimos: no se guardan datos personales).
CREATE TABLE IF NOT EXISTS reportes (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo         VARCHAR(60)   NOT NULL,
  descripcion  VARCHAR(500)  NOT NULL,
  referencia   VARCHAR(200)  NULL,
  lat          DECIMAL(9,6)  NOT NULL,
  lng          DECIMAL(9,6)  NOT NULL,
  fecha_hecho  DATETIME      NOT NULL,
  estado       ENUM('pendiente', 'verificado', 'descartado') NOT NULL DEFAULT 'pendiente',
  es_demo      TINYINT(1)    NOT NULL DEFAULT 0,
  creado_en    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fecha (fecha_hecho),
  KEY idx_tipo_fecha (tipo, fecha_hecho)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
