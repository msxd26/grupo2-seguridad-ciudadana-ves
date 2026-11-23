package pe.jsaire.seguridad.data.remote

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.KSerializer
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.nullable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import pe.jsaire.seguridad.data.Preferencias
import pe.jsaire.seguridad.data.model.Alerta
import pe.jsaire.seguridad.data.model.Comisaria
import pe.jsaire.seguridad.data.model.DatosMapa
import pe.jsaire.seguridad.data.model.MensajeChat
import pe.jsaire.seguridad.data.model.NuevoReporte
import pe.jsaire.seguridad.data.model.Recomendacion
import pe.jsaire.seguridad.data.model.Reporte
import pe.jsaire.seguridad.data.model.RespuestaChat
import pe.jsaire.seguridad.data.model.TipoIncidente
import pe.jsaire.seguridad.data.model.Usuario
import pe.jsaire.seguridad.data.model.Votos
import java.io.IOException

/** Error devuelto por la API (`{ ok:false, error, detalles }`) o de red. */
class ApiException(
    message: String,
    val status: Int = 0,
    val detalles: Map<String, String> = emptyMap(),
) : Exception(message)

val JsonApi = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
    coerceInputValues = true
    isLenient = true
}

/**
 * Cliente de la API REST de Tu Vecino (backend/src/routes/index.js).
 * Todas las respuestas siguen el formato `{ ok, data }` de apiView.
 */
class TuVecinoApi(
    private val prefs: Preferencias,
    private val client: OkHttpClient,
) {
    private val tipoJson = "application/json; charset=utf-8".toMediaType()

    private fun url(ruta: String) = "${prefs.servidor}/api$ruta"

    private suspend fun <T> llamar(
        metodo: String,
        ruta: String,
        serializer: KSerializer<T>,
        cuerpo: String? = null,
    ): T = withContext(Dispatchers.IO) {
        val body: RequestBody? = when {
            cuerpo != null -> cuerpo.toRequestBody(tipoJson)
            metodo == "POST" -> "{}".toRequestBody(tipoJson)
            else -> null
        }
        val request = Request.Builder().url(url(ruta)).method(metodo, body).header("Accept", "application/json").build()
        val respuesta = try {
            client.newCall(request).execute()
        } catch (e: IOException) {
            throw ApiException("No se pudo conectar con el servidor (${prefs.servidor}). Revisa tu conexión o la dirección en Ajustes.")
        }
        respuesta.use { r ->
            val texto = r.body?.string().orEmpty()
            val json = runCatching { JsonApi.parseToJsonElement(texto).jsonObject }.getOrNull()
                ?: throw ApiException("Respuesta inesperada del servidor (HTTP ${r.code})", r.code)
            val ok = json["ok"]?.jsonPrimitive?.booleanOrNull == true
            if (!r.isSuccessful || !ok) throw errorDesde(json, r.code)
            JsonApi.decodeFromJsonElement(serializer, json["data"] ?: JsonNull)
        }
    }

    private fun errorDesde(json: JsonObject, status: Int): ApiException {
        val mensaje = json["error"]?.jsonPrimitive?.contentOrNull ?: "Error del servidor (HTTP $status)"
        val detalles = (json["detalles"] as? JsonObject)
            ?.mapValues { it.value.jsonPrimitive.contentOrNull.orEmpty() }
            .orEmpty()
        return ApiException(mensaje, status, detalles)
    }

    private inline fun <reified T> cuerpo(valor: T) = JsonApi.encodeToString(valor)

    // --- Sesión ---------------------------------------------------------------------------------
    suspend fun yo(): Usuario? = llamar("GET", "/auth/me", Usuario.serializer().nullable)

    suspend fun login(email: String, password: String): Usuario =
        llamar("POST", "/auth/login", Usuario.serializer(), cuerpo(mapOf("email" to email, "password" to password)))

    suspend fun registro(nombre: String, email: String, password: String): Usuario =
        llamar(
            "POST", "/auth/registro", Usuario.serializer(),
            cuerpo(mapOf("nombre" to nombre, "email" to email, "password" to password)),
        )

    suspend fun logout() {
        llamar("POST", "/auth/logout", Unit.serializer().nullable)
    }

    // --- Datos públicos ---------------------------------------------------------------------------
    suspend fun health(): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            client.newCall(Request.Builder().url(url("/health")).build()).execute().use { it.isSuccessful }
        }.getOrDefault(false)
    }

    suspend fun tipos(): List<TipoIncidente> = llamar("GET", "/reportes/tipos", ListSerializer(TipoIncidente.serializer()))

    suspend fun mapa(dias: Int, tipos: List<String> = emptyList()): DatosMapa {
        val filtro = if (tipos.isEmpty()) "" else "&tipos=${tipos.joinToString(",")}"
        return llamar("GET", "/mapa?dias=$dias$filtro", DatosMapa.serializer())
    }

    suspend fun alertas(): List<Alerta> = llamar("GET", "/alertas", ListSerializer(Alerta.serializer()))

    suspend fun recomendacion(lat: Double, lng: Double): Recomendacion =
        llamar("GET", "/recomendacion?lat=$lat&lng=$lng", Recomendacion.serializer())

    suspend fun comisarias(): List<Comisaria> = llamar("GET", "/comisarias", ListSerializer(Comisaria.serializer()))

    // --- Reportes ciudadanos ------------------------------------------------------------------------
    suspend fun crearReporte(reporte: NuevoReporte): Reporte =
        llamar("POST", "/reportes", Reporte.serializer(), cuerpo(reporte))

    suspend fun misReportes(): List<Reporte> = llamar("GET", "/reportes/mios", ListSerializer(Reporte.serializer()))

    suspend fun chat(mensajes: List<MensajeChat>): RespuestaChat =
        llamar("POST", "/reportes/chat", RespuestaChat.serializer(), cuerpo(mapOf("mensajes" to mensajes)))

    suspend fun confirmar(id: Int): Votos = llamar("POST", "/reportes/$id/confirmar", Votos.serializer())

    suspend fun marcarFalso(id: Int): Votos = llamar("POST", "/reportes/$id/marcar", Votos.serializer())
}
