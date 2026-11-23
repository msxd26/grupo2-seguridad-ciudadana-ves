# 🏘️ Tu Vecino — HackODS UA 2026

> *"Haciendo visible la inseguridad que no se denuncia."*

**Equipo:** Grupo 2 — Seguridad Ciudadana para Villa El Salvador (VES).

🔗 **Demo en vivo:** https://34-176-116-202.sslip.io/ (HTTPS con certificado válido;  redirige ahí)

## Descripción

Tu Vecino es una plataforma (web + app Android) de reporte ciudadano que convierte lo que ven los vecinos de
Villa El Salvador en un mapa de seguridad en tiempo real. Cubre la brecha entre la inseguridad real (la mayoría de
incidentes no se denuncia) y la registrada oficialmente, y la cruza con las **denuncias oficiales del SIDPOL**
(datos abiertos del MININTER) para que la municipalidad decida con más información.

### ODS y desafíos

- **ODS 5 — Igualdad de género:** canal seguro y anónimo para reportar acoso y violencia; la predicción solo muestra datos agregados por zona.
- **ODS 10 — Reducción de desigualdades:** reporte accesible para adultos mayores y personas con baja alfabetización digital (chat con IA y dictado por voz, modo paso a paso con botones grandes).
- Desafíos oficiales: **2 — Prevención de violencia** y **3 — Inclusión digital**.

---

## ✨ Funcionalidades

### Web (vecinos)

| Módulo | Ruta | Qué ofrece |
| --- | --- | --- |
| Inicio | `/` | Resumen del distrito, accesos a los módulos y alertas activas |
| Reportar | `/reportar` | Tres modos: **chat con IA** (`/reportar/chat`, escribir o dictar en `es-PE`), **paso a paso** (`/reportar/guiado`, botones grandes) y **formulario** (`/reportar/formulario`). Ubicación en el mapa validada dentro de VES; anónimo o con cuenta |
| Mapa | `/mapa` | Leaflet con límite distrital, mapa de calor, reportes por tipo y periodo, zonas de riesgo (cuadrícula de ~330 m) y comisarías PNP. Panel **En vivo** con vecinos conectados, reportes que llegan al instante y "seguir en vivo"; en cada reporte se puede **confirmar** ("¿También lo viste? +1") o **marcar como falso**. Selector de fuente para **comparar** reportes vecinales con las denuncias oficiales (brecha de visibilidad por zona). En celulares, los filtros van en una hoja inferior |
| Alertas | `/alertas` | Agrupadas en incidentes recientes, zonas de riesgo y tendencias oficiales, con contador por filtro (*Todas*, *Mi zona*, *Peligro alto*, *Zonas y análisis*), "Ver más" en mensajes largos y accesos a "Reportar igual" y a las estadísticas |
| Emergencias | `/contacto` | Números de emergencia (105, 116, 106, 100) y comisarías cercanas |
| Ingresar | `/ingresar` | Inicio de sesión y registro |
| Mi cuenta | `/mi-cuenta` | Historial de reportes del vecino con su estado (en revisión → verificado / no procede) y la respuesta del equipo |

