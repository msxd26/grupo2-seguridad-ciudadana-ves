import { DenunciaModel } from '../models/DenunciaModel.js'
import { nombreModalidad } from '../config/fuente.js'
import { tituloDistrito } from '../utils/texto.js'

// Catálogos (años, modalidades, distritos). Los datos oficiales solo cambian al recargar
// la base, así que se consultan una vez y se reutilizan.
let metaPromise = null

export function obtenerMeta() {
  metaPromise ??= Promise.all([DenunciaModel.periodos(), DenunciaModel.modalidades(), DenunciaModel.distritos()])
    .then(([periodos, modalidades, distritos]) => {
      const lista = periodos.map((p) => ({ anio: p.anio, ultimoMes: p.ultimo_mes, completo: p.ultimo_mes === 12 }))
      return {
        periodos: lista,
        periodoPorAnio: new Map(lista.map((p) => [p.anio, p])),
        primerAnio: lista[0]?.anio,
        ultimoAnio: lista.at(-1)?.anio,
        modalidades: modalidades.map((id) => ({ id, nombre: nombreModalidad(id) })),
        distritos: distritos.map((d) => ({ ubigeo: d.ubigeo, nombre: tituloDistrito(d.distrito) })),
      }
    })
    .catch((err) => {
      metaPromise = null // reintentar en la próxima petición
      throw err
    })
  return metaPromise
}

// Versión serializable para el frontend.
export async function obtenerCatalogos() {
  const { periodos, modalidades, distritos } = await obtenerMeta()
  return { periodos, modalidades, distritos }
}
