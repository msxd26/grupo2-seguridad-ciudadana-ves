-- "Yo también lo vi": confirmaciones vecinales de un reporte (una por persona).
ALTER TABLE reportes ADD COLUMN confirmaciones SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER marcas;

CREATE TABLE IF NOT EXISTS reporte_confirmaciones (
  reporte_id INT UNSIGNED NOT NULL,
  huella     CHAR(64)     NOT NULL,
  creado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (reporte_id, huella),
  CONSTRAINT fk_confirmacion_reporte FOREIGN KEY (reporte_id) REFERENCES reportes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
