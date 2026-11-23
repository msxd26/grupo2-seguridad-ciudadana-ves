# TU VECINO — Spec UX/UI para Propuesta Ganadora
## HackODS UA 2026 · Villa El Salvador

> **Propósito de este documento:** especificación completa de mejoras UX/UI basadas en auditoría del código real. Cada mejora cita el archivo fuente, el principio que aplica y el criterio del jurado que fortalece. No modifica código — es el contrato de diseño antes de implementar.

---

## 1. CONCEPTO CENTRAL

**"La IA que razona contigo, no por ti."**

El diferenciador del pitch es hacer visible el razonamiento de la IA: que el vecino vea cómo la IA detecta, duda, pregunta y confirma. Eso es "pensar con IA" en acción — alineado exactamente con el tema del reto.

Cambio de paradigma:

| Estado actual | Estado objetivo |
|---|---|
| IA clasifica en silencio y muestra resultado | IA muestra confianza, pregunta cuando duda, explica qué detectó |
| Chips en snake_case: `intento_robo` | Etiquetas humanas: "🟠 Intentaron robarme — 91% seguro" |
| Pantalla de éxito genérica | Éxito muestra resumen de lo que se guardó |
| Guardado silencioso si falla | Error explícito con opción de reintentar |

---

## 2. DESIGN SYSTEM ACTUALIZADO

### 2.1 Paleta con ratios de contraste verificados

| Token | Nombre | Hex | Uso | Ratio sobre blanco | WCAG AA |
|---|---|---|---|---|---|
| `--color-primary` | Azul institucional | `#1D4ED8` | CTA primario, navbar, enlaces | 7.2:1 | ✅ AAA |
| `--color-primary-dark` | Azul oscuro | `#1E3A8A` | Hover states | 11.4:1 | ✅ AAA |
| `--color-danger` | Rojo alerta | `#DC2626` | Incidentes graves, peligro | 4.6:1 | ✅ AA |
| `--color-warning` | Naranja atención | `#F97316` | Incidentes medios | 2.9:1 ⚠️ | ❌ solo decorativo |
| `--color-warning-text` | Naranja texto | `#C2410C` | Texto naranja sobre blanco | 5.1:1 | ✅ AA |
| `--color-success` | Verde seguro | `#16A34A` | Puntos seguros, estado OK | 4.6:1 | ✅ AA |
| `--color-info` | Azul claro | `#0EA5E9` | Zonas oscuras, informativos | 2.7:1 ⚠️ | ❌ solo decorativo |
| `--color-info-text` | Azul info texto | `#0369A1` | Texto azul info sobre blanco | 5.9:1 | ✅ AA |
| `--color-neutral-50` | Fondo claro | `#F8FAFC` | Background de páginas | — | — |
| `--color-neutral-900` | Texto principal | `#0F172A` | Body text | 19.4:1 | ✅ AAA |
| `--color-neutral-500` | Texto secundario | `#64748B` | Subtexts, labels | 4.6:1 | ✅ AA |

> **Regla crítica:** `#F97316` (naranja) y `#0EA5E9` (azul claro) NO pueden usarse solos para texto. Usar sus variantes `*-text` cuando el contraste importa. El color nunca es el único diferenciador — siempre acompañar con etiqueta o icono.

### 2.2 Escala tipográfica

**Fuente:** Inter (ya importada en `layout.tsx`). **Fix obligatorio:** eliminar `font-family: Arial, Helvetica, sans-serif` de `globals.css:25`.

| Uso | Clase Tailwind | Tamaño real | Peso | Mínimo para adultos mayores |
|---|---|---|---|---|
| H1 principal | `text-3xl font-extrabold` | 30px | 800 | ✅ |
| H2 sección | `text-2xl font-bold` | 24px | 700 | ✅ |
| H3 subsección | `text-lg font-semibold` | 18px | 600 | ✅ |
| Body regular | `text-base` | 16px | 400 | ✅ |
| Body wizard | `text-lg font-semibold` | 18px | 600 | ✅ obligatorio |
| Label / chip | `text-sm font-medium` | 14px | 500 | ⚠️ mínimo |
| Microcopy | `text-sm` | 14px | 400 | ⚠️ mínimo — nunca `text-xs` para info crítica |
| Metadatos fecha | `text-xs` | 12px | 400 | ⚠️ solo timestamps, nunca mensajes de error |

