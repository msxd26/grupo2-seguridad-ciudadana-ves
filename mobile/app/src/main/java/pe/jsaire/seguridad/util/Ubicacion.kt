package pe.jsaire.seguridad.util

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import androidx.core.content.ContextCompat
import androidx.core.location.LocationManagerCompat
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeoutOrNull
import kotlin.coroutines.resume
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

data class Punto(val lat: Double, val lng: Double)

/** Centro aproximado de Villa El Salvador (vista inicial del mapa). */
val CENTRO_VES = Punto(-12.2133, -76.9363)

object Ubicacion {
    val PERMISOS = arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)

    fun tienePermiso(context: Context) = PERMISOS.any {
        ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
    }

    /** Ubicación actual con el GPS/red del teléfono (sin Google Play Services). Null si no se obtiene en 15 s. */
    @SuppressLint("MissingPermission")
    suspend fun actual(context: Context): Punto? {
        if (!tienePermiso(context)) return null
        val lm = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val proveedores = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)
            .filter { runCatching { lm.isProviderEnabled(it) }.getOrDefault(false) }
        val ultima = proveedores.mapNotNull { runCatching { lm.getLastKnownLocation(it) }.getOrNull() }
            .maxByOrNull { it.time }
        val reciente = ultima?.takeIf { System.currentTimeMillis() - it.time < 2 * 60_000 }
        if (reciente != null) return Punto(reciente.latitude, reciente.longitude)

        val proveedor = proveedores.firstOrNull() ?: return ultima?.let { Punto(it.latitude, it.longitude) }
        val nueva: Location? = withTimeoutOrNull(15_000) {
            suspendCancellableCoroutine { cont ->
                val cancelacion = android.os.CancellationSignal()
                cont.invokeOnCancellation { cancelacion.cancel() }
                LocationManagerCompat.getCurrentLocation(
                    lm, proveedor, cancelacion, ContextCompat.getMainExecutor(context),
                ) { loc -> if (cont.isActive) cont.resume(loc) }
            }
        }
        return (nueva ?: ultima)?.let { Punto(it.latitude, it.longitude) }
    }

    fun distanciaMetros(a: Punto, b: Punto): Double {
        val r = 6_371_000.0
        val dLat = Math.toRadians(b.lat - a.lat)
        val dLng = Math.toRadians(b.lng - a.lng)
        val h = sin(dLat / 2) * sin(dLat / 2) +
            cos(Math.toRadians(a.lat)) * cos(Math.toRadians(b.lat)) * sin(dLng / 2) * sin(dLng / 2)
        return 2 * r * atan2(sqrt(h), sqrt(1 - h))
    }
}
