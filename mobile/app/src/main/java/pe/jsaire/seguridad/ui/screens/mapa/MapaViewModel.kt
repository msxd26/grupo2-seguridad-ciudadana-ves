package pe.jsaire.seguridad.ui.screens.mapa

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.model.DatosMapa
import pe.jsaire.seguridad.data.model.Reporte
import pe.jsaire.seguridad.data.remote.EventoTiempoReal

/** Capas del mapa (iguales a la web: calor, incidentes, zonas y puntos seguros). */
enum class Capa(val etiqueta: String) {
    CALOR("Mapa de calor"),
    INCIDENTES("Incidentes"),
    ZONAS("Zonas de riesgo"),
    COMISARIAS("Comisarías"),
}

data class EstadoMapa(
    val dias: Int = 7,
    val tipo: String? = null, // null = todos los tipos
    val datos: DatosMapa? = null,
    val cargando: Boolean = false,
    val error: String? = null,
    val capas: Set<Capa> = setOf(Capa.CALOR, Capa.INCIDENTES, Capa.COMISARIAS),
    val seguirEnVivo: Boolean = true,
    val nuevos: Set<Int> = emptySet(), // reportes llegados en vivo durante esta sesión
    val ultimoEnVivo: Reporte? = null,
) {
    val reportes: List<Reporte> get() = datos?.reportes.orEmpty()
}

class MapaViewModel(private val c: AppContainer) : ViewModel() {
    private val _estado = MutableStateFlow(EstadoMapa())
    val estado: StateFlow<EstadoMapa> = _estado.asStateFlow()

    /** Reporte al que el mapa debe "volar" (modo Seguir en vivo). */
    private val _volarA = MutableSharedFlow<Reporte>(extraBufferCapacity = 4)
    val volarA: SharedFlow<Reporte> = _volarA.asSharedFlow()

    private var carga: Job? = null

    init {
        cargar()
    }

    fun cargar() {
        carga?.cancel()
        carga = viewModelScope.launch {
            _estado.update { it.copy(cargando = true, error = null) }
            val e = _estado.value
            runCatching { c.api.mapa(e.dias, listOfNotNull(e.tipo)) }
                .onSuccess { d ->
                    _estado.update { actual ->
                        // Conserva los reportes en vivo que aún no llegaron en la respuesta.
                        val ids = d.reportes.mapTo(HashSet()) { it.id }
                        val pendientes = actual.reportes.filter { it.id in actual.nuevos && it.id !in ids }
                        actual.copy(datos = d.copy(reportes = pendientes + d.reportes), cargando = false)
                    }
                }
                .onFailure { err -> _estado.update { it.copy(error = err.message, cargando = false) } }
        }
    }

    fun cambiarDias(dias: Int) {
        _estado.update { it.copy(dias = dias) }
        cargar()
    }

    fun cambiarTipo(tipo: String?) {
        _estado.update { it.copy(tipo = tipo) }
        cargar()
    }

    fun alternarCapa(capa: Capa) = _estado.update {
        it.copy(capas = if (capa in it.capas) it.capas - capa else it.capas + capa)
    }

    fun alternarSeguir() = _estado.update { it.copy(seguirEnVivo = !it.seguirEnVivo) }

    fun cerrarAvisoEnVivo() = _estado.update { it.copy(ultimoEnVivo = null) }

    /** Cambios en vivo enviados por el servidor (WebSocket). */
    fun aplicarEvento(evento: EventoTiempoReal) {
        val e = _estado.value
        val datos = e.datos ?: return
        when (evento) {
            is EventoTiempoReal.NuevoReporte -> {
                val r = evento.reporte
                if (e.tipo != null && r.tipo != e.tipo) return
                if (datos.reportes.none { it.id == r.id }) {
                    // Al instante: el punto y el calor se actualizan sin esperar al servidor.
                    _estado.update {
                        it.copy(
                            datos = datos.copy(reportes = listOf(r) + datos.reportes),
                            nuevos = it.nuevos + r.id,
                            ultimoEnVivo = r,
                        )
                    }
                    if (e.seguirEnVivo) _volarA.tryEmit(r)
                }
                // Las zonas de riesgo se calculan en el servidor: se refrescan en segundo plano.
                cargar()
            }
            is EventoTiempoReal.ReporteOculto ->
                _estado.update { it.copy(datos = datos.copy(reportes = datos.reportes.filterNot { r -> r.id == evento.id })) }
            is EventoTiempoReal.ReporteActualizado -> {
                val v = evento.votos
                _estado.update {
                    it.copy(datos = datos.copy(reportes = datos.reportes.map { r ->
                        if (r.id != v.id) r else r.copy(
                            confirmaciones = v.confirmaciones ?: r.confirmaciones,
                            marcas = v.marcas ?: r.marcas,
                        )
                    }))
                }
            }
            // Moderación en vivo: un descartado desaparece del mapa; un verificado muestra su nuevo estado.
            is EventoTiempoReal.ReporteModerado -> {
                val m = evento.moderado
                _estado.update {
                    it.copy(datos = datos.copy(reportes =
                        if (m.estado == "descartado" || m.oculto) datos.reportes.filterNot { r -> r.id == m.id }
                        else datos.reportes.map { r -> if (r.id == m.id) r.copy(estado = m.estado) else r }
                    ))
                }
            }
            is EventoTiempoReal.MiReporte, is EventoTiempoReal.Conectados -> Unit
        }
    }

    suspend fun confirmar(id: Int): Result<String> = runCatching {
        val v = c.api.confirmar(id)
        aplicarEvento(EventoTiempoReal.ReporteActualizado(v))
        "¡Gracias! Tu confirmación ayuda a otros vecinos."
    }

    suspend fun marcarFalso(id: Int): Result<String> = runCatching {
        val v = c.api.marcarFalso(id)
        if (v.oculto == true) aplicarEvento(EventoTiempoReal.ReporteOculto(id))
        else aplicarEvento(EventoTiempoReal.ReporteActualizado(v))
        "Gracias por avisar. La comunidad y la municipalidad lo revisarán."
    }
}
