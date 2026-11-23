package pe.jsaire.seguridad.ui.components

import android.graphics.Paint
import android.graphics.drawable.Drawable
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.core.graphics.ColorUtils
import androidx.core.graphics.drawable.DrawableCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.double
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.osmdroid.events.MapEventsReceiver
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.Polygon
import pe.jsaire.seguridad.data.model.Comisaria
import pe.jsaire.seguridad.data.model.Reporte
import pe.jsaire.seguridad.data.model.Zona
import pe.jsaire.seguridad.ui.colorNivel
import pe.jsaire.seguridad.ui.colorTipo
import pe.jsaire.seguridad.ui.etiquetaTipo
import pe.jsaire.seguridad.util.CENTRO_VES
import pe.jsaire.seguridad.util.Punto

/**
 * Mapa de OpenStreetMap (osmdroid) con el límite de Villa El Salvador, zonas de riesgo,
 * reportes ciudadanos y comisarías. También sirve para elegir un punto (modo selector).
 */
@Composable
fun MapaOsm(
    modifier: Modifier = Modifier,
    limite: JsonElement? = null,
    reportes: List<Reporte> = emptyList(),
    calor: List<Reporte> = emptyList(),
    nuevos: Set<Int> = emptySet(),
    comisarias: List<Comisaria> = emptyList(),
    zonas: List<Zona> = emptyList(),
    seleccion: Punto? = null,
    miUbicacion: Punto? = null,
    centrarEn: Punto? = null,
    zoomInicial: Double = 14.0,
    onReporteClick: (Reporte) -> Unit = {},
    onComisariaClick: (Comisaria) -> Unit = {},
    onTocarMapa: ((Punto) -> Unit)? = null,
) {
    val context = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    val alTocar by rememberUpdatedState(onTocarMapa)
    val alReporte by rememberUpdatedState(onReporteClick)
    val alComisaria by rememberUpdatedState(onComisariaClick)

    val mapa = remember {
        MapView(context).apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)
            zoomController.setVisibility(CustomZoomButtonsController.Visibility.SHOW_AND_FADEOUT)
            controller.setZoom(zoomInicial)
            controller.setCenter(GeoPoint(CENTRO_VES.lat, CENTRO_VES.lng))
            minZoomLevel = 11.0
            // Dentro de una pantalla con scroll, el arrastre mueve el mapa y no la pantalla.
            setOnTouchListener { v, _ ->
                v.parent?.requestDisallowInterceptTouchEvent(true)
                false
            }
        }
    }

    DisposableEffect(lifecycle) {
        val observer = LifecycleEventObserver { _, evento ->
            when (evento) {
                Lifecycle.Event.ON_RESUME -> mapa.onResume()
                Lifecycle.Event.ON_PAUSE -> mapa.onPause()
                else -> Unit
            }
        }
        lifecycle.addObserver(observer)
        onDispose {
            lifecycle.removeObserver(observer)
            mapa.onDetach()
        }
    }

    // Recentrar solo cuando cambia el destino pedido.
    androidx.compose.runtime.LaunchedEffect(centrarEn) {
        centrarEn?.let { mapa.controller.animateTo(GeoPoint(it.lat, it.lng), 16.0, 600L) }
    }

    AndroidView(
        modifier = modifier,
        factory = { mapa },
        update = { m ->
            m.overlays.clear()

            // Toques sobre el mapa (selector de ubicación).
            m.overlays.add(MapEventsOverlay(object : MapEventsReceiver {
                override fun singleTapConfirmedHelper(p: GeoPoint): Boolean {
                    val cb = alTocar ?: return false
                    cb(Punto(p.latitude, p.longitude))
                    return true
                }

                override fun longPressHelper(p: GeoPoint) = false
            }))

            limiteComoPoligono(limite)?.let { m.overlays.add(it) }

            if (calor.isNotEmpty()) {
                m.overlays.add(CapaCalor(calor.map { GeoPoint(it.lat, it.lng) }, m.resources.displayMetrics.density))
            }

            zonas.filter { it.nivel != "bajo" }.forEach { z ->
                val color = colorNivel(z.nivel)
                m.overlays.add(Polygon(m).apply {
                    points = listOf(
                        GeoPoint(z.sur, z.oeste), GeoPoint(z.sur, z.este),
                        GeoPoint(z.norte, z.este), GeoPoint(z.norte, z.oeste),
                    )
                    fillPaint.color = ColorUtils.setAlphaComponent(color.toArgb(), 70)
                    outlinePaint.color = color.toArgb()
                    outlinePaint.strokeWidth = 2f
                    title = "Zona con ${z.cantidad} reportes"
                    setOnClickListener { _, _, _ -> false }
                })
            }

            comisarias.forEach { c ->
                m.overlays.add(Marker(m).apply {
                    position = GeoPoint(c.lat, c.lng)
                    icon = pin(m, Color(0xFF0D47A1))
                    title = c.nombre
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                    setOnMarkerClickListener { _, _ -> alComisaria(c); true }
                })
            }

            reportes.forEach { r ->
                if (r.id in nuevos) {
                    // Reporte llegado en vivo: anillo destacado alrededor del punto.
                    m.overlays.add(Polygon(m).apply {
                        points = Polygon.pointsAsCircle(GeoPoint(r.lat, r.lng), 90.0)
                        fillPaint.color = ColorUtils.setAlphaComponent(colorTipo(r.tipo).toArgb(), 60)
                        outlinePaint.color = colorTipo(r.tipo).toArgb()
                        outlinePaint.strokeWidth = 5f
                        setOnClickListener { _, _, _ -> false }
                    })
                }
                m.overlays.add(Marker(m).apply {
                    position = GeoPoint(r.lat, r.lng)
                    icon = pin(m, colorTipo(r.tipo))
                    title = etiquetaTipo(r.tipo) + if (r.id in nuevos) " (nuevo)" else ""
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                    setOnMarkerClickListener { _, _ -> alReporte(r); true }
                })
            }

            miUbicacion?.let { p ->
                m.overlays.add(Marker(m).apply {
                    position = GeoPoint(p.lat, p.lng)
                    icon = pin(m, Color(0xFF00897B))
                    title = "Tú estás aquí"
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                    setOnMarkerClickListener { _, _ -> true }
                })
            }

            seleccion?.let { p ->
                m.overlays.add(Marker(m).apply {
                    position = GeoPoint(p.lat, p.lng)
                    icon = pin(m, Color(0xFFC62828))
                    title = "Lugar del incidente"
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                    setOnMarkerClickListener { _, _ -> true }
                })
            }
            m.invalidate()
        },
    )
}

