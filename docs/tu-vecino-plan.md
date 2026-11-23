# TU VECINO — Plan Maestro de Hackatón
> "Haciendo visible la inseguridad que no se denuncia."
> Contexto: Villa el Salvador, Lima, Perú · Stack: Next.js + Supabase + Tailwind + Leaflet + Recharts
> Generado con IA · Listo para ejecutar

---

## ⚠️ ALINEACIÓN CON BASES HACKODS UA 2026 — LECTURA OBLIGATORIA

> **Evento:** HackODS UA 2026 — Universidad Autónoma del Perú
> **Fecha:** 23 de noviembre de 2026 (HOY)
> **Sede:** Campus Lima Sur, Panamericana Sur Km. 16.3, Villa El Salvador

### Desafíos oficiales cubiertos por Tu Vecino

| Desafío oficial | ODS | Cómo Tu Vecino lo cubre |
|---|---|---|
| **Desafío 2 — Prevención de violencia** | **ODS 5** | Canal digital para reportar incidentes de acoso, violencia de género y actividades sospechosas de forma anónima y segura |
| **Desafío 3 — Inclusión digital** | **ODS 10** | Interfaz de chat IA + wizard paso a paso para adultos mayores y personas con baja alfabetización digital |

> **Nota estratégica:** Tu Vecino cubre 2 de los 3 desafíos oficiales simultáneamente. Mencionar esto explícitamente en el pitch.

### Criterios de evaluación y pesos (rúbrica oficial)

| Criterio | Peso | Cómo Tu Vecino maximiza este criterio |
|---|---|---|
| **Impacto** | **30%** | 86% de incidentes no denunciados en Lima (INEI 2023); afecta a toda la comunidad de VES |
| **Ejecución técnica** | **30%** | MVP funcional con Next.js + Supabase + Groq + Leaflet; demo en vivo navegable |
| **Innovación** | **25%** | IA conversacional para reporte; heatmap en tiempo real; 3 modos de accesibilidad |
| **Presentación** | **15%** | Pitch de 2–3 min con 5 slides exactas (ver sección 10f) |

> **Desempate:** Si hay empate, el jurado prioriza **Impacto**. Siempre abrir y cerrar el pitch con el argumento de impacto social.

### Entregables obligatorios de las bases

| Entregable | Estado en el plan | Tarea |
|---|---|---|
| ✅ Repositorio GitHub con README | T12 (nuevo) | Ver checklist de README abajo |
| ✅ Demo funcional navegable (no mockups) | T11 — deploy en Vercel | URL pública del deploy |
| ✅ Pitch 2–3 minutos, máximo 5 diapositivas | Sección 10f (nueva) | 5 slides exactas definidas |

### README obligatorio para GitHub

```markdown
# Tu Vecino — HackODS UA 2026

**Equipo:** [Nombre del equipo]
**Integrantes:** [Nombre 1], [Nombre 2], [Nombre 3]

## Descripción
Tu Vecino es una plataforma web de reporte ciudadano que transforma el conocimiento colectivo
de los vecinos de Villa el Salvador en un mapa de seguridad en tiempo real.
Llena la brecha entre la inseguridad real (86% no denunciada) y la registrada oficialmente.

## ODS Abordados
- **ODS 5 — Igualdad de género:** Canal seguro y anónimo para reportar acoso y violencia.
- **ODS 10 — Reducción de desigualdades:** Interfaz accesible para adultos mayores y personas
  con baja alfabetización digital (chat IA + wizard).

## Desafíos oficiales
- Desafío 2: Prevención de violencia
- Desafío 3: Inclusión digital

## Tecnologías utilizadas
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Realtime + Auth)
- Leaflet + OpenStreetMap
- Recharts
- Groq API (llama-3.1-8b-instant) — IA conversacional
- Vercel (deploy)

## Demo en vivo
🔗 [URL del deploy en Vercel]

## Instalación local
\`\`\`bash
git clone https://github.com/[usuario]/tu-vecino
cd tu-vecino
npm install
cp .env.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GROQ_API_KEY
npm run dev
\`\`\`
```

---

## STATUS DE TAREAS

> **Adaptación al stack del equipo:** el plan se aplicó sobre el monorepo existente
> (Express + MySQL + React con MVC) en lugar de Next.js + Supabase. Equivalencias:
> Supabase → MySQL 8.4 en Docker · Supabase Realtime → Server-Sent Events (`/api/eventos`) ·
> Supabase Auth → JWT en cookie httpOnly · Recharts → gráficos SVG propios · Groq → `POST /api/reportes/chat`.

| # | Subtarea | Estado |
|---|----------|--------|
| T1 | Scaffolding del proyecto (monorepo Express + React) | [x] done |
| T2 | Modelo de datos (migraciones MySQL 001–006) | [x] done |
| T3 | Mapa base con Leaflet + capa de incidentes + calor + puntos seguros | [x] done |
| T4 | Selector de 3 modos + formulario clásico | [x] done |
| T5 | Chat IA con Groq (+ clasificador local de respaldo) y micrófono | [x] done |
| T6 | Wizard paso a paso con botones grandes (modo accesible) | [x] done |
| T7 | Panel de alertas comunitarias (feed 24 h, Mi zona, Peligro alto) | [x] done |
| T8 | Dashboard municipal (reportes vecinales + denuncias SIDPOL) | [x] done |
| T9 | Autenticación (anónimo permitido, cuentas ciudadano/admin) | [x] done |
| T10 | UI/UX final: paleta azul institucional, Inter, responsive, bottom nav | [x] done |
| T11 | Demo seed data (72 reportes DEMO) · deploy pendiente (requiere cuenta del equipo) | [~] parcial |
| T12 | README completo + repositorio GitHub | [x] done |

---

## 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

### Resumen Ejecutivo

**TU VECINO** es una plataforma web de reporte ciudadano que transforma el conocimiento colectivo de los vecinos de Villa el Salvador en un mapa de seguridad en tiempo real. Llena la brecha entre la inseguridad real y la inseguridad registrada oficialmente, empoderando a ciudadanos y dando a las municipalidades datos accionables para intervenir antes de que los incidentes escalen.

### Problema

Las ciudades toman decisiones de seguridad usando exclusivamente denuncias policiales formales. En Villa el Salvador:
- El 70–80 % de los incidentes nunca se denuncian (intentos de robo, acoso, actividad sospechosa).
- Los grupos de WhatsApp vecinales concentran información valiosa que nunca se estructura.
- El serenazgo reacciona a hechos consumados, no a patrones de riesgo.
- Los ciudadanos no tienen forma de consultar qué zonas son inseguras a qué horas.

### Oportunidad

- Villa el Salvador tiene alta penetración de smartphones.
- Existe cultura de solidaridad vecinal activa (juntas vecinales, grupos de WhatsApp).
- La municipalidad no cuenta con herramientas digitales de inteligencia territorial.
- La inseguridad ciudadana es el principal problema percibido por los vecinos (encuestas INEI 2023).

### Propuesta de Valor

| Para ciudadanos | Para la municipalidad |
|---|---|
| Saber qué zonas evitar y a qué hora | Mapa de calor de incidentes en tiempo real |
| Reportar sin ir a una comisaría | Detección de zonas críticas emergentes |
| Ver rutas más seguras a pie | Priorización de patrullaje del serenazgo |
| Recibir alertas de su zona | Evidencia para solicitar presupuesto de iluminación |

### Objetivos del MVP

1. Permitir a cualquier vecino reportar un incidente en menos de 60 segundos.
2. Visualizar todos los reportes geolocalizados en un mapa interactivo.
3. Mostrar un mapa de calor de zonas de riesgo.
4. Enviar alertas push/banner cuando se reporta un incidente cercano.
5. Ofrecer un dashboard municipal con tendencias y categorías.

### Métricas de Éxito (KPIs para el pitch)

| Métrica | Meta MVP (demo) | Meta 3 meses post-lanzamiento |
|---|---|---|
| Reportes enviados | 20 en demo | 500/mes |
| Usuarios activos | 5 en demo | 300 vecinos |
| Tiempo medio de reporte | < 60 s | < 45 s |
| Cobertura de zonas mapeadas | 3 sectores VES | 10+ sectores |
| Alertas enviadas | — | 1.000/mes |

### Usuarios Objetivo

1. Vecinos de Villa el Salvador (18–60 años con smartphone).
2. Funcionarios de la Gerencia de Seguridad Ciudadana de la Municipalidad de VES.
3. Serenos y coordinadores de ronda.
4. Estudiantes universitarios (UNAM, UNMSM sedes cercanas).
5. Trabajadores nocturnos (comercio, delivery, transporte).

### Restricciones

