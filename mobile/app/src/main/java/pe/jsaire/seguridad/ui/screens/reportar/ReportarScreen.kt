package pe.jsaire.seguridad.ui.screens.reportar

import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.EditNote
import androidx.compose.material.icons.outlined.Forum
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material.icons.outlined.MyLocation
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material.icons.outlined.TouchApp
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.model.TipoIncidente
import pe.jsaire.seguridad.ui.AppViewModel
import pe.jsaire.seguridad.ui.colorTipo
import pe.jsaire.seguridad.ui.components.BotonGrande
import pe.jsaire.seguridad.ui.components.MapaOsm
import pe.jsaire.seguridad.ui.components.llamar
import pe.jsaire.seguridad.ui.etiquetaTipo
import pe.jsaire.seguridad.ui.iconoTipo
import pe.jsaire.seguridad.util.Punto
import pe.jsaire.seguridad.util.Ubicacion

@Composable
fun ReportarScreen(container: AppContainer, appVm: AppViewModel, onVerMapa: () -> Unit) {
    val vm: ReportarViewModel = viewModel { ReportarViewModel(container) }
    val e by vm.estado.collectAsStateWithLifecycle()
    val tipos by appVm.tipos.collectAsStateWithLifecycle()
    val usuario by appVm.usuario.collectAsStateWithLifecycle()

    BackHandler(enabled = e.pantalla != Pantalla.ELEGIR_MODO) { vm.atras() }

    Column(Modifier.fillMaxSize()) {
        if (e.pantalla != Pantalla.ELEGIR_MODO && e.pantalla != Pantalla.EXITO) {
            Row(Modifier.fillMaxWidth().padding(4.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { vm.atras() }) { Icon(Icons.AutoMirrored.Outlined.ArrowBack, "Atrás") }
                Text(tituloPaso(e), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            }
        }
        Box(Modifier.weight(1f)) {
            when (e.pantalla) {
                Pantalla.ELEGIR_MODO -> ElegirModo(conCuenta = usuario != null, onElegir = vm::elegirModo)
                Pantalla.GUIADO_TIPO -> PasoTipo(tipos, e.borrador.tipo) { vm.tipo(it); vm.irA(Pantalla.GUIADO_CUANDO) }
                Pantalla.GUIADO_CUANDO -> PasoCuando(e.borrador.cuando) { vm.cuando(it); vm.irA(Pantalla.UBICACION) }
                Pantalla.UBICACION -> PasoUbicacion(e.borrador.ubicacion, e.errores["ubicacion"], vm::ubicacion) { vm.irA(Pantalla.CONFIRMAR) }
                Pantalla.CONFIRMAR -> PasoConfirmar(e, vm)
                Pantalla.CHAT -> ChatAsistente(e, vm)
                Pantalla.FORMULARIO -> Formulario(e, tipos, vm)
                Pantalla.EXITO -> Exito(
                    conCuenta = usuario != null,
                    onOtro = vm::nuevoReporte,
                    onVerMapa = { vm.nuevoReporte(); onVerMapa() },
                )
            }
        }
    }
}

private fun tituloPaso(e: EstadoReportar) = when (e.pantalla) {
    Pantalla.GUIADO_TIPO -> "Paso 1 de 4 · ¿Qué pasó?"
    Pantalla.GUIADO_CUANDO -> "Paso 2 de 4 · ¿Cuándo?"
    Pantalla.UBICACION -> if (e.modo == Modo.CHAT) "¿Dónde ocurrió?" else "Paso 3 de 4 · ¿Dónde?"
    Pantalla.CONFIRMAR -> if (e.modo == Modo.CHAT) "Revisa y envía" else "Paso 4 de 4 · Revisa y envía"
    Pantalla.CHAT -> "Asistente Tu Vecino"
    Pantalla.FORMULARIO -> "Formulario de reporte"
    else -> ""
}

@Composable
private fun ElegirModo(conCuenta: Boolean, onElegir: (Modo) -> Unit) {
    val context = LocalContext.current
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("Reportar un incidente", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text(
            if (conCuenta) "Tu reporte quedará en tu cuenta para que sigas su estado."
            else "Tu reporte es anónimo. Si inicias sesión podrás seguir su estado.",
            style = MaterialTheme.typography.bodyMedium,
        )
        Card(
            onClick = { llamar(context, "105") },
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
        ) {
            Text(
                "¿Emergencia en curso? Toca aquí para llamar a la Policía al 105.",
                Modifier.padding(14.dp),
                color = MaterialTheme.colorScheme.onErrorContainer,
                fontWeight = FontWeight.SemiBold,
            )
        }
        Text("¿Cómo prefieres reportar?", style = MaterialTheme.typography.titleMedium)
        BotonGrande("Paso a paso (botones grandes)", Icons.Outlined.TouchApp, { onElegir(Modo.GUIADO) })
        BotonGrande("Contarle al asistente (chat o voz)", Icons.Outlined.Forum, { onElegir(Modo.CHAT) })
        BotonGrande("Formulario completo", Icons.Outlined.EditNote, { onElegir(Modo.FORMULARIO) })
    }
}

@Composable
private fun PasoTipo(tipos: List<TipoIncidente>, actual: String?, onElegir: (String) -> Unit) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        tipos.forEach { t ->
            BotonGrande(t.label, iconoTipo(t.id), { onElegir(t.id) }, color = colorTipo(t.id), seleccionado = actual == t.id)
        }
    }
}

