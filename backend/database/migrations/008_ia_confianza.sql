-- "La IA que razona contigo": confianza de la clasificación del chat y si el vecino la corrigió.
ALTER TABLE reportes
  ADD COLUMN ia_confianza TINYINT UNSIGNED NULL AFTER modo,
  ADD COLUMN ia_corregido TINYINT(1) NOT NULL DEFAULT 0 AFTER ia_confianza;