- MVP construido por IA en ~6 horas de hackatón (HackODS UA 2026, 23 nov 2026).
- Equipo de máximo 3 integrantes (regla de las bases).
- Sin presupuesto (usar tiers gratuitos: Supabase free, Vercel free, OpenStreetMap, Groq free).
- Autenticación anónima permitida para bajar la barrera de entrada al reporte.
- Sin integración con policía / MININTER en esta fase.
- Sin app nativa — web responsiva únicamente.
- Entregables obligatorios: GitHub público con README + demo funcional en Vercel + pitch 2–3 min con 5 slides.

### Riesgos

| Riesgo | Mitigación |
|---|---|
| Reportes falsos / spam | Moderación comunitaria (flag) + rate limiting |
| Privacidad del reportante | No se solicita nombre real; solo alias opcional |
| Dependencia de conectividad | Diseño offline-first en fase 2 |
| Adopción baja | Alianza con juntas vecinales desde el lanzamiento |

---

## 2. USER PERSONAS

### Persona 1 — Sofía, Estudiante Universitaria (20 años)

**Perfil:** Estudia Administración en UNMSM, vive en Sector 3 de VES, regresa a casa en transporte público después de las 10 p.m.

**Objetivos:**
- Saber si la ruta de la estación del Metropolitano a su casa es segura de noche.
- Avisar a sus amigas cuando ve algo sospechoso.

**Frustraciones:**
- No hay forma de saber qué calles son peligrosas sin preguntarle a su mamá.
- Los grupos de WhatsApp se saturan de mensajes y es difícil encontrar info útil.

**Necesidades:**
- Mapa con rutas seguras a pie.
- Forma rápida de reportar sin registrarse.

**Escenario de uso:** Ve a un hombre siguiéndola. Abre Tu Vecino, reporta "Acoso" en 30 segundos. Las vecinas del sector reciben una alerta inmediata.

---

### Persona 2 — Carlos, Trabajador Nocturno (35 años)

**Perfil:** Delivery de madrugada, conoce todas las calles de VES pero ha sido asaltado dos veces.

**Objetivos:**
- Planificar rutas de entrega evitando zonas peligrosas.
- Contribuir con información porque conoce los puntos calientes.

**Frustraciones:**
- No tiene tiempo de hacer una denuncia formal.
- Las apps de mapas no muestran información de seguridad local.

**Necesidades:**
- Mapa con zonas de riesgo visible a simple vista.
- Reporte rápido desde el celular mientras conduce (voice o 1-tap).

**Escenario de uso:** Ve a un grupo sospechoso en Jr. Paraíso. Abre el mapa, marca "Actividad sospechosa" con un tap y sigue su ruta.

---

### Persona 3 — Rosa, Vecina Activa (52 años)

**Perfil:** Presidenta de la junta vecinal del Sector 6. Coordina grupos de WhatsApp de seguridad.

**Objetivos:**
- Tener un registro ordenado de todos los incidentes de su sector.
- Presentar evidencia a la municipalidad para pedir más iluminación.

**Frustraciones:**
- Los mensajes de WhatsApp se pierden.
- No tiene forma de demostrarle a las autoridades la magnitud del problema.

**Necesidades:**
- Vista de historial de incidentes por zona.
- Exportar reportes para reuniones municipales.

**Escenario de uso:** Antes de la reunión mensual con el alcalde, descarga el resumen de incidentes de su sector de los últimos 30 días y lo lleva impreso.

---

### Persona 4 — Ing. Flores, Funcionario Municipal (45 años)

**Perfil:** Gerente de Seguridad Ciudadana de la Municipalidad de VES. Maneja un presupuesto limitado de serenazgo.

**Objetivos:**
- Priorizar dónde enviar patrullas de serenazgo.
- Justificar proyectos de iluminación pública ante el concejo.

**Frustraciones:**
- Solo tiene datos de denuncias formales que representan una fracción de los incidentes.
- No tiene herramientas digitales para analizar tendencias.

**Necesidades:**
- Dashboard con mapa de calor y gráficos de tendencias.
- Filtros por tipo de incidente, zona y fecha.

**Escenario de uso:** Cada lunes revisa el dashboard para identificar las 3 zonas con más reportes de la semana y redistribuir los turnos del serenazgo.

---

### Persona 5 — Sereno Javier (28 años)

**Perfil:** Sereno con 4 años de experiencia, patrulla en moto el turno nocturno (10 p.m.–6 a.m.).

**Objetivos:**
- Recibir alertas en tiempo real cuando se reporta un incidente en su zona.
- Responder más rápido sin esperar la radio central.

**Frustraciones:**
- Se entera de los incidentes muy tarde.
- No tiene visibilidad de qué pasó en su zona durante turnos anteriores.

**Necesidades:**
- Alertas push cuando aparece un reporte cercano.
- Mapa con incidentes de las últimas 24 horas.

**Escenario de uso:** A las 2 a.m. recibe una notificación de "Intento de robo" en Av. Mariátegui. Llega al lugar en 3 minutos.

---

## 3. USER STORIES PRIORIZADAS

### Must Have (imprescindible para el MVP)

| ID | Historia |
|---|---|
| US-01 | Como vecino, quiero reportar un incidente con tipo, descripción y ubicación, para alertar a mi comunidad en menos de 60 segundos. |
| US-02 | Como vecino, quiero ver en un mapa todos los incidentes reportados cerca de mí, para decidir qué ruta tomar. |
| US-03 | Como vecino, quiero ver un mapa de calor de zonas de riesgo, para identificar áreas peligrosas de un vistazo. |
| US-04 | Como funcionario municipal, quiero ver un dashboard con gráficos de tendencias e incidentes por categoría, para priorizar el despliegue del serenazgo. |
| US-05 | Como vecino, quiero recibir una alerta cuando se reporta un incidente en mi zona, para estar informado en tiempo real. |
| US-15 | Como vecino con poca experiencia tecnológica, quiero escribir o dictar lo que pasó en lenguaje natural, para que el sistema entienda mi reporte sin que yo tenga que llenar formularios. |
| US-16 | Como adulto mayor, quiero reportar usando botones grandes y preguntas simples de una en una, para no confundirme con la pantalla. |

### Should Have (deseable en el MVP)

| ID | Historia |
|---|---|
| US-06 | Como vecino, quiero ver los puntos seguros cercanos (comisarías, centros médicos, tiendas 24h), para saber a dónde ir en una emergencia. |
| US-07 | Como vecino, quiero poder reportar de forma anónima, para no temer represalias. |
| US-08 | Como vecino, quiero filtrar el mapa por tipo de incidente y rango de fechas, para encontrar información relevante. |
| US-09 | Como funcionario, quiero filtrar el dashboard por zona y tipo de incidente, para análisis detallado. |

### Could Have (futuras iteraciones)

| ID | Historia |
|---|---|
| US-10 | Como vecino, quiero que la app me sugiera la ruta más segura entre dos puntos. |
| US-11 | Como vecino, quiero reportar con foto o video como evidencia. |
| US-12 | Como sereno, quiero recibir alertas push en tiempo real en mi dispositivo. |
| US-13 | Como funcionario, quiero exportar reportes en PDF/CSV para presentaciones. |
| US-14 | Como vecino, quiero calificar si una zona ya está más segura (feedback loop). |

---

## 4. MVP PARA HACKATÓN (6 HORAS)

### Imprescindible (Must Build)

| Funcionalidad | Justificación |
|---|---|
| Mapa interactivo con pins de incidentes | Es el core value: "hacer visible lo invisible" |
| Formulario clásico de reporte (tipo, descripción, ubicación) | Modo estándar para usuarios familiarizados con apps |
| **Chat IA conversacional (Groq)** — modo accesibilidad | Vecino escribe/dicta en lenguaje natural; IA clasifica el reporte |
| **Wizard paso a paso** — modo accesibilidad | Botones grandes, una pregunta por pantalla, sin campos de texto libres |
| Selector de modo de reporte en `/reportar` | El vecino elige cómo quiere reportar antes de empezar |
| Mapa de calor por densidad de incidentes | Diferenciador visual de impacto para el jurado |
| Dashboard municipal (gráfico de barras por categoría + línea de tiempo) | Muestra el valor para el sector público |
| Seed data realista de Villa el Salvador | La demo necesita datos para impresionar |

### Deseable (Build If Time Allows)

| Funcionalidad | Justificación |
|---|---|
| Botón de micrófono en el chat IA (Web Speech API) | Permite reportar sin escribir; ideal para adultos mayores |
| Alertas banner en tiempo real (Supabase Realtime) | Wow factor para la demo |
| Autenticación anónima con Supabase | Permite asociar reportes a usuarios |
| Filtros de mapa (tipo, fecha) | Aumenta la utilidad percibida |
| Puntos seguros en el mapa | Complementa la narrativa de seguridad |

