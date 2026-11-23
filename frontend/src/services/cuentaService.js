import { getJson, patchJson, postJson, toQuery } from './api'

// Sesión
export const fetchSesion = (signal) => getJson('/auth/me', signal)
export const iniciarSesion = (datos) => postJson('/auth/login', datos)
export const registrarCuenta = (datos) => postJson('/auth/registro', datos)
export const cerrarSesion = () => postJson('/auth/logout')

// Ciudadano
export const fetchMisReportes = (signal) => getJson('/reportes/mios', signal)

// Administración
export const fetchAdminResumen = ({ demo }, signal) => getJson(`/admin/resumen${toQuery({ demo })}`, signal)
export const fetchAdminReportes = (filtros, signal) => getJson(`/admin/reportes${toQuery(filtros)}`, signal)
export const moderarReporte = (id, datos) => patchJson(`/admin/reportes/${id}`, datos)
export const fetchAdminUsuarios = ({ q }, signal) => getJson(`/admin/usuarios${toQuery({ q })}`, signal)
export const actualizarUsuario = (id, datos) => patchJson(`/admin/usuarios/${id}`, datos)
