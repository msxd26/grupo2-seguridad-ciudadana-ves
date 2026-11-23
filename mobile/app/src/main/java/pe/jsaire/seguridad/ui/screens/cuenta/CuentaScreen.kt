package pe.jsaire.seguridad.ui.screens.cuenta

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SecondaryTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import kotlinx.coroutines.launch
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.model.Reporte
import pe.jsaire.seguridad.data.model.Usuario
import pe.jsaire.seguridad.data.remote.ApiException
import pe.jsaire.seguridad.ui.AppViewModel
import pe.jsaire.seguridad.ui.colorEstado
import pe.jsaire.seguridad.ui.colorTipo
import pe.jsaire.seguridad.ui.components.Etiqueta
import pe.jsaire.seguridad.ui.components.IconoCircular
import pe.jsaire.seguridad.ui.components.MensajeError
import pe.jsaire.seguridad.ui.etiquetaEstado
import pe.jsaire.seguridad.ui.etiquetaTipo
import pe.jsaire.seguridad.ui.iconoTipo
import pe.jsaire.seguridad.util.Fechas

@Composable
fun CuentaScreen(container: AppContainer, appVm: AppViewModel) {
    val usuario by appVm.usuario.collectAsStateWithLifecycle()
    val u = usuario
    if (u == null) Ingresar(appVm) else MiCuenta(u, container, appVm)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun Ingresar(appVm: AppViewModel) {
    var tab by rememberSaveable { mutableStateOf(0) }
    var nombre by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var verPassword by remember { mutableStateOf(false) }
    var enviando by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var detalles by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    val scope = rememberCoroutineScope()
    val registro = tab == 1

    fun enviar() = scope.launch {
        enviando = true
        error = null
        detalles = emptyMap()
        val r = if (registro) appVm.registro(nombre, email, password) else appVm.login(email, password)
        enviando = false
        r.onSuccess { appVm.avisar("¡Hola, ${it.nombre.substringBefore(' ')}!") }
            .onFailure {
                error = it.message
                detalles = (it as? ApiException)?.detalles.orEmpty()
            }
    }

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp).imePadding(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Mi cuenta", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text(
            "No necesitas cuenta para reportar. Con una cuenta puedes seguir el estado de tus reportes y ver la respuesta del equipo municipal.",
            style = MaterialTheme.typography.bodyMedium,
        )
        SecondaryTabRow(selectedTabIndex = tab) {
            Tab(selected = tab == 0, onClick = { tab = 0; error = null }, text = { Text("Ingresar") })
            Tab(selected = tab == 1, onClick = { tab = 1; error = null }, text = { Text("Crear cuenta") })
        }
        if (registro) {
            OutlinedTextField(
                value = nombre, onValueChange = { nombre = it }, label = { Text("Nombre") },
                isError = detalles.containsKey("nombre"), supportingText = detalles["nombre"]?.let { { Text(it) } },
                singleLine = true, modifier = Modifier.fillMaxWidth(),
            )
        }
        OutlinedTextField(
            value = email, onValueChange = { email = it }, label = { Text("Correo electrónico") },
            isError = detalles.containsKey("email"), supportingText = detalles["email"]?.let { { Text(it) } },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            singleLine = true, modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = password, onValueChange = { password = it }, label = { Text("Contraseña") },
            isError = detalles.containsKey("password"),
            supportingText = {
                Text(detalles["password"] ?: if (registro) "Mínimo 8 caracteres, con letras y números" else "")
            },
            visualTransformation = if (verPassword) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            trailingIcon = {
                IconButton(onClick = { verPassword = !verPassword }) {
                    Icon(if (verPassword) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility, "Mostrar contraseña")
                }
            },
            singleLine = true, modifier = Modifier.fillMaxWidth(),
        )
        error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
        Button(
            onClick = { enviar() },
            enabled = !enviando && email.isNotBlank() && password.isNotBlank() && (!registro || nombre.isNotBlank()),
            modifier = Modifier.fillMaxWidth().height(54.dp),
        ) {
            if (enviando) CircularProgressIndicator(Modifier.size(22.dp), strokeWidth = 2.dp)
            else Text(if (registro) "Crear mi cuenta" else "Ingresar")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MiCuenta(u: Usuario, container: AppContainer, appVm: AppViewModel) {
    var reportes by remember { mutableStateOf<List<Reporte>?>(null) }
    var cargando by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun cargar() = scope.launch {
        cargando = true
        error = null
        runCatching { container.api.misReportes() }
            .onSuccess { reportes = it }
            .onFailure { error = it.message; appVm.sesionExpirada(it) }
        cargando = false
    }

    LaunchedEffect(u.id) { cargar() }

    PullToRefreshBox(isRefreshing = cargando, onRefresh = { cargar() }, modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                    Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.AccountCircle, null, Modifier.size(48.dp))
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text("Hola, ${u.nombre}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            Text(u.email, style = MaterialTheme.typography.bodyMedium)
                        }
                        IconButton(onClick = appVm::logout) { Icon(Icons.AutoMirrored.Outlined.Logout, "Cerrar sesión") }
                    }
                }
            }
            item {
                val lista = reportes.orEmpty()
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Resumen("Enviados", lista.size, Modifier.weight(1f))
                    Resumen("Verificados", lista.count { it.estado == "verificado" }, Modifier.weight(1f))
                    Resumen("En revisión", lista.count { it.estado == "pendiente" }, Modifier.weight(1f))
                }
            }
            item { Text("Mis reportes", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold) }
            error?.let { item { MensajeError(it, { cargar() }) } }
            if (reportes?.isEmpty() == true) {
                item { Text("Aún no has enviado reportes. Cuando lo hagas, aquí verás su estado.") }
            }
            items(reportes.orEmpty(), key = { it.id }) { TarjetaMiReporte(it) }
            item {
                OutlinedButton(onClick = appVm::logout, Modifier.fillMaxWidth()) { Text("Cerrar sesión") }
            }
        }
    }
}

@Composable
private fun Resumen(titulo: String, valor: Int, modifier: Modifier) {
    Card(modifier) {
        Column(Modifier.padding(12.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("$valor", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text(titulo, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun TarjetaMiReporte(r: Reporte) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconoCircular(iconoTipo(r.tipo), colorTipo(r.tipo))
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text(etiquetaTipo(r.tipo), fontWeight = FontWeight.SemiBold)
                    Text(Fechas.legible(r.fechaHecho), style = MaterialTheme.typography.bodySmall)
                }
                Etiqueta(etiquetaEstado(r.estado), colorEstado(r.estado))
            }
            Text(r.descripcion, style = MaterialTheme.typography.bodyMedium)
            r.referencia?.let { Text("📍 $it", style = MaterialTheme.typography.bodySmall) }
            if (r.oculto) Text("Oculto temporalmente por marcas de la comunidad.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.error)
            r.comentarioAdmin?.let {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                    Column(Modifier.padding(10.dp)) {
                        Text("Respuesta del equipo municipal", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                        Text(it, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}