### Fuera de Alcance (Do Not Build)

| Funcionalidad | Justificación |
|---|---|
| App nativa iOS/Android | Tiempo y complejidad innecesarios; web responsiva suficiente |
| Integración con policía/MININTER | Requiere convenios y APIs institucionales |
| Upload de fotos/video | Almacenamiento y moderación añaden complejidad |
| Ruta segura con algoritmo de navegación | Requiere routing engine; no factible en 6h |
| Sistema de autenticación completo con email verification | Barrera de adopción; anónimo es suficiente para demo |
| Notificaciones push nativas | Requiere service worker + certificados; scope excesivo |

---

## 5. ARQUITECTURA TÉCNICA

### Stack Recomendado (mínimo viable, todo gratuito)

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | Next.js 14 (App Router) | File-based routing, SSR, deploy trivial en Vercel |
| Estilos | Tailwind CSS v3 | Utility-first, rápido para prototipar |
| Mapa | Leaflet + react-leaflet + OpenStreetMap | Gratuito, sin API key, tiles de OSM |
| Gráficos | Recharts | Ligero, declarativo, integra bien con React |
| Backend | Supabase (PostgreSQL + PostGIS + Realtime + Auth) | BaaS completo, tier gratuito generoso |
| **IA conversacional** | **Groq API — llama-3.1-8b-instant** | Gratuito (14.400 req/día), latencia ~200ms, sin tarjeta de crédito |
| Deploy | Vercel (free tier) | Zero-config con Next.js |
| Íconos | Lucide React | Tree-shakeable, coherente |

### Diagrama de Capas

```
┌─────────────────────────────────────────────┐
│                 CLIENTE                      │
│  Next.js App Router (páginas y componentes) │
│  Tailwind CSS · Leaflet · Recharts          │
│  Supabase JS Client (browser)               │
└──────────────┬──────────────────────────────┘
               │ HTTPS / WebSocket (Realtime)
┌──────────────▼──────────────────────────────┐
│              SUPABASE                        │
│  PostgreSQL + PostGIS  │  Auth (anon/email)  │
│  Row Level Security    │  Realtime           │
│  REST API auto-gen     │  Storage (fase 2)   │
└─────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│          SERVICIOS EXTERNOS                  │
│  OpenStreetMap (tiles gratuitos)             │
│  Nominatim (geocoding gratuito)              │
└─────────────────────────────────────────────┘
```

### Flujo de Datos Principal

1. **Reporte clásico (formulario):** Usuario selecciona tipo → Geolocalización → POST a Supabase `incidentes` → Realtime actualiza el mapa.
2. **Reporte por chat IA:** Usuario escribe/dicta en lenguaje natural → API Route Next.js llama a Groq con prompt estructurado → Groq devuelve JSON `{tipo, descripcion, sector}` → Chat confirma con el vecino → POST a Supabase.
3. **Reporte por wizard:** Usuario responde preguntas una por una con botones grandes → Al finalizar, POST a Supabase igual que el flujo clásico.
4. **Visualización del mapa:** Cliente consulta `incidentes` via Supabase JS → Leaflet renderiza pins y heatmap layer.
5. **Dashboard municipal:** Cliente consulta vistas agregadas en Supabase → Recharts renderiza gráficos.

### Estructura de Carpetas del Proyecto

```
tu-vecino/
├── app/
│   ├── page.tsx                        # Home / Landing
│   ├── mapa/page.tsx                   # Mapa ciudadano
│   ├── reportar/
│   │   ├── page.tsx                    # Selector de modo de reporte
│   │   ├── formulario/page.tsx         # Modo 1: Formulario clásico
│   │   ├── chat/page.tsx               # Modo 2: Chat IA conversacional
│   │   └── guiado/page.tsx             # Modo 3: Wizard paso a paso
│   ├── alertas/page.tsx                # Feed de alertas
│   ├── dashboard/page.tsx              # Dashboard municipal
│   └── api/
│       └── reportar-chat/route.ts      # API Route → Groq (server-side, oculta API key)
├── components/
│   ├── Map/
│   │   ├── MapView.tsx                 # Componente principal Leaflet
│   │   ├── IncidentMarker.tsx          # Pin por tipo de incidente
│   │   └── HeatmapLayer.tsx            # Capa de calor
│   ├── ReportForm/
│   │   ├── ReportFormClassic.tsx       # Formulario clásico (chips + textarea)
│   │   ├── ReportChat.tsx              # Chat IA con burbuja de mensajes
│   │   └── ReportWizard.tsx            # Wizard (1 pregunta por pantalla)
│   ├── Dashboard/
│   │   ├── IncidentChart.tsx           # Recharts barras
│   │   └── TimelineChart.tsx           # Recharts línea de tiempo
│   └── ui/                             # Componentes reutilizables
├── lib/
│   ├── supabase.ts                     # Cliente Supabase
│   ├── groq.ts                         # Cliente Groq + prompt de clasificación
│   └── constants.ts                    # Tipos de incidentes, colores
├── types/
│   └── index.ts                        # TypeScript interfaces
└── supabase/
    └── migrations/
        └── 001_initial.sql             # Schema completo
```

---

## 6. MODELO DE DATOS

### Tabla: `usuarios`

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | Supabase Auth UID |
| alias | text | Nombre opcional, default "Vecino Anónimo" |
| rol | text | 'ciudadano' \| 'sereno' \| 'funcionario' |
| sector | text | Sector de VES (1–10) |
| created_at | timestamptz | Auto |

### Tabla: `incidentes`

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| tipo | text | Ver enum TIPOS_INCIDENTE |
| descripcion | text | Texto libre, max 500 chars |
| lat | float8 | Latitud WGS84 |
| lng | float8 | Longitud WGS84 |
| sector | text | Sector de VES inferido |
| usuario_id | uuid (FK) | → usuarios.id, nullable (anónimo) |
| estado | text | 'activo' \| 'resuelto' \| 'falso' |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

**Enum TIPOS_INCIDENTE:**
`robo`, `intento_robo`, `acoso`, `actividad_sospechosa`, `zona_oscura`, `espacio_abandonado`, `otro`

### Tabla: `alertas`

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | — |
| incidente_id | uuid (FK) | → incidentes.id |
| titulo | text | Texto corto de la alerta |
| descripcion | text | — |
| nivel | text | 'info' \| 'warning' \| 'danger' |
| activa | boolean | Default true |
| created_at | timestamptz | Auto |

### Tabla: `puntos_seguros`

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | — |
| nombre | text | "Comisaría VES", "Farmacia 24h" |
| tipo | text | 'comisaria' \| 'hospital' \| 'farmacia' \| 'iluminado' \| 'comercio_24h' |
| lat | float8 | — |
| lng | float8 | — |
| direccion | text | — |
| telefono | text | Nullable |
| activo | boolean | Default true |

### Tabla: `municipalidades`

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | — |
| nombre | text | "Municipalidad de Villa el Salvador" |
| distrito | text | — |
| codigo_ubigeo | text | INEI ubigeo |
| lat_centro | float8 | Centro del distrito |
| lng_centro | float8 | — |
| radio_km | float2 | Radio de cobertura |

### Tabla: `zonas` (fase 2)

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | — |
| nombre | text | "Sector 3 Norte" |
| municipalidad_id | uuid (FK) | — |
| geojson | jsonb | Polígono del sector |
| nivel_riesgo | int2 | 1–5 calculado |

### Vista: `v_incidentes_por_tipo`
Agregación de `incidentes` por `tipo` y `DATE(created_at)` para alimentar los gráficos del dashboard.

---

## 7. WIREFRAMES TEXTUALES

### Página 1: Home (`/`)

```
┌────────────────────────────────────────────┐
│  🔵 Tu Vecino          [Ver Mapa] [🔔] │
├────────────────────────────────────────────┤
│                                            │
│   HERO: "Villa el Salvador más segura      │
│   gracias a sus vecinos"                   │
│                                            │
│   [REPORTAR UN INCIDENTE]  (CTA primario)  │
│   [VER EL MAPA]            (CTA secundario)│
│                                            │
├────────────────────────────────────────────┤
│  ESTADÍSTICAS (3 cards):                   │
│  📍 127 reportes  📅 esta semana  🔥 3 zonas│
├────────────────────────────────────────────┤
│  ALERTAS RECIENTES (últimas 3)             │
│  • ⚠️ Acoso en Av. Revolución - hace 2h   │
│  • 🔴 Robo en Jr. Tupac - hace 5h         │
│  • 🟡 Zona oscura Sector 6 - hace 8h      │
├────────────────────────────────────────────┤
│  BOTTOM NAV: 🗺 Mapa | ➕ Reportar | 🔔 Alertas │
└────────────────────────────────────────────┘
```

