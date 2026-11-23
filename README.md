# 🏘️ Tu Vecino — HackODS UA 2026

> *"Haciendo visible la inseguridad que no se denuncia."*

**Equipo:** Grupo 2
**Integrantes:** [Nombre 1], [Nombre 2], [Nombre 3]

## Descripción

Tu Vecino es una plataforma web de reporte ciudadano que transforma el conocimiento colectivo de los vecinos de
Villa El Salvador en un mapa de seguridad en tiempo real. Llena la brecha entre la inseguridad real (la mayoría de
incidentes no se denuncia) y la registrada oficialmente, y la cruza con las **denuncias oficiales del SIDPOL**
(datos abiertos del MININTER) para que la municipalidad decida con más información.

## ODS abordados

- **ODS 5 — Igualdad de género:** canal seguro y anónimo para reportar acoso y violencia.
- **ODS 10 — Reducción de desigualdades:** interfaz accesible para adultos mayores y personas con baja
  alfabetización digital (chat con IA + modo paso a paso con botones grandes).

## Desafíos oficiales

- Desafío 2: Prevención de violencia
- Desafío 3: Inclusión digital

## Demo en vivo

🔗 *[URL del despliegue — pendiente]*

---

## ✨ Funcionalidades (plan Tu Vecino)

| Funcionalidad | Dónde |
| --- | --- |
| **3 modos de reporte** — chat con IA (escribir o dictar por voz), paso a paso (botones grandes, letra ≥ 18 px) y formulario | `/reportar` |
| **Mapa en tiempo real** con mapa de calor, incidentes por tipo, zonas críticas y puntos seguros (comisarías PNP) | `/mapa` |
| **Tiempo real con WebSocket**: reportes, confirmaciones, marcas, moderación y vecinos conectados llegan al instante a todas las pantallas; el autor recibe un aviso privado cuando moderan su reporte | todo el sitio |
| **Alertas comunitarias**: feed de reportes de 24 h, filtros *Mi zona* (geolocalización) y *Peligro alto* | `/alertas` |
| **Moderación comunitaria**: "Marcar como falso"; con 3 marcas de personas distintas el reporte se oculta hasta revisión | popup del mapa |
| **Panel municipal** de reportes vecinales: KPIs, calor, tipos, línea de tiempo, horas críticas, canal de reporte y top 5 zonas con acción sugerida + panel de **denuncias oficiales SIDPOL** estilo Power BI | `/dashboard` |
| Reporte **anónimo** (sin registro) o con cuenta para seguir su estado | `/mi-cuenta` |
| Administración: moderación, reportes marcados y usuarios | `/admin` |

Tipos de incidente: robo, intento de robo, acoso, actividad sospechosa, zona oscura, espacio abandonado y otro.

---

## 🧭 Módulos

| Módulo | Ruta | Qué ofrece |
| --- | --- | --- |
| Inicio | `/` | Resumen del distrito, accesos a los módulos y alertas activas |
| **Panel de decisión** | `/dashboard` | Tablero estilo Power BI: filtros (distrito, periodo, modalidad), KPIs con variación, tendencia mensual con promedio móvil, matriz de priorización, mapa de calor año × mes, ranking de los 43 distritos de Lima, estacionalidad y hallazgos automáticos. Filtro cruzado al hacer clic en los gráficos, vista en tabla, exportación a CSV y enlace compartible con los filtros aplicados |
| Mapa de riesgo | `/mapa` | Mapa Leaflet con límite distrital, comisarías PNP, reportes ciudadanos y zonas de riesgo (cuadrícula de ~330 m) por periodo y tipo |
| Reportar incidente | `/reportar` | Formulario anónimo con ubicación en el mapa, validado dentro de Villa El Salvador y con límite de envíos por IP |
| Alertas | `/alertas` | Alertas automáticas por zonas con reportes, modalidades oficiales en aumento y estacionalidad |
| Contacto | `/contacto` | Números de emergencia y comisarías de VES y distritos vecinos |
| Ingresar | `/ingresar` | Inicio de sesión y registro de vecinos |
| **Mi cuenta** (ciudadano) | `/mi-cuenta` | Vista amigable: saludo, accesos rápidos, historial de reportes con su estado (en revisión → verificado / no procede) y la respuesta del equipo, consejo del día, alertas y emergencias |
| **Administración** (admin) | `/admin` | Resumen de reportes y usuarios, bandeja de moderación (verificar / descartar con comentario, filtros, búsqueda, paginación y detalle con mapa) y gestión de usuarios (rol y activación) |

