import { useAsync } from './useAsync'
import { fetchLimite } from '../services/seguridadService'

// Límite distrital de VES (GeoJSON), usado para validar ubicaciones en el navegador.
export function useLimite() {
  const { data } = useAsync((signal) => fetchLimite(signal), [])
  return data?.limite ?? null
}