@Composable
private fun PasoCuando(actual: Cuando, onElegir: (Cuando) -> Unit) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Cuando.entries.forEach { c ->
            BotonGrande(c.etiqueta, Icons.Outlined.Schedule, { onElegir(c) }, seleccionado = actual == c)
        }
    }
}

/** Selector de ubicación: GPS del teléfono o tocar el mapa. */
@Composable
fun SelectorUbicacion(seleccion: Punto?, error: String?, onElegir: (Punto) -> Unit, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var buscando by remember { mutableStateOf(false) }
    var centrarEn by remember { mutableStateOf<Punto?>(null) }

    fun usarGps() = scope.launch {
        buscando = true
        val p = Ubicacion.actual(context)
        buscando = false
        if (p == null) {
            Toast.makeText(context, "No se pudo obtener tu ubicación. Toca el mapa para marcarla.", Toast.LENGTH_LONG).show()
        } else {
            onElegir(p)
            centrarEn = p
        }
    }

    val permisos = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { r ->
        if (r.values.any { it }) usarGps()
    }

    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedButton(
            onClick = { if (Ubicacion.tienePermiso(context)) usarGps() else permisos.launch(Ubicacion.PERMISOS) },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            enabled = !buscando,
        ) {
            if (buscando) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
            else Icon(Icons.Outlined.MyLocation, null)
            Spacer(Modifier.width(8.dp))
            Text("Estoy en el lugar: usar mi ubicación", fontSize = 16.sp)
        }
        Text("…o toca el mapa donde ocurrió:", style = MaterialTheme.typography.bodyMedium)
        MapaOsm(
            modifier = Modifier.fillMaxWidth().weight(1f).clip(RoundedCornerShape(16.dp)),
            seleccion = seleccion,
            centrarEn = centrarEn,
            zoomInicial = 14.0,
            onTocarMapa = onElegir,
        )
        if (error != null) Text(error, color = MaterialTheme.colorScheme.error)
    }
}

@Composable
private fun PasoUbicacion(seleccion: Punto?, error: String?, onElegir: (Punto) -> Unit, onSiguiente: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(horizontal = 20.dp, vertical = 8.dp)) {
        SelectorUbicacion(seleccion, error, onElegir, Modifier.weight(1f))
        Spacer(Modifier.height(10.dp))
        Button(onClick = onSiguiente, enabled = seleccion != null, modifier = Modifier.fillMaxWidth().height(56.dp)) {
            Text(if (seleccion == null) "Marca el lugar para continuar" else "Continuar", fontSize = 18.sp)
        }
    }
}