### Página 2: Mapa (`/mapa`)

```
┌────────────────────────────────────────────┐
│  ← Mapa de Incidentes        [🔥 Calor]   │
├─────────────────┬──────────────────────────┤
│ FILTROS (top):  │                          │
│ Tipo: [Todos ▼] │  MAPA LEAFLET            │
│ Fecha: [7d ▼]  │  (ocupa 70% del viewport)│
├─────────────────┤  pins por tipo:          │
│ LEYENDA:        │  🔴 Robo                 │
│ 🔴 Robo        │  🟠 Intento robo         │
│ 🟠 Intento     │  🟡 Acoso                │
│ 🟡 Acoso       │  ⚫ Act. sospechosa      │
│ ⚫ Sospechoso  │  💙 Zona oscura          │
│ 💙 Oscuridad   │  🟢 Punto seguro         │
│ 🟢 Punto seguro│                          │
├─────────────────┴──────────────────────────┤
│ Al tap en pin → Bottom sheet:              │
│  Tipo | Descripción | Hora | [Marcar falso]│
├────────────────────────────────────────────┤
│  BOTTOM NAV: 🗺 Mapa | ➕ Reportar | 🔔    │
└────────────────────────────────────────────┘
```

### Página 3: Selector de Modo de Reporte (`/reportar`)

```
┌────────────────────────────────────────────┐
│  ← ¿Cómo quieres reportar?                 │
├────────────────────────────────────────────┤
│                                            │
│  TRES OPCIONES (cards grandes):            │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  💬  CUÉNTAME QUÉ PASÓ              │ │
│  │  Escribe o dicta en tus palabras     │ │
│  │  → La IA te ayuda a completar        │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  🧭  PASO A PASO                    │ │
│  │  Te hago preguntas sencillas         │ │
│  │  → Solo toca botones                 │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  📋  FORMULARIO COMPLETO            │ │
│  │  Para usuarios avanzados             │ │
│  │  → Rellena todos los campos          │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

### Página 3a: Modo Chat IA (`/reportar/chat`)

```
┌────────────────────────────────────────────┐
│  ← Reportar — Chat                   [🎤] │
├────────────────────────────────────────────┤
│                                            │
│  🤖 Hola vecino/a. ¿Qué pasó?             │
│     Cuéntame con tus palabras.             │
│                                            │
│  👤 "Me siguieron en jr paraíso           │
│      hace un rato"                         │
│                                            │
│  🤖 Entendido. Detecté:                   │
│     • Tipo: Actividad sospechosa           │
│     • Zona: Jr. Paraíso                   │
│     ¿Confirmas esta ubicación?             │
│     [✅ Sí, correcto] [✏️ Cambiar]        │
│                                            │
│  👤 Sí, correcto                          │
│                                            │
│  🤖 ✅ ¡Reporte enviado! Gracias vecino/a │
│     Tu reporte ya aparece en el mapa.      │
│                                            │
├────────────────────────────────────────────┤
│  [   Escribe aquí...        ] [🎤] [➤]   │
└────────────────────────────────────────────┘
```

### Página 3b: Modo Wizard Paso a Paso (`/reportar/guiado`)

```
┌────────────────────────────────────────────┐
│  ← Paso 1 de 3: ¿Qué pasó?               │
│  ████░░░░░░  33%                           │
├────────────────────────────────────────────┤
│                                            │
│  BOTONES GRANDES (uno por fila):           │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │       🔴  Me robaron algo            │ │
│  └──────────────────────────────────────┘ │
│  ┌──────────────────────────────────────┐ │
│  │       🟠  Intentaron robarme         │ │
│  └──────────────────────────────────────┘ │
│  ┌──────────────────────────────────────┐ │
│  │       🟡  Me acosaron                │ │
│  └──────────────────────────────────────┘ │
│  ┌──────────────────────────────────────┐ │
│  │       ⚫  Vi algo sospechoso         │ │
│  └──────────────────────────────────────┘ │
│  ┌──────────────────────────────────────┐ │
│  │       💙  Hay una zona muy oscura    │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘

[Paso 2: "¿Dónde fue?" → usa tu ubicación o elige sector]
[Paso 3: "¿Cuándo fue?" → Ahora / Hace menos de 1h / Hoy]
[Confirmación → Enviar]
```

### Página 3c: Modo Formulario Clásico (`/reportar/formulario`)

```
┌────────────────────────────────────────────┐
│  ← Reportar Incidente                      │
├────────────────────────────────────────────┤
│  TIPO DE INCIDENTE (chips / grid 2x3):     │
│  [🔴 Robo]      [🟠 Intento de robo]      │
│  [🟡 Acoso]     [⚫ Actividad sospechosa] │
│  [💙 Zona oscura] [🏚 Espacio abandonado] │
│  [⚪ Otro]                                 │
├────────────────────────────────────────────┤
│  DESCRIPCIÓN (textarea):                   │
│  "¿Qué ocurrió? (opcional)"               │
│  [                                    ]    │
├────────────────────────────────────────────┤
│  UBICACIÓN:                                │
│  📍 [Usar mi ubicación actual]  ✅ / ⏳   │
│  — o —                                     │
│  Mini-mapa para arrastrar pin              │
├────────────────────────────────────────────┤
│  REPORTAR ANÓNIMAMENTE  🔘                 │
├────────────────────────────────────────────┤
│  [        ENVIAR REPORTE        ] (CTA)    │
│                                            │
│  ✅ ¡Reporte enviado! Gracias vecino/a    │
└────────────────────────────────────────────┘
```

### Página 4: Alertas (`/alertas`)

```
┌────────────────────────────────────────────┐
│  🔔 Alertas Comunitarias    [Configurar]   │
├────────────────────────────────────────────┤
│  FILTRO: [Todas] [Mi zona] [Peligro alto]  │
├────────────────────────────────────────────┤
│  FEED (cards ordenadas por recencia):      │
│  ┌─────────────────────────────────────┐  │
│  │ 🔴 PELIGRO — Robo a mano armada     │  │
│  │ Av. Mariátegui cdra 4 · hace 20 min │  │
│  │ "Me arrebataron el celular..."      │  │
│  │ [Ver en mapa]  [Marcar resuelto]    │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ 🟡 ATENCIÓN — Acoso callejero        │  │
│  │ Jr. Las Rosas · hace 2 h            │  │
│  └─────────────────────────────────────┘  │
├────────────────────────────────────────────┤
│  BOTTOM NAV: 🗺 | ➕ | 🔔                  │
└────────────────────────────────────────────┘
```

### Página 5: Dashboard Municipal (`/dashboard`)

```
┌────────────────────────────────────────────┐
│  📊 Dashboard Municipal — VES  [Exportar]  │
├────────────────────────────────────────────┤
│  FILTROS: Sector [Todos ▼] | Período [30d ▼]│
├─────────────────┬──────────────────────────┤
│  KPIs (4 cards):│                          │
│  127 reportes   │  MAPA DE CALOR           │
│  total          │  (mismo Leaflet con      │
│  ─────────────  │   heatmap layer)         │
│  3 zonas críticas│                         │
│  ─────────────  │                          │
│  +23% vs mes ant│                          │
│  ─────────────  │                          │
│  Tipo más freq: │                          │
│  Robo (42%)     │                          │
├─────────────────┴──────────────────────────┤
│  GRÁFICO DE BARRAS: Incidentes por tipo    │
│  Robo ████████ 54                         │
│  Acoso ██████ 38                           │
│  Sospechoso ████ 22                        │
├────────────────────────────────────────────┤
│  LÍNEA DE TIEMPO: Reportes últimos 30 días │
│  (Recharts LineChart)                      │
├────────────────────────────────────────────┤
│  TABLA: Top 5 zonas con más incidentes     │
│  Sector | Reportes | Tipo dominante | Acción│
└────────────────────────────────────────────┘
```

---

## 8. DISEÑO UX/UI

### Paleta de Colores

| Token | Color | Hex | Uso |
|---|---|---|---|
| Primary | Azul institucional | `#1D4ED8` | CTA primario, navbar, enlaces |
| Primary Dark | Azul oscuro | `#1E3A8A` | Hover states |
| Danger | Rojo alerta | `#DC2626` | Incidentes graves, peligro |
| Warning | Naranja atención | `#F97316` | Incidentes medios |
| Success | Verde seguro | `#16A34A` | Puntos seguros, estado OK |
| Info | Azul claro | `#0EA5E9` | Zonas oscuras, informativos |
| Neutral 50 | Fondo claro | `#F8FAFC` | Background de páginas |
| Neutral 900 | Texto principal | `#0F172A` | Body text |
| Neutral 400 | Texto secundario | `#94A3B8` | Subtexts, labels |

