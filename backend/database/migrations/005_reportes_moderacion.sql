-- Vincula reportes con su autor (opcional: se puede reportar de forma anónima)
-- y agrega los campos de moderación usados por los administradores.
ALTER TABLE reportes
  ADD COLUMN usuario_id       INT UNSIGNED NULL AFTER id,
  ADD COLUMN comentario_admin VARCHAR(300) NULL,
  ADD COLUMN revisado_por     INT UNSIGNED NULL,
  ADD COLUMN revisado_en      DATETIME     NULL,
  ADD KEY idx_usuario (usuario_id),
  ADD KEY idx_estado (estado),
  ADD CONSTRAINT fk_reporte_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_reporte_revisor FOREIGN KEY (revisado_por) REFERENCES usuarios (id) ON DELETE SET NULL;