private fun pin(m: MapView, color: Color): Drawable {
    val base = ContextCompat.getDrawable(m.context, org.osmdroid.library.R.drawable.marker_default)!!.mutate()
    return DrawableCompat.wrap(base).also { DrawableCompat.setTint(it, color.toArgb()) }
}

/** GeoJSON (FeatureCollection) del límite distrital → polígono sin relleno. */
private fun limiteComoPoligono(geojson: JsonElement?): Polygon? {
    val anillo = runCatching {
        val features = (geojson as JsonObject)["features"]!!.jsonArray
        val coords = features[0].jsonObject["geometry"]!!.jsonObject["coordinates"]!!.jsonArray
        // Polygon: [[ [lng,lat], ... ]]  ·  MultiPolygon: [[[ [lng,lat], ... ]]]
        val primero = coords[0].jsonArray
        if (primero[0].jsonArray[0] is JsonArray) primero[0].jsonArray else primero
    }.getOrNull() ?: return null
    return Polygon().apply {
        points = anillo.map { p ->
            val par = p.jsonArray
            GeoPoint(par[1].jsonPrimitive.double, par[0].jsonPrimitive.double)
        }
        fillPaint.color = android.graphics.Color.argb(18, 13, 71, 161)
        outlinePaint.color = android.graphics.Color.rgb(13, 71, 161)
        outlinePaint.strokeWidth = 4f
        outlinePaint.style = Paint.Style.STROKE
        setOnClickListener { _, _, _ -> false }
    }
}
