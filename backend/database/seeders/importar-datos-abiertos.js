// Descarga los CSV oficiales de MININTER desde la Plataforma Nacional de Datos Abiertos
// y regenera data/denuncias_lima_mininter.csv con los 43 distritos de Lima Metropolitana.
// Uso: npm run datos:actualizar  (luego: npm run db:seed)
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const BASE_URL = 'https://www.datosabiertos.gob.pe/sites/default/files/DATASET_Denuncias%20Policiales_'
const PRIMER_ANIO = 2018
const ULTIMO_ANIO = new Date().getFullYear()
const PREFIJO_LIMA = '1501' // ubigeo de la provincia de Lima
const OUTPUT = join(import.meta.dirname, 'data', 'denuncias_lima_mininter.csv')
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

let header = null
const filas = []
for (let anio = PRIMER_ANIO; anio <= ULTIMO_ANIO; anio++) {
  const texto = await descargar(anio)
  if (!texto) continue
  const [cabecera, ...lineas] = texto.trim().split(/\r?\n/)
  header ??= cabecera
  const idxUbigeo = cabecera.split(',').indexOf('UBIGEO_HECHO')
  for (const linea of lineas) {
    const ubigeo = linea.split(',')[idxUbigeo]?.padStart(6, '0')
    if (ubigeo?.startsWith(PREFIJO_LIMA)) filas.push(linea)
  }
}

if (!header) throw new Error('No se pudo descargar ningún archivo del portal.')

await writeFile(OUTPUT, [header, ...filas].join('\n') + '\n', 'utf8')
console.log(`✔ ${filas.length} filas de Lima Metropolitana guardadas en ${OUTPUT}`)
