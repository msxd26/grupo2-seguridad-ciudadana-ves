package pe.jsaire.seguridad.util

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import pe.jsaire.seguridad.data.model.Reporte
import pe.jsaire.seguridad.ui.TIPOS_POR_DEFECTO
import pe.jsaire.seguridad.ui.etiquetaTipo
import java.util.Locale
import kotlin.math.roundToInt

/**
 * Preferencias de avisos (iguales a la web, frontend/src/models/avisos.js):
 *  A) cercanía: radio desde mi ubicación (null = todo el distrito)
 *  B) ráfagas: varios reportes seguidos llegan en UNA sola notificación
 *  C) tipos: solo algunos tipos o solo nivel "Peligro"
 * El filtro se aplica en el teléfono: la ubicación nunca se envía al servidor.
 */
data class ConfigAvisos(
    val activo: Boolean = true,
    val radio: Int? = null,
    val lat: Double? = null,
    val lng: Double? = null,
    val tipos: Set<String> = emptySet(), // vacío = todos
    val soloPeligro: Boolean = false,
) {
    val ubicacion: Punto? get() = if (lat != null && lng != null) Punto(lat, lng) else null
}

val RADIOS_AVISO: List<Pair<Int?, String>> = listOf(500 to "500 m", 1000 to "1 km", 2000 to "2 km", null to "Todo el distrito")

private val PLURAL = mapOf(
    "robo" to "robos",
    "intento_robo" to "intentos de robo",
    "acoso" to "acosos",
    "actividad_sospechosa" to "actividades sospechosas",
    "zona_oscura" to "zonas oscuras",
    "espacio_abandonado" to "espacios abandonados",
    "otro" to "otros",
)

private fun nivelTipo(id: String) = TIPOS_POR_DEFECTO.firstOrNull { it.id == id }?.nivel ?: "info"

fun distanciaAviso(c: ConfigAvisos, r: Reporte): Double? =
    if (c.radio != null) c.ubicacion?.let { Ubicacion.distanciaMetros(it, Punto(r.lat, r.lng)) } else null

/** ¿Este reporte debe generar una notificación con esta configuración? */
fun cumpleFiltro(c: ConfigAvisos, r: Reporte): Boolean {
    if (!c.activo) return false
    if (c.soloPeligro && nivelTipo(r.tipo) != "peligro") return false
    if (c.tipos.isNotEmpty() && r.tipo !in c.tipos) return false
    if (c.radio != null) {
        val d = distanciaAviso(c, r) ?: return false
        if (d > c.radio) return false
    }
    return true
}

fun formatoDistancia(d: Double): String =
    if (d < 1000) "${(d / 10).roundToInt() * 10} m" else String.format(Locale("es", "PE"), "%.1f km", d / 1000)

/** "3 robos, 2 acosos y 1 zona oscura" */
fun resumenTipos(lista: List<Reporte>): String {
    val partes = lista.groupingBy { it.tipo }.eachCount().entries.sortedByDescending { it.value }.map { (id, n) ->
        if (n == 1) "1 ${etiquetaTipo(id).lowercase()}" else "$n ${PLURAL[id] ?: "otros"}"
    }
    return if (partes.size > 1) partes.dropLast(1).joinToString(", ") + " y " + partes.last() else partes.firstOrNull().orEmpty()
}

/** Área que contiene todos los reportes (para encuadrar el mapa), con un pequeño margen. */
// `clave` hace única cada petición: pedir dos veces la misma área vuelve a encuadrar el mapa.
data class Encuadre(val sur: Double, val oeste: Double, val norte: Double, val este: Double, val clave: Long = System.nanoTime()) {
    fun comoTexto() = "$sur,$oeste,$norte,$este"

    companion object {
        fun de(lista: List<Reporte>, margen: Double = 0.002) = Encuadre(
            lista.minOf { it.lat } - margen, lista.minOf { it.lng } - margen,
            lista.maxOf { it.lat } + margen, lista.maxOf { it.lng } + margen,
        )

        fun desdeTexto(texto: String?): Encuadre? {
            val v = texto?.split(',')?.mapNotNull { it.toDoubleOrNull() } ?: return null
            return if (v.size == 4) Encuadre(v[0], v[1], v[2], v[3]) else null
        }
    }
}

/**
 * B) Agrupa los reportes que llegan seguidos y entrega UN lote:
 * tras `silencioMs` sin reportes nuevos, o al llegar a `maximoMs`. Si el servidor anunció
 * una ráfaga, espera a que termine.
 */
class Agrupador(
    private val scope: CoroutineScope,
    private val silencioMs: Long = 4_000,
    private val maximoMs: Long = 30_000,
    private val alEntregar: (List<Reporte>) -> Unit,
) {
    private val lote = mutableListOf<Reporte>()
    private var silencio: Job? = null
    private var maximo: Job? = null
    private var enRafaga = false

    fun agregar(r: Reporte) {
        if (lote.any { it.id == r.id }) return
        lote += r
        if (!enRafaga) programarSilencio(silencioMs)
        if (maximo == null) maximo = scope.launch { delay(maximoMs); entregar() }
    }

    fun rafaga(estado: String) {
        when (estado) {
            "iniciada" -> {
                enRafaga = true
                silencio?.cancel()
                if (maximo == null) maximo = scope.launch { delay(maximoMs); entregar() }
            }
            "terminada" -> {
                enRafaga = false
                if (lote.isNotEmpty()) programarSilencio(1_500)
            }
        }
    }

    private fun programarSilencio(ms: Long) {
        silencio?.cancel()
        silencio = scope.launch { delay(ms); entregar() }
    }

    private fun entregar() {
        silencio?.cancel(); maximo?.cancel()
        silencio = null; maximo = null
        enRafaga = false
        val salida = lote.toList()
        lote.clear()
        if (salida.isNotEmpty()) alEntregar(salida)
    }
}
