import { useState } from 'react'
import DataTable from '../charts/DataTable'

// Contenedor de un visual del panel. Como en Power BI, cada visual puede verse como tabla.
export default function Tile({ titulo, subtitulo, tabla, className = '', children }) {
  const [verTabla, setVerTabla] = useState(false)

  return (
    <section className={`tile ${className}`}>
      <header className="tile__header">
        <div>
          <h3 className="tile__title">{titulo}</h3>
          {subtitulo ? <p className="tile__subtitle">{subtitulo}</p> : null}
        </div>
        {tabla ? (
          <button
            type="button"
            className="tile__action"
            aria-pressed={verTabla}
            onClick={() => setVerTabla((v) => !v)}
            title={verTabla ? 'Ver gráfico' : 'Ver como tabla'}
          >
            {verTabla ? 'Gráfico' : 'Tabla'}
          </button>
        ) : null}
      </header>
      <div className="tile__body">{verTabla && tabla ? <DataTable {...tabla} /> : children}</div>
    </section>
  )
}
