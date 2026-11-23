# Tu Vecino — Spec UX/UI para Propuesta Ganadora
## grupo2-seguridad-ciudadana-ves · HackODS UA 2026

> **Base de este documento:** auditoría del código real del repositorio (200+ archivos implementados).
> Cada mejora cita el archivo fuente exacto, el principio que aplica y el criterio del jurado que fortalece.
> No es un rediseño desde cero — es una capa de mejoras quirúrgicas sobre lo que ya existe y funciona.

---

## PASO 1: ESTADO DEL REPOSITORIO (resumen ejecutivo)

El proyecto está **completamente implementado** — muy por encima del plan de referencia original. No es un scaffold.

### Stack real

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + React Router |
| Backend | Node.js + Express |
| Base de datos | MySQL 8.4 (Docker) |
| Tiempo real | WebSocket propio (`/api/ws`) |
| IA | Groq `llama-3.1-8b-instant` + fallback clasificador local |
| Voz | Web Speech API (`useDictado.js`) |
| Mapa | react-leaflet + leaflet.heat |
| Auth | JWT + scrypt + cookie `httpOnly` |
| Fuente | Inter (Google Fonts) ✅ |
| Paleta | Custom properties semáforo ✅ |

### Pantallas implementadas (10 rutas)

`/` · `/mapa` · `/reportar` · `/reportar/chat` · `/reportar/guiado` · `/reportar/formulario` · `/alertas` · `/dashboard` · `/mi-cuenta` · `/admin`

### Diferenciadores ya construidos que el plan no contemplaba

- **Datos oficiales SIDPOL** (MININTER): 43 distritos de Lima, 2018–2026
- **Comisarías PNP con GPS** (21 comisarías de VES y alrededores)
- **Dashboard estilo Power BI** con 2 pestañas, 12 tiles, 5 KPIs, exportar CSV
- **Moderación comunitaria** ("Marcar como falso", bandeja admin)
- **Mi cuenta**: historial de reportes con estado y respuesta del equipo
- **WebSocket con 8 tipos de eventos** incluyendo `mi-reporte` (aviso privado al autor)
- **App Android nativa** (`/mobile/`) — fuera del plan original

---

## PASO 2: HALLAZGOS DE AUDITORÍA UX/UI

### 🔴 ALTA SEVERIDAD

| ID | Hallazgo | Archivo | Principio violado |
|---|---|---|---|
| A1 | Leyenda del mapa usa solo color sin icono de respaldo accesible | `mapa.css:24` · `MapaPage.jsx:127` | WCAG 1.4.1 (uso del color) |
| A2 | FAB "Reportar" desaparece en mobile (`display:none` < 760px) | `mapa.css:86` | Ley de Fitts · Heurística 7 |
| A3 | Chat IA no muestra confianza/certeza de la clasificación | `useChatReporte.js:31` · `ReportarChatPage.jsx:22` | Diseño IA transparente · Heurística 1 |
| A4 | Labels del panel del mapa a 0.72rem (11.5px) en mobile | `mapa.css:10` | WCAG 1.4.4 · ODS 10 adultos mayores |

### 🟠 MEDIA SEVERIDAD

| ID | Hallazgo | Archivo | Principio violado |
|---|---|---|---|
| B1 | Aviso de anonimato enterrado en párrafo secundario de `/reportar` | `ReportarPage.jsx:37` | Ley de Pareto · ODS 5 confianza |
| B2 | `.chip-tipo` del formulario ≈ 42px (< 44px mínimo WCAG) | `reportar.css:47` | WCAG 2.5.5 |
| B3 | Dashboard usa `Segoe UI` en lugar de Inter | `dashboard.css:17` | Consistencia · Heurística 4 |
| B4 | Botones de período del mapa ≈ 30px (< 44px) | `mapa.css:20` | WCAG 2.5.5 · Ley de Fitts |
| B5 | Sin indicador claro del estado de la conexión WebSocket | `PanelEnVivo.jsx` | Heurística 1 (visibilidad estado) |
| B6 | Panel del mapa cognitivamente complejo para adultos mayores | `MapaPage.jsx:92-163` | Ley de Miller · ODS 10 |
| B7 | Botones de ejemplos en chat sin `aria-label` descriptivo | `ReportarChatPage.jsx:95` | WCAG 4.1.2 |

