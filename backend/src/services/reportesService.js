import { createHash } from 'node:crypto'
import { ReporteModel } from '../models/ReporteModel.js'
import { env } from '../config/env.js'
import { MODOS_REPORTE, TIPOS_INCIDENTE, TIPOS_REPORTE } from '../config/fuente.js'
import { puntoEnPoligono } from '../utils/geo.js'
import { ErrorValidacion } from '../utils/texto.js'
import { emitir } from '../utils/eventos.js'

const MAX_DIAS_ATRAS = 30
const DIAS_PERMITIDOS = new Set([1, 7, 30, 90])

export function parsearDias(valor, porDefecto = 30) {
  const dias = Number(valor ?? porDefecto)
  if (!DIAS_PERMITIDOS.has(dias)) throw new ErrorValidacion('El periodo debe ser 1, 7, 30 o 90 días')
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
  const modo = MODOS_REPORTE.includes(body.modo) ? body.modo : 'formulario'
  const descripcion = limpiar(body.descripcion)
  const referencia = limpiar(body.referencia)
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  const fechaHecho = new Date(body.fechaHecho)

  if (!TIPOS_REPORTE.includes(tipo)) errores.tipo = 'Selecciona qué tipo de incidente fue'
  // En el modo guiado (solo botones) la descripción es opcional; en los demás, al menos 10 caracteres.
  const minimo = modo === 'guiado' ? 0 : 10
  if (descripcion.length < minimo) errores.descripcion = 'Describe lo ocurrido (mínimo 10 caracteres)'
  if (descripcion.length > 500) errores.descripcion = 'La descripción no puede superar 500 caracteres'
  if (referencia.length > 200) errores.referencia = 'La referencia no puede superar 200 caracteres'
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    errores.ubicacion = 'Indica dónde ocurrió'
  } else if (!puntoEnPoligono(lat, lng)) {
    errores.ubicacion = 'La ubicación debe estar dentro de Villa El Salvador'
  }
  const ahora = Date.now()
  if (Number.isNaN(fechaHecho.getTime())) {
    errores.fechaHecho = 'Indica cuándo ocurrió'
  } else if (fechaHecho.getTime() > ahora + 5 * 60_000) {
    errores.fechaHecho = 'La fecha no puede estar en el futuro'
  } else if (ahora - fechaHecho.getTime() > MAX_DIAS_ATRAS * 86_400_000) {
    errores.fechaHecho = `Solo se aceptan incidentes de los últimos ${MAX_DIAS_ATRAS} días`
  }

  if (Object.keys(errores).length) throw new ErrorValidacion('Revisa los datos del reporte', errores)
  const etiqueta = TIPOS_INCIDENTE.find((t) => t.id === tipo).label
  // Solo el chat IA envía la confianza de la clasificación y si el vecino corrigió a la IA.
  const confianza = Number(body.iaConfianza)
  const iaConfianza = modo === 'chat' && Number.isFinite(confianza) ? Math.min(100, Math.max(0, Math.round(confianza))) : null
  const iaCorregido = modo === 'chat' && body.iaCorregido === true
  return { tipo, modo, iaConfianza, iaCorregido, descripcion: descripcion || `${etiqueta} (reporte guiado)`, referencia: referencia || null, lat, lng, fechaHecho }
}

export async function crearReporte(body, usuario) {
  const reporte = await ReporteModel.crear({ ...validarReporte(body), usuarioId: usuario?.id ?? null })
  // Aviso en tiempo real a todos los navegadores conectados (sin datos del autor).
  emitir('reporte', reporte)
  return reporte
}

// Huella anónima de quien marca: usuario si hay sesión; si no, IP + navegador (con hash).
function huellaDe(req) {
  const base = req.usuario ? `u:${req.usuario.id}` : `a:${req.ip}|${req.get('user-agent') ?? ''}`
  return createHash('sha256').update(`${env.auth.jwtSecret}|${base}`).digest('hex')
}

export async function marcarFalso(id, req) {
  const reporte = await ReporteModel.buscarPorId(Number(id))
  if (!reporte || reporte.estado === 'descartado') throw Object.assign(new Error('Reporte no encontrado'), { status: 404 })
  const actualizado = await ReporteModel.marcar(reporte.id, huellaDe(req))
  if (!actualizado) throw new ErrorValidacion('Ya marcaste este reporte. ¡Gracias por avisar!')
  if (actualizado.oculto) emitir('reporte-oculto', { id: actualizado.id })
  else emitir('reporte-actualizado', resumenVotos(actualizado))
  return { id: actualizado.id, marcas: actualizado.marcas, oculto: actualizado.oculto }
}

const resumenVotos = (r) => ({ id: r.id, confirmaciones: r.confirmaciones, marcas: r.marcas })

// "Yo también lo vi": da credibilidad al reporte y se actualiza en vivo para todos.
export async function confirmarReporte(id, req) {
  const reporte = await ReporteModel.buscarPorId(Number(id))
  if (!reporte || reporte.estado === 'descartado' || reporte.oculto) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 })
  const actualizado = await ReporteModel.confirmar(reporte.id, huellaDe(req))
  if (!actualizado) throw new ErrorValidacion('Ya confirmaste este reporte. ¡Gracias!')
  emitir('reporte-actualizado', resumenVotos(actualizado))
  return resumenVotos(actualizado)
}

export const listarReportes = (query) =>
  ReporteModel.listarRecientes({ dias: parsearDias(query.dias), tipos: parsearTipos(query.tipos) })

export const misReportes = (usuario) => ReporteModel.listarPorUsuario(usuario.id)

export const tiposReporte = () => TIPOS_INCIDENTE
