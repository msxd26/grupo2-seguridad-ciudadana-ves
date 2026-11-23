package pe.jsaire.seguridad.ui.screens.ajustes

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SuggestionChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import pe.jsaire.seguridad.BuildConfig
import pe.jsaire.seguridad.ui.AppViewModel

@Composable
fun AjustesScreen(appVm: AppViewModel) {
    var url by rememberSaveable { mutableStateOf(appVm.servidor) }
    val conectado by appVm.conectado.collectAsStateWithLifecycle()

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Servidor de Tu Vecino", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        Text(
            "Dirección del backend. Con Docker en la red local usa la IP de la PC (ej. http://192.168.1.20). " +
                "Con el backend de desarrollo (npm run dev) usa el puerto 3000. Desde el emulador, la PC es 10.0.2.2.",
            style = MaterialTheme.typography.bodyMedium,
        )
        OutlinedTextField(
            value = url,
            onValueChange = { url = it },
            label = { Text("URL del servidor") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
            modifier = Modifier.fillMaxWidth(),
        )
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            SuggestionChip(onClick = { url = "http://10.0.2.2:3000" }, label = { Text("Emulador → backend dev (10.0.2.2:3000)") })
            SuggestionChip(onClick = { url = "http://10.0.2.2" }, label = { Text("Emulador → Docker (10.0.2.2)") })
        }
        Button(onClick = { appVm.cambiarServidor(url) }, modifier = Modifier.fillMaxWidth()) { Text("Guardar y conectar") }
        Text(
            when (conectado) {
                true -> "✅ Conectado a ${appVm.servidor}"
                false -> "❌ No se pudo conectar a ${appVm.servidor}"
                null -> "Probando conexión…"
            },
        )
        Text(
            "Cambiar de servidor cierra la sesión actual.\nVersión ${BuildConfig.VERSION_NAME}",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