@Composable
private fun PasoConfirmar(e: EstadoReportar, vm: ReportarViewModel) {
    val b = e.borrador
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp).imePadding(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Card {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(etiquetaTipo(b.tipo), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = colorTipo(b.tipo))
                Text("Cuándo: ${b.cuando.etiqueta}", fontSize = 17.sp)
                Text(
                    "Dónde: " + (b.ubicacion?.let { "%.5f, %.5f".format(it.lat, it.lng) } ?: "sin marcar"),
                    fontSize = 17.sp,
                )
            }
        }
        OutlinedTextField(
            value = b.descripcion,
            onValueChange = vm::descripcion,
            label = { Text(if (e.modo == Modo.GUIADO) "Detalles (opcional)" else "¿Qué pasó?") },
            isError = e.errores.containsKey("descripcion"),
            supportingText = { Text(e.errores["descripcion"] ?: "${b.descripcion.length}/500 · no incluyas nombres ni datos personales") },
            minLines = 3,
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = b.referencia,
            onValueChange = vm::referencia,
            label = { Text("Referencia (opcional)") },
            placeholder = { Text("Ej. Av. Revolución con Av. Central") },
            isError = e.errores.containsKey("referencia"),
            supportingText = e.errores["referencia"]?.let { { Text(it) } },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        ErroresEnvio(e)
        BotonEnviar(e.enviando, vm::enviar)
    }
}

@Composable
private fun ErroresEnvio(e: EstadoReportar) {
    if (e.error == null) return
    val extra = e.errores.filterKeys { it !in setOf("descripcion", "referencia") }.values
    Text(
        (listOf(e.error) + extra).joinToString("\n• "),
        color = MaterialTheme.colorScheme.error,
        style = MaterialTheme.typography.bodyMedium,
    )
}

@Composable
private fun BotonEnviar(enviando: Boolean, onEnviar: () -> Unit) {
    Button(onClick = onEnviar, enabled = !enviando, modifier = Modifier.fillMaxWidth().height(60.dp)) {
        if (enviando) CircularProgressIndicator(Modifier.size(22.dp), strokeWidth = 2.dp)
        else Text("Enviar reporte", fontSize = 19.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun ChatAsistente(e: EstadoReportar, vm: ReportarViewModel) {
    var texto by remember { mutableStateOf("") }
    val lista = rememberLazyListState()
    val context = LocalContext.current

    LaunchedEffect(e.mensajes.size, e.propuesta) {
        if (e.mensajes.isNotEmpty()) lista.animateScrollToItem(e.mensajes.size - 1 + if (e.propuesta != null) 1 else 0)
    }

    // Dictado por voz con el reconocedor del sistema.
    val dictado = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { r ->
        if (r.resultCode == Activity.RESULT_OK) {
            val dicho = r.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull().orEmpty()
            if (dicho.isNotBlank()) texto = (texto + " " + dicho).trim()
        }
    }

    Column(Modifier.fillMaxSize().imePadding()) {
        LazyColumn(
            Modifier.weight(1f).fillMaxWidth().padding(horizontal = 12.dp),
            state = lista,
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            items(e.mensajes) { m -> Burbuja(m.content, esVecino = m.role == "user") }
            e.propuesta?.let { p ->
                item {
                    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Detecté: ${etiquetaTipo(p.tipo)}", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                            if (p.zona.isNotBlank()) Text("Lugar: ${p.zona}")
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(onClick = vm::aceptarPropuesta, Modifier.weight(1f)) { Text("Sí, continuar") }
                                OutlinedButton(onClick = vm::rechazarPropuesta, Modifier.weight(1f)) { Text("No es así") }
                            }
                        }
                    }
                }
            }
            if (e.pensando) item { Text("El asistente está escribiendo…", style = MaterialTheme.typography.bodySmall) }
        }
        e.error?.let { Text(it, Modifier.padding(horizontal = 16.dp), color = MaterialTheme.colorScheme.error) }
        Surface(tonalElevation = 3.dp) {
            Row(Modifier.fillMaxWidth().padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = {
                    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                        .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                        .putExtra(RecognizerIntent.EXTRA_LANGUAGE, "es-PE")
                        .putExtra(RecognizerIntent.EXTRA_PROMPT, "Cuéntame qué pasó")
                    runCatching { dictado.launch(intent) }.onFailure {
                        Toast.makeText(context, "El dictado por voz no está disponible en este teléfono", Toast.LENGTH_SHORT).show()
                    }
                }) { Icon(Icons.Outlined.Mic, "Dictar por voz") }
                OutlinedTextField(
                    value = texto,
                    onValueChange = { texto = it.take(600) },
                    placeholder = { Text("Ej. Me robaron el celular en el paradero…") },
                    modifier = Modifier.weight(1f),
                    maxLines = 4,
                )
                IconButton(onClick = { vm.enviarMensaje(texto); texto = "" }, enabled = texto.isNotBlank() && !e.pensando) {
                    Icon(Icons.AutoMirrored.Outlined.Send, "Enviar")
                }
            }
        }
    }
}

