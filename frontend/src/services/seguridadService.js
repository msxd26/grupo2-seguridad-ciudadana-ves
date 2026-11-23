import { getJson, postJson, toQuery } from './api'

// Panel de decisión
export const fetchCatalogos = (signal) => getJson('/catalogos', signal)
export const fetchDashboard = (filtros, signal) =>
  getJson(`/dashboard${toQuery({ distrito: filtros.distrito, desde: filtros.desde, hasta: filtros.hasta, modalidades: filtros.modalidades })}`, signal)

// Mapa y comisarías
export const fetchMapa = ({ dias, tipos }, signal) => getJson(`/mapa${toQuery({ dias, tipos })}`, signal)
export const fetchLimite = (signal) => getJson('/mapa/limite', signal)
export const fetchComisarias = (signal) => getJson('/comisarias', signal)

// Alertas
export const fetchAlertas = (signal) => getJson('/alertas', signal)

// Reportes ciudadanos
export const fetchTiposReporte = (signal) => getJson('/reportes/tipos', signal)
export const crearReporte = (data) => postJson('/reportes', data)
export const marcarFalso = (id) => postJson(`/reportes/${id}/marcar`)
export const confirmarReporte = (id) => postJson(`/reportes/${id}/confirmar`)
export const conversarIA = (mensajes) => postJson('/reportes/chat', { mensajes })
export const fetchPanelCiudadano = ({ dias }, signal) => getJson(`/panel-ciudadano${toQuery({ dias })}`, signal)

// Predicción por zona y plan de acción (panel municipal)
export const fetchPredicciones = (signal) => getJson('/predicciones', signal)
export const fetchPlanAccion = (zonas, signal) => getJson(`/predicciones/plan${toQuery({ zonas: zonas?.join(',') })}`, signal)