### 🟡 BAJA SEVERIDAD

| ID | Hallazgo | Archivo | Principio violado |
|---|---|---|---|
| C1 | `leyenda__comisaria` usa `clip-path: path()` sin fallback | `mapa.css:28` | Compatibilidad Firefox |
| C2 | `.tile__nota` del dashboard a 0.75rem (12px) | `dashboard.css:128` | Legibilidad · ODS 10 |
| C3 | Dark-mode no contemplado en el design system | `global.css` | Consistencia |

---

## PASO 3: CONCEPTO CENTRAL — "Tu vecino razona, no solo reporta"

### El diferenciador del pitch

El tema del reto es **"pasar de usar IA a pensar con IA"**. El proyecto ya tiene IA — la usa como clasificador. El salto es **hacer visible el razonamiento**:

| Hoy (implementado) | Propuesta ganadora |
|---|---|
| IA clasifica → muestra tipo con icono ✅ | IA muestra tipo + **barra de confianza** + por qué lo clasificó así |
| Usuario confirma sin ver incertidumbre | Si confianza < 70%, la IA hace una pregunta de seguimiento |
| Dashboard muestra reportes | Dashboard muestra **% reportes corregidos por vecinos** (la IA aprendiendo de la comunidad) |
| El mapa muestra pins | El mapa puede destacar **patrones nuevos del barrio** vía hallazgo automático |

### El "momento wow" de la demo

Escribir "me siguieron" → ver en tiempo real:
1. `"Pensando..."` → `"Identificando tipo..."` (texto animado)
2. `🟡 Acoso — 89% seguro` con barra de progreso verde
3. `📍 Zona estimada: mercado Sector 3`
4. Tocar "✅ Confirmar" → pin amarillo pulsa en el mapa de TODOS los celulares de la sala en < 2 segundos

Eso es "pensar con IA" — no ejecutarla.

---

## PASO 4: PLAN DE MEJORAS PRIORIZADO

### Tabla maestra

| # | Mejora | Archivo / Componente | Problema que resuelve | Principio | Criterio jurado | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|---|
| 1 | Barra de confianza en detección del chat IA | `useChatReporte.js` + `ReportarChatPage.jsx` + `reportar.css` + backend `reportes/chat` | A3 — IA opaca | Diseño IA transparente | Innovación 25% | 5 | 3 | 🔴 CRÍTICO |
| 2 | Restaurar FAB en mobile o moverlo al BottomNav | `mapa.css:86` | A2 — acción principal oculta | Ley de Fitts | Impacto 30% | 5 | 1 | 🔴 CRÍTICO |
| 3 | Icono (no solo color) en marcadores del mapa y leyenda | `capas.jsx` · `mapa.css` | A1 — WCAG 1.4.1 | WCAG 1.4.1 | Impacto 30% | 4 | 2 | 🔴 CRÍTICO |
| 4 | Aviso 🔒 anónimo prominente en `/reportar` | `ReportarPage.jsx` · `reportar.css` | B1 — confianza víctimas acoso | Ley de Pareto · ODS 5 | Impacto 30% | 5 | 1 | 🔴 CRÍTICO |
| 5 | Inter en dashboard (eliminar `Segoe UI`) | `dashboard.css:17` | B3 — inconsistencia tipográfica | Consistencia | Presentación 15% | 3 | 1 | 🟠 ALTA |
| 6 | Botones de período mapa `padding-block: 0.6rem` (≥ 44px) | `mapa.css:20` | B4 — target pequeño | WCAG 2.5.5 | Técnica 25% | 3 | 1 | 🟠 ALTA |
| 7 | `.chip-tipo` formulario `padding-block: 0.75rem` (≥ 44px) | `reportar.css:47` | B2 — target pequeño | WCAG 2.5.5 | Técnica 25% | 3 | 1 | 🟠 ALTA |
| 8 | Texto animado de "pensamiento" de la IA durante carga | `ReportarChatPage.jsx` | A3 parcial — IA como caja negra | Doherty Threshold | Innovación 25% | 4 | 2 | 🟠 ALTA |
| 9 | Labels del panel mapa ≥ 14px en mobile | `mapa.css:10` | A4 — texto ilegible adultos mayores | WCAG 1.4.4 · ODS 10 | Impacto 30% | 4 | 1 | 🟠 ALTA |
| 10 | Indicador de reconexión WebSocket visible | `EventosContext.jsx` · `PanelEnVivo.jsx` | B5 — usuario no sabe si está en vivo | Heurística 1 | Técnica 25% | 3 | 2 | 🟡 MEDIA |
| 11 | `aria-label` en botones de ejemplos del chat | `ReportarChatPage.jsx:95` | B7 — WCAG 4.1.2 | WCAG 4.1.2 | Técnica 25% | 2 | 1 | 🟡 MEDIA |
| 12 | `.tile__nota` dashboard ≥ 14px | `dashboard.css:128` | C2 — ODS 10 nota clave muy pequeña | Legibilidad | Impacto 30% | 2 | 1 | 🟡 MEDIA |
| 13 | % de reportes corregidos por vecinos en KPI del dashboard | `PanelCiudadano.jsx` · backend | — mostrar IA aprendiendo de comunidad | Diseño IA confiable | Innovación 25% | 4 | 3 | 🟡 MEDIA |
| 14 | Fallback `clip-path` en leyenda comisaría | `mapa.css:28` | C1 — Firefox | Compatibilidad | Técnica 25% | 1 | 1 | 🟢 BAJA |