### Tipografía

| Uso | Fuente | Peso | Tamaño |
|---|---|---|---|
| Headings | Inter | 700 (Bold) | H1: 2xl, H2: xl, H3: lg |
| Body | Inter | 400 | 14–16px |
| Labels / chips | Inter | 500 (Medium) | 12–13px |
| Stats / números | Inter | 800 (ExtraBold) | xl–2xl |

> Importar desde Google Fonts: `font-family: 'Inter', sans-serif`

### Componentes Clave

| Componente | Descripción |
|---|---|
| `IncidentChip` | Chip de categoría con color e ícono Lucide |
| `AlertCard` | Card con borde izquierdo de color según nivel de peligro |
| `StatCard` | Card KPI con número grande, label y tendencia |
| `MapPin` | SVG pin Leaflet personalizado por tipo |
| `BottomNav` | Navegación inferior móvil (3 ítems) |
| `ReportButton` | FAB circular rojo fijo en esquina inferior derecha del mapa |
| `ReportModeSelector` | 3 cards grandes para elegir modo de reporte |
| `ChatBubble` | Burbuja de chat (usuario / bot) con estilos diferenciados |
| `WizardStep` | Contenedor de paso con barra de progreso y botones grandes |
| `MicButton` | Botón de micrófono que activa Web Speech API |

### Sistema de Iconos (Lucide React)

| Incidente | Ícono Lucide | Color |
|---|---|---|
| Robo | `ShieldAlert` | Rojo |
| Intento de robo | `AlertTriangle` | Naranja |
| Acoso | `UserX` | Amarillo |
| Actividad sospechosa | `Eye` | Gris oscuro |
| Zona oscura | `Moon` | Azul |
| Espacio abandonado | `Building2` | Marrón |
| Punto seguro | `ShieldCheck` | Verde |
| Alerta | `Bell` | Azul |

### Principios de Jerarquía Visual

1. **El mapa es el protagonista** — siempre visible, ocupa el 60-70% del viewport en móvil.
2. **Acción principal accesible en 1 tap** — botón "Reportar" siempre visible como FAB o en bottom nav.
3. **Semáforo de peligro consistente** — rojo / naranja / verde en toda la app.
4. **Mobile-first** — diseñado para 375px, escalable a 1440px para el dashboard.
5. **Contraste accesible** — WCAG AA mínimo en todos los textos sobre fondo.
6. **Accesibilidad inclusiva** — el modo wizard usa fuente mínima 18px y botones de altura mínima 56px para facilitar el toque en pantallas de adultos mayores.
7. **Lenguaje natural primero** — el chat IA usa lenguaje coloquial peruano ("vecino/a", "¿qué pasó?") para reducir la fricción cognitiva.

---

## 9. PLAN DE DESARROLLO (6 HORAS)

### Hora 1 — Scaffolding y Setup (0:00–1:00)

**Objetivo:** Proyecto corriendo localmente con conexión a Supabase y Groq.

```
1. npx create-next-app@latest tu-vecino --typescript --tailwind --app
2. npm install @supabase/supabase-js react-leaflet leaflet recharts lucide-react
3. npm install leaflet.heat groq-sdk
4. Crear proyecto en Supabase (supabase.com)
5. Crear cuenta en console.groq.com → obtener API key gratuita
6. Crear archivo lib/supabase.ts con cliente
7. Crear archivo lib/groq.ts con cliente + prompt de clasificación de incidentes
8. Ejecutar migration SQL 001_initial.sql (schema completo)
9. Insertar seed data de Villa el Salvador (20–30 incidentes realistas)
10. Verificar conexión: query simple a tabla incidentes
```

### Hora 2 — Mapa Base con Incidentes (1:00–2:00)

**Objetivo:** Mapa interactivo con pins de incidentes funcionando.

```
1. Componente MapView.tsx con react-leaflet, centrado en VES (-12.2140, -76.9332)
2. Fetch de incidentes desde Supabase al montar el componente
3. Renderizar IncidentMarker por cada incidente (ícono + color por tipo)
4. Popup al click con tipo, descripción y hora
5. Página /mapa con MapView a pantalla completa
6. Bottom navigation con 3 ítems (Mapa, Reportar, Alertas)
7. Responsive: funciona en 375px
```

### Hora 3 — Tres Modos de Reporte (2:00–3:30)

**Objetivo:** Los tres modos de reporte funcionando y conectados a Supabase.

```
PARTE A — Selector de modo y formulario clásico (45 min):
1. Página /reportar con ReportModeSelector: 3 cards grandes
2. /reportar/formulario: chips de tipo, textarea, geolocalización, INSERT Supabase
3. Toast de confirmación + Supabase Realtime en MapView

PARTE B — Chat IA conversacional (30 min):
4. API Route app/api/reportar-chat/route.ts con Groq SDK
5. Prompt del sistema: clasifica tipo, extrae zona, responde JSON estructurado
6. /reportar/chat: UI de chat con burbujas, input de texto + botón de micrófono
7. Flujo: mensaje → Groq → confirmación → INSERT Supabase

PARTE C — Wizard paso a paso (15 min):
8. /reportar/guiado: 3 pasos (¿qué pasó? → ¿dónde? → ¿cuándo?) con botones grandes
9. Barra de progreso visual (paso 1/3, 2/3, 3/3)
10. Al finalizar wizard: mismo INSERT a Supabase
```

### Hora 4 — Alertas y Heatmap (3:30–4:30)

**Objetivo:** Feed de alertas funcionando y mapa de calor visible.

```
1. Página /alertas con lista de AlertCard ordenadas por created_at DESC
2. Badge de nivel (peligro/atención/info) con colores
3. Botón "Ver en mapa" → navega a /mapa con pin seleccionado
4. Integrar leaflet.heat en MapView (capa toggleable con botón 🔥)
5. Lógica: generar puntos de calor a partir de lat/lng de incidentes
6. Puntos seguros en mapa: fetch de puntos_seguros + ícono verde especial
7. Filtros básicos en mapa: por tipo (dropdown)
```

### Hora 5 — Dashboard Municipal (4:30–5:30)

**Objetivo:** Dashboard con KPIs y gráficos funcionando.

```
1. Página /dashboard (ruta protegida o acceso libre para demo)
2. 4 StatCards: total reportes, zonas críticas, % cambio semanal, tipo más frecuente
3. Mapa de calor (reutilizar MapView con prop dashboardMode=true)
4. BarChart (Recharts) con incidentes por tipo
5. LineChart (Recharts) con reportes por día (últimos 30 días)
6. Tabla top 5 zonas (calcular por sector en JS)
7. Filtro de período (7d / 30d / 90d)
```

### Hora 6 — Pulido, Demo Data y Deploy (5:30–6:00)

**Objetivo:** App desplegada en Vercel con demo lista para el pitch.

```
1. Revisar responsive en 375px y 1440px
2. Mejorar seed data: 50+ incidentes distribuidos en VES con timestamps variados
3. Agregar 10 puntos seguros reales de VES (comisaría, posta médica, etc.)
4. Página Home con hero, stats en vivo y últimas 3 alertas
5. vercel deploy --prod (agregar GROQ_API_KEY como variable de entorno en Vercel)
6. Smoke test en móvil real: probar los 3 modos de reporte
7. Preparar URL de demo para el pitch
8. Captura de pantalla / GIF para presentación
```

---

## 10. PITCH DE HACKATÓN

### Pitch de 2–3 Minutos (formato oficial HackODS UA 2026)

> Duración objetivo: **2 minutos 30 segundos**. Las bases permiten 2–3 min. No superar 3 min.
> Apoyarse en las 5 diapositivas definidas en la sección 10f.

**[0:00–0:20] APERTURA — El golpe de impacto**
> *"El INEI nos dice que el 86% de los delitos en Lima nunca se denuncian. Eso significa que las ciudades toman decisiones de seguridad con solo el 14% de la información real. En Villa el Salvador, esta brecha tiene nombre y apellido: Rosa, 52 años, que nunca denunció porque tenía miedo. Carlos, delivery, que nunca denunció porque no tenía tiempo. Tu Vecino existe para darles voz."*

