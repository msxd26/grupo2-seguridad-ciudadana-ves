import { ReporteModel } from '../models/ReporteModel.js'
import { TIPOS_REPORTE } from '../config/fuente.js'
import { puntoEnPoligono } from '../utils/geo.js'
import { ErrorValidacion } from '../utils/texto.js'

const MAX_DIAS_ATRAS = 30
const DIAS_PERMITIDOS = new Set([7, 30, 90])

export function parsearDias(valor, porDefecto = 30) {
  const dias = Number(valor ?? porDefecto)
  if (!DIAS_PERMITIDOS.has(dias)) throw new ErrorValidacion('El periodo debe ser 7, 30 o 90 días')
  return dias
}

export function parsearTipos(valor) {
  const validos = new Set(TIPOS_REPORTE)
  return (valor ?? '').split(',').map((t) => t.trim()).filter((t) => validos.has(t))
}

const limpiar = (texto) => String(texto ?? '').replace(/\s+/g, ' ').trim()

// Valida un reporte ciudadano y devuelve los datos normalizados.
export function validarReporte(body) {
  const errores = {}
  const tipo = limpiar(body.tipo)
  const descripcion = limpiar(body.descripcion)
  const referencia = limpiar(body.referencia)
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  const fechaHecho = new Date(body.fechaHecho)

  if (!TIPOS_REPORTE.includes(tipo)) errores.tipo = 'Selecciona un tipo de incidente válido'
  if (descripcion.length < 10) errores.descripcion = 'Describe lo ocurrido (mínimo 10 caracteres)'
  if (descripcion.length > 500) errores.descripcion = 'La descripción no puede superar 500 caracteres'
  if (referencia.length > 200) errores.referencia = 'La referencia no puede superar 200 caracteres'
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    errores.ubicacion = 'Marca la ubicación en el mapa'
  } else if (!puntoEnPoligono(lat, lng)) {
    errores.ubicacion = 'La ubicación debe estar dentro de Villa El Salvador'
  }
  const ahora = Date.now()
  if (Number.isNaN(fechaHecho.getTime())) {
    errores.fechaHecho = 'Indica la fecha y hora del incidente'
  } else if (fechaHecho.getTime() > ahora + 5 * 60_000) {
    errores.fechaHecho = 'La fecha no puede estar en el futuro'
  } else if (ahora - fechaHecho.getTime() > MAX_DIAS_ATRAS * 86_400_000) {
    errores.fechaHecho = `Solo se aceptan incidentes de los últimos ${MAX_DIAS_ATRAS} días`
  }

  if (Object.keys(errores).length) throw new ErrorValidacion('Revisa los datos del reporte', errores)
  return { tipo, descripcion, referencia: referencia || null, lat, lng, fechaHecho }
}

export async function crearReporte(body, usuario) {
  return ReporteModel.crear({ ...validarReporte(body), usuarioId: usuario?.id ?? null })
}

export const misReportes = (usuario) => ReporteModel.listarPorUsuario(usuario.id)

export async function listarReportes(query) {
  return ReporteModel.listarRecientes({ dias: parsearDias(query.dias), tipos: parsearTipos(query.tipos) })
}

export const tiposReporte = () => TIPOS_REPORTE
