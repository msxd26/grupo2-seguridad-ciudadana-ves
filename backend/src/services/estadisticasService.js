import { DenunciaModel } from '../models/DenunciaModel.js'

// El dataset trunca este nombre; se muestra completo.
const MODALIDAD_COMPLETA = {
  'Violencia contra la mujer e integrantes':
    'Violencia contra la mujer e integrantes del grupo familiar',
}

const nombreModalidad = (m) => MODALIDAD_COMPLETA[m] ?? m

export async function obtenerPorAnio() {
  const rows = await DenunciaModel.totalPorAnio()
  return rows.map((r) => ({
    anio: r.anio,
    total: Number(r.total),
    ultimoMes: r.ultimo_mes,
    completo: r.ultimo_mes === 12,
  }))
}

export async function obtenerPorModalidad(anio) {
  const rows = await DenunciaModel.totalPorModalidad(anio)
  const total = rows.reduce((acc, r) => acc + Number(r.total), 0)
  return rows.map((r) => ({
    modalidad: nombreModalidad(r.modalidad),
    total: Number(r.total),
    porcentaje: total ? Number(((Number(r.total) / total) * 100).toFixed(1)) : 0,
  }))
}

export async function obtenerPorMes(anio) {
  const rows = await DenunciaModel.totalPorMes(anio)
  return rows.map((r) => ({ mes: r.mes, total: Number(r.total) }))
}

// Resumen del año: total, variación vs. el mismo periodo del año anterior y modalidad principal.
export async function obtenerResumen(anio) {
  const [porMes, porModalidad] = await Promise.all([obtenerPorMes(anio), obtenerPorModalidad(anio)])
  if (porMes.length === 0) return null

  const ultimoMes = porMes.at(-1).mes
  const total = porMes.reduce((acc, r) => acc + r.total, 0)
  const anterior = await DenunciaModel.totalHastaMes(anio - 1, ultimoMes)
  const variacion = anterior ? Number((((total - anterior) / anterior) * 100).toFixed(1)) : null

  return {
    anio,
    ultimoMes,
    completo: ultimoMes === 12,
    total,
    promedioMensual: Math.round(total / porMes.length),
    totalAnioAnteriorMismoPeriodo: anterior || null,
    variacionPorcentual: variacion,
    // "Otros" agrupa delitos diversos: se reporta la principal modalidad específica.
    modalidadPrincipal: porModalidad.find((m) => m.modalidad !== 'Otros') ?? null,
  }
}
