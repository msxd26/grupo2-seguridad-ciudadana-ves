package pe.jsaire.seguridad.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

// Modelos que replican las respuestas JSON del backend Express (backend/src/models y services).

@Serializable
data class Usuario(
    val id: Int,
    val nombre: String,
    val email: String,
    val rol: String = "ciudadano",
    val activo: Boolean = true,
    val creadoEn: String? = null,
    val ultimoAcceso: String? = null,
)

@Serializable
data class TipoIncidente(
    val id: String,
    val label: String,
    val nivel: String = "info", // peligro | atencion | info
)

@Serializable
data class Reporte(
    val id: Int,
    val tipo: String,
    val modo: String = "formulario",
    val descripcion: String = "",
    val referencia: String? = null,
    val lat: Double,
    val lng: Double,
    val fechaHecho: String,
    val estado: String = "pendiente", // pendiente | verificado | descartado
    val esDemo: Boolean = false,
    val creadoEn: String? = null,
    val marcas: Int = 0,
    val confirmaciones: Int = 0,
    val oculto: Boolean = false,
    val comentarioAdmin: String? = null,
    val revisadoEn: String? = null,
)

@Serializable
data class Comisaria(
    val codigo: String? = null,
    val nombre: String,
    val distrito: String = "",
    val tipo: String? = null,
    val divpol: String? = null,
    val lat: Double,
    val lng: Double,
)

@Serializable
data class Zona(
    val id: String,
    val sur: Double,
    val norte: Double,
    val oeste: Double,
    val este: Double,
    val cantidad: Int,
    val nivel: String, // alto | medio | bajo
    val tipoPrincipal: String = "otro",
    val soloDemo: Boolean = false,
)

@Serializable
data class DatosMapa(
    val dias: Int = 30,
    val limite: JsonElement? = null,
    val bbox: List<Double> = emptyList(),
    val comisarias: List<Comisaria> = emptyList(),
    val reportes: List<Reporte> = emptyList(),
    val zonas: List<Zona> = emptyList(),
)

@Serializable
data class Alerta(
    val id: String,
    val tipo: String, // incidente | zona | tendencia | estacional
    val nivel: String, // alta | media | informativa
    val titulo: String,
    val mensaje: String = "",
    val fecha: String? = null,
    val reporteId: Int? = null,
    val tipoIncidente: String? = null,
    val lat: Double? = null,
    val lng: Double? = null,
    val estado: String? = null,
    val esDemo: Boolean = false,
    val fuente: String? = null,
)

@Serializable
data class MensajeChat(val role: String, val content: String)

@Serializable
data class RespuestaChat(
    val tipo: String = "",
    val descripcion: String = "",
    val zona: String = "",
    val cuando: String = "",
    val mensaje: String = "",
    val motor: String = "local",
)

@Serializable
data class Votos(
    val id: Int,
    val confirmaciones: Int? = null,
    val marcas: Int? = null,
    val oculto: Boolean? = null,
)

@Serializable
data class Presencia(val conectados: Int = 0)

@Serializable
data class IdSolo(val id: Int)

/** Datos que la app envía para crear un reporte (POST /api/reportes). */
@Serializable
data class NuevoReporte(
    val tipo: String,
    val modo: String,
    val descripcion: String,
    val referencia: String?,
    val lat: Double,
    val lng: Double,
    val fechaHecho: String,
)

@Serializable
data class TipoConteo(val tipo: String, val label: String, val total: Int)

@Serializable
data class PuntoSeguro(val nombre: String, val lat: Double, val lng: Double, val distancia: Int)

/** Recomendación de seguridad personalizada (GET /api/recomendacion). */
@Serializable
data class Recomendacion(
    val texto: String,
    val motor: String = "local",
    val riesgo: String = "bajo", // alto | medio | bajo
    val incidentes: Int = 0,
    val radioMetros: Int = 500,
    val dias: Int = 30,
    val tipos: List<TipoConteo> = emptyList(),
    val horaActual: String? = null,
    val horarioRiesgo: String? = null,
    val enHorarioRiesgo: Boolean = false,
    val puntosSeguros: List<PuntoSeguro> = emptyList(),
)
