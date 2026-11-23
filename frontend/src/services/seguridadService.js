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
