package pe.jsaire.seguridad.data.remote

import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.retryWhen
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import pe.jsaire.seguridad.data.Preferencias
import pe.jsaire.seguridad.data.model.IdSolo
import pe.jsaire.seguridad.data.model.Presencia
import pe.jsaire.seguridad.data.model.Reporte
import pe.jsaire.seguridad.data.model.Votos
import java.io.IOException
import java.util.concurrent.TimeUnit
import kotlin.math.min

/** Eventos que el backend envía por WebSocket en /api/ws (backend/src/utils/tiempoReal.js). */
sealed interface EventoTiempoReal {
    data class NuevoReporte(val reporte: Reporte) : EventoTiempoReal
    data class ReporteActualizado(val votos: Votos) : EventoTiempoReal
    data class ReporteOculto(val id: Int) : EventoTiempoReal
    /** Un moderador verificó, descartó o devolvió a pendiente un reporte (llega a todos). */
    data class ReporteModerado(val moderado: Moderado) : EventoTiempoReal
    /** Aviso privado: moderaron un reporte mío (solo llega al autor, identificado por la cookie). */
    data class MiReporte(val aviso: AvisoMiReporte) : EventoTiempoReal
    data class Conectados(val total: Int) : EventoTiempoReal
    /** El servidor anuncia una ráfaga de reportes (iniciada / terminada): se agrupan en un solo aviso. */
    data class Rafaga(val datos: DatosRafaga) : EventoTiempoReal
}

@Serializable
data class DatosRafaga(val cantidad: Int = 0, val estado: String)

@Serializable
data class Moderado(val id: Int, val estado: String, val oculto: Boolean = false)

@Serializable
data class AvisoMiReporte(val id: Int, val tipo: String, val estado: String, val comentarioAdmin: String? = null)

class EventosTiempoReal(private val prefs: Preferencias, base: OkHttpClient) {
    // Conexión larga: sin límite de lectura y con ping cada 25 s para que no la corten los proxies.
    // Comparte el CookieJar del cliente base: el servidor reconoce la sesión para los avisos privados.
    private val client = base.newBuilder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .pingInterval(25, TimeUnit.SECONDS)
        .build()

    /** http(s)://servidor → ws(s)://servidor/api/ws */
    private fun urlWs(): String = prefs.servidor.replaceFirst(Regex("^http"), "ws") + "/api/ws"

    /** Flujo de eventos en vivo; se reconecta solo con espera creciente (1 s, 2 s, 4 s… hasta 15 s). */
    fun flujo(): Flow<EventoTiempoReal> = callbackFlow {
        val listener = object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                val evento = runCatching { decodificar(text) }.getOrNull()
                if (evento != null) trySend(evento)
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                close(IOException("Tiempo real desconectado (${response?.code ?: t.message})", t))
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                close(IOException("Tiempo real cerrado ($code)"))
            }
        }
        val socket = client.newWebSocket(Request.Builder().url(urlWs()).build(), listener)
        awaitClose { socket.close(1000, null) }
    }.retryWhen { _, intento ->
        delay(min(15_000L, 1_000L shl intento.toInt().coerceAtMost(4)))
        true
    }

    /** Mensajes del servidor: {"tipo": "...", "datos": {...}} */
    private fun decodificar(texto: String): EventoTiempoReal? {
        val mensaje: JsonObject = JsonApi.parseToJsonElement(texto).jsonObject
        val tipo = mensaje["tipo"]?.jsonPrimitive?.content ?: return null
        val datos: JsonElement = mensaje["datos"] ?: return null
        return when (tipo) {
            "reporte" -> EventoTiempoReal.NuevoReporte(JsonApi.decodeFromJsonElement(Reporte.serializer(), datos))
            "reporte-actualizado" -> EventoTiempoReal.ReporteActualizado(JsonApi.decodeFromJsonElement(Votos.serializer(), datos))
            "reporte-oculto" -> EventoTiempoReal.ReporteOculto(JsonApi.decodeFromJsonElement(IdSolo.serializer(), datos).id)
            "reporte-moderado" -> EventoTiempoReal.ReporteModerado(JsonApi.decodeFromJsonElement(Moderado.serializer(), datos))
            "mi-reporte" -> EventoTiempoReal.MiReporte(JsonApi.decodeFromJsonElement(AvisoMiReporte.serializer(), datos))
            "rafaga" -> EventoTiempoReal.Rafaga(JsonApi.decodeFromJsonElement(DatosRafaga.serializer(), datos))
            "presencia", "bienvenida" ->
                EventoTiempoReal.Conectados(JsonApi.decodeFromJsonElement(Presencia.serializer(), datos).conectados)
            else -> null
        }
    }
}
