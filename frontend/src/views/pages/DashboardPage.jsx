import { useSearchParams } from 'react-router-dom'
import PanelCiudadano from '../components/dashboard/PanelCiudadano'
import PanelOficial from '../components/dashboard/PanelOficial'
import PanelPrediccion from '../components/dashboard/PanelPrediccion'
import '../../assets/styles/dashboard.css'

const PESTANAS = [
  { id: 'vecinal', label: 'Reportes vecinales', detalle: 'Lo que no llega a la comisaría' },
  { id: 'oficial', label: 'Denuncias oficiales (SIDPOL)', detalle: 'MININTER · datos abiertos' },
  { id: 'prediccion', label: 'Predicción y plan', detalle: 'Próximos 7 y 30 días' },
]
const VISTAS = new Set(PESTANAS.map((p) => p.id))

// Dashboard municipal: reportes ciudadanos (Tu Vecino) + denuncias oficiales del Estado + predicción.
export default function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const vista = VISTAS.has(params.get('vista')) ? params.get('vista') : 'vecinal'

  const pestanas = (
    <div className="pbi-tabs" role="tablist" aria-label="Fuente de datos">
      {PESTANAS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={vista === p.id}
          className={vista === p.id ? 'pbi-tab pbi-tab--activa' : 'pbi-tab'}
          onClick={() => setParams(p.id === 'vecinal' ? {} : { vista: p.id }, { replace: true })}
        >
          <strong>{p.label}</strong>
          <span>{p.detalle}</span>
        </button>
      ))}
    </div>
  )

  if (vista === 'oficial') return <PanelOficial pestanas={pestanas} />
  if (vista === 'prediccion') return <PanelPrediccion pestanas={pestanas} />
  return <PanelCiudadano pestanas={pestanas} />
}