### Roles y sesión

| Rol | Puede |
| --- | --- |
| Visitante | Ver todo el sitio público y reportar de forma anónima |
| Ciudadano | Lo anterior + seguir sus reportes y ver las respuestas del equipo en **Mi cuenta** |
| Administrador | Lo anterior + moderar reportes y gestionar usuarios en **/admin** |

- Contraseñas cifradas con **scrypt** (módulo `crypto` de Node); la sesión es un JWT en una cookie `httpOnly` (`ves_sesion`).
- El rol se lee siempre de la base de datos; un administrador no puede quitarse su propio rol y siempre queda al menos uno activo.
- Límite de 10 intentos de ingreso cada 10 minutos por IP.
- El primer administrador se crea con `npm run db:admin` a partir de `ADMIN_EMAIL` y `ADMIN_PASSWORD` de `backend/.env` (en desarrollo: `admin@alertaves.pe` / `AdminVes2026`; **cámbialo** antes de publicar).

---

## 📊 Fuentes de datos oficiales

| Dato | Fuente | Detalle | Archivo |
| --- | --- | --- | --- |
| Denuncias policiales | [MININTER – SIDPOL (PNP)](https://www.datosabiertos.gob.pe/dataset/denuncias-policiales-registradas-nivel-nacional-mininter), Plataforma Nacional de Datos Abiertos | 43 distritos de Lima Metropolitana, 2018–2026 (año en curso parcial), por año, mes y modalidad | `backend/database/seeders/data/denuncias_lima_mininter.csv` |
| Comisarías PNP | [MININTER – Comisarías básicas](https://www.datosabiertos.gob.pe/dataset/comisar%C3%ADas-b%C3%A1sicas-de-la-polic%C3%ADa-nacional-del-per%C3%BA-mininter) (nov. 2019) | 21 comisarías de VES y alrededores con coordenadas GPS | `backend/database/seeders/data/comisarias_mininter.csv` |
| Límite distrital | [OpenStreetMap](https://www.openstreetmap.org/relation/1944858) (ODbL) | Polígono de Villa El Salvador (ubigeo 150142) | `backend/src/data/ves_limite.geojson` |

Las denuncias oficiales vienen **agregadas** (sin direcciones ni coordenadas); por eso el mapa de riesgo se construye con los **reportes ciudadanos** de la aplicación.

> **Datos de demostración:** `npm run db:demo` crea 90 reportes ciudadanos ficticios, marcados con `es_demo = 1` y la etiqueta **DEMO** en la interfaz, para probar el mapa y las alertas. Se eliminan con `npm run db:demo:limpiar`.

---

## 🧰 Stack tecnológico

| Capa          | Tecnología             |
| ------------- | ---------------------- |
| Backend       | Node.js + Express      |
| Base de datos | MySQL 8.4 (Docker)     |
| Frontend      | React 19 + Vite, React Router, Leaflet + leaflet.heat, Lucide (íconos), fuente Inter |
| IA conversacional | Groq API — `llama-3.1-8b-instant` (opcional; sin clave usa un clasificador local) |
| Voz           | Web Speech API (dictado en `es-PE`) |
| Tiempo real   | WebSocket (`ws`) en el mismo puerto de la API, ruta `/api/ws` |
| Arquitectura  | MVC (backend y frontend) |
| Repositorio   | Monorepo               |

---

## 🗂️ Estructura del monorepo

```
grupo2-seguridad-ciudadana-ves/
├── backend/                  # API REST (Express + MySQL)
│   ├── database/
│   │   ├── migrations/       # Scripts de creación/modificación de tablas
│   │   └── seeders/          # Datos iniciales de prueba
│   ├── src/
│   │   ├── config/           # Configuración (BD, variables de entorno)
│   │   ├── models/           # M: acceso a datos y entidades (MySQL)
│   │   ├── views/            # V: formato de respuestas JSON / plantillas
│   │   ├── controllers/      # C: manejo de peticiones y respuestas
│   │   ├── routes/           # Definición de endpoints
│   │   ├── middlewares/      # Autenticación, validaciones, errores
│   │   ├── services/         # Lógica de negocio reutilizable
│   │   └── utils/            # Funciones auxiliares
│   └── tests/                # Pruebas del backend
│
├── frontend/                 # Aplicación web (React)
│   ├── public/               # Archivos estáticos
│   ├── src/
│   │   ├── assets/           # Imágenes y estilos
│   │   ├── models/           # M: entidades y estructuras de datos
│   │   ├── views/            # V: interfaz de usuario
│   │   │   ├── pages/        # Pantallas completas
│   │   │   ├── components/   # Componentes reutilizables
│   │   │   └── layouts/      # Plantillas de diseño
│   │   ├── controllers/      # C: lógica de UI (custom hooks)
│   │   ├── services/         # Comunicación con la API
│   │   ├── routes/           # Rutas de navegación
│   │   ├── context/          # Estado global
│   │   └── utils/            # Funciones auxiliares
│   └── tests/                # Pruebas del frontend
│
├── docs/                     # Documentación del proyecto
├── docker-compose.yml        # MySQL + Adminer para desarrollo
└── README.md
```

### Patrón MVC

- **Backend:** la petición llega a `routes` → pasa por `middlewares` → la atiende un `controller`, que usa `services` y `models` para consultar MySQL → la respuesta se formatea en `views`.
- **Frontend:** las `views` (componentes React) muestran la interfaz; los `controllers` (custom hooks) manejan el estado y los eventos; los `models` definen la forma de los datos que llegan desde `services`.

---

## ⚙️ Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para MySQL)
- Git

---

## 🐳 Despliegue en la red local (Docker)

Levanta la aplicación completa (MySQL + API + web) para que cualquier celular o PC de la misma red la use.

```bash
cp .env.example .env        # completar PUBLIC_HOST (IP de esta PC), JWT_SECRET y ADMIN_PASSWORD
docker compose up -d --build
```

| Contenedor | Qué hace |
| --- | --- |
| `seguridad-ves-mysql` | Base de datos (volumen `mysql_data`) |
| `seguridad-ves-backend` | API Express: al iniciar espera a MySQL, migra, carga los datos oficiales si faltan y crea el administrador |
| `seguridad-ves-frontend` | Nginx: sirve la app compilada, redirige `/api` (incluido el WebSocket `/api/ws`) y publica los puertos **80** y **443** |
| `seguridad-ves-adminer` | Administración de la BD, solo desde esta PC (`http://localhost:8080`) |

Desde la red: **`http://<IP-de-la-PC>`** o **`https://<IP-de-la-PC>`**. Para saber la IP: `ipconfig` (Windows) o `ip a` (Linux).

- **HTTPS y celulares:** el GPS ("Usar mi ubicación") y las notificaciones del navegador solo funcionan con HTTPS. Nginx
  genera un certificado autofirmado para `PUBLIC_HOST`; la primera vez el navegador muestra un aviso: elegir
  *Configuración avanzada → Continuar*. Por HTTP todo lo demás funciona (la ubicación se marca tocando el mapa).
- **Firewall:** si otros equipos no conectan, permitir los puertos 80 y 443 (PowerShell como administrador):
  `New-NetFirewallRule -DisplayName "Tu Vecino" -Direction Inbound -Protocol TCP -LocalPort 80,443 -Action Allow`
- **Actualizar** tras cambios en el código: `docker compose up -d --build`. Ver el arranque: `docker compose logs -f backend`.
- Los mapas (OpenStreetMap) y la fuente Inter se cargan desde internet: la red local necesita salida a internet.

---

## 🚀 Instalación (desarrollo)

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd grupo2-seguridad-ciudadana-ves
```

### Base de datos (Docker)

Requiere [Docker Desktop](https://www.docker.com/products/docker-desktop/). Desde la raíz del proyecto:

```bash
docker compose up -d mysql adminer   # solo MySQL (puerto 3307) + Adminer en http://localhost:8080
```

| Servicio | Acceso | Credenciales (solo desarrollo) |
| --- | --- | --- |
| MySQL | `127.0.0.1:3307` | usuario `ves_app` / `ves_app_2026`, BD `seguridad_ves` |
| MySQL (root) | `127.0.0.1:3307` | `root` / `ves_root_2026` |
| Adminer | http://localhost:8080 | servidor `mysql` + credenciales de arriba |

Se usa el puerto **3307** para no chocar con un MySQL instalado localmente. Las credenciales se pueden cambiar con un `.env` en la raíz (`MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `MYSQL_PORT`).

```bash
docker compose down       # detener (los datos se conservan en el volumen)
docker compose down -v    # detener y borrar los datos
```

### Backend (API)

```bash
cd backend
npm install
cp .env.example .env      # ya apunta al MySQL de Docker
npm run db:setup          # tablas, datos oficiales y usuario administrador
npm run db:demo           # (opcional) reportes de demostración para el mapa
npm run dev               # http://localhost:3000/api
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

El frontend redirige `/api` al backend automáticamente (proxy de Vite).

---

## 🔌 Endpoints de la API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Estado del servidor |
| GET | `/api/catalogos` | Años, modalidades y distritos disponibles |
| GET | `/api/dashboard?distrito=150142&desde=2024&hasta=2026&modalidades=Robo,Hurto` | Datos del panel de decisión (todos los parámetros son opcionales) |
| GET | `/api/mapa?dias=30&tipos=Robo` | Límite, comisarías, reportes y zonas de riesgo (`dias`: 7, 30 o 90) |
| GET | `/api/mapa/limite` | Límite distrital (GeoJSON) |
| GET | `/api/comisarias` | Comisarías con coordenadas |
| GET | `/api/alertas` | Alertas automáticas vigentes |
| GET | `/api/reportes/tipos` | Tipos de incidente que se pueden reportar |
| GET | `/api/reportes?dias=30` | Reportes ciudadanos recientes |
| POST | `/api/reportes` | Crea un reporte: `{ tipo, descripcion, referencia?, lat, lng, fechaHecho }` (máx. 5 cada 10 min por IP). Con sesión queda vinculado al usuario |
| GET | `/api/reportes/mios` | 🔒 Reportes del usuario con sesión |
| POST | `/api/reportes/chat` | Asistente de reporte: `{ mensajes: [{ role, content }] }` → `{ tipo, descripcion, zona, cuando, mensaje }` |
| POST | `/api/reportes/:id/marcar` | Marca comunitaria "esto es falso" (una por persona) |
| GET | `/api/panel-ciudadano?dias=30` | Panel municipal de reportes vecinales |
| WS | `/api/ws` | WebSocket de tiempo real. El servidor envía `{ tipo, datos }`: `bienvenida`, `presencia`, `reporte`, `reporte-actualizado`, `reporte-oculto`, `reporte-moderado`, `simulacion` y, solo al autor, `mi-reporte` |
| POST | `/api/auth/registro` · `/api/auth/login` · `/api/auth/logout` | Crear cuenta, ingresar y salir |
| GET | `/api/auth/me` | Usuario de la sesión actual (o `null`) |
| GET | `/api/admin/resumen` | 🛡️ Indicadores de reportes, usuarios y alertas |
| GET | `/api/admin/reportes?estado=&tipo=&q=&pagina=&demo=1` | 🛡️ Bandeja de moderación |
| PATCH | `/api/admin/reportes/:id` | 🛡️ `{ estado, comentario }` (comentario obligatorio al descartar) |
| GET · PATCH | `/api/admin/usuarios` · `/api/admin/usuarios/:id` | 🛡️ Listar usuarios / cambiar `{ rol, activo }` |

🔒 requiere sesión · 🛡️ requiere rol administrador

### Scripts del backend

| Script | Acción |
| --- | --- |
| `npm run db:migrate` | Crea la base de datos y ejecuta las migraciones |
| `npm run db:seed` | Carga denuncias y comisarías desde los CSV oficiales |
| `npm run db:admin` | Crea (o promueve) el administrador definido en `.env` |
| `npm run db:setup` | Migración + carga + administrador |
| `npm run db:demo` / `npm run db:demo:limpiar` | Crea / elimina reportes de demostración |
| `npm run datos:actualizar` | Descarga los CSV del portal y regenera el archivo de Lima Metropolitana |

---

## 🤝 Flujo de trabajo

1. Crear una rama desde `main`: `git checkout -b feature/nombre-funcionalidad`
2. Realizar commits descriptivos.
3. Subir la rama y abrir un Pull Request hacia `main`.
4. Esperar revisión antes de fusionar.

---

## 👥 Equipo

**Grupo 2** — Proyecto de Seguridad Ciudadana para Villa El Salvador.
