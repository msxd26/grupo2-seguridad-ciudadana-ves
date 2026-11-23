// Lectura mínima de CSV (los archivos oficiales usados no tienen comillas ni comas internas).
export function parseCsv(text) {
  const [header, ...lines] = text.trim().split(/\r?\n/)
  const columns = header.split(',')
  return lines.map((line) => {
    const values = line.split(',')
    return Object.fromEntries(columns.map((col, i) => [col, values[i]]))
  })
}