**Avisos del navegador:** el vecino elige radio (500 m, 1 km, 2 km o todo el distrito), tipos de incidente y "solo
Peligro"; la preferencia y la ubicación se guardan solo en su navegador (el filtro se aplica en el dispositivo).
Cuando llegan varios reportes seguidos (una **ráfaga**), se recibe **un solo aviso** con el resumen ("5 reportes
nuevos · 3 robos y 2 acosos") y el mapa encuadra todos los puntos. El autor de un reporte recibe un aviso privado
cuando lo moderan. Los avisos y el GPS requieren HTTPS (ver despliegue).

**Moderación comunitaria:** con 3 marcas de "falso" de personas distintas el reporte se oculta hasta revisión.

Tipos de incidente: robo, intento de robo, acoso, actividad sospechosa, zona oscura, espacio abandonado y otro.

### Panel municipal (`/dashboard`)

Se abre desde la página de inicio o el pie de página. Tiene tres pestañas:

| Pestaña | Contenido |
| --- | --- |
| **Reportes vecinales** | KPIs, mapa de calor, tipos, línea de tiempo, horas críticas, canal de reporte y top de zonas con acción sugerida |
| **Denuncias oficiales (SIDPOL)** | Tablero estilo Power BI: filtros (distrito, periodo, modalidad), KPIs con variación, tendencia mensual, matriz de priorización, mapa de calor año × mes, ranking de distritos de Lima, estacionalidad y hallazgos automáticos. Filtro cruzado, vista en tabla, exportación a CSV y enlace con los filtros aplicados |
| **Predicción y plan** | Reportes esperados por zona para los próximos 7 y 30 días y **plan de acción** recomendado que el funcionario acepta, edita o descarta |

Cómo se calcula la predicción (`backend/src/services/prediccionService.js`):

```
esperado(7 días) = tasa semanal reciente × tendencia × ajuste estacional
```

- Tasa semanal: media ponderada de las últimas 4 semanas (pesos 4·3·2·1).
- Tendencia: últimos 14 días frente a los 14 anteriores, acotada a [0,7 – 1,3].
- Ajuste estacional: índice mensual de las denuncias SIDPOL del distrito, acotado a [0,85 – 1,15].
- Rango: intervalo de Poisson al 80 %. Solo se muestra una zona con 5 o más reportes en 8 semanas.

El plan de acción siempre se genera por reglas; si hay clave de Groq, la IA solo redacta la justificación y se
descarta cualquier texto con cifras que no estén en los datos.

### Administración (`/admin`, rol administrador)

- **Resumen:** indicadores agrupados en *Moderación* (pendientes, verificados, descartados, ocultos) y *Plataforma* (reportes, usuarios, alertas) y gráficos de los últimos días.
- **Reportes:** bandeja de moderación (verificar / descartar con comentario), filtros, búsqueda, paginación y detalle con mapa. En celular la tabla se muestra como tarjetas.
- **Usuarios:** cambiar rol y activar / desactivar.
- **Simulación en vivo** y **ráfaga de alertas** (3, 5 o 10 reportes DEMO) para presentaciones y para probar las notificaciones de la web y la app. La simulación se apaga sola a los 30 minutos.

### App Android (`mobile/`)

App nativa en Kotlin + Jetpack Compose que usa la misma API. Pantallas: Inicio, Mapa (osmdroid con mapa de calor),
Reportar, Alertas, Cuenta, Emergencias y Ajustes. Incluye **recomendación de seguridad según la ubicación**
(`/api/recomendacion`), notificaciones de reportes en tiempo real por WebSocket y sesión con la misma cookie de la web.
En **Ajustes → Avisos de reportes** se elige el radio, los tipos y "solo Peligro" (igual que en la web); una ráfaga
llega en una sola notificación y al tocarla el mapa encuadra todos los reportes.
El servidor por defecto es el despliegue en Google Cloud y se puede cambiar desde **Ajustes** (emulador o red local).

---

## 👥 Roles y sesión

| Rol | Puede |
| --- | --- |
| Visitante | Usar todo el sitio público y reportar de forma anónima |
| Ciudadano | Lo anterior + seguir sus reportes en **Mi cuenta** |
| Administrador | Lo anterior + moderar reportes, gestionar usuarios y lanzar la simulación en **/admin** |

- Contraseñas cifradas con **scrypt** (`crypto` de Node); la sesión es un JWT en la cookie `httpOnly` `ves_sesion`.
- El rol se lee siempre de la base de datos; un administrador no puede quitarse su propio rol y siempre queda al menos uno activo.
- Límites por IP (cada 10 min): 10 intentos de ingreso, 5 reportes, 40 mensajes al chat, 20 marcas/confirmaciones, 30 recomendaciones y 20 planes de acción.
- El primer administrador se crea con `ADMIN_EMAIL` y `ADMIN_PASSWORD`. En desarrollo (`backend/.env.example`): `admin@alertaves.pe` / `AdminVes2026` — **cámbialo** antes de publicar.

---

## 📊 Fuentes de datos

| Dato | Fuente | Detalle | Archivo |
| --- | --- | --- | --- |
| Denuncias policiales | [MININTER – SIDPOL (PNP)](https://www.datosabiertos.gob.pe/dataset/denuncias-policiales-registradas-nivel-nacional-mininter) | 43 distritos de Lima Metropolitana, desde 2018 (año en curso parcial), por año, mes y modalidad | `backend/database/seeders/data/denuncias_lima_mininter.csv` |
| Comisarías PNP | [MININTER – Comisarías básicas](https://www.datosabiertos.gob.pe/dataset/comisar%C3%ADas-b%C3%A1sicas-de-la-polic%C3%ADa-nacional-del-per%C3%BA-mininter) (nov. 2019) | Comisarías de VES y alrededores con coordenadas | `backend/database/seeders/data/comisarias_mininter.csv` |
| Límite distrital | [OpenStreetMap](https://www.openstreetmap.org/relation/1944858) (ODbL) | Polígono de Villa El Salvador (ubigeo 150142) | `backend/src/data/ves_limite.geojson` |

Las denuncias oficiales vienen **agregadas** (sin direcciones ni coordenadas); por eso el mapa y las zonas de riesgo
se construyen con los **reportes ciudadanos**.

**Datos de demostración:** se guardan con `es_demo = 1` y la interfaz los muestra con la etiqueta **DEMO**.

---

## 🧰 Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Backend | Node.js 22 + Express 5, `mysql2`, `jsonwebtoken`, `ws` |
| Base de datos | MySQL 8.4 (Docker) |
| Frontend | React 19 + Vite 6, React Router 7, Leaflet + react-leaflet + leaflet.heat, Lucide |
| App móvil | Kotlin, Jetpack Compose (Material 3), OkHttp, kotlinx.serialization, osmdroid (Android 10+, `minSdk 29`) |
| IA | Groq API — `llama-3.1-8b-instant` (opcional; sin clave se usan un clasificador y un redactor locales) |
| Voz | Web Speech API (dictado en `es-PE`) |
| Tiempo real | WebSocket en el mismo puerto de la API (`/api/ws`); si varios backends comparten la BD, se sincronizan cada 2 s por la base de datos |
| Despliegue | Docker Compose (MySQL + API + Nginx), VM en Google Cloud con HTTPS de Let's Encrypt (sslip.io); en la red local, certificado autofirmado |

---

## 🗂️ Estructura

```
grupo2-seguridad-ciudadana-ves/
├── backend/                     # API REST + WebSocket (Express + MySQL)
│   ├── database/
│   │   ├── migrations/          # SQL de tablas (denuncias, comisarías, reportes, usuarios, moderación…)
│   │   ├── seeders/             # Carga de CSV oficiales, administrador y datos DEMO
│   │   ├── migrate.js
│   │   └── inicializar.js       # Arranque en Docker: espera MySQL, migra, carga datos e inicia la API
│   └── src/
│       ├── config/              # Variables de entorno, conexión MySQL y catálogos (tipos, fuentes)
│       ├── routes/              # Endpoints
│       ├── middlewares/         # Sesión, roles, límites por IP y errores
│       ├── controllers/         # C: reciben la petición y responden
│       ├── services/            # Lógica: reportes, mapa, alertas, IA, predicción, plan, simulación…
│       ├── models/              # M: consultas a MySQL
│       ├── views/               # V: formato de respuesta JSON
│       ├── utils/               # Geo, contraseñas, bus de eventos y servidor WebSocket
│       └── data/                # Límite distrital (GeoJSON)
│
├── frontend/                    # Web (React + Vite)
│   ├── docker/                  # Nginx (proxy /api y WebSocket) y certificado HTTPS
│   └── src/
│       ├── views/               # V: pages, components y layouts
│       ├── controllers/         # C: custom hooks (estado y eventos)
│       ├── models/              # M: tipos, navegación, mapa, estadísticas, avisos
│       ├── services/            # Llamadas a la API
│       ├── context/             # Sesión (AuthContext) y tiempo real (EventosContext)
│       └── assets/styles/       # Tokens del design system y estilos por módulo
│
├── mobile/                      # App Android (Kotlin + Compose)
├── infra/                       # desplegar-gcp.sh (despliegue en la VM) y certificado-https.sh (Let's Encrypt)
├── docs/                        # Planes y especificaciones de diseño
├── docker-compose.yml
└── .env.example                 # Configuración para Docker Compose
```

**Patrón MVC.** Backend: `routes` → `middlewares` → `controllers` → `services` / `models` → `views`.
Frontend: las `views` (componentes React) muestran la interfaz, los `controllers` (hooks) manejan estado y eventos, y
los `models` definen los datos que llegan desde `services`.

---

## ⚙️ Requisitos

- [Node.js](https://nodejs.org/) 22 (el que usan las imágenes Docker)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git
- Para la app: Android Studio con JDK 11+ y SDK 36

---

## 🚀 Desarrollo local

```bash
git clone <url-del-repositorio>
cd grupo2-seguridad-ciudadana-ves
```

### 1. Base de datos

```bash
docker compose up -d mysql adminer   # MySQL en 127.0.0.1:3307 + Adminer en http://localhost:8080
```

| Servicio | Acceso | Credenciales por defecto (solo desarrollo) |
| --- | --- | --- |
| MySQL | `127.0.0.1:3307` | `ves_app` / `ves_app_2026`, BD `seguridad_ves` (root: `ves_root_2026`) |
| Adminer | http://localhost:8080 | servidor `mysql` + credenciales de arriba |

Se usa el puerto **3307** para no chocar con un MySQL local.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # ya apunta al MySQL de Docker
npm run db:setup          # tablas, datos oficiales y administrador
npm run db:demo           # (opcional) reportes DEMO para el mapa
npm run dev               # http://localhost:3000/api
```

| Script | Acción |
| --- | --- |
| `npm run dev` / `npm start` | API con recarga automática / API normal |
| `npm run db:migrate` | Crea la base de datos y aplica las migraciones |
| `npm run db:seed` | Carga denuncias y comisarías desde los CSV oficiales |
| `npm run db:admin` | Crea (o promueve) el administrador definido en `.env` |
| `npm run db:setup` | `db:migrate` + `db:seed` + `db:admin` |
| `npm run db:demo` | Crea 72 reportes DEMO de los últimos 10 días (reemplaza los anteriores) |
| `npm run db:demo:historial` | Crea 10 semanas de historial DEMO para la pestaña de predicción |
| `npm run db:demo:limpiar` | Elimina todos los reportes DEMO (los reales no se tocan) |
| `npm run datos:actualizar` | Descarga los CSV del portal de datos abiertos y regenera el de Lima (luego `db:seed`) |

Variables de `backend/.env`:

| Variable | Uso |
| --- | --- |
| `PORT`, `CORS_ORIGIN` | Puerto de la API y origen permitido del frontend |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a MySQL |
| `JWT_SECRET`, `SESION_DIAS` | Firma y duración de la sesión (en producción, mínimo 32 caracteres) |
| `ADMIN_NOMBRE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Primer administrador |
| `GROQ_API_KEY`, `GROQ_MODELO` | IA opcional ([clave gratuita](https://console.groq.com)) |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Vite redirige `/api` (REST y WebSocket) al backend en el puerto 3000.

### 4. App Android

Abrir la carpeta `mobile/` en Android Studio y ejecutar. Para usar el backend local, cambiar el servidor en
**Ajustes** de la app (por ejemplo `http://10.0.2.2:3000` en el emulador o `http://<IP-de-la-PC>` en la red local).

---

## 🐳 Despliegue con Docker (red local o servidor)

```bash
cp .env.example .env        # completar PUBLIC_HOST, JWT_SECRET, ADMIN_PASSWORD y claves de MySQL
docker compose up -d --build
```

| Contenedor | Qué hace |
| --- | --- |
| `seguridad-ves-mysql` | Base de datos (volumen `mysql_data`) |
| `seguridad-ves-backend` | API: espera a MySQL, migra, carga los datos oficiales si faltan, crea el administrador y, con `SEED_DEMO=true`, carga reportes DEMO la primera vez |
| `seguridad-ves-frontend` | Nginx: sirve la web, redirige `/api` y `/api/ws`, publica los puertos **80** y **443** |
| `seguridad-ves-adminer` | Administración de la BD, solo desde la misma PC (`http://localhost:8080`) |

Acceso desde la red: `http://<IP-de-la-PC>` o `https://<IP-de-la-PC>`.

- **HTTPS:** el GPS y las notificaciones del navegador solo funcionan con HTTPS. Nginx genera un certificado
  autofirmado para `PUBLIC_HOST`; la primera vez hay que aceptar el aviso del navegador. Por HTTP todo lo demás
  funciona (la ubicación se marca tocando el mapa).
- **Firewall de Windows** (PowerShell como administrador):
  `New-NetFirewallRule -DisplayName "Tu Vecino" -Direction Inbound -Protocol TCP -LocalPort 80,443 -Action Allow`
- **Actualizar:** `docker compose up -d --build` · **ver arranque:** `docker compose logs -f backend`
- **Detener:** `docker compose down` (conserva datos) · `docker compose down -v` (borra datos).
- Los mapas de OpenStreetMap necesitan salida a internet.

- **Varios backends con la misma BD** (por ejemplo el de desarrollo y el de Docker en la misma PC): cada uno reenvía a
  sus navegadores los reportes y moderaciones que guardó el otro, revisando la BD cada 2 s. `SINCRONIZACION_MS=0` lo desactiva.

### Google Cloud

`bash infra/desplegar-gcp.sh` (desde Git Bash, en la raíz) empaqueta el último commit, lo copia a la VM
`tu-vecino-vm` por el túnel IAP y ejecuta `docker compose up -d --build`. Requiere `gcloud` con sesión iniciada y el
archivo `.env.produccion` en la raíz (no se sube a git).

**HTTPS con certificado válido.** Con `SITIO_SEGURO` en `.env.produccion` (hoy `34-176-116-202.sslip.io`, una
dirección gratuita que apunta a la IP de la VM), Nginx usa el certificado de Let's Encrypt y redirige la web a HTTPS;
la API (`/api`) sigue respondiendo por HTTP para la app Android. Para emitirlo, una sola vez en la VM:

```bash
sudo bash /opt/tu-vecino/infra-certificado-https.sh   # copia de infra/certificado-https.sh
```

Valida el dominio sin detener Nginx, no envía ningún correo a Let's Encrypt y deja un cron diario (03:17) que
renueva el certificado y recarga Nginx. Para usar un dominio propio, cambiar `SITIO_SEGURO`, desplegar y volver a
ejecutar el script.

---

## 🔌 API

Todas las respuestas son JSON bajo `/api`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health` | Estado del servidor |
| POST | `/auth/registro` · `/auth/login` · `/auth/logout` | Crear cuenta, ingresar y salir |
| GET | `/auth/me` | Usuario de la sesión (o `null`) |
| GET | `/catalogos` | Años, modalidades y distritos disponibles |
| GET | `/dashboard?distrito=150142&desde=2024&hasta=2026&modalidades=Robo,Hurto` | Panel SIDPOL (parámetros opcionales) |
| GET | `/predicciones` | Predicción de reportes por zona |
| GET | `/predicciones/plan?zonas=` | Plan de acción recomendado |
| GET | `/mapa?dias=30&tipos=robo,acoso` | Límite, comisarías, reportes y zonas de riesgo (`dias`: 1, 7, 30 o 90) |
| GET | `/mapa/limite` | Límite distrital (GeoJSON) |
| GET | `/mapa/brecha` | Comparación reportes vecinales vs. denuncias oficiales por zona (brecha de visibilidad) |
| GET | `/comisarias` | Comisarías con coordenadas |
| GET | `/alertas` | Alertas vigentes |
| GET | `/recomendacion?lat=&lng=` | Recomendación de seguridad para una ubicación (app Android) |
| GET | `/reportes/tipos` | Tipos de incidente |
| GET | `/reportes?dias=30` | Reportes ciudadanos recientes |
| POST | `/reportes` | Crear reporte `{ tipo, descripcion, referencia?, lat, lng, fechaHecho }`; con sesión queda vinculado al usuario |
| GET | `/reportes/mios` | 🔒 Reportes del usuario |
| POST | `/reportes/chat` | Asistente con IA: `{ mensajes: [{ role, content }] }` → `{ tipo, descripcion, zona, cuando, mensaje }` |
| POST | `/reportes/:id/confirmar` · `/reportes/:id/marcar` | Confirmar el reporte / marcarlo como falso (uno por persona) |
| GET | `/panel-ciudadano?dias=30` | Panel de reportes vecinales |
| GET | `/admin/resumen` | 🛡️ Indicadores |
| GET · PATCH | `/admin/reportes` · `/admin/reportes/:id` | 🛡️ Bandeja de moderación / `{ estado, comentario }` (comentario obligatorio al descartar) |
| GET · PATCH | `/admin/usuarios` · `/admin/usuarios/:id` | 🛡️ Listar usuarios / cambiar `{ rol, activo }` |
| GET · POST | `/admin/simulacion` | 🛡️ Estado / encender o apagar la simulación en vivo |
| POST | `/admin/simulacion/rafaga` | 🛡️ Ráfaga de reportes DEMO `{ cantidad }` (1–10) |
| WS | `/ws` | Tiempo real. Mensajes `{ tipo, datos }`: `bienvenida`, `presencia`, `reporte`, `reporte-actualizado`, `reporte-oculto`, `reporte-moderado`, `simulacion`, `rafaga` y, solo al autor, `mi-reporte` |

🔒 requiere sesión · 🛡️ requiere rol administrador

---

## 🤝 Flujo de trabajo

1. Trabajar en la rama `dev` o en una rama `feature/...` creada desde ella.
2. Commits descriptivos (`feat:`, `fix:`…).
3. Abrir un Pull Request hacia `main` y esperar revisión antes de fusionar.
