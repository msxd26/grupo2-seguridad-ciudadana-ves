# 🛡️ Seguridad Ciudadana VES — Grupo 2

Sistema digital de **alertas ciudadanas y monitoreo de la delincuencia en Villa El Salvador**, que permite reportar incidentes, identificar zonas de riesgo y contribuir a mejorar la seguridad ciudadana.

---

## 📌 Objetivos

- **Reportar incidentes** de forma rápida desde cualquier dispositivo.
- **Identificar zonas de riesgo** a partir de los reportes registrados.
- **Monitorear la delincuencia** con información centralizada y actualizada.
- **Fortalecer la colaboración** entre vecinos y autoridades locales.

---

## 📊 Fuente de datos oficial

Las estadísticas provienen del dataset **[Denuncias policiales registradas a nivel nacional](https://www.datosabiertos.gob.pe/dataset/denuncias-policiales-registradas-nivel-nacional-mininter)**, publicado por el **Ministerio del Interior (MININTER)** en la **Plataforma Nacional de Datos Abiertos del Perú**.

| Campo | Detalle |
| --- | --- |
| Sistema de origen | SIDPOL – Sistema de Denuncias Policiales (PNP) |
| Cobertura | 2018 – 2026 (el año en curso es parcial) |
| Filtro aplicado | Villa El Salvador, ubigeo **150142** (distrito donde ocurrió el hecho) |
| Nivel de detalle | Año, mes y modalidad delictiva (cantidad de denuncias) |
| Modalidades | Violencia contra la mujer e integrantes del grupo familiar, robo, hurto, estafa, extorsión, secuestro y otros |
| Archivo local | `backend/database/seeders/data/denuncias_ves_mininter.csv` |

Para descargar la versión más reciente del portal: `npm run datos:actualizar` (en `backend/`) y luego `npm run db:seed`.

---

## 🧰 Stack tecnológico

| Capa          | Tecnología             |
| ------------- | ---------------------- |
| Backend       | Node.js + Express      |
| Base de datos | MySQL                  |
| Frontend      | React                  |
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
- [MySQL](https://www.mysql.com/) 8 o superior
- Git

---

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd grupo2-seguridad-ciudadana-ves
```

### Base de datos (Docker)

Requiere [Docker Desktop](https://www.docker.com/products/docker-desktop/). Desde la raíz del proyecto:

```bash
docker compose up -d      # MySQL 8.4 en el puerto 3307 + Adminer en http://localhost:8080
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
npm run db:setup          # crea la tabla y carga los datos oficiales
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
| GET | `/api/estadisticas/por-anio` | Total de denuncias por año |
| GET | `/api/estadisticas/resumen?anio=2025` | Total, promedio mensual, variación y modalidad principal |
| GET | `/api/estadisticas/por-modalidad?anio=2025` | Denuncias por modalidad delictiva |
| GET | `/api/estadisticas/por-mes?anio=2025` | Denuncias por mes |

Todas las respuestas incluyen el objeto `fuente` con la referencia al dataset oficial.

### Scripts del backend

| Script | Acción |
| --- | --- |
| `npm run db:migrate` | Crea la base de datos y ejecuta las migraciones |
| `npm run db:seed` | Carga el CSV oficial en MySQL |
| `npm run db:setup` | Migración + carga |
| `npm run datos:actualizar` | Descarga los CSV del portal y regenera el archivo de Villa El Salvador |

---

## 🤝 Flujo de trabajo

1. Crear una rama desde `main`: `git checkout -b feature/nombre-funcionalidad`
2. Realizar commits descriptivos.
3. Subir la rama y abrir un Pull Request hacia `main`.
4. Esperar revisión antes de fusionar.

---

## 👥 Equipo

**Grupo 2** — Proyecto de Seguridad Ciudadana para Villa El Salvador.
