import { useCallback, useEffect, useState } from 'react'
import { useEventos } from '../context/EventosContext'
import { useSearchParams } from 'react-router-dom'
import { fetchAdminReportes, moderarReporte } from '../services/cuentaService'
import { useAsync } from './useAsync'

// Controlador de la bandeja de moderación. Los filtros viven en la URL.
export function useAdminReportes() {
  const [params, setParams] = useSearchParams()
  const filtros = {
    estado: params.get('estado') ?? '',
    tipo: params.get('tipo') ?? '',
    q: params.get('q') ?? '',
    demo: params.get('demo') === '1',
    marcados: params.get('marcados') === '1',
    pagina: Number(params.get('pagina') ?? 1),
  }
  const clave = params.toString()
  const { data, error, cargando, recargar } = useAsync((signal) => fetchAdminReportes(filtros, signal), [clave])
  const [seleccionado, setSeleccionado] = useState(null)
  const { suscribir } = useEventos()

  // Nuevos reportes, marcas y moderaciones de otros administradores aparecen sin recargar.
  useEffect(
    () => suscribir((tipo) => ['reporte', 'reporte-actualizado', 'reporte-oculto', 'reporte-moderado'].includes(tipo) && recargar()),
    [suscribir, recargar],
  )

  const setFiltro = useCallback(
    (campo, valor) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (valor === '' || valor === false || valor === null) next.delete(campo)
        else next.set(campo, valor === true ? '1' : String(valor))
        if (campo !== 'pagina') next.delete('pagina') // al filtrar, volver a la página 1
        return next
      }, { replace: true })
    },
    [setParams],
  )

  const moderar = useCallback(
    async (id, estado, comentario) => {
      const actualizado = await moderarReporte(id, { estado, comentario })
      setSeleccionado(actualizado)
      recargar()
      return actualizado
    },
    [recargar],
  )

  return { filtros, data, error, cargando, setFiltro, seleccionado, setSeleccionado, moderar }
}
