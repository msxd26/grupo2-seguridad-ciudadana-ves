package pe.jsaire.seguridad

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import pe.jsaire.seguridad.ui.TuVecinoApp
import pe.jsaire.seguridad.ui.theme.AppmovilTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val container = (application as TuVecinoApplication).container
        setContent {
            AppmovilTheme {
                TuVecinoApp(container)
            }
        }
    }
}