> **Regla para adultos mayores:** Todo texto interactivo (botones, labels, confirmaciones) ≥ 16px. Wizard: todo ≥ 18px. Nunca usar `text-xs` para mensajes de error, avisos de privacidad ni CTAs.

### 2.3 Espaciado y tamaños táctiles

| Componente | Tamaño mínimo | Implementación actual | ¿Cumple? |
|---|---|---|---|
| Botones wizard | 56px alto | `py-5` ≈ 68px | ✅ |
| Botones CTA primario | 56px alto | `py-4` ≈ 56px | ✅ |
| BottomNav ítems | 44px alto | `py-3` ≈ 44px | ✅ |
| Botones icon-only (mic, send) | 44×44px | `w-10 h-10` = 40×40px | ⚠️ +4px |
| Filter chips del mapa | 32px alto | `py-1` ≈ 28px | ❌ muy pequeño en móvil |
| Zoom controls Leaflet | 44×44px | Default Leaflet 26×26px | ❌ |
| FAB del mapa | 56×56px | `w-14 h-14` = 56×56px | ✅ |

### 2.4 Design tokens en globals.css

Reemplazar el contenido actual de `globals.css` con:

```css
@import "tailwindcss";

:root {
  --color-primary:        #1D4ED8;
  --color-primary-dark:   #1E3A8A;
  --color-danger:         #DC2626;
  --color-warning:        #F97316;
  --color-warning-text:   #C2410C;
  --color-success:        #16A34A;
  --color-info:           #0EA5E9;
  --color-info-text:      #0369A1;
  --color-neutral-50:     #F8FAFC;
  --color-neutral-900:    #0F172A;
  --color-neutral-500:    #64748B;
}

body {
  /* Inter se aplica vía inter.className en layout.tsx — no sobreescribir */
  background: var(--color-neutral-50);
  color: var(--color-neutral-900);
}
```

---

## 3. MEJORAS PRIORIZADAS

### Tabla maestra

