// Historial DE DEMOSTRACIÓN (es_demo = 1) de 10 semanas para la predicción del panel municipal.
// No son datos reales: la interfaz los marca como "DEMO". Reemplaza los reportes demo anteriores
// (los reportes reales, es_demo = 0, no se tocan).
//   npm run db:demo:historial   → crea el historial demo
//   npm run db:demo:limpiar     → elimina todos los reportes demo
//
// Patrones plausibles por zona para que la predicción muestre casos distintos en el pitch:
// una zona que sube, una que baja, zonas estables con franjas horarias marcadas y ruido disperso.
import { pool } from '../../src/config/db.js'
import { crearAzar, DESCRIPCIONES } from '../../src/utils/demo.js'
import { TAMANO_CELDA, puntoEnPoligono } from '../../src/utils/geo.js'

const SEMANAS = 10
const DIA_MS = 86_400_000
const azar = crearAzar(20261124) // semilla fija: la demo es reproducible

// Horas típicas (hora de Lima) por perfil.
const HORAS = {
  noche: [18, 19, 20, 21, 22, 23],
  tardeNoche: [16, 17, 18, 19, 20, 21],
  manana: [6, 7, 8, 9, 10, 11],
  madrugada: [0, 1, 2, 3, 4, 5],
}

// [lat, lng] de referencia, tipos con peso, perfil horario, reportes por semana (de la más antigua a la actual).
const FOCOS = [
  { nombre: 'Av. Revolución (paradero)', centro: [-12.2131, -76.9379], tipos: [['robo', 55], ['intento_robo', 30], ['otro', 15]], horas: 'noche', pNoche: 0.75, semanal: [3, 9] }, // sube
  { nombre: 'Parque zonal Huáscar', centro: [-12.2010, -76.9445], tipos: [['acoso', 60], ['zona_oscura', 25], ['actividad_sospechosa', 15]], horas: 'tardeNoche', pNoche: 0.7, semanal: [5, 5], findeSemana: 0.5 }, // estable
  { nombre: 'Mercado Plaza Villa Sur', centro: [-12.2265, -76.9300], tipos: [['robo', 50], ['intento_robo', 35], ['otro', 15]], horas: 'manana', pNoche: 0.7, semanal: [6, 6] }, // estable, de mañana
  { nombre: 'Av. Pastor Sevilla', centro: [-12.2180, -76.9550], tipos: [['zona_oscura', 50], ['espacio_abandonado', 30], ['actividad_sospechosa', 20]], horas: 'noche', pNoche: 0.6, semanal: [3, 3] }, // estable
  { nombre: 'Av. Juan Velasco Alvarado', centro: [-12.2075, -76.9300], tipos: [['actividad_sospechosa', 60], ['robo', 25], ['otro', 15]], horas: 'noche', pNoche: 0.55, semanal: [7, 1.5] }, // baja
  { nombre: 'Av. El Sol', centro: [-12.2330, -76.9420], tipos: [['intento_robo', 50], ['robo', 30], ['acoso', 20]], horas: 'madrugada', pNoche: 0.6, semanal: [1, 2.5] }, // pocos datos
]
const RUIDO = 70 // reportes dispersos por todo el distrito (la mayoría queda como "datos insuficientes")

const MODOS = [['formulario', 50], ['chat', 30], ['guiado', 20]]

function ponderado(pares) {
  const total = pares.reduce((a, [, p]) => a + p, 0)
  let r = azar() * total
  for (const [valor, peso] of pares) if ((r -= peso) < 0) return valor
  return pares[0][0]
}

// Reportes de una semana: la tasa del patrón con una variación pequeña (±1).
// Un muestreo de Poisson puro con tasas tan bajas taparía el patrón que se quiere mostrar.
const cantidadSemana = (lambda) => Math.max(0, Math.round(lambda + (azar() - 0.5) * 2))

// Centro de la celda de ~330 m que contiene el foco: los reportes quedan en la misma zona.
const centroCelda = ([lat, lng]) => [(Math.floor(lat / TAMANO_CELDA) + 0.5) * TAMANO_CELDA, (Math.floor(lng / TAMANO_CELDA) + 0.5) * TAMANO_CELDA]

