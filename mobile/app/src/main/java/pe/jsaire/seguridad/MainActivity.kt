package pe.jsaire.seguridad

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import pe.jsaire.seguridad.ui.TuVecinoApp
import pe.jsaire.seguridad.ui.theme.AppmovilTheme
import pe.jsaire.seguridad.util.Encuadre
import pe.jsaire.seguridad.util.Notificaciones

class MainActivity : ComponentActivity() {
    private val container get() = (application as TuVecinoApplication).container

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        if (savedInstanceState == null) leerEnfoque(intent)
        setContent {
            AppmovilTheme {
                TuVecinoApp(container)
            }
        }
    }

    // La app ya estaba abierta y se tocó una notificación.
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        leerEnfoque(intent)
    }

    private fun leerEnfoque(intent: Intent?) {
        Encuadre.desdeTexto(intent?.getStringExtra(Notificaciones.EXTRA_ENCUADRE))?.let { container.enfoqueMapa.value = it }
    }
}
