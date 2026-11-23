package pe.jsaire.seguridad.ui.components

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Point
import android.graphics.RadialGradient
import android.graphics.Rect
import android.graphics.Shader
import androidx.core.graphics.createBitmap
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Overlay
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow

/**
 * Mapa de calor por densidad de reportes para osmdroid.
 * Replica la capa de la web (leaflet.heat en frontend/src/views/components/mapa/CapaCalor.jsx):
 * radio 28 + desenfoque 22, maxZoom 16, opacidad mínima 0.35 y gradiente de semáforo
 * verde → amarillo → naranja → rojo.
 *
 * Funciona como simpleheat: cada punto se pinta como un círculo difuso en una capa de
 * intensidad (alfa) que se acumula; luego cada píxel se colorea según su intensidad.
 */
class CapaCalor(
    private val puntos: List<GeoPoint>,
    densidad: Float,
) : Overlay() {

    private val escala = 0.25f // se dibuja a 1/4 de resolución y se amplía (rápido y suave)
    private val radioPx = (28 + 22) * densidad * escala
    private val paleta = crearPaleta()
    private val pincel = Paint(Paint.ANTI_ALIAS_FLAG)
    private val pincelBitmap = Paint(Paint.FILTER_BITMAP_FLAG)
    private val punto = Point()
    private val destino = Rect()

    private var bitmap: Bitmap? = null
    private var pixeles = IntArray(0)

    // Caché: no se recalcula si el mapa no se movió.
    private var claveCache: String? = null

    override fun draw(canvas: Canvas, mapView: MapView, shadow: Boolean) {
        if (shadow || puntos.isEmpty()) return
        val pj = mapView.projection
        val area = pj.intrinsicScreenRect
        val ancho = max(1, ceil(area.width() * escala).toInt())
        val alto = max(1, ceil(area.height() * escala).toInt())

        val clave = "${pj.zoomLevel}|${pj.boundingBox}|$ancho|$alto"
        val bmp = bitmap?.takeIf { it.width == ancho && it.height == alto }
            ?: createBitmap(ancho, alto).also { bitmap = it; pixeles = IntArray(ancho * alto); claveCache = null }

        if (clave != claveCache) {
            dibujarIntensidad(bmp, mapView, area)
            colorear(bmp)
            claveCache = clave
        }
        destino.set(area.left, area.top, area.left + (ancho / escala).toInt(), area.top + (alto / escala).toInt())
        canvas.drawBitmap(bmp, null, destino, pincelBitmap)
    }

    private fun dibujarIntensidad(bmp: Bitmap, mapView: MapView, area: Rect) {
        bmp.eraseColor(Color.TRANSPARENT)
        val lienzo = Canvas(bmp)
        val pj = mapView.projection
        // leaflet.heat: con menos zoom cada punto aporta menos (v = 1 / 2^(maxZoom - zoom)).
        val v = 1.0 / 2.0.pow(max(0.0, min(MAX_ZOOM - pj.zoomLevel, 12.0)))
        val alfa = (min(max(v, MIN_OPACIDAD), 1.0) * 255).toInt()
        val margen = radioPx / escala

        for (gp in puntos) {
            pj.toPixels(gp, punto)
            val x = punto.x - area.left
            val y = punto.y - area.top
            if (x < -margen || y < -margen || x > area.width() + margen || y > area.height() + margen) continue
            val cx = x * escala
            val cy = y * escala
            pincel.shader = RadialGradient(
                cx, cy, radioPx,
                intArrayOf(Color.argb(alfa, 0, 0, 0), Color.argb(alfa / 2, 0, 0, 0), Color.TRANSPARENT),
                floatArrayOf(0f, 0.45f, 1f),
                Shader.TileMode.CLAMP,
            )
            lienzo.drawCircle(cx, cy, radioPx, pincel)
        }
    }

    private fun colorear(bmp: Bitmap) {
        val w = bmp.width
        val h = bmp.height
        bmp.getPixels(pixeles, 0, w, 0, 0, w, h)
        for (i in pixeles.indices) {
            val a = pixeles[i] ushr 24
            pixeles[i] = if (a == 0) 0 else paleta[a]
        }
        bmp.setPixels(pixeles, 0, w, 0, 0, w, h)
    }

    override fun onDetach(mapView: MapView?) {
        bitmap?.recycle()
        bitmap = null
    }

    companion object {
        private const val MAX_ZOOM = 16.0
        private const val MIN_OPACIDAD = 0.35

        // Mismo gradiente que la web: { 0.2: verde, 0.45: amarillo, 0.7: naranja, 1: rojo }.
        private val PARADAS = floatArrayOf(0f, 0.2f, 0.45f, 0.7f, 1f)
        private val COLORES = intArrayOf(0x16A34A, 0x16A34A, 0xFACC15, 0xF97316, 0xDC2626)

        /** 256 colores ARGB: el índice es la intensidad acumulada y también la opacidad final. */
        private fun crearPaleta() = IntArray(256) { i ->
            val t = i / 255f
            var k = 0
            while (k < PARADAS.size - 2 && t > PARADAS[k + 1]) k++
            val f = ((t - PARADAS[k]) / (PARADAS[k + 1] - PARADAS[k])).coerceIn(0f, 1f)
            val c0 = COLORES[k]
            val c1 = COLORES[k + 1]
            fun canal(desp: Int) = (((c0 shr desp) and 0xFF) * (1 - f) + ((c1 shr desp) and 0xFF) * f).toInt()
            Color.argb(i, canal(16), canal(8), canal(0))
        }
    }
}
