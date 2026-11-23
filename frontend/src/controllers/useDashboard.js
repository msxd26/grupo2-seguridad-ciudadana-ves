import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchCatalogos, fetchDashboard } from '../services/seguridadService'
import { useAsync } from './useAsync'

// Controlador del panel de decisión. Los filtros viven en la URL (?desde=2024&modalidades=Robo…),
// así cada vista filtrada se puede compartir o guardar como marcador, igual que en Power BI.
export function useDashboard() {
  const [params, setParams] = useSearchParams()

  const distrito = params.get('distrito') ?? ''
  const desde = params.get('desde') ?? ''
  const hasta = params.get('hasta') ?? ''
  const modalidadesParam = params.get('modalidades') ?? ''
  const modalidades = useMemo(() => (modalidadesParam ? modalidadesParam.split(',') : []), [modalidadesParam])

  const catalogos = useAsync((signal) => fetchCatalogos(signal), [])
  const dashboard = useAsync(
    (signal) => fetchDashboard({ distrito, desde, hasta, modalidades: modalidadesParam }, signal),
    [distrito, desde, hasta, modalidadesParam],
  )

  // Actualiza solo los filtros indicados; `null` elimina el filtro.
  const actualizar = useCallback(
    (cambios) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(cambios)) {
            if (v === null || v === '' || (Array.isArray(v) && v.length === 0)) next.delete(k)
            else next.set(k, Array.isArray(v) ? v.join(',') : String(v))
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const acciones = useMemo(
    () => ({
      setDistrito: (ubigeo) => actualizar({ distrito: ubigeo }),
      setRango: (d, h) => actualizar({ desde: d, hasta: h }),
      setAnio: (anio) => actualizar({ desde: anio, hasta: anio }),
      toggleModalidad: (id) =>
        actualizar({
          modalidades: modalidades.includes(id) ? modalidades.filter((m) => m !== id) : [...modalidades, id],
        }),
      setModalidades: (lista) => actualizar({ modalidades: lista }),
      limpiar: () => setParams(new URLSearchParams(), { replace: true }),
    }),
    [actualizar, modalidades, setParams],
  )

  return {
    catalogos: catalogos.data,
    data: dashboard.data,
    error: dashboard.error ?? catalogos.error,
    cargando: dashboard.cargando,
    modalidadesSeleccionadas: modalidades,
    hayFiltros: params.size > 0,
    acciones,
  }
}
