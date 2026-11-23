package pe.jsaire.seguridad.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material.icons.outlined.AddAlert
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Map
import androidx.compose.material.icons.outlined.NotificationsActive
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.remote.EventoTiempoReal
import pe.jsaire.seguridad.ui.screens.ajustes.AjustesScreen
import pe.jsaire.seguridad.ui.screens.alertas.AlertasScreen
import pe.jsaire.seguridad.ui.screens.contacto.ContactoScreen
import pe.jsaire.seguridad.ui.screens.cuenta.CuentaScreen
import pe.jsaire.seguridad.ui.screens.inicio.InicioScreen
import pe.jsaire.seguridad.ui.screens.mapa.MapaScreen
import pe.jsaire.seguridad.ui.screens.reportar.ReportarScreen

private enum class Destino(val ruta: String, val titulo: String, val icono: ImageVector?) {
    INICIO("inicio", "Inicio", Icons.Outlined.Home),
    MAPA("mapa", "Mapa", Icons.Outlined.Map),
    REPORTAR("reportar", "Reportar", Icons.Outlined.AddAlert),
    ALERTAS("alertas", "Alertas", Icons.Outlined.NotificationsActive),
    CUENTA("cuenta", "Mi cuenta", Icons.Outlined.AccountCircle),
    CONTACTO("contacto", "Contacto y emergencias", null),
    AJUSTES("ajustes", "Ajustes", null),
}

private val PESTANAS = listOf(Destino.INICIO, Destino.MAPA, Destino.REPORTAR, Destino.ALERTAS, Destino.CUENTA)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TuVecinoApp(container: AppContainer) {
    val appVm: AppViewModel = viewModel { AppViewModel(container) }
    val nav = rememberNavController()
    val entrada by nav.currentBackStackEntryAsState()
    val actual = Destino.entries.firstOrNull { it.ruta == entrada?.destination?.route } ?: Destino.INICIO
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(Unit) { appVm.avisos.collect { snackbar.showSnackbar(it) } }
    // Aviso en pantalla cuando un vecino reporta algo (tiempo real).
    LaunchedEffect(Unit) {
        appVm.eventos.collect { e ->
            if (e is EventoTiempoReal.NuevoReporte) snackbar.showSnackbar("Nuevo reporte: ${etiquetaTipo(e.reporte.tipo)}")
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (actual == Destino.INICIO) "Tu Vecino" else actual.titulo) },
                navigationIcon = {
                    if (actual !in PESTANAS) {
                        IconButton(onClick = { nav.popBackStack() }) { Icon(Icons.AutoMirrored.Outlined.ArrowBack, "Atrás") }
                    }
                },
                actions = {
                    if (actual == Destino.INICIO) {
                        IconButton(onClick = { nav.navigate(Destino.AJUSTES.ruta) }) { Icon(Icons.Outlined.Settings, "Ajustes") }
                    }
                },
            )
        },
        bottomBar = {
            NavigationBar {
                PESTANAS.forEach { d ->
                    NavigationBarItem(
                        selected = actual == d,
                        onClick = { irAPestana(nav, d.ruta) },
                        icon = { Icon(d.icono!!, null) },
                        label = { Text(d.titulo) },
                    )
                }
            }
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Box(Modifier.padding(padding)) {
            NavHost(nav, startDestination = Destino.INICIO.ruta) {
                composable(Destino.INICIO.ruta) {
                    InicioScreen(
                        container, appVm,
                        onReportar = { irAPestana(nav, Destino.REPORTAR.ruta) },
                        onMapa = { irAPestana(nav, Destino.MAPA.ruta) },
                        onAlertas = { irAPestana(nav, Destino.ALERTAS.ruta) },
                        onContacto = { nav.navigate(Destino.CONTACTO.ruta) },
                        onAjustes = { nav.navigate(Destino.AJUSTES.ruta) },
                    )
                }
                composable(Destino.MAPA.ruta) { MapaScreen(container, appVm) }
                composable(Destino.REPORTAR.ruta) {
                    ReportarScreen(container, appVm, onVerMapa = { irAPestana(nav, Destino.MAPA.ruta) })
                }
                composable(Destino.ALERTAS.ruta) { AlertasScreen(container, appVm) }
                composable(Destino.CUENTA.ruta) { CuentaScreen(container, appVm) }
                composable(Destino.CONTACTO.ruta) { ContactoScreen(container) }
                composable(Destino.AJUSTES.ruta) { AjustesScreen(appVm) }
            }
        }
    }
}

private fun irAPestana(nav: NavHostController, ruta: String) {
    nav.navigate(ruta) {
        popUpTo(nav.graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}