function puntoCerca([lat, lng], radio) {
  for (let i = 0; i < 50; i++) {
    const p = [lat + (azar() - 0.5) * 2 * radio, lng + (azar() - 0.5) * 2 * radio]
    if (puntoEnPoligono(p[0], p[1])) return p
  }
  return [lat, lng]
}

// Fecha dentro de la semana `s` (0 = últimos 7 días) con la hora del perfil, en hora de Lima (UTC−5).
function fechaEn(s, foco) {
  const ahora = Date.now()
  for (let i = 0; i < 20; i++) {
    let dia = Math.floor(azar() * 7)
    const base = new Date(ahora - (s * 7 + dia) * DIA_MS)
    if (foco?.findeSemana && azar() < foco.findeSemana) {
      // Viernes o sábado
      const dow = new Date(base.getTime() - 5 * 3_600_000).getUTCDay()
      const objetivo = azar() < 0.5 ? 5 : 6
      dia = (dow - objetivo + 7) % 7
      base.setTime(base.getTime() - dia * DIA_MS)
    }
    const horas = foco && azar() < foco.pNoche ? HORAS[foco.horas] : [...Array(24).keys()]
    const hora = horas[Math.floor(azar() * horas.length)]
    const ymd = new Date(base.getTime() - 5 * 3_600_000).toISOString().slice(0, 10)
    const fecha = new Date(`${ymd}T${String(hora).padStart(2, '0')}:${String(Math.floor(azar() * 60)).padStart(2, '0')}:00-05:00`)
    if (fecha.getTime() <= ahora && fecha.getTime() > ahora - SEMANAS * 7 * DIA_MS) return fecha
  }
  return new Date(ahora - (s * 7 + 1) * DIA_MS)
}

function fila(tipo, [lat, lng], fecha, referencia) {
  const modo = ponderado(MODOS)
  const chat = modo === 'chat'
  const lista = DESCRIPCIONES[tipo]
  return [
    tipo, modo, chat ? 55 + Math.floor(azar() * 44) : null, chat && azar() < 0.2 ? 1 : 0,
    `${lista[Math.floor(azar() * lista.length)]}.`, referencia,
    Number(lat.toFixed(6)), Number(lng.toFixed(6)), fecha, azar() < 0.55 ? 'verificado' : 'pendiente', 1,
  ]
}

const filas = []
for (const foco of FOCOS) {
  const centro = centroCelda(foco.centro)
  const [inicio, fin] = foco.semanal
  for (let s = SEMANAS - 1; s >= 0; s--) {
    const lambda = inicio + ((fin - inicio) * (SEMANAS - 1 - s)) / (SEMANAS - 1)
    for (let k = cantidadSemana(lambda); k > 0; k--) {
      filas.push(fila(ponderado(foco.tipos), puntoCerca(centro, TAMANO_CELDA * 0.4), fechaEn(s, foco), foco.nombre))
    }
  }
}
for (let i = 0; i < RUIDO; i++) {
  const tipo = ponderado(Object.keys(DESCRIPCIONES).map((t) => [t, 1]))
  const centro = [-12.215 + (azar() - 0.5) * 0.06, -76.94 + (azar() - 0.5) * 0.06]
  if (!puntoEnPoligono(centro[0], centro[1])) { i--; continue }
  filas.push(fila(tipo, centro, fechaEn(Math.floor(azar() * SEMANAS), null), null))
}

try {
  await pool.query('DELETE FROM reportes WHERE es_demo = 1')
  await pool.query(
    'INSERT INTO reportes (tipo, modo, ia_confianza, ia_corregido, descripcion, referencia, lat, lng, fecha_hecho, estado, es_demo) VALUES ?',
    [filas],
  )
  console.log(`✔ ${filas.length} reportes DEMO de historial (${SEMANAS} semanas) creados con es_demo = 1`)
} finally {
  await pool.end()
}
