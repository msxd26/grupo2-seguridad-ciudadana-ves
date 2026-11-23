# 🛡️ Seguridad Ciudadana VES — Grupo 2

Sistema digital de **alertas ciudadanas y monitoreo de la delincuencia en Villa El Salvador**, que permite reportar incidentes, identificar zonas de riesgo y contribuir a mejorar la seguridad ciudadana.

---

## 📌 Objetivos

- **Reportar incidentes** de forma rápida desde cualquier dispositivo.
- **Identificar zonas de riesgo** a partir de los reportes registrados.
- **Monitorear la delincuencia** con información centralizada y actualizada.
- **Fortalecer la colaboración** entre vecinos y autoridades locales.

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

> ⚠️ El proyecto está en fase inicial: por ahora solo existe la estructura de directorios. Los pasos siguientes se completarán a medida que se configure cada módulo.

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd grupo2-seguridad-ciudadana-ves

# Backend
cd backend
npm install
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

---

## 🤝 Flujo de trabajo

1. Crear una rama desde `main`: `git checkout -b feature/nombre-funcionalidad`
2. Realizar commits descriptivos.
3. Subir la rama y abrir un Pull Request hacia `main`.
4. Esperar revisión antes de fusionar.

---

## 👥 Equipo

**Grupo 2** — Proyecto de Seguridad Ciudadana para Villa El Salvador.