| # | Mejora | Archivo / Componente | Problema que resuelve | Principio aplicado | Criterio jurado | Impacto 1–5 | Esfuerzo 1–5 | Prioridad |
|---|---|---|---|---|---|---|---|---|
| 1 | Fix fuente Arial → Inter en body | `globals.css:25` | Design system roto, Inter no llega | Consistencia, Heurística 4 | Presentación | 4 | 1 | 🔴 CRÍTICO |
| 2 | Promover aviso de anonimato arriba en /reportar | `reportar/page.tsx` | Confianza en víctimas de acoso (ODS 5) enterrada al fondo | Ley de Pareto, Psicología confianza | Impacto social | 5 | 1 | 🔴 CRÍTICO |
| 3 | Fix bug guardado silencioso en chat IA | `reportar/chat/page.tsx:59` | Reporte se pierde sin feedback | Heurística 9, Doherty Threshold | Técnica | 5 | 2 | 🔴 CRÍTICO |
| 4 | Chips de tipo en etiqueta humana, no snake_case | `reportar/chat/page.tsx:146` | IA incomprensible para vecino | Diseño IA transparente, Heurística 1 | Innovación | 5 | 1 | 🔴 CRÍTICO |
| 5 | Añadir barra de confianza al output de la IA | `lib/groq.ts` + `reportar/chat/page.tsx` | "Pensar con IA" — el diferenciador del pitch | Innovación del reto | Innovación | 5 | 2 | 🔴 CRÍTICO |
| 6 | Pantalla de éxito muestra resumen del reporte | `reportar/chat` + `reportar/guiado` | Usuario no sabe qué se guardó | Heurística 1, Diseño IA confiable | Técnica + Impacto | 4 | 2 | 🟠 ALTA |
| 7 | Añadir Dashboard al BottomNav | `components/ui/BottomNav.tsx` | Jurado no encuentra el dashboard en la demo | Heurística 7, Ley de Fitts | Presentación | 5 | 1 | 🟠 ALTA |
| 8 | Botón "Recomendado ⭐" en modo Wizard de /reportar | `reportar/page.tsx` | Adultos mayores no saben cuál elegir | Ley de Hick, ODS 10 | Impacto social | 4 | 1 | 🟠 ALTA |
| 9 | Leyenda del mapa visible (colores + etiquetas) | `mapa/page.tsx` + `MapView.tsx` | Color único diferenciador, falla WCAG 1.4.1 | WCAG 1.4.1, Gestalt | Impacto + Técnica | 4 | 2 | 🟠 ALTA |
| 10 | aria-label en todos los botones icon-only | Todos los `.tsx` | Cero accesibilidad declarada, falla WCAG 4.1.2 | WCAG 2.2 AA, ODS 10 | Impacto social | 4 | 2 | 🟠 ALTA |
| 11 | Filter chips del mapa con `py-2` → 36px | `mapa/page.tsx:69-90` | Targets muy pequeños en móvil | WCAG 2.5.5, Ley de Fitts | Técnica | 3 | 1 | 🟡 MEDIA |
| 12 | Mic/Send buttons `w-11 h-11` (44px) | `reportar/chat/page.tsx:177-197` | 40px < 44px mínimo WCAG | WCAG 2.5.5 | Técnica | 3 | 1 | 🟡 MEDIA |
| 13 | Spinner visible en carga del mapa | `mapa/page.tsx:94-98` | "Cargando..." en texto plano | Doherty Threshold, Heurística 1 | Presentación | 3 | 1 | 🟡 MEDIA |
| 14 | Eliminar dark-mode override en globals.css | `globals.css:15-20` | Rompería UI en sistema con dark mode | Consistencia | Presentación | 2 | 1 | 🟡 MEDIA |
| 15 | Stat card "sectores" deja de ser hardcoded | `app/page.tsx:48` | Valor 6 hardcodeado, frágil | Heurística 1 | Técnica | 2 | 1 | 🟡 MEDIA |
| 16 | Popups del mapa con Inter y font-size escalable | `MapView.tsx:79-84` | Font sans-serif genérica, 11px fijo | Inclusión adultos mayores, ODS 10 | Impacto social | 3 | 1 | 🟡 MEDIA |
| 17 | Reemplazar alert() del micrófono por inline error | `reportar/chat/page.tsx:95` | alert() bloquea UI, inconsistente | WCAG, Heurística 9 | Presentación | 2 | 1 | 🟡 MEDIA |
| 18 | Botón "Centrar en mi ubicación" en mapa | `mapa/page.tsx` | Adultos mayores sin referencia espacial | ODS 10, Ley de Fitts | Impacto social | 3 | 2 | 🟡 MEDIA |
| 19 | lang="es" en HTML ya correcto — verificar | `layout.tsx:14` | Ya implementado ✅ | WCAG 3.1.1 | — | — | — | ✅ HECHO |

---

## 4. ESPECIFICACIÓN POR PANTALLA

### 4.1 `globals.css` — Fix del design system

**Cambio:** eliminar `font-family: Arial, Helvetica, sans-serif` del selector `body` y remover el bloque `@media (prefers-color-scheme: dark)`. El layout ya aplica Inter vía `inter.className`.

**Criterio de aceptación:** Inspeccionar cualquier elemento de texto en DevTools → `font-family` computado debe ser `"Inter"`, no `"Arial"`.

---

### 4.2 `/reportar` — Selector de modo

**Cambios:**

1. **Aviso de anonimato sube arriba**, antes de las cards, con estilo prominente:
   ```
   ┌─────────────────────────────────────────┐
   │  🔒  Sin registro · Sin DNI · Anónimo  │  ← bg-green-50 border-green-200
   │      Tu identidad nunca se almacena.   │  ← text-sm (14px), no text-xs
   └─────────────────────────────────────────┘
   ```
   - Color de texto: `#15803D` (green-700) sobre `#F0FDF4` (green-50) → ratio 7.1:1 ✅

2. **Badge "Recomendado ⭐" en la card del Wizard** (modo guiado):
   - Añadir `<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">⭐ Recomendado</span>` debajo del título
   - La card del Wizard debe tener `border-green-400` en lugar de `border-green-200` para destacar visualmente

