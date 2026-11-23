import { useSearchParams } from 'react-router-dom'
import PanelCiudadano from '../components/dashboard/PanelCiudadano'
import PanelOficial from '../components/dashboard/PanelOficial'
import '../../assets/styles/dashboard.css'

const PESTANAS = [
  { id: 'vecinal', label: 'Reportes vecinales', detalle: 'Lo que no llega a la comisaría' },
  { id: 'oficial', label: 'Denuncias oficiales (SIDPOL)', detalle: 'MININTER · datos abiertos' },
]

// Dashboard municipal: reportes ciudadanos (Tu Vecino) + denuncias oficiales del Estado.
export default function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const vista = params.get('vista') === 'oficial' ? 'oficial' : 'vecinal'

  const pestanas = (
    <div className="pbi-tabs" role="tablist" aria-label="Fuente de datos">
      {PESTANAS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={vista === p.id}
          className={vista === p.id ? 'pbi-tab pbi-tab--activa' : 'pbi-tab'}
          onClick={() => setParams(p.id === 'oficial' ? { vista: 'oficial' } : {}, { replace: true })}
        >
          <strong>{p.label}</strong>
          <span>{p.detalle}</span>
        </button>
      ))}
    </div>
  )

  return vista === 'oficial' ? <PanelOficial pestanas={pestanas} /> : <PanelCiudadano pestanas={pestanas} />
}