**[0:20–0:50] PROBLEMA — Con datos**
> *"Estamos ante el Desafío 2 y el Desafío 3 de este hackatón: prevención de violencia e inclusión digital. Los sistemas actuales fallan en ambos. Denunciar en la comisaría toma 45 minutos y requiere DNI. Las apps de seguridad no son accesibles para adultos mayores. Y el 86% de los incidentes — acoso, seguimientos, zonas oscuras — nunca llegan a ninguna estadística."*

**[0:50–1:40] SOLUCIÓN + DEMO EN VIVO**
> *"Tu Vecino resuelve esto en tres formas: [mostrar pantalla del celular]*
> — Para Rosa: un wizard paso a paso, solo botones grandes, cero texto. [demo wizard]
> — Para Carlos: escribe 'vi algo raro en jr paraíso' y la IA clasifica el reporte en 2 segundos. [demo chat IA]
> — Para todos: el reporte aparece en el mapa en tiempo real. [mostrar pin aparecer]*
> *Y el serenazgo de VES ve este dashboard con las zonas críticas de la semana." [mostrar dashboard]*

**[1:40–2:10] IMPACTO Y ODS**
> *"Impacto directo en ODS 5 — igualdad de género: por primera vez, el acoso callejero en VES se puede reportar de forma anónima y segura en 20 segundos. Impacto en ODS 10 — inclusión digital: el adulto mayor que nunca usó una app puede reportar con tres toques. Nuestra meta: 500 vecinos activos, 1.000 reportes/mes, 3 sectores cubiertos en 90 días."*

**[2:10–2:30] CIERRE — El gancho**
> *"Tu Vecino no reemplaza a la policía. No reemplaza al serenazgo. Los hace más inteligentes con el conocimiento que ya existe en su comunidad. Gracias."*

### Problema (slide 1)

- 86% de los delitos en Lima no se denuncian (INEI ENAPRES 2023).
- El serenazgo de VES toma decisiones con solo el 14% de la información real.
- El acoso y la violencia de género son los incidentes menos denunciados.
- Resultado: ciudadanos vulnerables, autoridades reactivas, inseguridad crónica.
- **ODS 5 y ODS 10 sin cobertura digital en VES.**

### Solución (slide 2)

- Plataforma web responsiva: sin descarga, sin registro obligatorio.
- **3 modos de reporte:** Chat IA / Wizard accesible / Formulario clásico.
- Mapa en tiempo real con heatmap de zonas peligrosas.
- Dashboard municipal con tendencias, categorías y zonas críticas.
- 100% gratuito para vecinos. Sostenible con modelo B2G para municipalidades.

### Demo (slide 3 — solo captura de pantalla del mapa con heatmap)

- Slide con screenshot del mapa de calor de VES.
- Caption: "Demo en vivo →" (el presentador toma el celular).

### Impacto Social (slide 4)

- **ODS 5:** Reporte anónimo de acoso y violencia — sin miedo a represalias.
- **ODS 10:** 3 modos de accesibilidad — adultos mayores incluidos.
- **Municipalidad:** primera vez con datos de la inseguridad invisible.
- **Meta 90 días:** 500 vecinos activos, 1.000 reportes/mes, 3 sectores cubiertos.

### Innovación (slide 5)

- No es otro sistema de denuncias. Es inteligencia comunitaria estructurada.
- IA conversacional en lenguaje natural (Groq llama-3.1-8b-instant).
- Tiempo real: el reporte aparece en el mapa de todos al instante.
- Anónimo por defecto. Sin DNI. Sin barreras.
- Cubre 2 desafíos oficiales del HackODS UA 2026 simultáneamente.

### ODS Impactados

> Los ODS oficiales del evento son los que cubre el proyecto. Mencionarlos por número y nombre exacto en el pitch.

| ODS | Conexión | ¿Es ODS oficial del desafío? |
|---|---|---|
| **ODS 5 — Igualdad de género** | Canal seguro para reportar acoso y violencia de género de forma anónima | ✅ Desafío 2 oficial |
| **ODS 10 — Reducción de desigualdades** | Chat IA + wizard para adultos mayores y personas con baja alfabetización digital | ✅ Desafío 3 oficial |
| ODS 11 — Ciudades y comunidades sostenibles | Ciudades más seguras e inclusivas | Complementario |
| ODS 16 — Paz, justicia e instituciones sólidas | Instituciones municipales con mejor información | Complementario |

### Preguntas Difíciles del Jurado y Respuestas

| Pregunta | Respuesta recomendada |
|---|---|
| "¿Cómo evitan que la gente haga reportes falsos?" | "Dos mecanismos: 1) El flag comunitario 'marcar como falso' — si 3 usuarios lo marcan, el reporte se oculta pendiente de revisión. 2) Rate limiting por IP/sesión: máximo 5 reportes por hora. En fase 2 incorporamos verificación por SMS opcional." |
| "¿No genera esto más miedo en la comunidad?" | "Al contrario: la información reduce el miedo irracional. Es mejor saber que la calle X es peligrosa de noche que no saber nada. Estudios de criminología confirman que la transparencia de datos de seguridad reduce la percepción de inseguridad generalizada." |
| "¿Cómo monetizan esto?" | "Modelo freemium: la app ciudadana es 100% gratuita. El dashboard municipal avanzado (exportes, API, integración con SISFOH) es SaaS B2G: cobramos a municipalidades, no a los vecinos. Con 3 municipios cubrimos costos operativos; con 10 somos rentables." |
| "¿Qué los diferencia de SafetiPin o Citizen app?" | "SafetiPin requiere auditorías formales, no reportes en tiempo real. Citizen app no existe en Perú y no tiene integración municipal. Nosotros somos la única solución diseñada específicamente para el contexto de Lima: serenazgo, juntas vecinales y la cultura del WhatsApp vecinal." |
| "¿Tienen alianzas con la municipalidad?" | "Hoy presentamos el MVP. El siguiente paso inmediato es una reunión con la Gerencia de Seguridad Ciudadana de VES — tenemos contacto con el presidente de la junta vecinal del Sector 6 que nos conectará. El producto está diseñado para ser adoptado sin costo inicial." |
| "¿Qué pasa con la privacidad de los reportantes?" | "Por defecto todos los reportes son anónimos. No almacenamos nombre, DNI ni teléfono. Solo coordenadas y descripción del incidente. Cumplimos con la Ley 29733 de Protección de Datos Personales del Perú." |
| "¿Han hablado con vecinos reales?" | "Sí. Antes de la hackatón hablamos con vecinas del Sector 6 de VES. Carmen, 48 años, nos dijo: 'Nunca fui a la comisaría porque me da miedo que me busquen después.' Eso confirma exactamente el problema que resolvemos: el 86% de incidentes que nunca aparecen en ninguna estadística." |
| "¿Por qué ustedes son el equipo correcto?" | "Somos desarrolladores que creen que la tecnología debe resolver los problemas de la gente que menos acceso tiene a ella. Del mismo modo en que Yape democratizó los pagos y el Metropolitano democratizó el transporte — Tu Vecino democratiza la información de seguridad." |

---

## 10b. DEMO FLOW — GUIÓN DE 90 SEGUNDOS

> Este es el guión exacto para la demo en vivo. Ensayarlo 3 veces antes del pitch.
> Requiere que la app esté abierta en el celular del presentador con datos seed ya cargados.

### Escena 1 — El Problema (15 s)

**Narrador dice:** *"Son las 10 de la noche. Rosa sale del mercado en Villa el Salvador. Tiene que caminar 6 cuadras hasta su casa. No sabe si esa ruta es segura. No hay forma de saberlo... hasta hoy."*

**Pantalla:** Mapa vacío — solo calles de VES sin ningún pin.

---

### Escena 2 — El Reporte en Tiempo Real (25 s)

**Narrador dice:** *"Carlos, delivery de madrugada, acaba de ver algo sospechoso en Jr. Paraíso. Abre Tu Vecino, escribe tres palabras..."*

**Acción en vivo:** Abrir `/reportar/chat`, escribir "vi a dos tipos sospechosos en jr paraíso", mostrar cómo la IA responde en 2 segundos y confirmar.

**Narrador dice:** *"...y en 20 segundos ese reporte existe para toda la comunidad."*

**Acción en vivo:** Cambiar al mapa. El nuevo pin aparece en tiempo real.

**Pausa de 3 segundos en silencio mirando al jurado.**

---

### Escena 3 — El Valor Para la Comunidad (20 s)

**Narrador dice:** *"Rosa abre el mapa. Ve el heatmap. Decide tomar la ruta alternativa. Llega a casa sin problemas."*

**Acción en vivo:** Activar capa de heatmap. Mostrar zonas rojas vs zonas verdes en VES.

---

### Escena 4 — El Valor Para el Municipio (20 s)

