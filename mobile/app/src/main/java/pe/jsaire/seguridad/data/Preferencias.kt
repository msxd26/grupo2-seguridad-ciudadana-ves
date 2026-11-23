package pe.jsaire.seguridad.data

import android.content.Context
import androidx.core.content.edit
import pe.jsaire.seguridad.BuildConfig

/** Ajustes locales: dirección del servidor y cookie de sesión (JWT httpOnly `ves_sesion`). */
class Preferencias(context: Context) {
    private val prefs = context.getSharedPreferences("tu_vecino", Context.MODE_PRIVATE)

    var servidor: String
        get() = prefs.getString(KEY_SERVIDOR, null) ?: BuildConfig.SERVIDOR_POR_DEFECTO
        set(valor) = prefs.edit { putString(KEY_SERVIDOR, normalizarServidor(valor)) }

    var cookies: Set<String>
        get() = prefs.getStringSet(KEY_COOKIES, emptySet()) ?: emptySet()
        set(valor) = prefs.edit { putStringSet(KEY_COOKIES, valor) }

    companion object {
        private const val KEY_SERVIDOR = "servidor"
        private const val KEY_COOKIES = "cookies"

        fun normalizarServidor(valor: String): String {
            var url = valor.trim().trimEnd('/')
            if (!url.startsWith("http://") && !url.startsWith("https://")) url = "http://$url"
            return url.removeSuffix("/api")
        }
    }
}
