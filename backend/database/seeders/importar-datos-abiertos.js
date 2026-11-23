// Descarga los CSV oficiales de MININTER desde la Plataforma Nacional de Datos Abiertos
// y regenera data/denuncias_ves_mininter.csv solo con Villa El Salvador (ubigeo 150142).
// Uso: npm run datos:actualizar
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { FUENTE_DENUNCIAS } from '../../src/config/fuente.js'

const BASE_URL = 'https://www.datosabiertos.gob.pe/sites/default/files/DATASET_Denuncias%20Policiales_'
const PRIMER_ANIO = 2018
const ULTIMO_ANIO = new Date().getFullYear()
const OUTPUT = join(import.meta.dirname, 'data', 'denuncias_ves_mininter.csv')

const anios = Array.from({ length: ULTIMO_ANIO - PRIMER_ANIO + 1 }, (_, i) => PRIMER_ANIO + i)

const INTENTOS = 4

// El portal es lento y corta conexiones simultáneas: se descarga año por año con reintentos.
async function descargar(anio) {
  for (let intento = 1; intento <= INTENTOS; intento++) {
    try {
      const res = await fetch(`${BASE_URL}${anio}.csv`, { signal: AbortSignal.timeout(120_000) })
      if (res.status === 404) {
        console.warn(`⚠ ${anio}: no publicado todavía`)
        return null
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const texto = await res.text()
      console.log(`✔ ${anio} descargado`)
      return texto
    } catch (err) {
      console.warn(`… ${anio}: intento ${intento}/${INTENTOS} falló (${err.cause?.code ?? err.message})`)
      await new Promise((r) => setTimeout(r, 2000 * intento))
    }
  }
  throw new Error(`No se pudo descargar ${anio} tras ${INTENTOS} intentos; el CSV actual no se modificó.`)
}

const resultados = []
for (const anio of anios) resultados.push(await descargar(anio))

let header = null
const filas = []
for (const texto of resultados) {
  if (!texto) continue
  const [cabecera, ...lineas] = texto.trim().split(/\r?\n/)
  header ??= cabecera
  const idxUbigeo = cabecera.split(',').indexOf('UBIGEO_HECHO')
  for (const linea of lineas) {
    if (linea.split(',')[idxUbigeo]?.padStart(6, '0') === FUENTE_DENUNCIAS.ubigeo) filas.push(linea)
  }
}

if (!header) throw new Error('No se pudo descargar ningún archivo del portal.')

await writeFile(OUTPUT, [header, ...filas].join('\n') + '\n', 'utf8')
console.log(`✔ ${filas.length} filas de ${FUENTE_DENUNCIAS.distrito} guardadas en ${OUTPUT}`)
console.log('  Ejecuta "npm run db:seed" para cargarlas en MySQL.')