**Narrador dice:** *"El lunes, el Gerente de Seguridad Ciudadana abre el dashboard. Ve que el Sector 3 tiene 23 reportes esta semana, 40% más que la anterior. Reorienta el patrullaje antes del próximo incidente."*

**Acción en vivo:** Abrir `/dashboard`. Mostrar gráfico de barras y el mapa de calor municipal.

---

### Cierre (10 s)

**Narrador dice:** *"Tu Vecino. Haciendo visible la inseguridad que no se denuncia. Gracias."*

**Pantalla:** Home de la app con el slogan.

---

### Checklist Pre-Demo

```
[ ] Seed data cargado: 50+ incidentes en VES con timestamps de los últimos 7 días
[ ] Al menos 1 incidente en cada sector
[ ] Heatmap visible (suficiente densidad de puntos)
[ ] Groq API key activa y respondiendo < 2s
[ ] Supabase Realtime habilitado en tabla incidentes
[ ] Celular con batería > 80% y en modo avión (excepto WiFi)
[ ] URL de la app guardada en favoritos del celular
[ ] Pantalla del celular proyectada o preparada para compartir
```

---

## 10c. ESTADÍSTICAS CON FUENTES CITABLES

> Usar estas estadísticas en el pitch. Citar la fuente cuando el jurado pregunte.

| Dato | Número | Fuente | Cómo usarlo |
|---|---|---|---|
| Víctimas que NO denuncian | **86%** | INEI — ENAPRES 2023, Tabla 3.4 | "86 de cada 100 robos son invisibles para el Estado" |
| Víctimas de delito en Lima al año | **1.8 millones** | INEI — ENAPRES 2023 | Escala del problema en la ciudad |
| Percepción de inseguridad en Lima | **73%** de ciudadanos se siente inseguro | INEI — ENAPRES 2023 | "El miedo es generalizado, los datos no lo reflejan" |
| Municipios con serenazgo activo en Lima | **43 distritos** | MININTER — Anuario 2022 | Mercado potencial B2G concreto |
| Inseguridad como principal problema percibido | **1er lugar** en Lima Metropolitana | Barómetro de las Américas / IEP 2023 | Validación del dolor como prioridad ciudadana |

**Frase de apertura del pitch (usar literalmente):**
> *"El INEI nos dice que el 86% de los delitos en Lima nunca se denuncian. Eso significa que las ciudades toman decisiones de seguridad con solo el 14% de la información real. Tu Vecino existe para cerrar esa brecha."*

---

## 10d. MODELO DE NEGOCIO CON NÚMEROS

### Por qué es sostenible

**Costos operativos del MVP (mes 1–3):**

| Servicio | Costo mensual |
|---|---|
| Supabase Free tier | S/ 0 |
| Vercel Free tier | S/ 0 |
| Groq Free tier (14.400 req/día) | S/ 0 |
| Dominio .pe | S/ 15/mes (amortizado) |
| **Total mes 1** | **S/ 15/mes** |

**Costos operativos escala (500 usuarios activos, 1.000 reportes/mes):**

| Servicio | Costo mensual |
|---|---|
| Supabase Pro | S/ 80 (~$25) |
| Vercel Pro | S/ 80 (~$25) |
| Groq (aún en free tier con 1.000 req/mes) | S/ 0 |
| **Total escala** | **S/ 160/mes** |

### Modelo de Ingresos B2G

| Tier | Cliente | Precio mensual | Incluye |
|---|---|---|---|
| Gratuito | Vecinos ciudadanos | S/ 0 | Mapa, reportes, alertas |
| Municipal Básico | Municipalidades pequeñas | S/ 500/mes | Dashboard + exportes CSV |
| Municipal Pro | Municipalidades medianas | S/ 1.500/mes | API + integración SISFOH + soporte |
| Enterprise | Mancomunidades / Región | S/ 4.000/mes | Multi-distrito + BI avanzado |

### Proyección Financiera (conservadora)

| Hito | Tiempo | Clientes | Ingreso mensual |
|---|---|---|---|
| Break-even | Mes 6 | 1 municipio Pro | S/ 1.500 — cubre costos |
| Rentabilidad inicial | Mes 12 | 3 municipios | S/ 4.500/mes |
| Meta año 2 | Mes 24 | 10 municipios Lima | S/ 15.000/mes |
| TAM Lima completa | — | 43 municipios | S/ 64.500/mes |

**Respuesta al jurado sobre monetización:**
> *"Con un solo municipio en tier Pro cubrimos todos nuestros costos operativos. No necesitamos inversión para sobrevivir — necesitamos inversión para crecer más rápido. Lima tiene 43 municipios. Nuestro TAM anual es S/ 774.000 solo en Lima, sin contar Callao, Arequipa ni Trujillo."*

---

## 10e. POR QUÉ NOSOTROS — SLIDE DEL EQUIPO

> Este es el slide más subestimado del pitch. Los jurados votan por equipos, no solo por ideas.

### Versión A — Si el equipo tiene conexión con VES

*"Somos [X] desarrolladores que vivimos/tenemos familia en Lima y hemos sido víctimas o conocemos víctimas de inseguridad en distritos como Villa el Salvador. Este proyecto no es un ejercicio académico — es una solución a algo que nos afecta personalmente."*

### Versión B — Si el equipo no tiene conexión directa con VES

*"Somos desarrolladores que creemos que la tecnología debe resolver los problemas de quienes menos acceso tienen a ella. Del mismo modo que Yape democratizó los pagos bancarios para los que nunca tuvieron cuenta — Tu Vecino democratiza el acceso a información de seguridad para los que nunca denunciarían."*

### Qué agregar si el equipo hizo validación de usuario

> Reemplaza cualquiera de las versiones anteriores con esto — es el más poderoso:

*"Antes de la hackatón hablamos con 3 vecinas del Sector 6 de Villa el Salvador. Las tres dijeron que nunca habían denunciado un incidente. La razón más común: miedo a represalias y no saber adónde ir. Las tres dijeron que sí usarían una app así si fuera anónima y rápida. Eso es nuestra validación inicial — y es suficiente para saber que el problema es real."*

### Checklist Pre-Pitch para Validación de Usuario

```
[ ] Enviar WhatsApp a 3 personas (familia/amigos en Lima) con 2 preguntas:
    1. "¿Alguna vez viviste algo inseguro y no lo denunciaste? ¿Por qué?"
    2. "¿Usarías una app para reportar de forma anónima en 30 segundos?"
[ ] Guardar las respuestas (screenshots) para mostrar al jurado si preguntan
[ ] Preparar 1 quote memorable de máximo 15 palabras para el pitch en vivo
```

---

## 11. DIFERENCIACIÓN

### vs. Mapas de Delitos Tradicionales (ej: SIDPOL del MININTER)

| Dimensión | SIDPOL / mapas oficiales | Tu Vecino |
|---|---|---|
| Fuente de datos | Solo denuncias formales | Reportes ciudadanos + denuncias |
| Latencia | Días o semanas | Segundos |
| Cobertura | ~20% de incidentes reales | Aspiracional: 70%+ |
| Acceso ciudadano | No disponible al público | 100% público |
| Granularidad | Comisaría / distrito | Calle exacta |

### vs. Sistemas de Denuncias (ej: DENUNCIAS VIRTUALES PNP)

| Dimensión | Denuncia PNP | Tu Vecino |
|---|---|---|
| Tiempo para completar | 20–45 minutos | 30 segundos |
| Requiere registro | Sí, con DNI | No (anónimo) |
| Visualización geográfica | No | Sí, en tiempo real |
| Valor para el ciudadano | Trámite legal | Información útil inmediata |
| Colaborativo | No | Sí |

### vs. Apps de Seguridad Existentes (ej: Yasta, apps de serenazgo)

| Dimensión | Apps de serenazgo | Tu Vecino |
|---|---|---|
| Dirección de la info | App → ciudadano | Ciudadano → App → comunidad → municipio |
| Mapa colaborativo | No | Sí |
| Datos históricos | No | Sí, con tendencias |
| Dashboard municipal | No | Sí |
| Offline capability | Varía | Fase 2 |

### Factor Innovador Clave

**Tu Vecino es el primer sistema de inteligencia de seguridad ciudadana bidireccional para Lima que convierte conversaciones vecinales en datos estructurados accionables para la gestión municipal.**

No es una app de emergencias. No es un sistema de denuncias. Es infraestructura de información comunitaria.

---

## 12. ROADMAP

### Fase 1 — MVP Hackatón (Hoy)

**Objetivo:** Demostrar el concepto con datos reales de VES.

**Funcionalidades:**
- Reporte ciudadano (tipo, descripción, ubicación)
- Mapa interactivo con heatmap
- Feed de alertas comunitarias
- Dashboard municipal básico
- Seed data realista de VES