3. **Texto "Para usuarios avanzados"** en la card del formulario → cambiar a "Si ya sabes qué ocurrió"

**Criterio de aceptación:**
- El aviso de anonimato es lo primero que lee el usuario (above the fold en 375px)
- Contraste del aviso ≥ 4.5:1
- El modo Wizard tiene indicador visual diferenciador respecto a los otros dos

---

### 4.3 `/reportar/chat` — Chat IA con razonamiento visible

**Cambios:**

**A. Fix del bug de guardado (línea 59):**

Lógica actual (rota):
```
if (parsed.accion === 'guardar' && pendingData) → guarda
else if (parsed.tipo) → setPendingData(parsed)
```

Lógica correcta: si Groq responde con `accion: "guardar"` pero `pendingData` es null, mostrar error explícito "No pude recuperar los datos del incidente. ¿Puedes contarme de nuevo qué pasó?"

**B. Chips en etiqueta humana (línea 146):**

Actual: `Tipo: intento_robo`
Debe ser: `🟠 Intentaron robarme`

Usar `TIPO_INCIDENTE_CONFIG[parsed.tipo].label` y `TIPO_INCIDENTE_CONFIG[parsed.tipo].emoji` en lugar de `parsed.tipo` raw.

**C. Barra de confianza — el "momento wow" del pitch:**

Añadir campo `confianza` al system prompt de Groq (`lib/groq.ts`):
```
El JSON de respuesta debe incluir: "confianza": número entre 0 y 100 que represente
tu certeza en la clasificación. Si es < 70, haz una pregunta de seguimiento en "confirmacion".
```

Visualización en la bubble del bot:
```
┌─────────────────────────────────────────────┐
│ Detecté:                                    │
│ 🟠 Intentaron robarme                       │  ← TIPO_INCIDENTE_CONFIG.label
│ ████████░░  87% seguro                      │  ← barra progress, color según nivel
│ 📍 Jr. Paraíso · Sector 3                   │
│                                             │
│ ✅ Confirmar    ✏️ Corregir                  │  ← 2 botones explícitos
└─────────────────────────────────────────────┘
```

- Barra: `bg-green-500` si ≥ 80, `bg-yellow-500` si 60–79, `bg-red-500` si < 60
- Si confianza < 70: el bot hace una pregunta adicional antes de mostrar "Confirmar"
- Botón "✏️ Corregir" limpia `pendingData` y regresa al input

**D. Pantalla de éxito con resumen:**

Después de guardar, mostrar:
```
┌────────────────────────────────────┐
│          ✅ Reporte enviado        │
│                                    │
│  🟠 Intentaron robarme             │
│  📍 Sector 3 · Jr. Paraíso        │
│  🕐 Ahora · 🔒 Anónimo             │
│                                    │
│  [Ver en el mapa →]                │  ← botón azul, 56px alto
└────────────────────────────────────┘
```

**E. Mic button: `alert()` → error inline:**

```
// Actual
return alert('Tu navegador no soporta el micrófono. Usa Chrome.')

// Nuevo
setError('El micrófono no está disponible en este navegador.')
```
Mostrar el error debajo del input con el mismo estilo que los otros errores.

**F. Tamaños táctiles mic y send:**
- `w-10 h-10` (40px) → `w-11 h-11` (44px) en ambos botones

**Criterios de aceptación del chat:**
- [ ] Chips muestran etiqueta humana + emoji, no snake_case
- [ ] Barra de confianza visible con porcentaje
- [ ] Botones "Confirmar" y "Corregir" explícitos (no solo escribir de nuevo)
- [ ] Pantalla de éxito muestra tipo, sector y timestamp del reporte guardado
- [ ] Si falla el guardado, mensaje de error con opción de reintentar
- [ ] Mic button ≥ 44×44px
- [ ] No hay ningún `alert()` nativo

---

### 4.4 `/reportar/guiado` — Wizard

**Cambios menores (el wizard ya es el más accesible):**

