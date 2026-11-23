package pe.jsaire.seguridad.ui.components

import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.LocalPolice
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.unit.sp
import androidx.core.net.toUri
import kotlinx.coroutines.launch
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.model.PuntoSeguro
import pe.jsaire.seguridad.data.model.Recomendacion
import pe.jsaire.seguridad.ui.colorNivel
import pe.jsaire.seguridad.util.Punto
import pe.jsaire.seguridad.util.Ubicacion

/**
 * "¿Qué tan seguro es donde estoy?": usa el GPS del vecino y pide al backend una recomendación
 * personalizada (nivel de riesgo, factores, horario de mayor incidencia y puntos seguros cercanos).
 */
@Composable
fun RecomendacionCard(
    container: AppContainer,
    modifier: Modifier = Modifier,
    autoIniciar: Boolean = false,
    onUbicacion: (Punto) -> Unit = {},
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var cargando by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var resultado by remember { mutableStateOf<Recomendacion?>(null) }

    fun consultar() = scope.launch {
        cargando = true
        error = null
        val p = Ubicacion.actual(context)
        if (p == null) {
            error = "No se pudo obtener tu ubicación. Activa el GPS e inténtalo de nuevo."
        } else {
            onUbicacion(p)
            runCatching { container.api.recomendacion(p.lat, p.lng) }
                .onSuccess { resultado = it }
                .onFailure { error = it.message }
        }
        cargando = false
    }

    val permisos = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { r ->
        if (r.values.any { it }) consultar() else error = "Necesitamos tu ubicación para darte una recomendación."
    }
    fun iniciar() = if (Ubicacion.tienePermiso(context)) consultar() else permisos.launch(Ubicacion.PERMISOS)

    androidx.compose.runtime.LaunchedEffect(Unit) { if (autoIniciar) iniciar() }

    val r = resultado
    val color = colorNivel(r?.riesgo)
    Card(
        modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh),
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconoCircular(Icons.Outlined.Shield, if (r != null) color else MaterialTheme.colorScheme.primary)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text("¿Qué tan seguro es aquí?", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    if (r != null) {
                        Text(
                            "${r.incidentes} reportes a ${r.radioMetros} m · últimos ${r.dias} días",
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                }
                if (r != null) {
                    Etiqueta("Riesgo ${r.riesgo}", color)
                    IconButton(onClick = { iniciar() }, enabled = !cargando) { Icon(Icons.Outlined.Refresh, "Actualizar") }
                }
            }

            when {
                cargando -> Row(verticalAlignment = Alignment.CenterVertically) {
                    CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
                    Spacer(Modifier.width(10.dp))
                    Text("Analizando tu zona…")
                }
                r == null -> {
                    Text(
                        "Te explicamos el nivel de riesgo donde estás, a qué hora ocurren más incidentes y dónde están los puntos seguros más cercanos.",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Button(onClick = { iniciar() }, Modifier.fillMaxWidth()) { Text("Analizar mi ubicación") }
                }
                else -> DetalleRecomendacion(r)
            }
            error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium) }
        }
    }
}

@Composable
private fun DetalleRecomendacion(r: Recomendacion) {
    Text(r.texto, style = MaterialTheme.typography.bodyLarge, fontSize = 17.sp)
    r.horarioRiesgo?.let { h ->
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Outlined.Schedule, null, Modifier.size(18.dp), tint = colorNivel(if (r.enHorarioRiesgo) "alta" else "media"))
            Spacer(Modifier.width(6.dp))
            Text(
                "Mayor incidencia: $h" + if (r.enHorarioRiesgo) " (ahora)" else "",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (r.enHorarioRiesgo) FontWeight.Bold else FontWeight.Normal,
            )
        }
    }
    r.puntosSeguros.forEach { PuntoSeguroFila(it) }
    if (r.motor == "groq") {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Outlined.AutoAwesome, null, Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.width(4.dp))
            Text("Redactado con IA a partir de reportes vecinales", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun PuntoSeguroFila(p: PuntoSeguro) {
    val context = LocalContext.current
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Outlined.LocalPolice, null, Modifier.size(20.dp), tint = MaterialTheme.colorScheme.primary)
        Spacer(Modifier.width(8.dp))
        Column(Modifier.weight(1f)) {
            Text(p.nombre, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
            Text(if (p.distancia >= 1000) "%.1f km".format(p.distancia / 1000.0) else "${p.distancia} m", style = MaterialTheme.typography.bodySmall)
        }
        TextButton(onClick = {
            val uri = "geo:${p.lat},${p.lng}?q=${p.lat},${p.lng}(${android.net.Uri.encode(p.nombre)})".toUri()
            runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, uri)) }
        }) { Text("Cómo llegar") }
    }
}
