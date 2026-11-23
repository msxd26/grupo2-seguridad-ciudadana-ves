package pe.jsaire.seguridad.ui.screens.mapa

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.GridOn
import androidx.compose.material.icons.outlined.Place
import androidx.compose.material.icons.outlined.Sensors
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material.icons.outlined.Whatshot
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.IconButton
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Flag
import androidx.compose.material.icons.outlined.LocalPolice
import androidx.compose.material.icons.outlined.MyLocation
import androidx.compose.material.icons.outlined.ThumbUp
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SmallFloatingActionButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.model.Comisaria
import pe.jsaire.seguridad.data.model.Reporte
import pe.jsaire.seguridad.ui.AppViewModel
import pe.jsaire.seguridad.ui.colorEstado
import pe.jsaire.seguridad.ui.colorTipo
import pe.jsaire.seguridad.ui.components.Etiqueta
import pe.jsaire.seguridad.ui.components.IconoCircular
import pe.jsaire.seguridad.ui.components.MapaOsm
import pe.jsaire.seguridad.ui.components.RecomendacionCard
import pe.jsaire.seguridad.ui.etiquetaEstado
import pe.jsaire.seguridad.ui.etiquetaTipo
import pe.jsaire.seguridad.ui.iconoTipo
import pe.jsaire.seguridad.util.Encuadre
import pe.jsaire.seguridad.util.Fechas
import pe.jsaire.seguridad.util.Punto
import pe.jsaire.seguridad.util.Ubicacion
import pe.jsaire.seguridad.util.resumenTipos

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapaScreen(container: AppContainer, appVm: AppViewModel) {
    val vm: MapaViewModel = viewModel { MapaViewModel(container) }
    val estado by vm.estado.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var reporteAbierto by remember { mutableStateOf<Reporte?>(null) }
    var comisariaAbierta by remember { mutableStateOf<Comisaria?>(null) }
    var miUbicacion by remember { mutableStateOf<Punto?>(null) }
    var centrarEn by remember { mutableStateOf<Punto?>(null) }
    var verRecomendacion by remember { mutableStateOf(false) }

    val tipos by appVm.tipos.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) { appVm.eventos.collect(vm::aplicarEvento) }
    // "Seguir en vivo": el mapa vuela al reporte nuevo y abre su ficha.
    LaunchedEffect(Unit) {
        vm.volarA.collect { r ->
            centrarEn = Punto(r.lat, r.lng)
            reporteAbierto = r
        }
    }
    // Ráfaga: se encuadran todos sus reportes (en vivo o al abrir la app desde la notificación).
    var encuadrarEn by remember { mutableStateOf<Encuadre?>(null) }
    LaunchedEffect(Unit) { vm.encuadrar.collect { encuadrarEn = it; reporteAbierto = null } }
    val enfoque by container.enfoqueMapa.collectAsStateWithLifecycle()
    LaunchedEffect(enfoque) {
        enfoque?.let { encuadrarEn = it; container.enfoqueMapa.value = null }
    }

    fun ubicarme() = scope.launch {
        val p = Ubicacion.actual(context)
        if (p == null) {
            Toast.makeText(context, "No se pudo obtener tu ubicación", Toast.LENGTH_SHORT).show()
        } else {
            miUbicacion = p
            centrarEn = p
        }
    }

    val permisos = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { r ->
        if (r.values.any { it }) ubicarme()
    }

    Box(Modifier.fillMaxSize()) {
        val datos = estado.datos
        val capas = estado.capas
        MapaOsm(
            modifier = Modifier.fillMaxSize(),
            limite = datos?.limite,
            reportes = if (Capa.INCIDENTES in capas) estado.reportes else emptyList(),
            calor = if (Capa.CALOR in capas) estado.reportes else emptyList(),
            nuevos = estado.nuevos,
            comisarias = if (Capa.COMISARIAS in capas) datos?.comisarias.orEmpty() else emptyList(),
            zonas = if (Capa.ZONAS in capas) datos?.zonas.orEmpty() else emptyList(),
            miUbicacion = miUbicacion,
            centrarEn = centrarEn,
            encuadrarEn = encuadrarEn,
            onReporteClick = { reporteAbierto = it },
            onComisariaClick = { comisariaAbierta = it },
        )

        Column(Modifier.fillMaxWidth()) {
            Surface(tonalElevation = 3.dp, shadowElevation = 3.dp) {
                Column(
                    Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalArrangement = Arrangement.spacedBy(2.dp),
                ) {
                    FilaChips {
                        listOf(1 to "24 h", 7 to "7 días", 30 to "30 días", 90 to "90 días").forEach { (d, txt) ->
                            FilterChip(selected = estado.dias == d, onClick = { vm.cambiarDias(d) }, label = { Text(txt) })
                        }
                        FilterChip(
                            selected = estado.seguirEnVivo, onClick = vm::alternarSeguir,
                            label = { Text("Seguir en vivo") },
                            leadingIcon = { Icon(Icons.Outlined.Sensors, null) },
                        )
                    }
                    FilaChips {
                        Capa.entries.forEach { c ->
                            FilterChip(
                                selected = c in capas, onClick = { vm.alternarCapa(c) },
                                label = { Text(c.etiqueta) },
                                leadingIcon = { Icon(iconoCapa(c), null) },
                            )
                        }
                    }
                    FilaChips {
                        FilterChip(selected = estado.tipo == null, onClick = { vm.cambiarTipo(null) }, label = { Text("Todos") })
                        tipos.forEach { t ->
                            FilterChip(
                                selected = estado.tipo == t.id,
                                onClick = { vm.cambiarTipo(if (estado.tipo == t.id) null else t.id) },
                                label = { Text(t.label) },
                                leadingIcon = { Icon(iconoTipo(t.id), null, tint = colorTipo(t.id)) },
                            )
                        }
                    }
                    Text(
                        when {
                            estado.error != null -> estado.error!!
                            datos == null -> "Cargando mapa…"
                            else -> "${estado.reportes.size} reportes vecinales · ${datos.zonas.count { it.nivel != "bajo" }} zonas críticas" +
                                if (estado.nuevos.isNotEmpty()) " · ${estado.nuevos.size} nuevos en vivo" else ""
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = if (estado.error != null) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            if (estado.cargando) LinearProgressIndicator(Modifier.fillMaxWidth())
        }

        Column(
            Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Bottom) {
                if (Capa.CALOR in capas) LeyendaCalor()
                Spacer(Modifier.weight(1f))
                SmallFloatingActionButton(onClick = { verRecomendacion = true }) {
                    Icon(Icons.Outlined.Shield, "¿Qué tan seguro es aquí?")
                }
                Spacer(Modifier.width(8.dp))
                SmallFloatingActionButton(
                    onClick = { if (Ubicacion.tienePermiso(context)) ubicarme() else permisos.launch(Ubicacion.PERMISOS) },
                ) { Icon(Icons.Outlined.MyLocation, "Mi ubicación") }
            }
            if (estado.rafaga.size > 1) {
                AvisoRafaga(estado.rafaga, onVer = vm::verRafaga, onCerrar = vm::cerrarRafaga)
            } else estado.ultimoEnVivo?.let { r ->
                AvisoEnVivo(
                    r,
                    onVer = { centrarEn = Punto(r.lat, r.lng); reporteAbierto = r },
                    onCerrar = vm::cerrarAvisoEnVivo,
                )
            }
        }
    }

    reporteAbierto?.let { abierto ->
        // Siempre la versión más reciente (los votos cambian en vivo).
        val r = estado.datos?.reportes?.firstOrNull { it.id == abierto.id } ?: abierto
        ModalBottomSheet(onDismissRequest = { reporteAbierto = null }) {
            DetalleReporte(
                reporte = r,
                onConfirmar = { scope.launch { vm.confirmar(r.id).onSuccess(appVm::avisar).onFailure { appVm.avisar(it.message ?: "Error") } } },
                onMarcar = {
                    scope.launch {
                        vm.marcarFalso(r.id).onSuccess(appVm::avisar).onFailure { appVm.avisar(it.message ?: "Error") }
                        reporteAbierto = null
                    }
                },
            )
        }
    }

    if (verRecomendacion) {
        ModalBottomSheet(onDismissRequest = { verRecomendacion = false }) {
            RecomendacionCard(
                container,
                modifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 24.dp).navigationBarsPadding(),
                autoIniciar = true,
                onUbicacion = { p -> miUbicacion = p; centrarEn = p },
            )
        }
    }

    comisariaAbierta?.let { c ->
        ModalBottomSheet(onDismissRequest = { comisariaAbierta = null }) {
            Column(Modifier.padding(20.dp).navigationBarsPadding(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconoCircular(Icons.Outlined.LocalPolice, MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.width(12.dp))
                    Text(c.nombre, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
                Text("${c.distrito}${c.divpol?.let { " · $it" } ?: ""}")
                Text("Comisaría de la Policía Nacional del Perú (punto seguro).", style = MaterialTheme.typography.bodySmall)
                Spacer(Modifier.height(8.dp))
                Button(onClick = { pe.jsaire.seguridad.ui.components.llamar(context, "105") }, Modifier.fillMaxWidth()) {
                    Text("Llamar a la Policía (105)")
                }
                Spacer(Modifier.height(12.dp))
            }
        }
    }
}

@Composable
private fun FilaChips(content: @Composable () -> Unit) {
    Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) { content() }
}

private fun iconoCapa(c: Capa) = when (c) {
    Capa.CALOR -> Icons.Outlined.Whatshot
    Capa.INCIDENTES -> Icons.Outlined.Place
    Capa.ZONAS -> Icons.Outlined.GridOn
    Capa.COMISARIAS -> Icons.Outlined.LocalPolice
}

/** Leyenda del mapa de calor (mismo gradiente de semáforo que la web). */
@Composable
private fun LeyendaCalor() {
    Surface(shape = RoundedCornerShape(12.dp), tonalElevation = 3.dp, shadowElevation = 2.dp) {
        Column(Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) {
            Text("Densidad de reportes", style = MaterialTheme.typography.labelSmall)
            Box(
                Modifier.padding(vertical = 4.dp).width(140.dp).height(8.dp).clip(RoundedCornerShape(4.dp)).background(
                    Brush.horizontalGradient(
                        listOf(Color(0xFF16A34A), Color(0xFFFACC15), Color(0xFFF97316), Color(0xFFDC2626)),
                    ),
                ),
            )
            Row(Modifier.width(140.dp)) {
                Text("Baja", style = MaterialTheme.typography.labelSmall)
                Spacer(Modifier.weight(1f))
                Text("Alta", style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

/** Tarjeta con el último reporte llegado en tiempo real. */
@Composable
private fun AvisoEnVivo(r: Reporte, onVer: () -> Unit, onCerrar: () -> Unit) {
    Card(
        onClick = onVer,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
    ) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(10.dp).clip(CircleShape).background(Color(0xFFDC2626)))
            Spacer(Modifier.width(10.dp))
            IconoCircular(iconoTipo(r.tipo), colorTipo(r.tipo))
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text("EN VIVO · ${etiquetaTipo(r.tipo)}", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                Text(
                    r.referencia ?: r.descripcion,
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(Fechas.relativa(r.creadoEn ?: r.fechaHecho), style = MaterialTheme.typography.labelSmall)
            }
            IconButton(onClick = onCerrar) { Icon(Icons.Outlined.Close, "Cerrar") }
        }
    }
}

/** Varios reportes seguidos: un solo aviso con el resumen y el botón para verlos todos en el mapa. */
@Composable
private fun AvisoRafaga(lista: List<Reporte>, onVer: () -> Unit, onCerrar: () -> Unit) {
    Card(
        onClick = onVer,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
    ) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(40.dp).clip(CircleShape).background(Color(0xFFDC2626)), contentAlignment = Alignment.Center) {
                Text("${lista.size}", color = Color.White, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text("${lista.size} reportes nuevos", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                Text(resumenTipos(lista), style = MaterialTheme.typography.bodySmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Text("Toca para verlos todos en el mapa", style = MaterialTheme.typography.labelSmall)
            }
            IconButton(onClick = onCerrar) { Icon(Icons.Outlined.Close, "Cerrar") }
        }
    }
}

@Composable
private fun DetalleReporte(reporte: Reporte, onConfirmar: () -> Unit, onMarcar: () -> Unit) {
    Column(Modifier.padding(20.dp).navigationBarsPadding(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconoCircular(iconoTipo(reporte.tipo), colorTipo(reporte.tipo))
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(etiquetaTipo(reporte.tipo), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text(Fechas.relativa(reporte.fechaHecho), style = MaterialTheme.typography.bodySmall)
            }
            Etiqueta(etiquetaEstado(reporte.estado), colorEstado(reporte.estado))
        }
        Text(reporte.descripcion, style = MaterialTheme.typography.bodyLarge)
        reporte.referencia?.let { Text("📍 $it", style = MaterialTheme.typography.bodyMedium) }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            AssistChip(onClick = {}, label = { Text("${reporte.confirmaciones} lo vieron") })
            AssistChip(onClick = {}, label = { Text("${reporte.marcas} marcas de falso") })
            if (reporte.esDemo) AssistChip(onClick = {}, label = { Text("Demo") })
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = onConfirmar, Modifier.weight(1f)) {
                Icon(Icons.Outlined.ThumbUp, null)
                Spacer(Modifier.width(6.dp))
                Text("Yo también lo vi")
            }
            OutlinedButton(onClick = onMarcar, Modifier.weight(1f)) {
                Icon(Icons.Outlined.Flag, null)
                Spacer(Modifier.width(6.dp))
                Text("Es falso")
            }
        }
        Text(
            "Con 3 marcas de personas distintas el reporte se oculta hasta que la municipalidad lo revise.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(8.dp))
    }
}
