import { useAsync } from '../../controllers/useAsync'
import { fetchComisarias } from '../../services/seguridadService'
import { EMERGENCY_NUMBERS } from '../../models/navigation'
import { enlaceOsm } from '../../models/mapa'
import '../../assets/styles/paginas.css'

const DISTRITO = 'Villa El Salvador'

function ListaComisarias({ comisarias }) {
  return (
    <ul className="comisarias">
      {comisarias.map((c) => (
        <li key={c.codigo}>
          <div>
            <strong>{c.nombre}</strong>
            <span>{c.distrito} · {c.divpol}</span>
          </div>
          <a href={enlaceOsm(c.lat, c.lng)} target="_blank" rel="noreferrer">Ver ubicación</a>
        </li>
      ))}
    </ul>
  )
}

export default function ContactoPage() {
  const { data, error } = useAsync((signal) => fetchComisarias(signal), [])
  const enVes = (data ?? []).filter((c) => c.distrito.toLowerCase() === DISTRITO.toLowerCase())
  const cercanas = (data ?? []).filter((c) => c.distrito.toLowerCase() !== DISTRITO.toLowerCase())

  return (
    <section className="pagina container">
      <header className="pagina__header">
        <h1>Contacto y emergencias</h1>
        <p>Números de emergencia y comisarías de la Policía Nacional en Villa El Salvador y distritos vecinos.</p>
      </header>

      <div className="emergencias">
        {EMERGENCY_NUMBERS.map((e) => (
          <a key={e.id} className="emergencia" href={`tel:${e.number}`}>
            <span className="emergencia__numero">{e.number}</span>
            <span className="emergencia__label">{e.label}</span>
          </a>
        ))}
      </div>

      {error ? <div className="form-error" role="alert">No se pudieron cargar las comisarías: {error}</div> : null}

      <div className="contacto-grid">
        <section>
          <h2>Comisarías en Villa El Salvador</h2>
          <ListaComisarias comisarias={enVes} />
        </section>
        <section>
          <h2>Comisarías cercanas</h2>
          <ListaComisarias comisarias={cercanas} />
        </section>
      </div>

      <p className="pagina__fuente">
        Fuente: MININTER – Relación de comisarías básicas de la PNP (noviembre 2019), Plataforma Nacional de Datos Abiertos.
        La ubicación puede haber cambiado; confirma antes de acudir.
      </p>
    </section>
  )
}
