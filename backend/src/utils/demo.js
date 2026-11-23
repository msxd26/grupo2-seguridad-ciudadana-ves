// Generador de reportes DE DEMOSTRACIÓN (usado por el seeder y por la simulación en vivo).
// Siempre se guardan con es_demo = 1 y la interfaz los marca como "DEMO".
import { LIMITE_VES, puntoEnPoligono } from './geo.js'

export const DESCRIPCIONES = {
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
const FOCOS = [[-12.2131, -76.9379], [-12.2010, -76.9445], [-12.2265, -76.9300], [-12.2180, -76.9550], [-12.2075, -76.9300]]

// Generador pseudoaleatorio con semilla opcional (la demo del seeder es reproducible).
export function crearAzar(semilla = Date.now() % 2 ** 32) {
  let s = semilla
  return () => ((s = (s * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32)
}

function ponderado(pares, azar) {
  const total = pares.reduce((a, [, p]) => a + p, 0)
  let r = azar() * total
  for (const [valor, peso] of pares) if ((r -= peso) < 0) return valor
  return pares[0][0]
}

function puntoAleatorio(azar) {
  const [minLng, minLat, maxLng, maxLat] = LIMITE_VES.bbox
  for (;;) {
    let lat, lng
    if (azar() < 0.6) {
      const [flat, flng] = FOCOS[Math.floor(azar() * FOCOS.length)]
      lat = flat + (azar() - 0.5) * 0.006
      lng = flng + (azar() - 0.5) * 0.006
    } else {
      lat = minLat + azar() * (maxLat - minLat)
      lng = minLng + azar() * (maxLng - minLng)
    }
    if (puntoEnPoligono(lat, lng)) return [lat, lng]
  }
}

// Devuelve los datos de un reporte demo listo para insertar.
export function generarReporteDemo(azar, fechaHecho = new Date()) {
  const tipo = ponderado(Object.entries(PESOS), azar)
  const [lat, lng] = puntoAleatorio(azar)
  const lista = DESCRIPCIONES[tipo]
  const modo = ponderado(MODOS, azar)
  // Los reportes por chat llevan la confianza de la IA y si el vecino la corrigió (~1 de cada 5).
  const chat = modo === 'chat'
  return {
    tipo,
    modo,
    iaConfianza: chat ? 55 + Math.floor(azar() * 44) : null,
    iaCorregido: chat && azar() < 0.2,
    descripcion: `${lista[Math.floor(azar() * lista.length)]}.`,
    referencia: REFERENCIAS[Math.floor(azar() * REFERENCIAS.length)],
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    fechaHecho,
  }
}
