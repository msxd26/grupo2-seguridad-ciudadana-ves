package pe.jsaire.seguridad.ui.screens.alertas

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.GridOn
import androidx.compose.material.icons.outlined.TrendingUp
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.model.Alerta
import pe.jsaire.seguridad.data.remote.EventoTiempoReal
import pe.jsaire.seguridad.ui.AppViewModel
import pe.jsaire.seguridad.ui.colorNivel
import pe.jsaire.seguridad.ui.components.Etiqueta
import pe.jsaire.seguridad.ui.components.IconoCircular
import pe.jsaire.seguridad.ui.components.MensajeError
import pe.jsaire.seguridad.ui.iconoTipo
import pe.jsaire.seguridad.util.Fechas
import pe.jsaire.seguridad.util.Punto
import pe.jsaire.seguridad.util.Ubicacion

enum class Filtro { TODAS, MI_ZONA, PELIGRO }

/** Radio de "Mi zona" alrededor del vecino. */
private const val RADIO_MI_ZONA_M = 1_500.0

data class EstadoAlertas(
    val alertas: List<Alerta> = emptyList(),
    val cargando: Boolean = true,
    val error: String? = null,
    val filtro: Filtro = Filtro.TODAS,
    val miUbicacion: Punto? = null,
) {
    val visibles: List<Alerta>
        get() = when (filtro) {
            Filtro.TODAS -> alertas
            Filtro.PELIGRO -> alertas.filter { it.nivel == "alta" }
            Filtro.MI_ZONA -> miUbicacion?.let { yo ->
                alertas.filter { a ->
                    a.lat != null && a.lng != null && Ubicacion.distanciaMetros(yo, Punto(a.lat, a.lng)) <= RADIO_MI_ZONA_M
                }
            } ?: emptyList()
        }
}

class AlertasViewModel(private val c: AppContainer) : ViewModel() {
    private val _estado = MutableStateFlow(EstadoAlertas())
    val estado: StateFlow<EstadoAlertas> = _estado.asStateFlow()

    init {
        cargar()
    }

    fun cargar() {
        viewModelScope.launch {
            _estado.update { it.copy(cargando = true, error = null) }
            runCatching { c.api.alertas() }
                .onSuccess { a -> _estado.update { it.copy(alertas = a, cargando = false) } }
                .onFailure { e -> _estado.update { it.copy(error = e.message, cargando = false) } }
        }
    }

    fun filtrar(f: Filtro) = _estado.update { it.copy(filtro = f) }
    fun ubicacion(p: Punto) = _estado.update { it.copy(miUbicacion = p, filtro = Filtro.MI_ZONA) }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertasScreen(container: AppContainer, appVm: AppViewModel) {
    val vm: AlertasViewModel = viewModel { AlertasViewModel(container) }
    val e by vm.estado.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        appVm.eventos.collect {
            if (it is EventoTiempoReal.NuevoReporte || it is EventoTiempoReal.ReporteOculto || it is EventoTiempoReal.ReporteModerado) vm.cargar()
        }
    }

    fun miZona() = scope.launch {
        val p = Ubicacion.actual(context)
        if (p == null) Toast.makeText(context, "No se pudo obtener tu ubicación", Toast.LENGTH_SHORT).show()
        else vm.ubicacion(p)
    }

    val permisos = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { r ->
        if (r.values.any { it }) miZona()
    }

    Column(Modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            FilterChip(selected = e.filtro == Filtro.TODAS, onClick = { vm.filtrar(Filtro.TODAS) }, label = { Text("Todas") })
            FilterChip(
                selected = e.filtro == Filtro.MI_ZONA,
                onClick = {
                    when {
                        e.miUbicacion != null -> vm.filtrar(Filtro.MI_ZONA)
                        Ubicacion.tienePermiso(context) -> miZona()
                        else -> permisos.launch(Ubicacion.PERMISOS)
                    }
                },
                label = { Text("Mi zona (1,5 km)") },
            )
            FilterChip(selected = e.filtro == Filtro.PELIGRO, onClick = { vm.filtrar(Filtro.PELIGRO) }, label = { Text("Peligro alto") })
        }

        PullToRefreshBox(isRefreshing = e.cargando, onRefresh = vm::cargar, modifier = Modifier.weight(1f)) {
            LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                if (e.error != null) item { MensajeError(e.error!!, vm::cargar) }
                if (!e.cargando && e.error == null && e.visibles.isEmpty()) {
                    item {
                        Text(
                            if (e.filtro == Filtro.MI_ZONA) "No hay alertas cerca de ti. ¡Buena noticia!" else "No hay alertas por ahora.",
                            Modifier.padding(24.dp),
                        )
                    }
                }
                items(e.visibles, key = { it.id }) { TarjetaAlerta(it) }
            }
        }
    }
}

@Composable
fun TarjetaAlerta(a: Alerta, modifier: Modifier = Modifier) {
    val color = colorNivel(a.nivel)
    val icono = when (a.tipo) {
        "zona" -> Icons.Outlined.GridOn
        "tendencia" -> Icons.Outlined.TrendingUp
        "estacional" -> Icons.Outlined.CalendarMonth
        else -> iconoTipo(a.tipoIncidente)
    }
    Card(modifier.fillMaxWidth()) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.Top) {
            IconoCircular(icono, color)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(a.titulo, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                if (a.mensaje.isNotBlank()) Text(a.mensaje, style = MaterialTheme.typography.bodyMedium)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Etiqueta(
                        when (a.nivel) { "alta" -> "Peligro alto"; "media" -> "Atención"; else -> "Informativa" },
                        color,
                    )
                    if (a.esDemo) Etiqueta("Demo", MaterialTheme.colorScheme.outline)
                    a.fecha?.let { Text(Fechas.relativa(it), style = MaterialTheme.typography.bodySmall) }
                }
                a.fuente?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}
