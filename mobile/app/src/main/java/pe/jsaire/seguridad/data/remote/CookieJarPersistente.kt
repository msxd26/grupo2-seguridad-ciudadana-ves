package pe.jsaire.seguridad.data.remote

import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import pe.jsaire.seguridad.data.Preferencias

/**
 * Guarda la cookie de sesión del backend (`ves_sesion`) para que la sesión sobreviva
 * al cerrar la app. Igual que el navegador: el servidor la crea al iniciar sesión y la borra al salir.
 */
class CookieJarPersistente(private val prefs: Preferencias) : CookieJar {
    private val cookies = mutableListOf<Cookie>()

    init {
        val base = HttpUrl.Builder().scheme("http").host("localhost").build()
        prefs.cookies.mapNotNullTo(cookies) { Cookie.parse(base, it) }
    }

    @Synchronized
    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        for (nueva in cookies) {
            this.cookies.removeAll { it.name == nueva.name }
            if (nueva.expiresAt > System.currentTimeMillis()) this.cookies.add(nueva)
        }
        guardar()
    }

    // Una sola API por instalación: la cookie se envía al servidor configurado, sea cual sea su host.
    @Synchronized
    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        val ahora = System.currentTimeMillis()
        if (cookies.removeAll { it.expiresAt <= ahora }) guardar()
        return cookies.map { c ->
            Cookie.Builder().name(c.name).value(c.value).hostOnlyDomain(url.host).path("/").build()
        }
    }

    @Synchronized
    fun limpiar() {
        cookies.clear()
        guardar()
    }

    private fun guardar() {
        prefs.cookies = cookies.map { it.toString() }.toSet()
    }
}
