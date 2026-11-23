package pe.jsaire.seguridad.ui.screens.ajustes

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import kotlinx.coroutines.launch
import pe.jsaire.seguridad.ui.AppViewModel
import pe.jsaire.seguridad.ui.TIPOS_POR_DEFECTO
import pe.jsaire.seguridad.util.RADIOS_AVISO
import pe.jsaire.seguridad.util.Ubicacion

/**
 * Avisos de reportes (igual que en la web): cercanía, tipos y "solo Peligro".
 * Una ráfaga de reportes llega en una sola notificación. La ubicación se guarda solo en el teléfono.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AvisosAjustes(appVm: AppViewModel) {
    val guardada by appVm.configAvisos.collectAsStateWithLifecycle()
    var borrador by remember(guardada) { mutableStateOf(guardada) }
    var mensaje by remember { mutableStateOf<String?>(null) }
    var guardando by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    fun guardar() = scope.launch {
        guardando = true
        val ubicacion = if (borrador.radio != null) Ubicacion.actual(context) else null
        appVm.guardarAvisos(borrador, ubicacion)
            .onSuccess { mensaje = "✅ Preferencias guardadas" }
            .onFailure { mensaje = it.message }
        guardando = false
    }

    val permisos = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { r ->
        if (r.values.any { it }) guardar() else mensaje = "Sin permiso de ubicación: elige \"Todo el distrito\"."
    }

    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("Avisos de reportes", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                    Text("Notificaciones cuando un vecino reporta algo", style = MaterialTheme.typography.bodySmall)
                }
                Switch(checked = borrador.activo, onCheckedChange = { borrador = borrador.copy(activo = it) })
            }

            if (borrador.activo) {
                Text("¿De qué distancia?", fontWeight = FontWeight.SemiBold)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    RADIOS_AVISO.forEach { (metros, etiqueta) ->
                        FilterChip(selected = borrador.radio == metros, onClick = { borrador = borrador.copy(radio = metros) }, label = { Text(etiqueta) })
                    }
                }
                if (borrador.radio != null) {
                    Text("Usaremos tu ubicación actual. Se guarda solo en este teléfono.", style = MaterialTheme.typography.bodySmall)
                }

                Text("¿De qué tipo?", fontWeight = FontWeight.SemiBold)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Solo nivel Peligro (robo y acoso)", Modifier.weight(1f))
                    Switch(checked = borrador.soloPeligro, onCheckedChange = { borrador = borrador.copy(soloPeligro = it) })
                }
                if (!borrador.soloPeligro) {
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        TIPOS_POR_DEFECTO.forEach { t ->
                            val marcado = t.id in borrador.tipos
                            FilterChip(
                                selected = marcado,
                                onClick = { borrador = borrador.copy(tipos = if (marcado) borrador.tipos - t.id else borrador.tipos + t.id) },
                                label = { Text(t.label) },
                            )
                        }
                    }
                    if (borrador.tipos.isEmpty()) Text("Sin marcar ninguno, te avisamos de todos los tipos.", style = MaterialTheme.typography.bodySmall)
                }
                Text(
                    "Si llegan varios reportes seguidos, recibirás una sola notificación con el resumen.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }

            Button(
                onClick = {
                    mensaje = null
                    if (borrador.activo && borrador.radio != null && !Ubicacion.tienePermiso(context)) permisos.launch(Ubicacion.PERMISOS)
                    else guardar()
                },
                enabled = !guardando,
                modifier = Modifier.fillMaxWidth(),
            ) { Text(if (guardando) "Obteniendo ubicación…" else "Guardar avisos") }
            mensaje?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
        }
    }
}