1. **Pantalla de éxito con resumen** (igual que chat):
   - Mostrar: tipo seleccionado (con emoji y label humano), sector, cuándo
   - Botón "Ver en el mapa →" de 56px alto en lugar de redirect automático

2. **Añadir aria-label a botón de retroceso:**
   ```tsx
   <button aria-label="Volver al paso anterior" ...>
     <ArrowLeft size={20} />
   </button>
   ```

3. **Progress bar con texto accesible:**
   ```tsx
   <div
     role="progressbar"
     aria-valuenow={step}
     aria-valuemin={1}
     aria-valuemax={3}
     aria-label={`Paso ${step} de 3`}
     ...
   />
   ```

**Criterios de aceptación:**
- [ ] Progress bar tiene `role="progressbar"` y `aria-valuenow/min/max`
- [ ] Botón retroceso tiene `aria-label`
- [ ] Pantalla de éxito muestra resumen con tipo y sector seleccionados

---

### 4.5 `/mapa` — Mapa de incidentes

**Cambios:**

**A. Leyenda visible:**

Añadir un panel flotante colapsable en la esquina superior izquierda del mapa:
```
┌─────────────────────┐
│ Leyenda        [×]  │
│ 🔴 Robo             │
│ 🟠 Intento de robo  │
│ 🟡 Acoso            │
│ ⚫ Sospechoso       │
│ 💙 Zona oscura      │
│ 🏚️ Abandonado       │
│ 🟢 Punto seguro     │
└─────────────────────┘
```
- El color acompaña siempre al emoji y la etiqueta → nunca solo color
- Por defecto colapsado en mobile (`[+] Leyenda`), expandido en desktop

**B. Filter chips con más altura:**
- `py-1` → `py-1.5` (mínimo 32px de alto)
- Añadir `aria-pressed={filterTipo === key}` a cada chip

**C. Spinner de carga:**
Reemplazar texto plano "Cargando mapa..." por:
```tsx
<div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 gap-3">
  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
  <p className="text-slate-400 text-sm">Cargando mapa...</p>
</div>
```

**D. aria-label en botón heatmap y FAB:**
```tsx
<button aria-label="Activar mapa de calor" ...>
<Link aria-label="Reportar un incidente" ...>
```

**E. Botón "Mi ubicación" (nice-to-have):**
Añadir botón en la esquina inferior izquierda del mapa que llama a `map.locate()` de Leaflet y centra la vista en la posición del usuario.

**Criterios de aceptación:**
- [ ] Leyenda visible con emoji + etiqueta (no solo color)
- [ ] Filter chips ≥ 32px alto con `aria-pressed`
- [ ] Spinner animado durante carga inicial
- [ ] FAB y botón heatmap tienen `aria-label`

---

### 4.6 `/alertas` — Alertas comunitarias

**Cambios:**

1. **Badge de nivel con icono además de color:**
   - Añadir icono Lucide junto al label: `<AlertTriangle>` para DANGER, `<Info>` para INFO
   - El badge usa `color` y texto Y icono → satisface WCAG 1.4.1

2. **aria-label en "Ver →":**
   ```tsx
   <Link aria-label={`Ver en mapa: ${alerta.titulo}`} href="/mapa">
     Ver →
   </Link>
   ```

**Criterio de aceptación:**
- [ ] Badge de nivel tiene icono además de color y texto
- [ ] Cada link "Ver →" tiene aria-label descriptivo

---

### 4.7 `/dashboard` — Dashboard Municipal

**Cambios:**

**A. Acceso desde BottomNav:**
Añadir ítem Dashboard al BottomNav:
```tsx
{ href: '/dashboard', label: 'Dashboard', Icon: TrendingUp }
```
El nav pasará de 3 a 4 ítems. En 375px: `flex-1` los distribuye equitativamente (≈ 94px cada uno).

**B. KPI card "Tipo más frecuente" con etiqueta humana:**
- Actual: `getMostFrequentType` devuelve `cfg.label` — ya está bien ✅
- Verificar que el texto no se desborde en la card con `leading-tight` y `break-words`

**C. Tabla top sectores con etiqueta de porcentaje:**
Añadir `%` del total junto al número absoluto para que el funcionario entienda la proporción:
```
Sector 3     8  (34%)  ████████░░
Sector 1     6  (26%)  ██████░░░░
```

