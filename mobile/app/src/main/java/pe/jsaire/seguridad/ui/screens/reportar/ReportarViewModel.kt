package pe.jsaire.seguridad.ui.screens.reportar

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.model.MensajeChat
import pe.jsaire.seguridad.data.model.NuevoReporte
import pe.jsaire.seguridad.data.model.Reporte
import pe.jsaire.seguridad.data.model.RespuestaChat
import pe.jsaire.seguridad.data.remote.ApiException
import pe.jsaire.seguridad.util.Fechas
import pe.jsaire.seguridad.util.Punto
import java.time.Duration
import java.time.Instant

/** Cuándo ocurrió el hecho (el backend acepta hasta 30 días atrás). */
enum class Cuando(val etiqueta: String, val haceHoras: Long) {
    AHORA("Ahora mismo", 0),
    HACE_1H("Hace una hora", 1),
    HOY("Hoy, más temprano", 4),
    AYER("Ayer", 24),
    SEMANA("Esta semana", 72),
}

enum class Modo(val api: String) { GUIADO("guiado"), CHAT("chat"), FORMULARIO("formulario") }

enum class Pantalla { ELEGIR_MODO, GUIADO_TIPO, GUIADO_CUANDO, UBICACION, CONFIRMAR, CHAT, FORMULARIO, EXITO }

data class Borrador(
    val tipo: String? = null,
    val descripcion: String = "",
    val referencia: String = "",
    val ubicacion: Punto? = null,
    val cuando: Cuando = Cuando.AHORA,
)

data class EstadoReportar(
    val pantalla: Pantalla = Pantalla.ELEGIR_MODO,
    val modo: Modo = Modo.GUIADO,
    val borrador: Borrador = Borrador(),
    val enviando: Boolean = false,
    val error: String? = null,
    val errores: Map<String, String> = emptyMap(),
    val creado: Reporte? = null,
    // Chat con IA
    val mensajes: List<MensajeChat> = emptyList(),
    val pensando: Boolean = false,
    val propuesta: RespuestaChat? = null,
)

class ReportarViewModel(private val c: AppContainer) : ViewModel() {
    private val _estado = MutableStateFlow(EstadoReportar())
    val estado: StateFlow<EstadoReportar> = _estado.asStateFlow()

    private fun borrador(cambio: (Borrador) -> Borrador) =
        _estado.update { it.copy(borrador = cambio(it.borrador), errores = emptyMap(), error = null) }

    fun irA(pantalla: Pantalla) = _estado.update { it.copy(pantalla = pantalla, error = null) }

    fun elegirModo(modo: Modo) {
        val inicio = when (modo) {
            Modo.GUIADO -> Pantalla.GUIADO_TIPO
            Modo.CHAT -> Pantalla.CHAT
            Modo.FORMULARIO -> Pantalla.FORMULARIO
        }
        val saludo = if (modo == Modo.CHAT) listOf(
            MensajeChat("assistant", "¡Hola, vecino/a! Cuéntame qué pasó y por dónde fue. Puedes escribir o dictar con el micrófono."),
        ) else emptyList()
        _estado.value = EstadoReportar(pantalla = inicio, modo = modo, mensajes = saludo)
    }

    /** Botón "atrás" interno del asistente. Devuelve false si ya está en el inicio. */
    fun atras(): Boolean {
        val e = _estado.value
        val anterior = when (e.pantalla) {
            Pantalla.ELEGIR_MODO -> return false
            Pantalla.GUIADO_TIPO, Pantalla.CHAT, Pantalla.FORMULARIO, Pantalla.EXITO -> Pantalla.ELEGIR_MODO
            Pantalla.GUIADO_CUANDO -> Pantalla.GUIADO_TIPO
            Pantalla.UBICACION -> if (e.modo == Modo.CHAT) Pantalla.CHAT else Pantalla.GUIADO_CUANDO
            Pantalla.CONFIRMAR -> Pantalla.UBICACION
        }
        irA(anterior)
        return true
    }

