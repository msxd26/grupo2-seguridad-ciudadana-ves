-- Tu Vecino (HackODS UA 2026): tipos de incidente del plan y moderación comunitaria.

-- 1) Tipos de incidente normalizados (ids en snake_case).
UPDATE reportes SET tipo = CASE tipo
  WHEN 'Robo' THEN 'robo'
  WHEN 'Hurto' THEN 'robo'
  WHEN 'Violencia contra la mujer' THEN 'acoso'
  WHEN 'Microcomercialización de drogas' THEN 'actividad_sospechosa'
  WHEN 'Pandillaje' THEN 'actividad_sospechosa'
  WHEN 'Consumo de alcohol en vía pública' THEN 'actividad_sospechosa'
  WHEN 'Alumbrado o zona insegura' THEN 'zona_oscura'
  ELSE 'otro'
END
WHERE tipo NOT IN ('robo', 'intento_robo', 'acoso', 'actividad_sospechosa', 'zona_oscura', 'espacio_abandonado', 'otro');

-- 2) Canal por el que se creó el reporte y ocultamiento por marcas comunitarias.
ALTER TABLE reportes
  ADD COLUMN modo   ENUM('formulario', 'chat', 'guiado') NOT NULL DEFAULT 'formulario' AFTER tipo,
  ADD COLUMN marcas SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN oculto TINYINT(1) NOT NULL DEFAULT 0,
  ADD KEY idx_oculto (oculto);

-- 3) Marcas "esto es falso": una por persona (usuario o huella anónima) y reporte.
CREATE TABLE IF NOT EXISTS reporte_marcas (
  reporte_id INT UNSIGNED NOT NULL,
  huella     CHAR(64)     NOT NULL,
  creado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (reporte_id, huella),
  CONSTRAINT fk_marca_reporte FOREIGN KEY (reporte_id) REFERENCES reportes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
