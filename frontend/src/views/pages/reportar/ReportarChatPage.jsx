import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useChatReporte } from '../../../controllers/useChatReporte'
import { useDictado } from '../../../controllers/useDictado'
import { useLimite } from '../../../controllers/useLimite'
import { tipoDe } from '../../../models/tipos'
import { IconoEnviar, IconoMic, IconoMicOff } from '../../../models/iconos'
import UbicacionSelector from '../../components/reporte/UbicacionSelector'
import '../../../assets/styles/reportar.css'

const EJEMPLOS = ['Me siguieron en el Jr. Paraíso hace un rato', 'Hay un poste apagado en mi cuadra', 'Intentaron robarme el celular en el paradero']

function Burbuja({ mensaje }) {
  const t = mensaje.deteccion ? tipoDe(mensaje.deteccion.tipo) : null
  return (
    <div className={mensaje.role === 'user' ? 'burbuja-chat burbuja-chat--yo' : 'burbuja-chat burbuja-chat--bot'}>
      {mensaje.role === 'assistant' ? <span className="burbuja-chat__avatar" aria-hidden="true">🏘️</span> : null}
      <div className="burbuja-chat__contenido">
        <p>{mensaje.content}</p>
        {t ? (
          <ul className="deteccion">
            <li><span>Tipo</span><strong style={{ color: t.color }}><t.Icono size={16} aria-hidden="true" /> {t.label}</strong></li>
            {mensaje.deteccion.zona ? <li><span>Zona</span><strong>{mensaje.deteccion.zona}</strong></li> : null}
          </ul>
        ) : null}
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
        {chat.pensando ? <div className="burbuja-chat burbuja-chat--bot"><span className="burbuja-chat__avatar" aria-hidden="true">🏘️</span><div className="burbuja-chat__contenido escribiendo"><span /><span /><span /></div></div> : null}

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
              {chat.envio.enviando ? 'Enviando…' : 'Enviar reporte'}
            </button>
          </div>
        ) : null}

        {enviado ? (
          <div className="chat__acciones">
            <Link className="btn-chat btn-chat--si" to={`/mapa?lat=${enviado.lat}&lng=${enviado.lng}`}>Ver en el mapa</Link>
            <button type="button" className="btn-chat" onClick={chat.reiniciar}>Hacer otro reporte</button>
          </div>
        ) : null}
        <div ref={finRef} />
      </div>

      {chat.error ? <div className="form-error" role="alert">{chat.error}</div> : null}
      {dictado.error ? <div className="form-error" role="alert">{dictado.error}</div> : null}

      {chat.fase === 'conversando' && chat.mensajes.length === 1 ? (
        <div className="chat__ejemplos">
          <span>Prueba con:</span>
          {EJEMPLOS.map((ej) => <button key={ej} type="button" onClick={() => setTexto(ej)}>“{ej}”</button>)}
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