@Composable
private fun Burbuja(texto: String, esVecino: Boolean) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = if (esVecino) Arrangement.End else Arrangement.Start) {
        Text(
            texto,
            Modifier
                .widthIn(max = 300.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(if (esVecino) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
                .padding(12.dp),
            color = if (esVecino) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 17.sp,
        )
    }
}

@Composable
private fun Formulario(e: EstadoReportar, tipos: List<TipoIncidente>, vm: ReportarViewModel) {
    val b = e.borrador
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 8.dp).imePadding(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Tipo de incidente", style = MaterialTheme.typography.titleSmall)
        FlujoChips {
            tipos.forEach { t ->
                FilterChip(selected = b.tipo == t.id, onClick = { vm.tipo(t.id) }, label = { Text(t.label) },
                    leadingIcon = { Icon(iconoTipo(t.id), null, Modifier.size(18.dp)) })
            }
        }
        e.errores["tipo"]?.let { Text(it, color = MaterialTheme.colorScheme.error) }

        Text("¿Cuándo ocurrió?", style = MaterialTheme.typography.titleSmall)
        FlujoChips {
            Cuando.entries.forEach { c ->
                FilterChip(selected = b.cuando == c, onClick = { vm.cuando(c) }, label = { Text(c.etiqueta) })
            }
        }
        e.errores["fechaHecho"]?.let { Text(it, color = MaterialTheme.colorScheme.error) }

        OutlinedTextField(
            value = b.descripcion,
            onValueChange = vm::descripcion,
            label = { Text("¿Qué pasó?") },
            isError = e.errores.containsKey("descripcion"),
            supportingText = { Text(e.errores["descripcion"] ?: "${b.descripcion.length}/500 · mínimo 10 caracteres") },
            minLines = 3,
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = b.referencia,
            onValueChange = vm::referencia,
            label = { Text("Referencia (opcional)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        Text("Ubicación", style = MaterialTheme.typography.titleSmall)
        SelectorUbicacion(b.ubicacion, e.errores["ubicacion"], vm::ubicacion, Modifier.height(380.dp))
        ErroresEnvio(e)
        BotonEnviar(e.enviando, vm::enviar)
        Spacer(Modifier.height(12.dp))
    }
}

@OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
private fun FlujoChips(content: @Composable () -> Unit) {
    androidx.compose.foundation.layout.FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(0.dp),
    ) { content() }
}

@Composable
private fun Exito(conCuenta: Boolean, onOtro: () -> Unit, onVerMapa: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
    ) {
        Icon(Icons.Outlined.CheckCircle, null, Modifier.size(96.dp), tint = MaterialTheme.colorScheme.primary)
        Text("¡Gracias, vecino/a!", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text(
            "Tu reporte ya aparece en el mapa de todos los vecinos y llega al panel de la municipalidad." +
                if (conCuenta) " Puedes seguir su estado en Mi cuenta." else "",
            style = MaterialTheme.typography.bodyLarge,
        )
        Button(onClick = onVerMapa, Modifier.fillMaxWidth().height(56.dp)) { Text("Ver en el mapa", fontSize = 18.sp) }
        TextButton(onClick = onOtro) { Text("Hacer otro reporte") }
    }
}