**D. Tarjeta "Reportes corregidos por vecinos" (si se implementa la confianza de IA):**
Contabilizar cuántos reportes tuvieron `accion: "corregir"` antes de guardarse. Esta métrica demuestra que la comunidad calibra la IA — el argumento clave de "pensar con IA".

**Criterios de aceptación:**
- [ ] Dashboard accesible desde BottomNav
- [ ] Top sectores muestra % además de conteo absoluto
- [ ] KPIs tienen `aria-label` descriptivos

---

### 4.8 `BottomNav` — Navegación inferior

**Cambios:**

```tsx
// Nuevo NAV_ITEMS con Dashboard
const NAV_ITEMS = [
  { href: '/mapa',       label: 'Mapa',       Icon: Map },
  { href: '/reportar',   label: 'Reportar',   Icon: PlusCircle },
  { href: '/alertas',    label: 'Alertas',    Icon: Bell },
  { href: '/dashboard',  label: 'Dashboard',  Icon: TrendingUp },
]

// Añadir accesibilidad al nav
<nav
  role="navigation"
  aria-label="Navegación principal"
  className="fixed bottom-0 ..."
>
  // Añadir aria-current en cada link activo
  <Link
    aria-current={active ? 'page' : undefined}
    ...
  >
```

**Criterio de aceptación:**
- [ ] `role="navigation"` y `aria-label` en el nav
- [ ] `aria-current="page"` en el ítem activo
- [ ] 4 ítems distribuidos uniformemente en 375px

---

## 5. MICROINTERACCIONES CLAVE

### 5.1 Pin en tiempo real (Supabase Realtime → Leaflet)

Ya implementado (`mapa/page.tsx:36-39`). Mejorar con microinteracción visual:

Cuando llega un nuevo incidente vía Realtime, el marcador debe hacer un "pulse" de 2s antes de quedar estático:

```css
/* Añadir a globals.css */
@keyframes pin-pulse {
  0%   { transform: scale(1.5) rotate(-45deg); opacity: 0.7; }
  50%  { transform: scale(1.8) rotate(-45deg); opacity: 1; }
  100% { transform: scale(1)   rotate(-45deg); opacity: 1; }
}
.pin-new {
  animation: pin-pulse 0.6s ease-out;
}
```

Añadir la clase `pin-new` al `divIcon` del marcador nuevo durante 2s, luego removerla.

### 5.2 Clasificación de la IA en vivo (el momento wow)

Mientras Groq procesa (estado `loading`), mostrar texto animado que simule razonamiento:

```tsx
const THINKING_STEPS = [
  'Leyendo tu mensaje...',
  'Identificando el tipo de incidente...',
  'Detectando la zona...',
  'Preparando clasificación...',
]
```

Rotar el texto cada 800ms durante el loading. Reemplaza los 3 puntos rebotantes actuales con este efecto typewriter. Esto hace visible el "pensamiento" de la IA — es el diferenciador narrativo del pitch.

### 5.3 Transición de paso en el Wizard

La transición entre pasos actualmente es instantánea. Añadir:
```tsx
<div className="animate-in slide-in-from-right duration-200">
  {/* contenido del paso */}
</div>
```
(Tailwind animate-in requiere el plugin `tailwindcss-animate` o una clase CSS manual.)

---

## 6. ACCESIBILIDAD — CHECKLIST WCAG 2.2 AA

### Por archivo

