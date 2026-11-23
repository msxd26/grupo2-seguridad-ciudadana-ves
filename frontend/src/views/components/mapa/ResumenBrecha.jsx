// Banner de resumen de brecha: "X zonas con subregistro alto · 3.7× más reportes vecinales".
// Visible en los primeros 10 segundos de la demo.
export default function ResumenBrecha({ resumen, cargando }) {
  if (cargando) {
    return (
      <div className="resumen-brecha resumen-brecha--cargando" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" style={{ width: 16, height: 16, borderWidth: 2 }} />
        <span>Calculando diferencia de visibilidad…</span>
      </div>
    )
  }
  if (!resumen) return null

  const hayBrechaAlta = resumen.zonasConBrechaAlta > 0

  return (
    <div className={`resumen-brecha${hayBrechaAlta ? ' resumen-brecha--alerta' : ''}`} role="status" aria-live="polite">
      <div className="resumen-brecha__titular">
        <span className="resumen-brecha__icono" aria-hidden="true">{hayBrechaAlta ? '⚠️' : 'ℹ️'}</span>
        <strong>{resumen.titularBrecha}</strong>
      </div>
      {resumen.zonasConBrechaAlta > 0 ? (
        <p className="resumen-brecha__detalle">
          <span className="resumen-brecha__badge">{resumen.zonasConBrechaAlta} zona{resumen.zonasConBrechaAlta > 1 ? 's' : ''} con alta diferencia</span>
          {resumen.tiposSinEquivalenteOficial?.length ? (
            <> · {resumen.tiposSinEquivalenteOficial.map((t) => t === 'zona_oscura' ? 'Zonas oscuras' : 'Espacios abandonados').join(' y ')} no aparecen en los datos oficiales</>
          ) : null}
        </p>
      ) : null}
      <details className="resumen-brecha__nota">
        <summary>¿Cómo leer este mapa? (2 frases)</summary>
        <p>Las zonas <strong>rojas</strong> son lugares donde los vecinos reportaron mucho más de lo que figura en las estadísticas policiales. Las zonas <strong>grises</strong> tienen cifras similares en ambas fuentes.</p>
      </details>
    </div>
  )
}
