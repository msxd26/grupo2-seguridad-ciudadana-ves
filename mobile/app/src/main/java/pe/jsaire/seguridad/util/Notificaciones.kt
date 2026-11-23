package pe.jsaire.seguridad.util

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import pe.jsaire.seguridad.MainActivity
import pe.jsaire.seguridad.R
import pe.jsaire.seguridad.data.model.Reporte
import pe.jsaire.seguridad.data.remote.AvisoMiReporte
import pe.jsaire.seguridad.ui.etiquetaTipo

/**
 * Notificaciones del sistema de Tu Vecino:
 * - "Reportes en vivo": cada reporte nuevo de los vecinos (llega por WebSocket).
 * - "Mis reportes": cuando un moderador revisa un reporte mío.
 */
class Notificaciones(private val context: Context) {

    init {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(
            NotificationChannel(CANAL_REPORTES, "Reportes en vivo", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Avisos cuando un vecino reporta un incidente en Villa El Salvador"
            },
        )
        manager.createNotificationChannel(
            NotificationChannel(CANAL_MIS_REPORTES, "Mis reportes", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Cuando el equipo verifica o revisa un reporte tuyo"
            },
        )
    }

    /** En Android 13+ hace falta el permiso POST_NOTIFICATIONS (se pide al abrir la app). */
    fun permitidas(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED

    /** Un solo reporte (con la distancia si el aviso es por cercanía). */
    fun nuevoReporte(r: Reporte, distancia: Double? = null) {
        val titulo = "Nuevo reporte: ${etiquetaTipo(r.tipo)}" +
            (distancia?.let { " a ${formatoDistancia(it)}" } ?: "") + if (r.esDemo) " (demo)" else ""
        val texto = buildString {
            append(r.descripcion)
            r.referencia?.let { append(" · ").append(it) }
        }
        mostrar(CANAL_REPORTES, ID_BASE_REPORTES + r.id, titulo, texto, GRUPO_REPORTES, Encuadre.de(listOf(r)))
    }

    /** Varios reportes seguidos: UNA notificación con el resumen; al tocarla, el mapa los encuadra a todos. */
    fun rafaga(lista: List<Reporte>, cerca: Boolean) {
        val titulo = "${lista.size} reportes nuevos" + (if (cerca) " cerca de ti" else "") +
            if (lista.all { it.esDemo }) " (demo)" else ""
        val texto = "${resumenTipos(lista)}. Toca para verlos en el mapa."
        mostrar(CANAL_REPORTES, ID_BASE_RAFAGAS + lista.first().id, titulo, texto, GRUPO_REPORTES, Encuadre.de(lista))
    }

    fun miReporte(a: AvisoMiReporte) {
        val estado = when (a.estado) {
            "verificado" -> "fue verificado ✅"
            "descartado" -> "no procede"
            else -> "volvió a revisión"
        }
        val texto = a.comentarioAdmin ?: "Revisa el detalle en Mi cuenta."
        mostrar(CANAL_MIS_REPORTES, ID_BASE_MIS_REPORTES + a.id, "Tu reporte #${a.id} ${estado}", texto, null, null)
    }

    private fun mostrar(canal: String, id: Int, titulo: String, texto: String, grupo: String?, encuadre: Encuadre?) {
        if (!permitidas()) return
        // Al tocar la notificación se abre la app (si ya estaba abierta, vuelve a primer plano).
        // Si trae un área, la app abre el mapa encuadrando esos reportes.
        val intent = Intent(context, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            .apply { encuadre?.let { putExtra(EXTRA_ENCUADRE, it.comoTexto()) } }
        // Un requestCode por notificación: si no, Android reutiliza el mismo intent y pisa los extras.
        val pendiente = PendingIntent.getActivity(context, id, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        val notificacion = NotificationCompat.Builder(context, canal)
            .setSmallIcon(R.drawable.ic_notificacion)
            .setContentTitle(titulo)
            .setContentText(texto)
            .setStyle(NotificationCompat.BigTextStyle().bigText(texto))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setAutoCancel(true)
            .setContentIntent(pendiente)
            .apply { if (grupo != null) setGroup(grupo) }
            .build()
        try {
            NotificationManagerCompat.from(context).notify(id, notificacion)
        } catch (_: SecurityException) {
            // El usuario retiró el permiso mientras la app estaba abierta: no se notifica.
        }
    }

    companion object {
        const val CANAL_REPORTES = "reportes_en_vivo"
        const val CANAL_MIS_REPORTES = "mis_reportes"
        private const val GRUPO_REPORTES = "pe.jsaire.seguridad.REPORTES"
        private const val ID_BASE_REPORTES = 100_000
        private const val ID_BASE_MIS_REPORTES = 500_000
        private const val ID_BASE_RAFAGAS = 900_000
        const val EXTRA_ENCUADRE = "pe.jsaire.seguridad.ENCUADRE"
    }
}
