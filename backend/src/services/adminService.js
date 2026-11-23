import { ReporteModel } from '../models/ReporteModel.js'
import { UsuarioModel } from '../models/UsuarioModel.js'
import { TIPOS_REPORTE } from '../config/fuente.js'
import { ErrorValidacion } from '../utils/texto.js'
import { obtenerAlertas } from './alertasService.js'

const ESTADOS = ['pendiente', 'verificado', 'descartado']
const ROLES = ['ciudadano', 'admin']
const POR_PAGINA = 15

const esVerdadero = (v) => v === '1' || v === 'true'

export async function resumen(query) {
  const incluirDemo = esVerdadero(query.demo)
  const [reportes, usuarios, alertas] = await Promise.all([
    ReporteModel.resumenAdmin({ incluirDemo }),
    UsuarioModel.listar({}),
    obtenerAlertas(),
  ])
  return {
    ...reportes,
    usuarios: {
      total: usuarios.length,
      admins: usuarios.filter((u) => u.rol === 'admin').length,
      nuevos7dias: usuarios.filter((u) => Date.now() - new Date(u.creadoEn).getTime() < 7 * 86_400_000).length,
    },
    alertas: { total: alertas.length, altas: alertas.filter((a) => a.nivel === 'alta').length },
  }
}

export async function listarReportes(query) {
  const estado = ESTADOS.includes(query.estado) ? query.estado : null
  const tipo = TIPOS_REPORTE.includes(query.tipo) ? query.tipo : null
  const q = String(query.q ?? '').trim().slice(0, 80) || null
  const pagina = Math.max(1, Number.parseInt(query.pagina, 10) || 1)
  const { total, reportes } = await ReporteModel.listarAdmin({
    estado, tipo, q, incluirDemo: esVerdadero(query.demo), soloMarcados: esVerdadero(query.marcados), pagina, porPagina: POR_PAGINA,
  })
  return { reportes, total, pagina, paginas: Math.max(1, Math.ceil(total / POR_PAGINA)) }
}

export async function moderarReporte(id, body, admin) {
  const estado = String(body.estado ?? '')
  const comentario = String(body.comentario ?? '').replace(/\s+/g, ' ').trim()
  if (!ESTADOS.includes(estado)) throw new ErrorValidacion('Estado no válido')
  if (comentario.length > 300) throw new ErrorValidacion('El comentario no puede superar 300 caracteres')
  if (estado === 'descartado' && comentario.length < 5) {
    throw new ErrorValidacion('Indica el motivo del descarte', { comentario: 'Explica brevemente por qué se descarta' })
  }
  const reporte = await ReporteModel.actualizarEstado(Number(id), {
    estado, comentario: comentario || null, revisorId: admin.id,
  })
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 })
  return reporte
}

export const listarUsuarios = (query) => UsuarioModel.listar({ q: String(query.q ?? '').trim().slice(0, 80) || null })

export async function actualizarUsuario(id, body, admin) {
  const objetivo = await UsuarioModel.buscarPorId(Number(id))
  if (!objetivo) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 })

  const cambios = {}
  if (body.rol !== undefined) {
    if (!ROLES.includes(body.rol)) throw new ErrorValidacion('Rol no válido')
    cambios.rol = body.rol
  }
  if (body.activo !== undefined) cambios.activo = Boolean(body.activo)

  if (objetivo.id === admin.id && (cambios.rol === 'ciudadano' || cambios.activo === false)) {
    throw new ErrorValidacion('No puedes quitarte el rol de administrador ni desactivar tu propia cuenta')
  }
  const dejaDeSerAdmin = objetivo.rol === 'admin' && (cambios.rol === 'ciudadano' || cambios.activo === false)
  if (dejaDeSerAdmin && (await UsuarioModel.contarAdminsActivos()) <= 1) {
    throw new ErrorValidacion('Debe quedar al menos un administrador activo')
  }
  return UsuarioModel.actualizar(objetivo.id, cambios)
}
