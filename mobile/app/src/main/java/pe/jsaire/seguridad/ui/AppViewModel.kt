package pe.jsaire.seguridad.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import pe.jsaire.seguridad.AppContainer
import pe.jsaire.seguridad.data.model.TipoIncidente
import pe.jsaire.seguridad.data.model.Usuario
import pe.jsaire.seguridad.data.remote.ApiException
import pe.jsaire.seguridad.data.remote.EventoTiempoReal

/**
 * Estado compartido por toda la app: sesión del vecino, catálogo de tipos,
 * conexión con el servidor y eventos en tiempo real (WebSocket).
 */
class AppViewModel(private val c: AppContainer) : ViewModel() {
    private val _usuario = MutableStateFlow<Usuario?>(null)
    val usuario: StateFlow<Usuario?> = _usuario.asStateFlow()

    private val _tipos = MutableStateFlow(TIPOS_POR_DEFECTO)
    val tipos: StateFlow<List<TipoIncidente>> = _tipos.asStateFlow()

    private val _conectado = MutableStateFlow<Boolean?>(null)
    val conectado: StateFlow<Boolean?> = _conectado.asStateFlow()

    private val _vecinosEnLinea = MutableStateFlow(0)
    val vecinosEnLinea: StateFlow<Int> = _vecinosEnLinea.asStateFlow()

    private val _eventos = MutableSharedFlow<EventoTiempoReal>(extraBufferCapacity = 32)
    val eventos: SharedFlow<EventoTiempoReal> = _eventos.asSharedFlow()

    /** Avisos breves para mostrar en un Snackbar. */
    private val _avisos = MutableSharedFlow<String>(extraBufferCapacity = 8)
    val avisos: SharedFlow<String> = _avisos.asSharedFlow()

    val servidor: String get() = c.prefs.servidor

    private var trabajoEventos: Job? = null

    init {
        conectar()
    }

    /** (Re)inicia todo contra el servidor configurado. */
    fun conectar() {
        viewModelScope.launch {
            _conectado.value = c.api.health()
            if (_conectado.value == true) {
                runCatching { c.api.tipos() }.onSuccess { if (it.isNotEmpty()) _tipos.value = it }
                runCatching { c.api.yo() }.onSuccess { _usuario.value = it }
            }
        }
        trabajoEventos?.cancel()
        trabajoEventos = viewModelScope.launch {
            c.eventos.flujo().collect { evento ->
                if (evento is EventoTiempoReal.Conectados) _vecinosEnLinea.value = evento.total
                // Notificación del sistema por cada reporte nuevo de los vecinos.
                if (evento is EventoTiempoReal.NuevoReporte) c.notificaciones.nuevoReporte(evento.reporte)
                // Aviso privado: el moderador revisó un reporte mío (snackbar + notificación).
                if (evento is EventoTiempoReal.MiReporte) {
                    c.notificaciones.miReporte(evento.aviso)
                    val a = evento.aviso
                    val estado = when (a.estado) {
                        "verificado" -> "verificado ✅"
                        "descartado" -> "no procede"
                        else -> "en revisión"
                    }
                    _avisos.tryEmit("Tu reporte #${a.id}: $estado" + (a.comentarioAdmin?.let { " · $it" } ?: ""))
                }
                _eventos.emit(evento)
            }
        }
    }

    fun cambiarServidor(url: String) {
        c.prefs.servidor = url
        c.cookies.limpiar() // la sesión pertenece al servidor anterior
        _usuario.value = null
        conectar()
    }

    fun avisar(mensaje: String) {
        _avisos.tryEmit(mensaje)
    }

    suspend fun login(email: String, password: String): Result<Usuario> = runCatching {
        c.api.login(email.trim(), password)
    }.onSuccess { _usuario.value = it }

    suspend fun registro(nombre: String, email: String, password: String): Result<Usuario> = runCatching {
        c.api.registro(nombre.trim(), email.trim(), password)
    }.onSuccess { _usuario.value = it }

    fun logout() {
        viewModelScope.launch {
            runCatching { c.api.logout() }
            c.cookies.limpiar()
            _usuario.value = null
            avisar("Cerraste sesión")
        }
    }

    /** Si el servidor dice que la sesión ya no es válida, se limpia localmente. */
    fun sesionExpirada(e: Throwable) {
        if (e is ApiException && e.status == 401) {
            c.cookies.limpiar()
            _usuario.value = null
        }
    }
}
