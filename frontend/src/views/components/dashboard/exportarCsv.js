import { MESES } from '../../../models/estadisticas'

const escapar = (v) => {
  const s = String(v ?? '')
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// Descarga los datos del panel filtrado en CSV (abre en Excel).
export function exportarCsv(data) {
  const { filtros, periodo, serieMensual, porModalidad } = data
  const lineas = [
    ['Panel de decisión – Alerta VES'],
    ['Distrito', filtros.distrito.nombre],
    ['Periodo', periodo],
    ['Modalidades', filtros.modalidades.length ? filtros.modalidades.join(' | ') : 'Todas'],
    ['Fuente', `${data.fuente.entidad} – ${data.fuente.sistema}`],
    [],
    ['Año', 'Mes', 'Denuncias', 'Promedio móvil 3 meses'],
    ...serieMensual.map((p) => [p.anio, MESES[p.mes - 1], p.total, p.promedioMovil ?? '']),
    [],
    ['Modalidad', 'Denuncias', '% del total', 'Denuncias periodo anterior', 'Variación %', 'Prioridad'],
    ...porModalidad.map((m) => [m.modalidad, m.total, m.participacion, m.totalPrevio ?? '', m.variacion ?? '', m.prioridad ?? '']),
  ]
  const csv = '﻿' + lineas.map((l) => l.map(escapar).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `alerta-ves_${filtros.distrito.nombre.replace(/\s+/g, '-').toLowerCase()}_${filtros.desde}-${filtros.hasta}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
