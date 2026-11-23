package pe.jsaire.seguridad.ui.screens.inicio

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Campaign
import androidx.compose.material.icons.outlined.LocalPolice
import androidx.compose.material.icons.outlined.Map
import androidx.compose.material.icons.outlined.NotificationsActive
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.model.Alerta
import pe.jsaire.seguridad.data.remote.EventoTiempoReal
import pe.jsaire.seguridad.ui.AppViewModel
import pe.jsaire.seguridad.ui.NUMEROS_EMERGENCIA
import pe.jsaire.seguridad.ui.components.BotonGrande
import pe.jsaire.seguridad.ui.components.FilaEmergencias
import pe.jsaire.seguridad.ui.components.RecomendacionCard
import pe.jsaire.seguridad.ui.screens.alertas.TarjetaAlerta

private val CONSEJOS = listOf(
    "Camina por calles iluminadas y con movimiento, sobre todo de noche.",
    "En el paradero, guarda el celular y mantén tus pertenencias delante de ti.",
    "Si ves algo sospechoso, repórtalo: tu aviso ayuda a que la municipalidad priorice el patrullaje.",
    "Acuerda con tu familia un punto de encuentro y ten a la mano los números de emergencia.",
    "Si alguien te acosa, busca un lugar concurrido y pide ayuda. Puedes llamar a la Línea 100.",
)

@Composable
fun InicioScreen(
    container: AppContainer,
    appVm: AppViewModel,
    onReportar: () -> Unit,
    onMapa: () -> Unit,
    onAlertas: () -> Unit,
    onContacto: () -> Unit,
    onAjustes: () -> Unit,
) {
    val usuario by appVm.usuario.collectAsStateWithLifecycle()
    val conectado by appVm.conectado.collectAsStateWithLifecycle()
    val enLinea by appVm.vecinosEnLinea.collectAsStateWithLifecycle()
    var alertas by remember { mutableStateOf<List<Alerta>?>(null) }
    var recarga by remember { mutableStateOf(0) }

    LaunchedEffect(conectado, recarga) {
        if (conectado == true) alertas = runCatching { container.api.alertas() }.getOrNull()
    }
    LaunchedEffect(Unit) {
        appVm.eventos.collect { if (it is EventoTiempoReal.NuevoReporte) recarga++ }
    }

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text(
            usuario?.let { "Hola, ${it.nombre.substringBefore(' ')} 👋" } ?: "Hola, vecino/a 👋",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
        )
        Text("Haciendo visible la inseguridad que no se denuncia en Villa El Salvador.", style = MaterialTheme.typography.bodyMedium)

        EstadoConexion(conectado, enLinea, appVm.servidor, onReintentar = appVm::conectar, onAjustes = onAjustes)

        BotonGrande("Reportar un incidente", Icons.Outlined.Campaign, onReportar, color = MaterialTheme.colorScheme.error, seleccionado = true)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            BotonGrande("Mapa", Icons.Outlined.Map, onMapa, Modifier.weight(1f))
            BotonGrande("Alertas", Icons.Outlined.NotificationsActive, onAlertas, Modifier.weight(1f))
        }

        RecomendacionCard(container)

        val activas = alertas.orEmpty()
        if (activas.isNotEmpty()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Alertas activas (${activas.size})", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                TextButton(onClick = onAlertas) { Text("Ver todas") }
            }
            activas.take(3).forEach { TarjetaAlerta(it) }
        }

        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)) {
            Column(Modifier.padding(16.dp)) {
                Text("Consejo del día", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                Text(CONSEJOS[(System.currentTimeMillis() / 86_400_000 % CONSEJOS.size).toInt()], style = MaterialTheme.typography.bodyLarge)
            }
        }

        Text("Emergencias", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        FilaEmergencias(NUMEROS_EMERGENCIA.take(2))
        OutlinedButton(onClick = onContacto, Modifier.fillMaxWidth()) {
            androidx.compose.material3.Icon(Icons.Outlined.LocalPolice, null)
            Spacer(Modifier.width(8.dp))
            Text("Más números y comisarías")
        }
    }
}

@Composable
private fun EstadoConexion(conectado: Boolean?, enLinea: Int, servidor: String, onReintentar: () -> Unit, onAjustes: () -> Unit) {
    val (color, texto) = when (conectado) {
        null -> Color(0xFF9E9E9E) to "Conectando con el servidor…"
        true -> Color(0xFF2E7D32) to if (enLinea > 0) "En vivo · $enLinea vecinos conectados" else "En vivo"
        false -> Color(0xFFD32F2F) to "Sin conexión con $servidor"
    }
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(10.dp).background(color, CircleShape))
        Spacer(Modifier.width(8.dp))
        Text(texto, style = MaterialTheme.typography.bodySmall, modifier = Modifier.weight(1f))
        if (conectado == false) {
            TextButton(onClick = onReintentar) { Text("Reintentar") }
            TextButton(onClick = onAjustes) { Text("Ajustes") }
        }
    }
}
