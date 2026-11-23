package pe.jsaire.seguridad

import android.app.Application
import okhttp3.OkHttpClient
import org.osmdroid.config.Configuration
import pe.jsaire.seguridad.data.Preferencias
import pe.jsaire.seguridad.data.remote.CookieJarPersistente
import pe.jsaire.seguridad.data.remote.EventosTiempoReal
import pe.jsaire.seguridad.data.remote.TuVecinoApi
import java.util.concurrent.TimeUnit

/** Contenedor simple de dependencias compartidas por toda la app. */
class AppContainer(app: Application) {
    val prefs = Preferencias(app)
    val cookies = CookieJarPersistente(prefs)
    private val http = OkHttpClient.Builder()
        .cookieJar(cookies)
        .connectTimeout(8, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()
    val api = TuVecinoApi(prefs, http)
    val eventos = EventosTiempoReal(prefs, http)
}

class TuVecinoApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        // osmdroid: identificador requerido por la política de uso de los mosaicos de OpenStreetMap.
        Configuration.getInstance().apply {
            load(this@TuVecinoApplication, getSharedPreferences("osmdroid", MODE_PRIVATE))
            userAgentValue = packageName
        }
    }
}
