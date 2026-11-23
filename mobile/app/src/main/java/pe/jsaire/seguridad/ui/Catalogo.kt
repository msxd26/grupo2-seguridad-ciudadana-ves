package pe.jsaire.seguridad.ui

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.HelpOutline
import androidx.compose.material.icons.outlined.House
import androidx.compose.material.icons.outlined.PanTool
import androidx.compose.material.icons.outlined.ReportProblem
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.Warning
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import pe.jsaire.seguridad.data.model.TipoIncidente

/** Catálogo local de tipos (igual a TIPOS_INCIDENTE del backend); se usa si aún no llegó /reportes/tipos. */
val TIPOS_POR_DEFECTO = listOf(
    TipoIncidente("robo", "Robo", "peligro"),
    TipoIncidente("intento_robo", "Intento de robo", "atencion"),
    TipoIncidente("acoso", "Acoso", "peligro"),
    TipoIncidente("actividad_sospechosa", "Actividad sospechosa", "atencion"),
    TipoIncidente("zona_oscura", "Zona oscura", "info"),
    TipoIncidente("espacio_abandonado", "Espacio abandonado", "info"),
    TipoIncidente("otro", "Otro", "info"),
)

fun etiquetaTipo(id: String?) = TIPOS_POR_DEFECTO.firstOrNull { it.id == id }?.label ?: (id ?: "Incidente")

fun colorTipo(id: String?): Color = when (id) {
    "robo" -> Color(0xFFD32F2F)
    "intento_robo" -> Color(0xFFF57C00)
    "acoso" -> Color(0xFF8E24AA)
    "actividad_sospechosa" -> Color(0xFFFBC02D)
    "zona_oscura" -> Color(0xFF455A64)
    "espacio_abandonado" -> Color(0xFF6D4C41)
    else -> Color(0xFF1976D2)
}

fun iconoTipo(id: String?): ImageVector = when (id) {
    "robo" -> Icons.Outlined.Warning
    "intento_robo" -> Icons.Outlined.ReportProblem
    "acoso" -> Icons.Outlined.PanTool
    "actividad_sospechosa" -> Icons.Outlined.Visibility
    "zona_oscura" -> Icons.Outlined.DarkMode
    "espacio_abandonado" -> Icons.Outlined.House
    else -> Icons.Outlined.HelpOutline
}

/** Nivel de alerta del backend: alta | media | informativa. */
fun colorNivel(nivel: String?): Color = when (nivel) {
    "alta", "alto", "peligro" -> Color(0xFFD32F2F)
    "media", "medio", "atencion" -> Color(0xFFF57C00)
    "bajo" -> Color(0xFF2E7D32)
    else -> Color(0xFF1976D2)
}

fun etiquetaEstado(estado: String) = when (estado) {
    "verificado" -> "Verificado"
    "descartado" -> "No procede"
    else -> "En revisión"
}

fun colorEstado(estado: String): Color = when (estado) {
    "verificado" -> Color(0xFF2E7D32)
    "descartado" -> Color(0xFF757575)
    else -> Color(0xFFF57C00)
}

data class NumeroEmergencia(val etiqueta: String, val numero: String)

val NUMEROS_EMERGENCIA = listOf(
    NumeroEmergencia("Policía Nacional", "105"),
    NumeroEmergencia("Bomberos", "116"),
    NumeroEmergencia("SAMU", "106"),
    NumeroEmergencia("Línea 100 (violencia familiar)", "100"),
)
