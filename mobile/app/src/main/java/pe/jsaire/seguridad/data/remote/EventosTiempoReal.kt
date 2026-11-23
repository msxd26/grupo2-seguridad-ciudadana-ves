package pe.jsaire.seguridad.data.remote

import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.retryWhen
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import pe.jsaire.seguridad.data.Preferencias
import pe.jsaire.seguridad.data.model.IdSolo
import pe.jsaire.seguridad.data.model.Presencia
import pe.jsaire.seguridad.data.model.Reporte
import pe.jsaire.seguridad.data.model.Votos
import java.io.IOException
import java.util.concurrent.TimeUnit

/** Eventos que el backend emite por Server-Sent Events en /api/eventos (utils/eventos.js). */
sealed interface EventoTiempoReal {
    data class NuevoReporte(val reporte: Reporte) : EventoTiempoReal
    data class ReporteActualizado(val votos: Votos) : EventoTiempoReal
    data class ReporteOculto(val id: Int) : EventoTiempoReal
    data class Conectados(val total: Int) : EventoTiempoReal
}

class EventosTiempoReal(private val prefs: Preferencias, base: OkHttpClient) {
    // Conexión larga: sin límite de lectura (el servidor manda un latido cada 25 s).
    private val client = base.newBuilder().readTimeout(0, TimeUnit.MILLISECONDS).build()

    /** Flujo de eventos; se reconecta solo cada 5 s si se cae la conexión. */
    fun flujo(): Flow<EventoTiempoReal> = callbackFlow {
        val request = Request.Builder().url("${prefs.servidor}/api/eventos").header("Accept", "text/event-stream").build()
        val listener = object : EventSourceListener() {
            override fun onEvent(eventSource: EventSource, id: String?, type: String?, data: String) {
                val evento = runCatching {
                    when (type) {
                        "reporte" -> EventoTiempoReal.NuevoReporte(JsonApi.decodeFromString(Reporte.serializer(), data))
                        "reporte-actualizado" -> EventoTiempoReal.ReporteActualizado(JsonApi.decodeFromString(Votos.serializer(), data))
                        "reporte-oculto" -> EventoTiempoReal.ReporteOculto(JsonApi.decodeFromString(IdSolo.serializer(), data).id)
                        "presencia" -> EventoTiempoReal.Conectados(JsonApi.decodeFromString(Presencia.serializer(), data).conectados)
                        else -> null
                    }
                }.getOrNull()
                if (evento != null) trySend(evento)
            }

            override fun onFailure(eventSource: EventSource, t: Throwable?, response: Response?) {
                close(t ?: IOException("Canal de eventos cerrado (HTTP ${response?.code})"))
            }

            override fun onClosed(eventSource: EventSource) {
                close(IOException("Canal de eventos cerrado"))
            }
        }
        val fuente = EventSources.createFactory(client).newEventSource(request, listener)
        awaitClose { fuente.cancel() }
    }.retryWhen { _, _ ->
        delay(5_000)
        true
    }
}