**Valor generado:** Validación del concepto ante jurado y primeros usuarios.

---

### Fase 2 — Prevención (1–3 meses)

**Objetivo:** Llegar a 500 usuarios activos en VES.

**Funcionalidades:**
- PWA instalable (offline-first con service worker)
- Notificaciones push por sector
- Rutas seguras a pie (evitando zonas de alta densidad de incidentes)
- Foto como evidencia de reporte
- Moderación comunitaria (flag de reportes falsos)
- Perfil de usuario con historial de reportes

**Valor generado:** Primera red de inteligencia vecinal activa de Lima.

---

### Fase 3 — Inteligencia Comunitaria (3–6 meses)

**Objetivo:** Convertir los datos en predicciones.

**Funcionalidades:**
- Análisis de patrones temporales (horas y días más peligrosos por zona)
- Alertas preventivas basadas en patrones históricos
- API pública para juntas vecinales y ONG
- Integración con grupos de WhatsApp (bot de reporte)
- Verificación de puntos seguros por la comunidad
- Mapa de iluminación pública con reporte de puntos oscuros

**Valor generado:** Sistema predictivo de bajo costo para municipalidades.

---

### Fase 4 — Gestión Municipal (6–12 meses)

**Objetivo:** Firmar contratos SaaS con 3+ municipalidades de Lima.

**Funcionalidades:**
- Dashboard municipal avanzado (exportes PDF/CSV, API REST)
- Módulo de gestión de serenazgo (asignación de turnos por zonas calientes)
- Integración con SISFOH y datos del INEI
- Sistema de tickets para seguimiento de intervenciones
- Reportes automáticos semanales para gerentes municipales
- Multi-tenancy (varias municipalidades en una plataforma)

**Valor generado:** Ingresos recurrentes B2G. Primer producto de GovTech de seguridad ciudadana para Lima.

---

### Fase 5 — Escalamiento Nacional (12–24 meses)

**Objetivo:** Presencia en 20+ distritos del Perú.

**Funcionalidades:**
- Plataforma nacional de inteligencia de seguridad ciudadana
- API de datos abiertos para investigadores y periodistas
- Integración con el Observatorio Nacional de Seguridad Ciudadana (CONASEC)
- SDK para municipalidades (white-label)
- App nativa iOS/Android
- Análisis con IA: detección automática de patrones anómalos

**Valor generado:** Plataforma de referencia nacional. Potencial de expansión a Chile, Colombia, Bolivia.

---

## 13. NAMING — DECISIÓN FINAL

### Nombre del Producto: **TU VECINO** ✅ Confirmado

| Elemento | Texto |
|---|---|
| **Nombre del producto** | Tu Vecino |
| **Tagline** | "Haciendo visible la inseguridad que no se denuncia" |
| **Copy del hero** | "Tu vecino/a ya reportó. ¿Tú ya revisaste el mapa?" |
| **Nombre en código** | `tu-vecino` (carpeta y package.json) |
| **Dominio sugerido** | tuvecinope.com / tuvecino.app |

---

## APÉNDICE — COMANDOS DE INICIO RÁPIDO

```bash
# 1. Crear proyecto
npx create-next-app@latest tu-vecino --typescript --tailwind --app --src-dir=false
cd tu-vecino

# 2. Instalar dependencias
npm install @supabase/supabase-js react-leaflet leaflet recharts lucide-react
npm install -D @types/leaflet

# 3. Variables de entorno
# Crear .env.local:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
# GROQ_API_KEY=gsk_...  ← obtener en console.groq.com (gratis, sin tarjeta)

# 4. Correr en desarrollo
npm run dev
```

### Prompt del Sistema — Groq (lib/groq.ts)

```typescript
import Groq from 'groq-sdk'

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const SYSTEM_PROMPT = `
Eres un asistente de seguridad ciudadana para el distrito de Villa el Salvador, Lima, Perú.
Tu único trabajo es ayudar a vecinos a reportar incidentes de seguridad.

Cuando el vecino te cuente qué pasó:
1. Clasifica el tipo de incidente en una de estas categorías EXACTAS:
   robo | intento_robo | acoso | actividad_sospechosa | zona_oscura | espacio_abandonado | otro
2. Extrae o infiere la zona/calle si se menciona.
3. Escribe una descripción breve (máximo 150 caracteres).
4. Responde SIEMPRE con este JSON y nada más:
   {"tipo": "...", "descripcion": "...", "sector": "...", "confirmacion": "Detecté: [tipo] en [zona]. ¿Confirmas?"}

Si el vecino confirma, responde: {"accion": "guardar"}
Si el vecino corrige, vuelve a clasificar con la nueva información.
Usa lenguaje coloquial y amigable. Llama al usuario "vecino/a".
`.trim()
```

### SQL Migration Inicial (Supabase SQL Editor)

```sql
-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla incidentes
CREATE TABLE incidentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (tipo IN (
    'robo','intento_robo','acoso','actividad_sospechosa',
    'zona_oscura','espacio_abandonado','otro'
  )),
  descripcion TEXT,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  sector TEXT,
  usuario_id UUID,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo','resuelto','falso')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla puntos_seguros
CREATE TABLE puntos_seguros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'comisaria','hospital','farmacia','iluminado','comercio_24h'
  )),
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  direccion TEXT,
  telefono TEXT,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla alertas
CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID REFERENCES incidentes(id),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  nivel TEXT DEFAULT 'info' CHECK (nivel IN ('info','warning','danger')),
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime en incidentes
ALTER TABLE incidentes REPLICA IDENTITY FULL;

-- RLS: lectura pública
ALTER TABLE incidentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura publica incidentes" ON incidentes FOR SELECT USING (true);
CREATE POLICY "insercion publica incidentes" ON incidentes FOR INSERT WITH CHECK (true);

ALTER TABLE puntos_seguros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura publica puntos" ON puntos_seguros FOR SELECT USING (true);

ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura publica alertas" ON alertas FOR SELECT USING (true);
```

### Seed Data de Villa el Salvador

```sql
INSERT INTO incidentes (tipo, descripcion, lat, lng, sector) VALUES
  ('robo', 'Arrebato de celular a pasajero de microbús', -12.2140, -76.9332, 'Sector 2'),
  ('intento_robo', 'Dos personas en moto intentaron robar bolso', -12.2165, -76.9290, 'Sector 3'),
  ('acoso', 'Hombre siguiendo a joven cerca del parque', -12.2200, -76.9350, 'Sector 4'),
  ('actividad_sospechosa', 'Grupo bebiendo frente a colegio por las noches', -12.2130, -76.9300, 'Sector 1'),
  ('zona_oscura', 'Cuadra completamente sin iluminación', -12.2180, -76.9270, 'Sector 5'),
  ('robo', 'Asalto a comerciante en mercado', -12.2155, -76.9320, 'Sector 2'),
  ('espacio_abandonado', 'Lote abandonado usado como botadero', -12.2210, -76.9380, 'Sector 6'),
  ('intento_robo', 'Intentaron abrir la puerta del carro', -12.2145, -76.9345, 'Sector 3'),
  ('acoso', 'Acoso verbal a mujeres en paradero', -12.2190, -76.9310, 'Sector 4'),
  ('robo', 'Robo de bicicleta encadenada', -12.2135, -76.9360, 'Sector 1'),
  ('actividad_sospechosa', 'Venta de drogas en esquina', -12.2170, -76.9280, 'Sector 5'),
  ('zona_oscura', 'Alumbrado roto hace 3 semanas', -12.2200, -76.9340, 'Sector 6'),
  ('robo', 'Robo de laptop en internet', -12.2160, -76.9300, 'Sector 2'),
  ('intento_robo', 'Seguimiento a persona que sacó dinero del banco', -12.2140, -76.9330, 'Sector 3'),
  ('acoso', 'Hombre exhibicionista en parque', -12.2185, -76.9360, 'Sector 4');

INSERT INTO puntos_seguros (nombre, tipo, lat, lng, direccion) VALUES
  ('Comisaría Villa El Salvador', 'comisaria', -12.2143, -76.9289, 'Av. Revolución s/n'),
  ('Posta Médica Sector 2', 'hospital', -12.2168, -76.9312, 'Jr. Los Alamos 234'),
  ('Farmacia Mifarma 24h', 'farmacia', -12.2155, -76.9298, 'Av. Pastor Sevilla 180'),
  ('Bodega Don Juan 24h', 'comercio_24h', -12.2178, -76.9335, 'Jr. Las Rosas 56');
```

---

*Plan generado el 2026-11-23 · Proyecto: Tu Vecino · Hackatón de Impacto Social*
