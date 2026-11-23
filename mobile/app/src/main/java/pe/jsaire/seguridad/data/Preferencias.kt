package pe.jsaire.seguridad.data

import android.content.Context
import androidx.core.content.edit
import pe.jsaire.seguridad.BuildConfig
import pe.jsaire.seguridad.util.ConfigAvisos

/** Ajustes locales: dirección del servidor y cookie de sesión (JWT httpOnly `ves_sesion`). */
class Preferencias(context: Context) {
    private val prefs = context.getSharedPreferences("tu_vecino", Context.MODE_PRIVATE)

    var servidor: String
        get() = prefs.getString(KEY_SERVIDOR, null) ?: BuildConfig.SERVIDOR_POR_DEFECTO
        set(valor) = prefs.edit { putString(KEY_SERVIDOR, normalizarServidor(valor)) }

    var cookies: Set<String>
        get() = prefs.getStringSet(KEY_COOKIES, emptySet()) ?: emptySet()
        set(valor) = prefs.edit { putStringSet(KEY_COOKIES, valor) }

    /** Preferencias de avisos. La ubicación se guarda solo en este teléfono. */
    var avisos: ConfigAvisos
        get() = ConfigAvisos(
            activo = prefs.getBoolean(KEY_AV_ACTIVO, true),
            radio = prefs.getInt(KEY_AV_RADIO, 0).takeIf { it > 0 },
            lat = prefs.getString(KEY_AV_LAT, null)?.toDoubleOrNull(),
            lng = prefs.getString(KEY_AV_LNG, null)?.toDoubleOrNull(),
            tipos = prefs.getStringSet(KEY_AV_TIPOS, emptySet()) ?: emptySet(),
            soloPeligro = prefs.getBoolean(KEY_AV_PELIGRO, false),
        )
        set(c) = prefs.edit {
            putBoolean(KEY_AV_ACTIVO, c.activo)
            putInt(KEY_AV_RADIO, c.radio ?: 0)
            putString(KEY_AV_LAT, c.lat?.toString())
            putString(KEY_AV_LNG, c.lng?.toString())
            putStringSet(KEY_AV_TIPOS, c.tipos)
            putBoolean(KEY_AV_PELIGRO, c.soloPeligro)
        }

    companion object {
        private const val KEY_AV_ACTIVO = "avisos_activo"
        private const val KEY_AV_RADIO = "avisos_radio"
        private const val KEY_AV_LAT = "avisos_lat"
        private const val KEY_AV_LNG = "avisos_lng"
        private const val KEY_AV_TIPOS = "avisos_tipos"
        private const val KEY_AV_PELIGRO = "avisos_solo_peligro"
        private const val KEY_SERVIDOR = "servidor"
        private const val KEY_COOKIES = "cookies"

        fun normalizarServidor(valor: String): String {
            var url = valor.trim().trimEnd('/')
            if (!url.startsWith("http://") && !url.startsWith("https://")) url = "http://$url"
            return url.removeSuffix("/api")
        }
    }
}
