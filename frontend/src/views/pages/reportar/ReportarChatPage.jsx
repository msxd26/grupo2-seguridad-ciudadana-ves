import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { UMBRAL_CONFIANZA, useChatReporte } from '../../../controllers/useChatReporte'
import { useDictado } from '../../../controllers/useDictado'
import { useLimite } from '../../../controllers/useLimite'
import { tipoDe } from '../../../models/tipos'
import { IconoEnviar, IconoMic, IconoMicOff } from '../../../models/iconos'
import UbicacionSelector from '../../components/reporte/UbicacionSelector'
import ReporteEnviado from '../../components/reporte/ReporteEnviado'
import '../../../assets/styles/reportar.css'

const EJEMPLOS = ['Me siguieron en el Jr. Paraíso hace un rato', 'Hay un poste apagado en mi cuadra', 'Intentaron robarme el celular en el paradero']

// Lo que la IA "va pensando" mientras clasifica: hace visible su razonamiento.
const PASOS_PENSANDO = ['Leyendo tu mensaje…', 'Identificando el tipo de incidente…', 'Detectando la zona…', 'Preparando la clasificación…']

const nivelConfianza = (c) => (c >= 80 ? 'alta' : c >= 60 ? 'media' : 'baja')
const TEXTO_NIVEL = { alta: 'Bastante seguro', media: 'Algo seguro', baja: 'Con dudas' }