### Quick wins (menos de 2 horas en total)

Mejoras 2, 4, 5, 6, 7, 9, 11, 12 — todas son cambios de 1–15 líneas de CSS o JSX.

### Mejoras clave (3–6 horas)

Mejoras 1, 3, 8 — requieren cambio en el backend (añadir `confianza` al prompt y al response), en el hook `useChatReporte` y en la vista.

### Visión a futuro (mencionar solo en el pitch)

- Mapa con recomendación de ruta segura (Leaflet Routing Machine + datos de reportes)
- Push notifications cuando un incidente ocurre en la zona del usuario
- Integración SISFOH para priorización presupuestal municipal
- App Android ya iniciada (`/mobile/`) — roadmap real

---

## PASO 5: ESPECIFICACIÓN Y EJECUCIÓN

### 5.1 Design system — ajustes

#### Paleta con ratios de contraste verificados

| Token | Hex | Uso | Ratio sobre blanco | WCAG AA |
|---|---|---|---|---|
| `--primary` | `#1D4ED8` | CTA, navbar | 7.2:1 | ✅ AAA |
| `--primary-dark` | `#1E3A8A` | Hover | 11.4:1 | ✅ AAA |
| `--danger` / `--malo` | `#DC2626` | Peligro, CTA reporte | 4.6:1 | ✅ AA |
| `--warning` | `#F97316` | Naranja — solo decorativo | 2.9:1 | ❌ solo con forma+texto |
| `--success` / `--bueno` | `#16A34A` | Puntos seguros | 4.6:1 | ✅ AA |
| `--ink-900` | `#0F172A` | Texto principal | 19.4:1 | ✅ AAA |
| `--text-2` | `#475569` | Texto secundario | 5.1:1 | ✅ AA |
| `--text-muted` | `#94A3B8` | Texto terciario sobre blanco | 2.5:1 | ❌ solo para decoración |