    fun tipo(id: String) = borrador { it.copy(tipo = id) }
    fun descripcion(t: String) = borrador { it.copy(descripcion = t.take(500)) }
    fun referencia(t: String) = borrador { it.copy(referencia = t.take(200)) }
    fun ubicacion(p: Punto) = borrador { it.copy(ubicacion = p) }
    fun cuando(c: Cuando) = borrador { it.copy(cuando = c) }

    // --- Chat ----------------------------------------------------------------------------------
    fun enviarMensaje(texto: String) {
        val limpio = texto.trim()
        if (limpio.isEmpty() || _estado.value.pensando) return
        val historial = _estado.value.mensajes + MensajeChat("user", limpio)
        _estado.update { it.copy(mensajes = historial, pensando = true, propuesta = null, error = null) }
        viewModelScope.launch {
            runCatching { c.api.chat(historial.drop(1)) } // el saludo inicial es local
                .onSuccess { r ->
                    _estado.update {
                        it.copy(
                            mensajes = it.mensajes + MensajeChat("assistant", r.mensaje),
                            pensando = false,
                            propuesta = r.takeIf { p -> p.tipo.isNotBlank() },
                        )
                    }
                }
                .onFailure { e -> _estado.update { it.copy(pensando = false, error = e.message) } }
        }
    }

    /** El vecino acepta lo que entendió el asistente: se llena el borrador y se pasa a la ubicación. */
    fun aceptarPropuesta() {
        val p = _estado.value.propuesta ?: return
        val textoVecino = _estado.value.mensajes.filter { it.role == "user" }.joinToString(". ") { it.content }
        val cuando = when (p.cuando) {
            "hace_1h" -> Cuando.HACE_1H
            "hoy" -> Cuando.HOY
            else -> Cuando.AHORA
        }
        _estado.update {
            it.copy(
                borrador = it.borrador.copy(
                    tipo = p.tipo,
                    descripcion = p.descripcion.ifBlank { textoVecino }.take(500),
                    referencia = p.zona.take(200),
                    cuando = cuando,
                ),
                propuesta = null,
                pantalla = Pantalla.UBICACION,
            )
        }
    }

    fun rechazarPropuesta() {
        _estado.update {
            it.copy(
                propuesta = null,
                mensajes = it.mensajes + MensajeChat("assistant", "Perdón, vecino/a. ¿Me cuentas otra vez qué pasó, con un poco más de detalle?"),
            )
        }
    }

    // --- Envío ---------------------------------------------------------------------------------
    fun enviar() {
        val e = _estado.value
        val b = e.borrador
        val errores = buildMap {
            if (b.tipo == null) put("tipo", "Selecciona qué tipo de incidente fue")
            if (e.modo != Modo.GUIADO && b.descripcion.trim().length < 10) put("descripcion", "Describe lo ocurrido (mínimo 10 caracteres)")
            if (b.ubicacion == null) put("ubicacion", "Indica dónde ocurrió")
        }
        if (errores.isNotEmpty()) {
            _estado.update { it.copy(errores = errores, error = "Revisa los datos del reporte") }
            return
        }
        val fecha = Instant.now().minus(Duration.ofHours(b.cuando.haceHoras))
        val nuevo = NuevoReporte(
            tipo = b.tipo!!,
            modo = e.modo.api,
            descripcion = b.descripcion.trim(),
            referencia = b.referencia.trim().ifBlank { null },
            lat = b.ubicacion!!.lat,
            lng = b.ubicacion.lng,
            fechaHecho = Fechas.aIso(fecha),
        )
        _estado.update { it.copy(enviando = true, error = null, errores = emptyMap()) }
        viewModelScope.launch {
            runCatching { c.api.crearReporte(nuevo) }
                .onSuccess { r -> _estado.update { it.copy(enviando = false, creado = r, pantalla = Pantalla.EXITO) } }
                .onFailure { err ->
                    _estado.update {
                        it.copy(
                            enviando = false,
                            error = err.message,
                            errores = (err as? ApiException)?.detalles.orEmpty(),
                        )
                    }
                }
        }
    }

    fun nuevoReporte() {
        _estado.value = EstadoReportar()
    }
}