function Deteccion({ deteccion }) {
  const t = tipoDe(deteccion.tipo)
  const nivel = nivelConfianza(deteccion.confianza)
  return (
    <ul className="deteccion" aria-label="Lo que detectó la IA">
      <li><span>Detecté</span><strong style={{ color: t.texto }}><t.Icono size={16} aria-hidden="true" /> {t.label}</strong></li>
      {deteccion.zona ? <li><span>Zona</span><strong>📍 {deteccion.zona}</strong></li> : null}
      <li className="deteccion__confianza">
        <div className="deteccion__confianza-fila">
          <span>Confianza de la IA</span>
          <strong className={`deteccion__nivel--${nivel}`}>{deteccion.confianza}% · {TEXTO_NIVEL[nivel]}</strong>
        </div>
        <div
          className={`confianza confianza--${nivel}`}
          role="meter"
          aria-valuenow={deteccion.confianza}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confianza de la IA: ${deteccion.confianza}%`}
        >
          <span style={{ width: `${deteccion.confianza}%` }} />
        </div>
        {deteccion.duda ? <p className="deteccion__nota">Tengo menos de {UMBRAL_CONFIANZA}% de certeza: respóndeme para estar seguros.</p> : null}
      </li>
    </ul>
  )
}

function Burbuja({ mensaje }) {
  return (
    <div className={mensaje.role === 'user' ? 'burbuja-chat burbuja-chat--yo' : 'burbuja-chat burbuja-chat--bot'}>
      {mensaje.role === 'assistant' ? <span className="burbuja-chat__avatar" aria-hidden="true">🏘️</span> : null}
      <div className="burbuja-chat__contenido">
        <p>{mensaje.content}</p>
        {mensaje.deteccion ? <Deteccion deteccion={mensaje.deteccion} /> : null}
      </div>
    </div>
  )
}

// Con "reducir movimiento" activado se muestra solo el primer texto, sin rotar.
const reducirMovimiento = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function Pensando() {
  const [paso, setPaso] = useState(0)
  useEffect(() => {
    if (reducirMovimiento()) return undefined
    const id = setInterval(() => setPaso((p) => Math.min(p + 1, PASOS_PENSANDO.length - 1)), 800)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="burbuja-chat burbuja-chat--bot">
      <span className="burbuja-chat__avatar" aria-hidden="true">🏘️</span>
      <div className="burbuja-chat__contenido pensando">
        <span className="spinner" aria-hidden="true" />
        <span key={paso} className="pensando__texto">{PASOS_PENSANDO[paso]}</span>
      </div>
    </div>
  )
}

// Modo 2: chat conversacional con IA (Groq o clasificador local).
export default function ReportarChatPage() {
  const limite = useLimite()
  const chat = useChatReporte()
  const [texto, setTexto] = useState('')
  const dictado = useDictado((dicho) => setTexto((t) => (t ? `${t} ${dicho}` : dicho)))
  const finRef = useRef(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [chat.mensajes.length, chat.fase, chat.pensando])

  const enviar = (e) => {
    e?.preventDefault()
    chat.enviarMensaje(texto)
    setTexto('')
  }

  const enviado = chat.envio.enviado

  return (
    <section className="reportar container chat">
      <Link to="/reportar" className="volver">← Cambiar forma de reportar</Link>
      <header className="chat__header">
        <h1>Cuéntame qué pasó</h1>
        <p>Escribe o dicta en tus palabras. Te ayudo a completar el reporte.</p>
      </header>

      <div className="chat__ventana" aria-live="polite">
        {chat.mensajes.map((m, i) => <Burbuja key={i} mensaje={m} />)}
        {chat.pensando ? <Pensando /> : null}

        {chat.fase === 'confirmar' && !chat.pensando ? (
          <div className="chat__acciones">
            <button type="button" className="btn-chat btn-chat--si" onClick={chat.confirmar}>✅ Sí, correcto</button>
            <button type="button" className="btn-chat" onClick={chat.corregir}>✏️ Corregir</button>
          </div>
        ) : null}

        {chat.fase === 'ubicacion' && !enviado ? (
          <div className="chat__ubicacion">
            <UbicacionSelector limite={limite} valor={chat.ubicacion} onCambiar={chat.setUbicacion} altura={260} error={chat.envio.errores.ubicacion} />
            {chat.envio.error && !chat.envio.errores.ubicacion ? <div className="form-error" role="alert">{chat.envio.error}</div> : null}
            <button type="button" className="btn btn--alert boton-enviar" disabled={!chat.ubicacion || chat.envio.enviando} onClick={chat.enviarReporte}>
              {chat.envio.enviando ? 'Enviando…' : chat.envio.error ? 'Reintentar envío' : 'Enviar reporte'}
            </button>
          </div>
        ) : null}

        {enviado ? (
          <div className="chat__enviado">
            <ReporteEnviado reporte={enviado} onOtro={chat.reiniciar} dentroDeChat />
          </div>
        ) : null}
        <div ref={finRef} />
      </div>

      {chat.error ? <div className="form-error" role="alert">{chat.error}</div> : null}
      {dictado.error ? <div className="form-error" role="alert">{dictado.error}</div> : null}

      {chat.fase === 'conversando' && chat.mensajes.length === 1 ? (
        <div className="chat__ejemplos">
          <span>Prueba con:</span>
          {EJEMPLOS.map((ej) => (
            <button key={ej} type="button" onClick={() => setTexto(ej)} aria-label={`Usar el ejemplo: ${ej}`}>“{ej}”</button>
          ))}
        </div>
      ) : null}

      {chat.fase === 'conversando' ? (
        <form className="chat__entrada" onSubmit={enviar}>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={dictado.escuchando ? 'Te escucho…' : 'Escribe aquí lo que pasó…'}
            maxLength={600}
            aria-label="Mensaje"
            autoFocus
          />
          {dictado.disponible ? (
            <button type="button" className={dictado.escuchando ? 'chat__mic chat__mic--activo' : 'chat__mic'} onClick={dictado.alternar} aria-label={dictado.escuchando ? 'Detener dictado' : 'Dictar por voz'} aria-pressed={dictado.escuchando}>
              {dictado.escuchando ? <IconoMicOff size={22} /> : <IconoMic size={22} />}
            </button>
          ) : null}
          <button type="submit" className="chat__enviar" disabled={!texto.trim() || chat.pensando} aria-label="Enviar">
            <IconoEnviar size={20} />
          </button>
        </form>
      ) : null}
    </section>
  )
}