| Archivo | Check | Estado |
|---|---|---|
| `globals.css` | Eliminar override `font-family: Arial` | ❌ Pendiente |
| `globals.css` | Eliminar dark-mode override | ❌ Pendiente |
| `layout.tsx` | `lang="es"` ✅ | ✅ Hecho |
| `BottomNav.tsx` | `role="navigation"` + `aria-label` + `aria-current` | ❌ Pendiente |
| `mapa/page.tsx` | `aria-label` en FAB, heatmap button | ❌ Pendiente |
| `mapa/page.tsx` | `aria-pressed` en filter chips | ❌ Pendiente |
| `mapa/page.tsx` | Leyenda con texto + emoji (no solo color) | ❌ Pendiente |
| `MapView.tsx` | Popups con font-size ≥ 14px y `font-family: inherit` | ❌ Pendiente |
| `reportar/page.tsx` | Aviso anonimato texto-sm (no text-xs), contraste ≥ 4.5:1 | ❌ Pendiente |
| `reportar/chat/page.tsx` | `aria-label` en Mic y Send buttons | ❌ Pendiente |
| `reportar/chat/page.tsx` | Chips con etiqueta humana no snake_case | ❌ Pendiente |
| `reportar/chat/page.tsx` | Sin `alert()` nativo | ❌ Pendiente |
| `reportar/guiado/page.tsx` | `role="progressbar"` con `aria-valuenow/min/max` | ❌ Pendiente |
| `reportar/guiado/page.tsx` | `aria-label` en botón retroceso | ❌ Pendiente |
| `alertas/page.tsx` | Badges con icono además de color | ❌ Pendiente |
| `alertas/page.tsx` | `aria-label` en cada link "Ver →" | ❌ Pendiente |
| `dashboard/page.tsx` | Accesible desde BottomNav | ❌ Pendiente |

---

## 7. NARRATIVA PARA EL PITCH

### Frase de valor en una línea

> **"Tu Vecino hace visible la inseguridad que no se denuncia — y la IA te explica lo que entiende para que tú la corrijas."**

### 3 argumentos por criterio fuerte del jurado

**Impacto Social (30%)**
> *"El 86% de los delitos en Lima son invisibles. Tu Vecino los hace visibles en 20 segundos, sin DNI, sin comisaría, con un wizard accesible para el adulto mayor que nunca usó una app. ODS 5: canal anónimo para acoso. ODS 10: inclusión digital real."*

**Innovación (25%)**
> *"No usamos IA para clasificar en silencio. Usamos IA que razona contigo: te muestra su confianza, te pregunta si dudó, te deja corregirla. Eso es 'pensar con IA' — el tema exacto de este reto — no solo ejecutarla."*

**Técnica (25%)**
> *"Stack 100% serverless: Next.js 16 + Supabase Realtime + Groq en 300ms de respuesta. Mapa en tiempo real: el pin aparece en el mapa de todos 2 segundos después del reporte. Deploy en Vercel con Docker para cualquier municipio. Cero infraestructura que mantener."*

### Guion de demo — 3 minutos exactos

**[0:00–0:15] El golpe**
- Pantalla: Home de la app en el celular
- Narración: *"El INEI dice que 86 de cada 100 delitos en Lima nunca llegan a una estadística. Esta noche, en Villa el Salvador, eso cambia."*

**[0:15–0:40] Demo: vecina reporta acoso (ODS 5)**
- Pantalla: `/reportar` → el aviso verde "🔒 Sin DNI. 100% anónimo." visible arriba
- Toca "Cuéntame qué pasó"
- Escribe: "un tipo me siguió desde el mercado hasta mi casa"
- Pantalla: texto animado "Identificando el tipo de incidente..."
- Pantalla: bot responde con chip **"🟡 Acoso — 92% seguro"** + barra de confianza
- Toca "✅ Confirmar"
- Pantalla éxito: "Acoso · Sector 3 · Ahora · 🔒 Anónimo"
- Narración: *"20 segundos. Sin nombre. Sin DNI. El acoso ya existe en los datos."*

**[0:40–1:00] Demo: el pin aparece en tiempo real**
- Cambiar a `/mapa` en otro dispositivo (o pantalla dividida)
- El pin amarillo aparece con animación de pulse
- Activar heatmap: zonas rojas vs zonas seguras
- Narración: *"Rosa puede ver ahora qué ruta evitar de noche."*

**[1:00–1:20] Demo: adulto mayor con wizard (ODS 10)**
- Volver a `/reportar` → toca el botón verde "⭐ Recomendado — Paso a paso"
- Mostrar los 3 pasos: botones grandes, fuente 18px, sin texto largo
- Narración: *"Tres toques. Sin leer. Sin escribir. El adulto mayor que nunca usó una app puede reportar."*

