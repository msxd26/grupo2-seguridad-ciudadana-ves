import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../../controllers/useAsync'
import { useLimite } from '../../../controllers/useLimite'
import { useEventos } from '../../../context/EventosContext'
import { fetchPanelCiudadano } from '../../../services/seguridadService'
import { formatNumero, formatVariacion } from '../../../models/estadisticas'
import { MODOS, colorTipo } from '../../../models/tipos'
import { NIVELES_ZONA } from '../../../models/mapa'
import MapaBase from '../mapa/MapaBase'
import CapaCalor from '../mapa/CapaCalor'
import KpiCard from './KpiCard'
import Tile from './Tile'
import ColumnChart from './ColumnChart'
import HBarList from './HBarList'
import '../../../assets/styles/mapa.css'

const PERIODOS = [7, 30, 90]
const fechaCorta = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', timeZone: 'UTC' })

function exportar(data) {
  const filas = [
    ['Panel municipal Tu Vecino - reportes vecinales', `Últimos ${data.dias} días`],
    [],
    ['Tipo', 'Reportes', '%'],
    ...data.porTipo.map((t) => [t.label, t.total, t.porcentaje]),
    [],
    ['Zona', 'Reportes', 'Tipo dominante', 'Acción sugerida', 'Lat', 'Lng'],
    ...data.topZonas.map((z) => [z.referencia, z.cantidad, z.tipoDominanteLabel, z.accion, z.lat.toFixed(5), z.lng.toFixed(5)]),
    [],
    ['Día', 'Reportes'],
    ...data.porDia.map((d) => [d.dia, d.total]),
  ]
  const csv = '﻿' + filas.map((f) => f.map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v)).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `tu-vecino_reportes_${data.dias}dias.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Dashboard municipal con los reportes vecinales (plan: KPIs, calor, tipos, línea de tiempo, top zonas).
export default function PanelCiudadano({ pestanas }) {
  const [dias, setDias] = useState(30)
  const limite = useLimite()
  const { data, error, cargando, recargar } = useAsync((signal) => fetchPanelCiudadano({ dias }, signal), [dias])
  const { suscribir } = useEventos()

  useEffect(() => suscribir((evento) => ['reporte', 'reporte-moderado', 'reporte-oculto'].includes(evento) && recargar()), [suscribir, recargar])

  const k = data?.kpis
  // Proporción de cada zona sobre el total del periodo (el funcionario entiende el peso relativo).
  const pct = (n) => (k?.total ? Math.round((n / k.total) * 100) : 0)
  const delta = k?.variacion !== null && k?.variacion !== undefined
    ? { sube: k.variacion > 0, malo: k.variacion > 0, texto: `${formatVariacion(k.variacion)} vs. ${dias} días anteriores` }
    : null

  return (
    <div className="pbi">
      {pestanas}
      <div className="pbi__bar">
        <div className="pbi__bar-inner">
          <div>
            <h1 className="pbi__title">Panel municipal · Reportes vecinales</h1>
            <p className="pbi__subtitle">Villa El Salvador · últimos {dias} días · se actualiza en tiempo real</p>
          </div>
          <div className="pbi__actions">
            <div className="pbi__periodos" role="group" aria-label="Periodo">
              {PERIODOS.map((d) => (
                <button key={d} type="button" className={d === dias ? 'pbi__btn pbi__btn--activo' : 'pbi__btn'} aria-pressed={d === dias} onClick={() => setDias(d)}>
                  {d} días
                </button>
              ))}
            </div>
            <button type="button" className="pbi__btn pbi__btn--primario" onClick={() => data && exportar(data)} disabled={!data}>Exportar CSV</button>
          </div>
        </div>
      </div>

      <div className={cargando && data ? 'pbi__canvas pbi__canvas--cargando pbi__canvas--completo' : 'pbi__canvas pbi__canvas--completo'}>
        {error ? <div className="pbi__error" role="alert">No se pudo cargar el panel: {error}</div> : null}
        {!data && !error ? <p>Cargando…</p> : null}

        {data ? (
          <>
            {data.hayDemo ? <p className="pbi__demo">Incluye reportes de demostración para la presentación.</p> : null}
            <div className="pbi__kpis pbi__kpis--5 pbi__kpis--6">
              <KpiCard label="Reportes vecinales" value={formatNumero(k.total)} delta={delta} detail={`Periodo anterior: ${formatNumero(k.totalPrevio)}`} />
              <KpiCard label="Zonas críticas" value={k.zonasCriticas} detail="3 o más reportes en ~330 m" />
              <KpiCard label="Tipo más frecuente" value={k.tipoPrincipal ? `${k.tipoPrincipal.porcentaje}%` : '—'} detail={k.tipoPrincipal?.label ?? 'Sin reportes'} />
              <KpiCard label="Hora más crítica" value={k.horaPico ? `${String(k.horaPico.hora).padStart(2, '0')}:00` : '—'} detail="Franja con más incidentes" />
              <KpiCard label="Inclusión digital (ODS 10)" value={k.total ? `${Math.round((k.accesibles / k.total) * 100)}%` : '—'} detail="Reportes por chat IA o paso a paso" />
              {/* "Pensar con IA": la comunidad calibra a la IA corrigiendo sus clasificaciones. */}
              <KpiCard
                label="IA calibrada por vecinos"
                value={k.iaReportes ? `${Math.round((k.iaCorregidos / k.iaReportes) * 100)}%` : '—'}
                detail={k.iaReportes ? `${k.iaCorregidos} de ${k.iaReportes} reportes del chat corregidos · confianza media ${k.iaConfianzaPromedio}%` : 'Aún sin reportes por chat'}
              />
            </div>

            <div className="pbi__grid">
              <Tile className="span-7" titulo="Mapa de calor" subtitulo="Densidad de reportes vecinales">
                <div className="pbi__mapa">
                  <MapaBase limite={limite} zoom={13} className="mapa">
                    <CapaCalor puntos={data.puntos} />
                  </MapaBase>
                </div>
              </Tile>

              <Tile className="span-5" titulo="Incidentes por tipo" tabla={{ caption: 'Por tipo', columns: [{ key: 'label', label: 'Tipo' }, { key: 'total', label: 'Reportes', numeric: true }, { key: 'porcentaje', label: '%', numeric: true }], rows: data.porTipo }}>
                <HBarList
                  items={data.porTipo.map((t) => ({ key: t.tipo, label: t.label, value: t.total, extra: `· ${t.porcentaje}%` }))}
                  ariaLabel="Reportes por tipo"
                  prefijo={(d) => <i className="punto-tipo" style={{ background: colorTipo(d.key) }} />}
                />
              </Tile>

              <Tile className="span-8" titulo="Línea de tiempo" subtitulo="Reportes por día" tabla={{ caption: 'Por día', columns: [{ key: 'dia', label: 'Día' }, { key: 'total', label: 'Reportes', numeric: true }], rows: data.porDia }}>
                <ColumnChart
                  items={data.porDia.map((d, i) => ({
                    key: d.dia,
                    label: i % Math.ceil(data.porDia.length / 10) === 0 ? fechaCorta.format(new Date(d.dia)) : '',
                    value: d.total,
                    tooltip: [fechaCorta.format(new Date(d.dia)), `${d.total} reporte${d.total === 1 ? '' : 's'}`],
                  }))}
                  ariaLabel="Reportes por día"
                  etiquetaValor="max"
                />
              </Tile>

              <Tile className="span-4" titulo="Canal de reporte" subtitulo="Cómo reportan los vecinos">
                <HBarList items={Object.entries(data.porModo).map(([modo, n]) => ({ key: modo, label: MODOS[modo], value: n }))} ariaLabel="Reportes por canal" compacto />
                <p className="tile__nota">Chat IA y paso a paso acercan el reporte a adultos mayores y personas con poca experiencia digital.</p>
              </Tile>

              <Tile className="span-5" titulo="Horas del día" subtitulo="¿A qué hora ocurren los incidentes?">
                <ColumnChart
                  items={data.porHora.map((h) => ({ key: h.hora, label: h.hora % 3 === 0 ? `${h.hora}h` : '', value: h.total, tooltip: [`${h.hora}:00 – ${h.hora}:59`, `${h.total} reportes`] }))}
                  ariaLabel="Reportes por hora"
                  etiquetaValor="max"
                />
              </Tile>

              <Tile className="span-7" titulo="Top 5 zonas con más incidentes" subtitulo="Dónde priorizar el serenazgo">
                {data.topZonas.length ? (
                  <div className="priority">
                    <table>
                      <thead>
                        <tr><th scope="col">Zona</th><th scope="col" className="num">Reportes</th><th scope="col">% del total</th><th scope="col">Tipo dominante</th><th scope="col">Acción sugerida</th></tr>
                      </thead>
                      <tbody>
                        {data.topZonas.map((z) => (
                          <tr key={z.id}>
                            <th scope="row">
                              <Link className="priority__link" to={`/mapa?lat=${z.lat}&lng=${z.lng}`}>
                                <i className="punto-tipo" style={{ background: NIVELES_ZONA[z.nivel].color }} /> {z.referencia || 'Ver en mapa'}
                              </Link>
                            </th>
                            <td className="num">{z.cantidad}</td>
                            <td>
                              <span className="porcentaje-zona">
                                <span className="porcentaje-zona__barra" aria-hidden="true"><span style={{ width: `${pct(z.cantidad)}%` }} /></span>
                                {pct(z.cantidad)}%
                              </span>
                            </td>
                            <td>{z.tipoDominanteLabel}</td>
                            <td>{z.accion}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="tile__nota">Sin reportes en este periodo.</p>}
              </Tile>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
