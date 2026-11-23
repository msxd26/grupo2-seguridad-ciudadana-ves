// Lectura mínima del CSV de denuncias (sin comillas ni comas internas).
export function parseDenunciasCsv(text) {
  const [header, ...lines] = text.trim().split(/\r?\n/)
  const columns = header.split(',')
  return lines.map((line) => {
    const values = line.split(',')
    return Object.fromEntries(columns.map((col, i) => [col, values[i]]))
  })
}