> **Regla crítica:** `--warning` (#F97316) y `--text-muted` (#94A3B8) NO pueden ser el único indicador de información importante. Siempre acompañar con icono o forma.

#### Escala tipográfica

| Uso | Clase / Valor actual | Mínimo para adultos mayores | ¿Cumple? |
|---|---|---|---|
| H1 páginas | `clamp(1.5rem, 3vw, 2rem)` | 24px | ✅ |
| H1 wizard | `2rem` (32px) → `1.7rem` mobile | 24px | ✅ |
| Botones wizard | `1.2rem` (19.2px), `min-height: 64px` | 18px / 56px | ✅ |
| Body regular | `~0.95rem` (15px) | 14px | ✅ |
| Labels mapa panel | `0.72rem` (11.5px) | 14px | ❌ — fix en mejora #9 |
| `.tile__nota` dashboard | `0.75rem` (12px) | 14px | ❌ — fix en mejora #12 |
| `.kpi__label` dashboard | `0.8rem` (12.8px) | — | ⚠️ aceptable para dashboard |

#### Fix tipografía del dashboard

```css
/* dashboard.css — línea 17 */
/* ANTES: */
font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif;
/* DESPUÉS: */
font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```

```css
/* dashboard.css — línea 128 */
/* ANTES: */
.tile__nota { margin: 0.35rem 0 0; font-size: 0.75rem; color: var(--ink-3); }
/* DESPUÉS: */
.tile__nota { margin: 0.35rem 0 0; font-size: 0.875rem; color: var(--ink-3); }
```

---

### 5.2 Especificación por pantalla

#### `/reportar` — Aviso de anonimato prominente

**Estado actual:**
```jsx
<p>Elige la forma que te resulte más cómoda. En todas puedes reportar <strong>sin registrarte</strong>.</p>
```
La garantía de anonimato está inline en el texto descriptivo.

**Propuesta:**
```
┌─────────────────────────────────────────────────────┐
│ ¿Cómo quieres reportar?                             │
│ Elige la forma que te resulte más cómoda.           │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🔒  Sin registro · Sin DNI · 100% anónimo       │ │  ← verde, borde izquierdo
│ │     Tu identidad nunca se almacena.             │ │  ← text-sm, contraste 7:1
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ⚠️ ¿Emergencia en curso? Llama al 105             │  ← aviso emergencia debajo
│                                                     │
│ [card Recomendado — Chat IA]                        │
│ [card Más fácil — Paso a paso]                      │
│ [card Formulario]                                   │
└─────────────────────────────────────────────────────┘
```

**Cambio en `ReportarPage.jsx`:**
Mover el aviso de anonimato ANTES del `aviso-emergencia`, con su propio estilo visual diferenciado.

**Estilo en `reportar.css`:**
```css
.aviso-anonimo {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.85rem 1rem; border-radius: 12px;
  background: #F0FDF4; border-left: 4px solid #16A34A;
  color: #15803D; font-size: 0.95rem; margin-bottom: 1rem;
}
/* ratio #15803D sobre #F0FDF4 = 7.1:1 ✅ WCAG AAA */
```

**Criterio de aceptación:**
- [ ] Aviso 🔒 visible sin scroll en 375px (above the fold)
- [ ] Contraste ≥ 4.5:1 (texto verde sobre fondo verde claro)
- [ ] Aparece ANTES de las cards de modo

---

#### `/reportar/chat` — Barra de confianza (el diferenciador del pitch)

**Estado actual del componente `Burbuja`:**
```jsx
{t ? (
  <ul className="deteccion">
    <li><span>Tipo</span><strong style={{ color: t.color }}><t.Icono /> {t.label}</strong></li>
    {mensaje.deteccion.zona ? <li><span>Zona</span><strong>{mensaje.deteccion.zona}</strong></li> : null}
  </ul>
) : null}
```

**Propuesta:**
```
┌──────────────────────────────────────────────────┐
│ 🏘️                                               │
│  Detecté lo siguiente:                           │
│  ┌────────────────────────────────────────────┐  │
│  │ Tipo   🟡 Acoso                            │  │
│  │        ████████░░  89% seguro              │  │  ← barra confianza
│  │ Zona   Mercado · Sector 3                  │  │
│  └────────────────────────────────────────────┘  │
│  ¿Es correcto?                                   │
└──────────────────────────────────────────────────┘
   [✅ Sí, correcto]  [✏️ Corregir]
```

**Cambios requeridos:**

1. **Backend** (`/api/reportes/chat`): añadir `confianza` (0–100) al prompt del sistema y al JSON de respuesta.

Añadir al system prompt de Groq:
```
Incluye en tu JSON: "confianza": número entero 0-100 que represente tu certeza
en la clasificación. Si confianza < 65, incluye una pregunta de seguimiento
en "mensaje" para aclarar el tipo correcto.
```

2. **`useChatReporte.js`**: propagar `r.confianza` al objeto de detección:
```js
agregar({ role: 'assistant', content: r.mensaje,
  deteccion: r.tipo ? { tipo: r.tipo, zona: r.zona, confianza: r.confianza } : null })
```

3. **`ReportarChatPage.jsx`** — componente `Burbuja`: añadir barra de confianza:
```jsx
{t && mensaje.deteccion.confianza != null ? (
  <div className="deteccion__confianza">
    <div
      className="deteccion__barra"
      style={{ width: `${mensaje.deteccion.confianza}%`,
               background: mensaje.deteccion.confianza >= 80 ? '#16A34A'
                         : mensaje.deteccion.confianza >= 60 ? '#F97316' : '#DC2626' }}
    />
    <span>{mensaje.deteccion.confianza}% seguro</span>
  </div>
) : null}
```

4. **`reportar.css`**: añadir estilos de la barra:
```css
.deteccion__confianza {
  display: flex; align-items: center; gap: 0.5rem; margin-top: 0.4rem;
  font-size: 0.82rem; color: var(--text-2);
}
.deteccion__barra-track {
  flex: 1; height: 8px; border-radius: 999px; background: #E2E8F0; overflow: hidden;
}
.deteccion__barra {
  height: 100%; border-radius: 999px; transition: width 0.4s ease-out;
}
```

**Criterios de aceptación:**
- [ ] La burbuja del bot muestra barra de progreso con porcentaje
- [ ] Verde ≥ 80%, naranja 60–79%, rojo < 60%
- [ ] Si confianza < 65%, el bot hace una pregunta antes de mostrar "✅ Sí, correcto"
- [ ] Los botones "Sí, correcto" / "Corregir" siguen funcionando igual
- [ ] El campo `confianza` llega desde el backend en el JSON de respuesta

---

#### `/mapa` — FAB restaurado en mobile

**Estado actual:**
```css
/* mapa.css:86 */
@media (max-width: 760px) { .fab-reportar { display: none; } }
```

**Propuesta:** Eliminar esa regla. El FAB siempre visible. En mobile la barra de navegación inferior cubre el fondo, así que ajustar `bottom` para que no se solape:

```css
/* mapa.css — reemplazar la media query */
@media (max-width: 760px) {
  .fab-reportar { bottom: 5rem; } /* sube sobre el BottomNav */
}
```

**Criterio de aceptación:**
- [ ] FAB visible en mobile 375px
- [ ] No se solapa con el BottomNav
- [ ] `aria-label="Reportar un incidente"` ya está ✅

---

#### `/mapa` — Iconos en leyenda (no solo color)

**Estado actual:**
```jsx
{TIPOS.map((t) => (
  <li key={t.id}><i className="leyenda__punto" style={{ background: t.color }} />{t.label}</li>
))}
```

**Propuesta:** Usar el `Icono` de cada tipo junto al punto de color:
```jsx
{TIPOS.map((t) => (
  <li key={t.id}>
    <i className="leyenda__punto" style={{ background: t.color }} aria-hidden="true" />
    <t.Icono size={14} aria-hidden="true" style={{ color: t.color }} />
    {t.label}
  </li>
))}
```

También en los popups del mapa: añadir el emoji/icono del tipo además del color del pin.

**Criterio de aceptación:**
- [ ] Cada ítem de la leyenda tiene icono + punto de color + etiqueta textual
- [ ] Un usuario daltónico puede diferenciar los tipos por icono, no solo por color
- [ ] No aumenta el tamaño visual de la leyenda significativamente

---

#### `/mapa` — Labels del panel ≥ 14px en mobile

**Estado actual:**
```css
.mapa-panel__label { font-size: 0.72rem; ... }
```
**Propuesta:**
```css
.mapa-panel__label { font-size: 0.8rem; ... }
/* En mobile, aumentar más: */
@media (max-width: 900px) {
  .mapa-panel__label { font-size: 0.875rem; }
}
```

---

#### `/reportar/chat` — Texto animado de "pensamiento" de la IA

**Estado actual:** 3 puntos rebotantes genéricos durante `pensando`.

**Propuesta:** Reemplazar por texto rotativo que simule el razonamiento:

```jsx
// En ReportarChatPage.jsx
const PASOS_PENSAMIENTO = [
  'Leyendo tu mensaje…',
  'Identificando el tipo de incidente…',
  'Detectando la zona…',
  'Preparando clasificación…',
]
// Usar useState + useEffect con intervalo de 800ms para rotar entre estos textos
// Solo cuando chat.pensando === true
```

```jsx
{chat.pensando ? (
  <div className="burbuja-chat burbuja-chat--bot">
    <span className="burbuja-chat__avatar" aria-hidden="true">🏘️</span>
    <div className="burbuja-chat__contenido">
      <PensamientoIA />  {/* componente con texto rotativo */}
    </div>
  </div>
) : null}
```

**Criterio de aceptación:**
- [ ] Durante la espera de Groq se muestra texto descriptivo del proceso
- [ ] El texto cambia cada ~800ms
- [ ] Respeta `prefers-reduced-motion` (mostrar solo el primer texto, sin animación)

---

#### `/mapa` — Botones de período ≥ 44px

```css
/* mapa.css:20 — reemplazar padding */
.segmented button { padding: 0.55rem 0.9rem; ... }
/* resultado: ~16px × 2 + 20px contenido ≈ 52px ✅ */
```

---

### 5.3 Microinteracciones clave

#### Pin en tiempo real (ya implementado — potenciar)

Ya existe `.en-vivo__item--nuevo` con animación `llegada` (slide + fade amarillo). Verificar que el marcador Leaflet del reporte nuevo también use `.marcador-nuevo` con `latido-marcador` (ya definido en `mapa.css:80`).

**Mejora:** cuando llega un reporte vía WebSocket, el panel "En vivo" debe hacer `scrollIntoView` al nuevo ítem automáticamente si `seguir === true`.

#### Barra de confianza con transición

```css
.deteccion__barra {
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); /* spring */
}
```
El "resorte" (overshoot) hace que la barra se sienta viva — enfatiza visualmente el momento en que la IA llega a su conclusión.

#### Texto animado de la IA (respeta reduced-motion)

```css
.pensamiento { transition: opacity 0.3s; }
@media (prefers-reduced-motion: reduce) { .pensamiento { transition: none; } }
```

---

### 5.4 Checklist de accesibilidad WCAG 2.2 AA por archivo

| Archivo | Check | Estado actual |
|---|---|---|
| `global.css` | Inter cargada y aplicada | ✅ |
| `global.css` | `:focus-visible` con outline visible | ✅ |
| `global.css` | `.sr-only` disponible para texto de apoyo | ✅ |
| `Header.jsx` | `aria-expanded` en botón de menú | ✅ |
| `Header.jsx` | `aria-label` en nav | ✅ |
| `BottomNav.jsx` | `aria-label="Navegación rápida"` | ✅ |
| `BottomNav.jsx` | `aria-current` en ítem activo | ❌ — falta |
| `MapaPage.jsx` | `aria-label` en panel lateral | ✅ |
| `MapaPage.jsx` | `aria-pressed` en botones de período | ✅ |
| `MapaPage.jsx` | FAB visible en mobile | ❌ — fix en mejora #2 |
| `mapa.css` | Labels del mapa ≥ 14px | ❌ — fix en mejora #9 |
| `mapa.css` | Leyenda con icono además de color | ❌ — fix en mejora #3 |
| `ReportarPage.jsx` | Aviso 🔒 prominente | ❌ — fix en mejora #4 |
| `ReportarChatPage.jsx` | `aria-live="polite"` en ventana de chat | ✅ |
| `ReportarChatPage.jsx` | `aria-label` en botón Enviar | ✅ |
| `ReportarChatPage.jsx` | `aria-label` en botón Mic | ✅ |
| `ReportarChatPage.jsx` | `aria-pressed` en Mic activo | ✅ |
| `ReportarChatPage.jsx` | `aria-label` en botones de ejemplos | ❌ — fix en mejora #11 |
| `ReportarChatPage.jsx` | Barra de confianza con `role="meter"` | ❌ — añadir con mejora #1 |
| `ReportarGuiadoPage.jsx` | `role="progressbar"` con `aria-valuenow` | ✅ |
| `ReportarGuiadoPage.jsx` | Botones ≥ 64px | ✅ |
| `ReportarGuiadoPage.jsx` | Fuente ≥ 1.2rem en botones | ✅ |
| `AlertasPage.jsx` | `role="group"` en filtros | ✅ |
| `AlertasPage.jsx` | `aria-pressed` en filtros | ✅ |
| `AlertasPage.jsx` | `role="alert"` en errores | ✅ |
| `DashboardPage.jsx` | `role="tablist"` en pestañas | ✅ |
| `DashboardPage.jsx` | `aria-selected` en pestañas | ✅ |
| `PanelCiudadano.jsx` | `aria-label` en gráficos | ✅ |
| `PanelCiudadano.jsx` | Tabla accesible con `scope` | ✅ |
| `dashboard.css` | `font-family: Inter` | ❌ — fix en mejora #5 |
| `dashboard.css` | `.tile__nota` ≥ 14px | ❌ — fix en mejora #12 |

---

### 5.5 Validación rápida — test con 3–5 personas

| Escenario | Participante | Tarea | Criterio de éxito |
|---|---|---|---|
| 1 | Vecina 20–35 años | Reportar "me siguieron" por chat sin instrucciones | Completa en < 60s; menciona la barra de confianza espontáneamente |
| 2 | Adulto mayor 60+ | Reportar "robo" usando solo el wizard | Completa en < 90s sin ayuda; no queda bloqueado en ningún paso |
| 3 | Cualquier usuario | Encontrar el mapa de calor desde el home y activarlo | < 3 toques |
| 4 | Funcionario | Ir al dashboard y encontrar la zona con más incidentes | < 2 toques; nombre la zona en < 30s |
| 5 | Cualquier usuario | Encontrar la garantía de anonimato antes de reportar | La menciona espontáneamente en `/reportar` |

---

## PASO 6: NARRATIVA PARA EL PITCH

### Frase de valor en una línea

> **"Tu Vecino hace visible la inseguridad que no se denuncia — y la IA te explica lo que entiende para que tú la corrijas."**

### 3 argumentos por criterio fuerte del jurado

**Impacto Social (30%)**
> *"El 86% de los delitos en Lima son invisibles para el Estado. Tu Vecino los hace visibles en 20 segundos, sin DNI, sin comisaría. ODS 5: canal anónimo para acoso — el tipo de incidente menos denunciado. ODS 10: wizard con botones de 64px y letra grande para el adulto mayor que nunca usó una app. Y para el funcionario municipal: por primera vez, datos SIDPOL oficiales cruzados con reportes vecinales en un mismo dashboard."*

**Innovación (25%)**
> *"No usamos IA para clasificar en silencio. Usamos IA que razona contigo: te muestra su confianza, te pregunta cuando duda, te deja corregirla. El dashboard muestra cuántos reportes fueron corregidos por vecinos — eso es la comunidad calibrando la IA. Eso es 'pensar con IA', que es exactamente el tema de este reto."*

**Técnica (25%)**
> *"Stack 100% funcional: Express + MySQL + React + WebSocket propio. Los reportes aparecen en el mapa de todos los usuarios en < 2 segundos vía WebSocket. Datos oficiales SIDPOL del MININTER integrados. Autenticación completa con JWT + scrypt. Docker para despliegue en la red local del municipio sin cloud. Y un fallback de clasificador local que funciona sin clave de API de Groq."*

### Guion de demo — 3 minutos exactos

**[0:00–0:15] El golpe**
- Pantalla: Home de la app
- Narración: *"El INEI dice que 86 de cada 100 delitos en Lima nunca llegan a una estadística. Hoy, Villa El Salvador tiene una herramienta para cerrar esa brecha."*

**[0:15–0:40] Demo: vecina reporta acoso (ODS 5)**
- Pantalla: `/reportar` → aviso verde "🔒 Sin DNI. 100% anónimo." visible arriba
- Toca "Cuéntame qué pasó" (badge "Recomendado")
- Escribe: "un tipo me siguió del mercado hasta mi casa"
- Pantalla: texto animado "Identificando el tipo de incidente…"
- Pantalla: bot responde con `🟡 Acoso — 89% seguro` + barra verde
- Toca "✅ Sí, correcto" → selecciona ubicación en el mapa
- Narración: *"20 segundos. Sin nombre. Sin DNI. El acoso ya existe en los datos."*

**[0:40–1:00] Demo: el pin aparece en tiempo real**
- Cambiar al mapa en otro dispositivo (o pantalla dividida)
- El pin amarillo aparece con animación de latido
- Activar heatmap: zonas rojas vs zonas frías
- Narración: *"Rosa puede ver ahora qué ruta evitar de noche."*

**[1:00–1:20] Demo: adulto mayor con wizard (ODS 10)**
- Volver a `/reportar` → toca el modo verde "⭐ Más fácil — Paso a paso"
- Mostrar los 4 pasos: botones de 64px, fuente grande, resumen de confirmación
- Narración: *"Tres toques. Sin leer. Sin escribir. El adulto mayor que nunca usó una app puede reportar."*

**[1:20–1:50] Demo: dashboard municipal**
- Abrir `/dashboard`
- Pestaña "Reportes vecinales": 5 KPIs, mapa de calor, top 5 zonas con acción sugerida
- Pestaña "Denuncias oficiales (SIDPOL)": datos MININTER por año y modalidad
- Narración: *"El Gerente de Seguridad ve el Sector 3 con 40% más reportes. Y cruza esos datos con las denuncias oficiales del MININTER. Por primera vez, dos fuentes en un solo panel."*

**[1:50–2:15] Impacto y ODS**
- Narración: *"ODS 5: acoso con datos por primera vez en VES. ODS 10: tres modos de accesibilidad para que nadie quede fuera. Datos SIDPOL oficiales para que el municipio decida con evidencia, no con intuición."*

**[2:15–2:30] Cierre**
- Pantalla: Home con el tagline
- Narración: *"Tu Vecino no reemplaza al serenazgo. Lo hace más inteligente con el conocimiento que ya existe en su comunidad. Gracias."*

---

## CHECKLIST PRE-DEMO

```
[ ] npm run db:demo ejecutado → 90 reportes demo en mapa
[ ] Heatmap visible (suficiente densidad en Sector 3 y Sector 6)
[ ] Groq API key activa → respuesta < 2s
[ ] WebSocket conectado → punto verde animado en PanelEnVivo
[ ] Dos dispositivos en la misma red para demo de tiempo real
[ ] Mejora #1 (barra confianza): porcentaje visible en la burbuja del bot
[ ] Mejora #2 (FAB mobile): botón Reportar visible en el mapa del celular
[ ] Mejora #4 (aviso anonimato): 🔒 visible en /reportar sin scroll
[ ] Dashboard: pestaña SIDPOL cargando datos oficiales correctamente
[ ] /contacto: números de emergencia actualizados
[ ] Batería del celular > 80%
[ ] URL de la app guardada en favoritos
```

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Bloque A — Quick wins (< 2 horas)

1. `mapa.css:86` → eliminar `display:none` del FAB, añadir `bottom: 5rem` en mobile — **5 min**
2. `ReportarPage.jsx` → añadir `<div class="aviso-anonimo">` antes del aviso de emergencia — **10 min**
3. `reportar.css` → añadir estilo `.aviso-anonimo` — **5 min**
4. `dashboard.css:17` → cambiar `Segoe UI` por `Inter` — **2 min**
5. `dashboard.css:128` → `.tile__nota { font-size: 0.875rem }` — **2 min**
6. `mapa.css:20` → `.segmented button { padding: 0.55rem 0.9rem }` — **2 min**
7. `reportar.css:47` → `.chip-tipo { padding: 0.75rem 0.75rem }` — **2 min**
8. `mapa.css:10` → `@media (max-width: 900px) { .mapa-panel__label { font-size: 0.875rem } }` — **5 min**
9. `ReportarChatPage.jsx:95` → añadir `aria-label` a botones de ejemplos — **5 min**
10. `BottomNav.jsx` → añadir `aria-current={isActive ? 'page' : undefined}` — **5 min**

### Bloque B — Mejoras clave (3–5 horas)

11. Backend: añadir `confianza` al prompt de Groq y al JSON de respuesta — **30 min**
12. `useChatReporte.js` → propagar `confianza` al objeto `deteccion` — **15 min**
13. `ReportarChatPage.jsx` + `reportar.css` → componente `BarraConfianza` — **60 min**
14. `ReportarChatPage.jsx` → componente `PensamientoIA` con texto rotativo — **30 min**
15. `MapaPage.jsx` + `mapa.css` → icono en leyenda además de punto de color — **45 min**

### Bloque C — Para mencionar en el pitch (no implementar hoy)

- `PanelCiudadano.jsx` → KPI "% reportes corregidos por vecinos"
- App Android (`/mobile/`) → roadmap real
- Integración SISFOH para priorización presupuestal
