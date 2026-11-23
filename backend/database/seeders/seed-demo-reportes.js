// Genera reportes ciudadanos DE DEMOSTRACIÓN (es_demo = 1) para la demo de Tu Vecino.
// No son datos reales: la interfaz los marca como "DEMO".
//   npm run db:demo          → crea los reportes demo (reemplaza los anteriores)
//   npm run db:demo:limpiar  → elimina todos los reportes demo
import { pool } from '../../src/config/db.js'
import { LIMITE_VES, puntoEnPoligono } from '../../src/utils/geo.js'

const SOLO_LIMPIAR = process.argv.includes('--limpiar')
const CANTIDAD = 72
const DIAS = 10 // la mayoría cae en los últimos 7 días (checklist pre-demo del plan)

// Descripciones de ejemplo por tipo (inspiradas en el seed del plan).
const DESCRIPCIONES = {
  robo: ['Arrebato de celular a pasajero de microbús', 'Asalto a comerciante en el mercado', 'Robo de bicicleta encadenada', 'Le quitaron la mochila a un escolar'],
  intento_robo: ['Dos personas en moto intentaron robar un bolso', 'Intentaron abrir la puerta de un carro', 'Siguieron a una persona que salió del banco'],
  acoso: ['Hombre siguiendo a una joven cerca del parque', 'Acoso verbal a mujeres en el paradero', 'Hombre exhibicionista en el parque'],
  actividad_sospechosa: ['Grupo bebiendo frente al colegio por las noches', 'Venta de drogas en la esquina', 'Personas merodeando casas al anochecer'],
  zona_oscura: ['Cuadra completamente sin iluminación', 'Alumbrado roto hace tres semanas', 'Poste de luz apagado frente al paradero'],
  espacio_abandonado: ['Lote abandonado usado como botadero', 'Casa abandonada donde se reúnen de noche'],
  otro: ['Pelea callejera entre varias personas', 'Vehículo sospechoso estacionado varios días'],
}
const PESOS = { robo: 24, intento_robo: 14, acoso: 16, actividad_sospechosa: 16, zona_oscura: 14, espacio_abandonado: 8, otro: 8 }
const MODOS = [['formulario', 50], ['chat', 30], ['guiado', 20]]
const REFERENCIAS = ['Av. Revolución', 'Av. César Vallejo', 'Av. Pastor Sevilla', 'Av. El Sol', 'Av. Central', 'Av. Juan Velasco Alvarado', 'Parque zonal Huáscar', 'Mercado Plaza Villa Sur', null, null]

// Focos de concentración para que se formen zonas críticas visibles.
const FOCOS = [[-12.2131, -76.9379], [-12.2010, -76.9445], [-12.2265, -76.9300], [-12.2180, -76.9550], [-12.2075, -76.9300]]

// Generador pseudoaleatorio con semilla: la demo es reproducible.
let semilla = 20261123
const azar = () => ((semilla = (semilla * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32)
const elegir = (lista) => lista[Math.floor(azar() * lista.length)]
function ponderado(pares) {
  const total = pares.reduce((a, [, p]) => a + p, 0)
  let r = azar() * total
  for (const [valor, peso] of pares) if ((r -= peso) < 0) return valor
  return pares[0][0]
}

const [minLng, minLat, maxLng, maxLat] = LIMITE_VES.bbox
function puntoAleatorio() {
  for (;;) {
    let lat, lng
    if (azar() < 0.6) {
      const [flat, flng] = elegir(FOCOS)
      lat = flat + (azar() - 0.5) * 0.006
      lng = flng + (azar() - 0.5) * 0.006
    } else {
      lat = minLat + azar() * (maxLat - minLat)
      lng = minLng + azar() * (maxLng - minLng)
    }
    if (puntoEnPoligono(lat, lng)) return [lat, lng]
  }
}

// Hora con más probabilidad de noche (18:00–02:00), como en la realidad.
function fechaAleatoria() {
  const fecha = new Date(Date.now() - azar() ** 1.5 * DIAS * 86_400_000)
  if (azar() < 0.6) fecha.setHours(18 + Math.floor(azar() * 8) % 24, Math.floor(azar() * 60))
  return fecha > new Date() ? new Date(Date.now() - azar() * 3_600_000) : fecha
}

try {
  await pool.query('DELETE FROM reportes WHERE es_demo = 1')
  if (SOLO_LIMPIAR) {
    console.log('✔ Reportes demo eliminados')
  } else {
    const filas = Array.from({ length: CANTIDAD }, () => {
      const tipo = ponderado(Object.entries(PESOS))
      const [lat, lng] = puntoAleatorio()
      return [
        tipo,
        ponderado(MODOS),
        `${elegir(DESCRIPCIONES[tipo])}.`,
        elegir(REFERENCIAS),
        lat.toFixed(6),
        lng.toFixed(6),
        fechaAleatoria(),
        azar() < 0.55 ? 'verificado' : 'pendiente',
        1,
      ]
    })
    await pool.query(
      'INSERT INTO reportes (tipo, modo, descripcion, referencia, lat, lng, fecha_hecho, estado, es_demo) VALUES ?',
      [filas],
    )
    console.log(`✔ ${CANTIDAD} reportes DEMO creados (marcados con es_demo = 1)`)
  }
} finally {
  await pool.end()
}
