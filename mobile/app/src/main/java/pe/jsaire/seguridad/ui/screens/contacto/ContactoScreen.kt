package pe.jsaire.seguridad.ui.screens.contacto

import android.content.Intent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.model.Comisaria
import pe.jsaire.seguridad.ui.NUMEROS_EMERGENCIA
import pe.jsaire.seguridad.ui.components.FilaEmergencias
import pe.jsaire.seguridad.ui.components.MensajeError

private const val DISTRITO = "Villa El Salvador"

@Composable
fun ContactoScreen(container: AppContainer) {
    var comisarias by remember { mutableStateOf<List<Comisaria>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var intento by remember { mutableStateOf(0) }

    LaunchedEffect(intento) {
        error = null
        runCatching { container.api.comisarias() }.onSuccess { comisarias = it }.onFailure { error = it.message }
    }

    val lista = comisarias.orEmpty()
    val enVes = lista.filter { it.distrito.equals(DISTRITO, ignoreCase = true) }
    val vecinas = lista - enVes.toSet()

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item { Text("Números de emergencia", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold) }
        item { FilaEmergencias(NUMEROS_EMERGENCIA) }
        error?.let { item { MensajeError(it, { intento++ }) } }
        if (enVes.isNotEmpty()) {
            item { Text("Comisarías en Villa El Salvador", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold) }
            items(enVes, key = { "ves-" + it.nombre }) { FilaComisaria(it) }
        }
        if (vecinas.isNotEmpty()) {
            item { Text("Distritos vecinos", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold) }
            items(vecinas, key = { "vec-" + it.nombre + it.distrito }) { FilaComisaria(it) }
        }
        item {
            Text(
                "Fuente: Comisarías básicas de la PNP (MININTER, datos abiertos).",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun FilaComisaria(c: Comisaria) {
    val context = LocalContext.current
    Card(Modifier.fillMaxWidth()) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(c.nombre, fontWeight = FontWeight.SemiBold)
                Text(listOfNotNull(c.distrito, c.divpol).joinToString(" · "), style = MaterialTheme.typography.bodySmall)
            }
            TextButton(onClick = {
                val uri = "geo:${c.lat},${c.lng}?q=${c.lat},${c.lng}(${Uri(c.nombre)})".toUri()
                runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, uri)) }
            }) { Text("Cómo llegar") }
        }
    }
}

private fun Uri(texto: String) = android.net.Uri.encode(texto)