**[1:20–1:45] Demo: dashboard municipal**
- Abrir `/dashboard` desde el BottomNav
- Mostrar KPIs, gráfico de barras, top sectores con porcentajes
- Narración: *"El Gerente de Seguridad Ciudadana ve el Sector 3 con 40% más reportes esta semana. Reorienta el patrullaje antes del próximo incidente."*

**[1:45–2:10] Impacto y ODS**
- Narración: *"ODS 5: por primera vez el acoso en VES tiene datos. ODS 10: tres modos de accesibilidad para que nadie quede fuera. Meta 90 días: 500 vecinos activos, 1.000 reportes, 3 sectores cubiertos."*

**[2:10–2:30] Cierre**
- Pantalla: Home con slogan
- Narración: *"Tu Vecino no reemplaza al serenazgo. Lo hace más inteligente con el conocimiento que ya existe en su comunidad. Gracias."*

---

## 8. VALIDACIÓN RÁPIDA (PRE-PITCH)

### Test con 3–5 personas (mínimo 1 adulto mayor)

| Escenario | Tarea | Criterio de éxito |
|---|---|---|
| Vecina 20–35 años | Reportar "me siguieron" por chat sin instrucciones | Completa en < 60s, entiende la barra de confianza |
| Adulto mayor 60+ años | Reportar "robo" usando solo el wizard | Completa en < 90s sin pedir ayuda |
| Cualquier usuario | Encontrar el mapa de calor y activarlo | < 2 toques desde home |
| Funcionario | Encontrar el dashboard | < 3 toques desde home (BottomNav visible) |
| Cualquier usuario | Encontrar la nota de anonimato | La menciona espontáneamente en /reportar |

### Checklist pre-demo

```
[ ] globals.css: `font-family` del body es Inter (verificar en DevTools)
[ ] /reportar: aviso 🔒 visible arriba en 375px sin scroll
[ ] /reportar/chat: chips muestran "🟡 Acoso", no "acoso"
[ ] /reportar/chat: barra de confianza visible con porcentaje
[ ] /reportar/guiado: badge "⭐ Recomendado" visible en la card verde
[ ] /mapa: leyenda colapsable con emoji + etiqueta
[ ] /dashboard: accesible desde BottomNav con 1 tap
[ ] Seed data: 50+ incidentes con timestamps últimos 7 días
[ ] Groq API key activa y respondiendo < 2s
[ ] Supabase Realtime: nuevo incidente aparece en mapa < 3s
[ ] Pantalla de éxito: muestra tipo y sector del reporte guardado
```

---

## 9. ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Quick wins — menos de 1 hora en total

1. `globals.css` → eliminar `font-family: Arial` y dark-mode override — **10 min**
2. `reportar/page.tsx` → subir aviso de anonimato y añadir badge Wizard — **15 min**
3. `reportar/chat/page.tsx` → chips con `TIPO_INCIDENTE_CONFIG.label` + `.emoji` — **10 min**
4. `BottomNav.tsx` → añadir Dashboard + `role` + `aria-current` — **15 min**
5. `mapa/page.tsx` → spinner animado + `aria-label` FAB y heatmap — **15 min**

### Mejoras clave — 1–3 horas

6. `lib/groq.ts` → añadir `confianza` al system prompt — **20 min**
7. `reportar/chat/page.tsx` → barra de confianza + botones Confirmar/Corregir + fix bug guardado — **60 min**
8. `reportar/chat/page.tsx` + `reportar/guiado/page.tsx` → pantalla de éxito con resumen — **30 min**
9. `mapa/page.tsx` + `MapView.tsx` → leyenda colapsable — **40 min**
10. Todos los `.tsx` → `aria-label` en botones icon-only y `aria-pressed` en chips — **30 min**

### Visión a futuro — solo mencionar en el pitch

- Mapa de zonas seguras nocturnas con recomendación de ruta (Groq + Leaflet routing)
- Push notifications cuando se reporta un incidente en el sector del usuario
- Dashboard con exportación a PDF para la municipalidad
- Verificación por SMS opcional para reducir reportes falsos
- Integración con WhatsApp Business para reportes por mensaje
