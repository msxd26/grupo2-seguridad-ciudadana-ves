package pe.jsaire.seguridad.util

import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

/** Fechas de la API: ISO-8601 en UTC (ej. 2026-11-23T15:04:05.000Z). Se muestran en hora de Lima. */
object Fechas {
    private val LIMA: ZoneId = ZoneId.of("America/Lima")
    private val formato = DateTimeFormatter.ofPattern("d MMM yyyy, HH:mm", Locale.forLanguageTag("es-PE"))

    fun parse(iso: String?): Instant? = iso?.let { runCatching { Instant.parse(it) }.getOrNull() }

    fun aIso(instante: Instant): String = DateTimeFormatter.ISO_INSTANT.format(instante)

    fun legible(iso: String?): String = parse(iso)?.atZone(LIMA)?.format(formato) ?: "—"

    /** "hace 5 min", "hace 3 h", "hace 2 días" o la fecha completa si es más antigua. */
    fun relativa(iso: String?): String {
        val instante = parse(iso) ?: return "—"
        val d = Duration.between(instante, Instant.now())
        return when {
            d.isNegative || d.toMinutes() < 1 -> "hace un momento"
            d.toMinutes() < 60 -> "hace ${d.toMinutes()} min"
            d.toHours() < 24 -> "hace ${d.toHours()} h"
            d.toDays() < 7 -> if (d.toDays() == 1L) "ayer" else "hace ${d.toDays()} días"
            else -> legible(iso)
        }
    }
}
