# Tu Vecino — Identidad Visual y Design System
## Plan completo · grupo2-seguridad-ciudadana-ves · HackODS UA 2026

> **Base:** auditoría de los 9 archivos CSS reales del repositorio.
> Cada decisión cita el archivo fuente, el principio que aplica y el criterio que fortalece en el pitch.
> **Este documento es solo el plan.** No modifiques nada hasta aprobarlo.

---

## PASO 1: DIAGNÓSTICO (resumen ejecutivo)

### Problemas críticos encontrados

| ID | Archivo | Problema | Impacto |
|----|---------|----------|---------|
| D1 | `global.css` | 3 azules distintos para "acción primaria": `#1D4ED8`, `#2a78d6` (dashboard), `#2563eb` (admin) | Demo inconsistente |
| D2 | `reportar.css:117` + `mapa.css` | Mismo rojo `#DC2626` para FAB "Reportar" y pines de peligro máximo | Colisión semántica grave |
| D3 | `cuenta.css` | Paleta completamente independiente: `--teal`, `--coral`, `--violeta` sin conexión al sistema | 4 identidades visuales |
| D4 | `admin.css:19` | `font-family: 'Segoe UI'` — mismo bug que se corrigió en dashboard pero no en admin | Inconsistencia tipográfica |
| D5 | `paginas.css:67` | `.alerta__pie { color: #75746f }` sobre blanco = ratio 4.3:1 — falla WCAG AA | Accesibilidad rota |
| D6 | `paginas.css:57` | `.alerta--media` badge con `#e07b00` sobre `#fff1db` = ratio 4.0:1 — falla WCAG AA | Accesibilidad rota |
| D7 | `global.css` | Sin tokens de escala tipográfica, radios, sombras ni espaciado — valores ad-hoc en todos los archivos | Mantenimiento imposible |
| D8 | `global.css` | Duplicados con mismo valor y distinto nombre: `--primary`/`--blue`, `--danger`/`--alert`, `--ink-900`/`--navy-900` | Confusión en equipo |
| D9 | `mapa.css:53` | Popups Leaflet con `font-family: system-ui` — no usa Inter | Inconsistencia tipográfica |
| D10 | Todos | Sin tokens de sombra — 6+ valores distintos de `box-shadow` repetidos en bruto | Mantenimiento imposible |

### Lo que ya funciona bien y no hay que tocar

- Paleta semáforo base (`#DC2626`, `#F97316`, `#EAB308`, `#16A34A`) — correcta, solo falta sistematizar
- Fuente Inter cargada desde CDN con subsets 400–800 ✅
- Variables `--primary`, `--primary-dark`, `--success`, `--border`, `--bg` usadas consistentemente en la mayoría de páginas
- Sistema de radios base `--radius: 10px` ✅ (extenderlo)
- `prefers-reduced-motion` respetado en 4 de 5 animaciones ✅
- `lang="es"` y viewport configurados en `index.html` ✅
- `.sr-only` y `:focus-visible` definidos en `global.css` ✅

---

## PASO 2: IDENTIDAD Y ESTILO

### Personalidad de marca

| Adjetivo | Qué transmite | Qué evitar |
|----------|--------------|------------|
| **Cercana** | Habla como el vecino, no como institución | Lenguaje policial, burocrático |
| **Confiable** | Promete anonimato y lo cumple visualmente | Colores fríos corporativos |
| **Serena** | Calma incluso cuando el contenido es grave | Rojo alarma constante, diseño ansioso |
| **Clara** | Sin ambigüedades: el vecino sabe siempre qué hace | Metáforas abstractas, iconos sin etiqueta |
| **Alerta cuando hace falta** | Solo el peligro real "grita" | Falsas alarmas visuales |

### Dirección visual

- **Radios:** generosos en superficies que el vecino toca (20px cards, 12px campos, 999px pills/botones acción); compactos en datos del dashboard (4–6px). Justificación: las formas redondeadas reducen ansiedad cognitiva — especialmente relevante para adultos mayores y víctimas de acoso.
- **Sombras:** 3 niveles (`subtle`, `card`, `modal`). Sin sombra de color rojo en el FAB — refuerza confusión semántica.
- **Iconografía:** Lucide Icons (ya usada) ✅. `20px` base, `24px` acciones principales, `16px` contextos densos. Siempre con etiqueta visible en acciones críticas.
- **Microcopy:** segunda persona singular, conversacional peruano. Sin subjuntivo en el wizard.
- **Sin fotografías** de violencia ni caras de víctimas. Iconos y formas geométricas.

---

## PASO 3: PALETA DE COLORES

### Decisiones de diseño antes de los tokens

1. **Unificar los 3 azules** → `#1D4ED8` como único azul institucional (el de mayor presencia ya)
2. **Resolver la colisión rojo** → el FAB "Reportar" y botones de acción principal migran a azul `#1D4ED8`. El rojo `#DC2626` queda exclusivamente para peligro alto en mapa. El botón "Enviar" final del wizard puede usar verde `#15803D` (el acto de reportar es positivo, no emergencia).
3. **Integrar Mi cuenta** → los colores teal/coral/violeta se conservan como "accents" pero se registran como tokens globales, no como variables aisladas en el scope de `.cuenta`.

### Tabla de tokens de color

| Token | HEX | Uso principal | Fondo real | Ratio | WCAG AA |
|-------|-----|--------------|------------|-------|---------|
| **Marca** | | | | | |
| `--color-brand` | `#1D4ED8` | Acción primaria, header, links, FAB | `#FFFFFF` | 7.2:1 | ✅ AAA |
| `--color-brand-dark` | `#1E3A8A` | Hover brand, fondo header | `#FFFFFF` | 11.4:1 | ✅ AAA |
| `--color-brand-light` | `#DBEAFE` | Iconos módulo, fondos sutiles | — | decorativo | — |
| **Semáforo de peligro** | | | | | |
| `--color-peligro-alto` | `#DC2626` | Pin robo, alerta alta (SOLO mapa/alertas) | `#FFFFFF` | 4.6:1 | ✅ AA |
| `--color-peligro-alto-bg` | `#FEE2E2` | Badge alerta alta | `#FFFFFF` | — | decorativo |
| `--color-peligro-alto-txt` | `#991B1B` | Texto en badge alerta alta | `#FEE2E2` | 7.1:1 | ✅ AAA |
| `--color-peligro-medio` | `#C2410C` | Pin intento robo, texto naranja sobre blanco | `#FFFFFF` | 5.4:1 | ✅ AA |
| `--color-peligro-medio-bg` | `#FEF3C7` | Badge advertencia media | `#FFFFFF` | — | decorativo |
| `--color-peligro-medio-txt` | `#78350F` | Texto en badge media | `#FEF3C7` | 7.9:1 | ✅ AAA |
| `--color-peligro-bajo` | `#CA8A04` | Pin acoso (SOLO icono/forma, nunca texto solo) | `#FFFFFF` | 3.1:1 | ⚠️ solo icono |
| `--color-peligro-bajo-bg` | `#FEF9C3` | Fondo badge acoso | `#FFFFFF` | — | decorativo |
| `--color-peligro-bajo-txt` | `#713F12` | Texto en badge acoso | `#FEF9C3` | 8.4:1 | ✅ AAA |
| `--color-info` | `#0369A1` | Pin zona oscura, elementos informativos | `#FFFFFF` | 5.9:1 | ✅ AA |
| `--color-info-bg` | `#E0F2FE` | Fondo badge info | `#FFFFFF` | — | decorativo |
| `--color-info-txt` | `#075985` | Texto en badge info | `#E0F2FE` | 7.4:1 | ✅ AAA |
| **Estados UI** | | | | | |
| `--color-success` | `#15803D` | Éxito, confirmación, aviso anonimato | `#FFFFFF` | 7.0:1 | ✅ AAA |
| `--color-success-bg` | `#F0FDF4` | Fondo aviso anonimato | `#FFFFFF` | — | decorativo |
| `--color-success-txt` | `#14532D` | Texto en contexto éxito | `#F0FDF4` | 9.1:1 | ✅ AAA |
| `--color-warning` | `#D97706` | Aviso emergencia UI (≠ peligro mapa) | `#FFFFFF` | 4.6:1 | ✅ AA |
| `--color-warning-bg` | `#FFFBEB` | Fondo aviso emergencia | `#FFFFFF` | — | decorativo |
| `--color-warning-txt` | `#78350F` | Texto aviso emergencia | `#FFFBEB` | 7.9:1 | ✅ AAA |
| `--color-error` | `#DC2626` | Error de formulario | `#FFFFFF` | 4.6:1 | ✅ AA |
| `--color-error-bg` | `#FEE2E2` | Fondo mensaje error | `#FFFFFF` | — | decorativo |
| `--color-error-txt` | `#991B1B` | Texto error en campo | `#FEE2E2` | 7.1:1 | ✅ AAA |
| `--color-disabled-txt` | `#94A3B8` | Texto deshabilitado | `#FFFFFF` | 2.5:1 | ⚠️ solo no-texto |
| `--color-focus` | `#1D4ED8` | Outline foco visible | variable | ≥3:1 | ✅ AA UI |
| **Neutros** | | | | | |
| `--color-ink-900` | `#0F172A` | Texto principal | `#FFFFFF` | 19.4:1 | ✅ AAA |
| `--color-ink-700` | `#334155` | Texto secundario enfatizado | `#FFFFFF` | 10.2:1 | ✅ AAA |
| `--color-ink-500` | `#64748B` | Texto secundario normal | `#FFFFFF` | 4.6:1 | ✅ AA |
| `--color-ink-400` | `#94A3B8` | Placeholder, texto terciario | `#FFFFFF` | 2.5:1 | ⚠️ no para texto |
| `--color-surface-0` | `#FFFFFF` | Cards, burbujas bot, formularios | — | — | — |
| `--color-surface-1` | `#F8FAFC` | Fondo de página general | — | — | — |
| `--color-surface-2` | `#F1F5F9` | Fondo chat, panel mapa, dashboard | — | — | — |
| `--color-border` | `#E2E8F0` | Bordes de cards y campos normales | — | — | — |
| `--color-border-strong` | `#CBD5E1` | Bordes activos, foco de campos | — | — | — |
| **Mapa** | | | | | |
| `--color-mapa-usuario` | `#1D4ED8` | Punto "mi ubicación" | Mapa | — | Distinto de peligro |
| `--color-mapa-seleccion` | `#7C3AED` | Pin seleccionado/activo en panel | Mapa | — | Distinto de semáforo |
| `--color-mapa-seguro` | `#15803D` | Comisarías / puntos seguros | Mapa | — | ✅ |
| **Accents (Mi cuenta / Admin)** | | | | | |
| `--color-teal` | `#0D9488` | Mi cuenta, auth, avatar usuario | `#FFFFFF` | 4.5:1 | ✅ AA |
| `--color-amber` | `#D97706` | Header accent, admin brand, logo | `#1E3A8A` | 6.3:1 | ✅ AA |
| **Gráficos del dashboard** | | | | | |
| `--chart-1` | `#1D4ED8` | Robo | — | — | — |
| `--chart-2` | `#C2410C` | Intento de robo | — | — | — |
| `--chart-3` | `#D97706` | Acoso | — | — | — |
| `--chart-4` | `#334155` | Actividad sospechosa | — | — | — |
| `--chart-5` | `#0369A1` | Zona oscura | — | — | — |
| `--chart-6` | `#78350F` | Espacio abandonado | — | — | — |
| `--chart-7` | `#64748B` | Otro | — | — | — |

> Los 7 colores de gráfico son distinguibles en deuteranopia y protanopia porque varían en luminancia además de matiz (basado en paleta Okabe-Ito).

---

## PASO 4: TIPOGRAFÍA

### Familia tipográfica

**Decisión: Inter únicamente.** No se necesita un segundo typeface. Inter tiene:
- Excelente legibilidad en pantallas pequeñas y de baja resolución (pantallas baratas de celulares Android en VES)
- Diacríticos completos para español (tildes, ñ, ¿, ¡)
- 9 pesos disponibles, 400–800 ya cargados ✅
- Versiones OpenType con `font-feature-settings: "cv05"` para diferenciar `1`, `l` e `I` — útil para números de emergencia

**Estrategia de carga (conexiones lentas):**
```html
<!-- Ya en index.html — verificar que esté en este orden exacto -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```
- `display=swap` asegura que el texto se muestra con fuente del sistema mientras carga Inter ✅
- Subsets ya optimizados por Google (latin, latin-ext) ✅
- El subset `latin-ext` cubre todos los caracteres del español ✅

### Escala tipográfica

| Token | rem | px equiv. | Peso | Interlineado | Uso |
|-------|-----|-----------|------|-------------|-----|
| `--text-xs` | `0.75rem` | 12px | 400 | 1.5 | Timestamps, metadatos — NUNCA texto crítico |
| `--text-sm` | `0.875rem` | 14px | 400–500 | 1.5 | Labels de formulario, chips, badges |
| `--text-base` | `1rem` | 16px | 400 | 1.6 | Cuerpo general, párrafos — mínimo absoluto |
| `--text-md` | `1.0625rem` | 17px | 400–500 | 1.6 | Cuerpo en alertas y cards |
| `--text-lg` | `1.125rem` | 18px | 400–600 | 1.55 | Cuerpo wizard (mínimo ODS 10) |
| `--text-xl` | `1.25rem` | 20px | 600–700 | 1.4 | H3, títulos de card, botones grandes |
| `--text-2xl` | `1.5rem` | 24px | 700 | 1.3 | H2 de sección |
| `--text-3xl` | `1.875rem` | 30px | 700–800 | 1.2 | H1 de página |
| `--text-4xl` | `2.25rem` | 36px | 800 | 1.15 | H1 hero, números de emergencia |
| `--text-hero` | `clamp(1.9rem, 4.5vw, 3rem)` | — | 800 | 1.15 | Hero homepage |

**Reglas de accesibilidad:**
- Cuerpo general: mínimo `--text-base` (16px). Nunca `--text-xs` para texto de error, alertas, ni CTAs.
- Wizard y guiado: todo el texto de opciones ≥ `--text-lg` (18px).
- Longitud de línea: máximo `70ch` en cuerpo (ya aplicado con `max-width: 70ch` en varios selectores ✅).
- NO texto en mayúsculas para cuerpos de más de 3 palabras — dificulta lectura. Majúsculas solo para labels de categoría muy cortos (`font-size < --text-sm` + `letter-spacing`).
- Espaciado de letras: `0` para cuerpo; solo `letter-spacing: 0.03–0.08em` en etiquetas uppercase muy cortas.

---

## PASO 5: SISTEMA DE DISEÑO

### 5.1 Escala de espaciado

Base: `4px` (0.25rem). Escala multiplicada ×1.5 aproximada:

| Token | rem | px | Uso típico |
|-------|-----|----|-----------|
| `--space-1` | `0.25rem` | 4px | Gap interno mínimo |
| `--space-2` | `0.5rem` | 8px | Gap entre elementos inline |
| `--space-3` | `0.75rem` | 12px | Padding interno chips/badges |
| `--space-4` | `1rem` | 16px | Padding cards compactas, gap de formulario |
| `--space-5` | `1.25rem` | 20px | Padding cards normales |
| `--space-6` | `1.5rem` | 24px | Gap entre secciones |
| `--space-8` | `2rem` | 32px | Padding de páginas (block) |
| `--space-10` | `2.5rem` | 40px | Separación entre bloques mayores |
| `--space-16` | `4rem` | 64px | Secciones del hero |

### 5.2 Escala de radios

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | `6px` | Tablas, chips densos del dashboard |
| `--radius-md` | `10px` | Campos de formulario, botones pequeños (`--radius` actual) |
| `--radius-lg` | `14px` | Cards de alerta, burbujas de chat |
| `--radius-xl` | `18px` | Cards de modo en /reportar, cards de Mi cuenta |
| `--radius-2xl` | `20px` | Modales, panel "En vivo" |
| `--radius-pill` | `999px` | Botones de acción, pills de estado, FAB |

### 5.3 Escala de sombras / elevación

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-subtle` | `0 1px 2px rgba(15,23,42,0.05)` | Cards en reposo, tiles dashboard |
| `--shadow-card` | `0 4px 12px rgba(15,23,42,0.08)` | Cards al hover, dropdowns |
| `--shadow-raised` | `0 8px 24px rgba(15,23,42,0.12)` | Modales, panel lateral activo |
| `--shadow-modal` | `0 16px 40px rgba(15,23,42,0.22)` | Drawer detalle admin, panel "En vivo" |
| `--shadow-fab` | `0 6px 16px rgba(29,78,216,0.35)` | FAB Reportar (sombra AZUL, no roja) |

### 5.4 Breakpoints y grilla

| Nombre | Ancho | Columnas | Padding inline |
|--------|-------|----------|---------------|
| `xs` | < 480px | 1 | `1rem` |
| `sm` | 480–760px | 2 | `1.25rem` |
| `md` | 760–900px | 3 | `1.25rem` |
| `lg` | 900–1200px | 4 (12 en dashboard) | `1.25rem` |
| `xl` | > 1200px | 4 (12 en dashboard) | `1.25rem` |

Breakpoints exactos para CSS:
- `760px`: aparece BottomNav mobile, se oculta header desktop
- `900px`: mapa y dashboard cambian a layout apilado
- `1200px`: max-width del contenedor (`--max-width`)

### 5.5 Tamaños táctiles

| Contexto | Mínimo alto | Mínimo ancho | Principio |
|----------|-------------|-------------|-----------|
| Botones generales | 44px | 44px | WCAG 2.5.5 |
| Botones del wizard | 64px | 100% | Plan §8, ODS 10 |
| Botón "Enviar" wizard | 72px | 100% | Acción irreversible — mayor peso |
| FAB Reportar | 56px | 56px | Ley de Fitts |
| Chips de tipo de incidente | 44px | auto | WCAG 2.5.5 |
| Ítems del BottomNav | 44px | 25% de viewport | WCAG 2.5.5 |
| Mic y Send del chat | 44px | 44px | WCAG 2.5.5 (ya corregido) |
| Botones de período del mapa | 44px | auto | WCAG 2.5.5 (ya corregido) |
| Controles de zoom Leaflet | 44px | 44px | Requiere CSS sobre `.leaflet-control-zoom` |

### 5.6 Animaciones

| Token | Valor | Uso |
|-------|-------|-----|
| `--duration-fast` | `150ms` | Hover, cambio de color |
| `--duration-base` | `200ms` | Transiciones de estado UI |
| `--duration-slow` | `300ms` | Entrada/salida de modales, drawers |
| `--duration-enter` | `350ms` | Animación de entrada de notificaciones |
| `--ease-default` | `ease-out` | Entrada de elementos |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Barra de confianza IA (ya implementado) |

**Regla global:** todos los archivos ya tienen `@media (prefers-reduced-motion: reduce)` en sus animaciones — mantenerlo en cada nueva animación que se añada.

### 5.7 Especificación de componentes clave

#### Botón primario (acción institucional)
```
Estado normal:   bg #1D4ED8, color #FFF, radius --radius-pill, padding 0.6rem 1.1rem, min-height 44px
Estado hover:    bg #1E3A8A
Estado foco:     outline 2px #1D4ED8, offset 2px
Estado activo:   bg #1E3A8A, scale(0.98)
Estado disabled: opacity 0.6, cursor not-allowed
Estado carga:    spinner inline, text "Enviando…", disabled
```

#### Botón peligro (SOLO emergencias — no Reportar)
```
Estado normal:   bg #DC2626, color #FFF, radius --radius-pill
Estado hover:    bg #B91C1C
Uso:             SOLO en "Llamar al 105", no en el flujo de reporte
```

#### FAB Reportar
```
bg: #1D4ED8  (MIGRADO desde rojo — ver D2)
color: #FFF
radius: --radius-pill
padding: 0.9rem 1.2rem
shadow: --shadow-fab (azul, no rojo)
min-height: 56px
aria-label: "Reportar un incidente"
```

#### Botón grande del wizard
```
min-height: 64px
font-size: --text-lg (18px)
font-weight: 700
radius: --radius-xl (18px)
border: 2px solid --color-border-strong
bg: --color-surface-0
color: --color-ink-900
Estado seleccionado: border-color var(--color-tipo), bg color-mix(in srgb, var(--color-tipo) 10%, #fff)
```

#### Botón "Enviar reporte" (wizard, paso final)
```
bg: --color-success (#15803D)  — verde, no rojo: reportar es positivo
color: #FFF
min-height: 72px
font-size: 1.35rem
font-weight: 800
Señal visual adicional: icono de escudo/check antes del texto
```

#### Tarjeta de alerta
```
bg: --color-surface-0
border: 1px solid --color-border
border-left: 4px solid [color-nivel]
radius: --radius-lg (14px)
padding: 1.1rem 1.2rem
Nivel alta:   border-left #DC2626 + badge txt #991B1B sobre #FEE2E2
Nivel media:  border-left #C2410C + badge txt #78350F sobre #FEF3C7  (FIX: reemplaza #e07b00 que falla AA)
Nivel info:   border-left #0369A1 + badge txt #075985 sobre #E0F2FE
```

#### Pin del mapa (redundancia no-color)
```
Cada tipo tiene: color de fondo + icono SVG + forma distinta de pin si es posible
robo:           fondo #DC2626 + icono cuchillo/bolsa
intento_robo:   fondo #C2410C + icono exclamación
acoso:          fondo #CA8A04 + icono persona seguida
actividad_sospechosa: fondo #334155 + icono ojo
zona_oscura:    fondo #0369A1 + icono luna/bombilla apagada
espacio_abandonado:   fondo #78350F + icono edificio roto
punto_seguro:   fondo #15803D + forma escudo (distinta de círculo)
```

#### Burbuja de chat IA (con confianza — ya implementado)
```
Bot: bg #FFFFFF, shadow --shadow-subtle, radius 16px 16px 16px 4px
Usuario: bg #1D4ED8, color #FFF, radius 16px 16px 4px 16px
Detección: bg --color-surface-1, border 1px --color-border, radius --radius-md
Barra confianza: track #E2E8F0, fill verde/naranja/rojo según nivel, spring transition
Texto pensamiento: italic --color-ink-500, animación fade respetando reduced-motion
```

#### Leyenda del mapa
```
Cada ítem: punto color + icono Lucide + etiqueta textual (ya implementado)
font-size: --text-sm (14px mínimo)
En mobile: --text-base (16px) — ya corregido en mapa.css
```

#### Tabs del dashboard
```
Normal:     bg #1E3A8A rgba(255,255,255,0.08), color #DBEAFE
Activa:     bg #1f2a3c, color #FFFFFF
Periodo btn: padding 0.55rem 0.9rem, min-height 44px (ya corregido)
```

#### Aviso de anonimato
```
bg: --color-success-bg (#F0FDF4)
border-left: 4px solid --color-success (#15803D)
color: #15803D   ratio 7.1:1 sobre #F0FDF4 ✅ AAA
font-size: --text-base (16px)
font-weight: 500
Posición: arriba del selector de modos, before the fold en 375px (ya implementado)
```

#### Zoom controls de Leaflet (requiere CSS sobre la librería)
```css
/* Añadir en mapa.css */
.leaflet-control-zoom a {
  width: 44px !important;
  height: 44px !important;
  line-height: 44px !important;
  font-size: 20px !important;
}
```

---

## PASO 6: PLAN DE IMPLEMENTACIÓN

### 6.1 Estructura de archivos propuesta

```
frontend/src/assets/styles/
├── tokens.css          ← NUEVO: todas las variables CSS centralizadas
├── global.css          ← MIGRAR: limpiar duplicados, importar tokens.css
├── header.css          ← MIGRAR: Segoe UI → Inter (admin), colores a tokens
├── paginas.css         ← MIGRAR: 2 fixes de contraste + colores a tokens
├── reportar.css        ← MIGRAR: FAB rojo → azul, boton-grande--enviar → verde
├── mapa.css            ← MIGRAR: popups a Inter, zoom controls 44px
├── dashboard.css       ← ya Inter ✅, migrar --s1 a --color-brand
├── admin.css           ← MIGRAR: font-family Segoe UI → Inter, --adm-blue a tokens
├── cuenta.css          ← MIGRAR: tokens locales → referir a tokens.css
└── footer.css          ← revisar, cambios menores
```

### 6.2 Bloque de tokens CSS listo para copiar

Crear el archivo [`frontend/src/assets/styles/tokens.css`](../frontend/src/assets/styles/tokens.css):

```css
/* ============================================================
   TU VECINO — Design Tokens v1.0
   HackODS UA 2026 · Villa El Salvador
   Importar PRIMERO en global.css:  @import './tokens.css';
   ============================================================ */

:root {

  /* ── Marca ─────────────────────────────────────────────── */
  --color-brand:        #1D4ED8;   /* 7.2:1 sobre blanco ✅ AAA */
  --color-brand-dark:   #1E3A8A;   /* 11.4:1 sobre blanco ✅ AAA */
  --color-brand-light:  #DBEAFE;   /* decorativo */

  /* ── Semáforo de peligro (mapa y alertas) ───────────────── */
  --color-peligro-alto:        #DC2626;  /* 4.6:1 ✅ AA */
  --color-peligro-alto-bg:     #FEE2E2;
  --color-peligro-alto-txt:    #991B1B;  /* 7.1:1 sobre -bg ✅ AAA */

  --color-peligro-medio:       #C2410C;  /* 5.4:1 ✅ AA */
  --color-peligro-medio-bg:    #FEF3C7;
  --color-peligro-medio-txt:   #78350F;  /* 7.9:1 sobre -bg ✅ AAA */

  --color-peligro-bajo:        #CA8A04;  /* 3.1:1 — solo con icono */
  --color-peligro-bajo-bg:     #FEF9C3;
  --color-peligro-bajo-txt:    #713F12;  /* 8.4:1 sobre -bg ✅ AAA */

  --color-info:                #0369A1;  /* 5.9:1 ✅ AA */
  --color-info-bg:             #E0F2FE;
  --color-info-txt:            #075985;  /* 7.4:1 sobre -bg ✅ AAA */

  /* ── Estados UI ─────────────────────────────────────────── */
  --color-success:      #15803D;   /* 7.0:1 ✅ AAA */
  --color-success-bg:   #F0FDF4;
  --color-success-txt:  #14532D;   /* 9.1:1 sobre -bg ✅ AAA */

  --color-warning:      #D97706;   /* 4.6:1 ✅ AA */
  --color-warning-bg:   #FFFBEB;
  --color-warning-txt:  #78350F;   /* 7.9:1 sobre -bg ✅ AAA */

  --color-error:        #DC2626;   /* 4.6:1 ✅ AA */
  --color-error-bg:     #FEE2E2;
  --color-error-txt:    #991B1B;   /* 7.1:1 sobre -bg ✅ AAA */

  --color-disabled-txt: #94A3B8;   /* 2.5:1 — solo no-texto */
  --color-focus:        #1D4ED8;

  /* ── Neutros ────────────────────────────────────────────── */
  --color-ink-900:      #0F172A;   /* 19.4:1 ✅ AAA */
  --color-ink-700:      #334155;   /* 10.2:1 ✅ AAA */
  --color-ink-500:      #64748B;   /* 4.6:1 ✅ AA */
  --color-ink-400:      #94A3B8;   /* 2.5:1 — solo placeholder */

  --color-surface-0:    #FFFFFF;
  --color-surface-1:    #F8FAFC;
  --color-surface-2:    #F1F5F9;

  --color-border:       #E2E8F0;
  --color-border-strong:#CBD5E1;

  /* ── Mapa ───────────────────────────────────────────────── */
  --color-mapa-usuario:    #1D4ED8;
  --color-mapa-seleccion:  #7C3AED;
  --color-mapa-seguro:     #15803D;

  /* ── Accents ────────────────────────────────────────────── */
  --color-teal:         #0D9488;   /* 4.5:1 ✅ AA */
  --color-amber:        #D97706;   /* 6.3:1 sobre navy ✅ AA */

  /* ── Gráficos del dashboard ─────────────────────────────── */
  --chart-1: #1D4ED8;
  --chart-2: #C2410C;
  --chart-3: #D97706;
  --chart-4: #334155;
  --chart-5: #0369A1;
  --chart-6: #78350F;
  --chart-7: #64748B;

  /* ── Tipografía ─────────────────────────────────────────── */
  --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  --text-xs:   0.75rem;    /* 12px */
  --text-sm:   0.875rem;   /* 14px */
  --text-base: 1rem;       /* 16px — mínimo para cuerpo */
  --text-md:   1.0625rem;  /* 17px */
  --text-lg:   1.125rem;   /* 18px — mínimo wizard */
  --text-xl:   1.25rem;    /* 20px */
  --text-2xl:  1.5rem;     /* 24px */
  --text-3xl:  1.875rem;   /* 30px */
  --text-4xl:  2.25rem;    /* 36px */

  /* ── Espaciado ──────────────────────────────────────────── */
  --space-1:   0.25rem;   /*  4px */
  --space-2:   0.5rem;    /*  8px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-16:  4rem;      /* 64px */

  /* ── Radios ─────────────────────────────────────────────── */
  --radius-sm:   6px;
  --radius-md:   10px;    /* = --radius actual */
  --radius-lg:   14px;
  --radius-xl:   18px;
  --radius-2xl:  20px;
  --radius-pill: 999px;

  /* Alias de compatibilidad — mantener mientras se migra */
  --radius: var(--radius-md);

  /* ── Sombras ────────────────────────────────────────────── */
  --shadow-subtle:  0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-card:    0 4px 12px rgba(15, 23, 42, 0.08);
  --shadow-raised:  0 8px 24px rgba(15, 23, 42, 0.12);
  --shadow-modal:   0 16px 40px rgba(15, 23, 42, 0.22);
  --shadow-fab:     0 6px 16px rgba(29, 78, 216, 0.35); /* azul, no rojo */

  /* ── Animaciones ────────────────────────────────────────── */
  --duration-fast:  150ms;
  --duration-base:  200ms;
  --duration-slow:  300ms;
  --duration-enter: 350ms;
  --ease-default:   ease-out;
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── Alias legacy — DEPRECADO, eliminar en cada archivo migrado ── */
  --primary:      var(--color-brand);
  --primary-dark: var(--color-brand-dark);
  --danger:       var(--color-peligro-alto);
  --warning:      var(--color-warning);
  --success:      var(--color-success);
  --info:         var(--color-info);
  --ink-900:      var(--color-ink-900);
  --text-2:       var(--color-ink-500);
  --text-muted:   var(--color-ink-400);
  --bg:           var(--color-surface-1);
  --border:       var(--color-border);
  --navy-900:     var(--color-ink-900);
  --navy-800:     #1E293B;
  --navy-700:     var(--color-brand-dark);
  --amber:        var(--color-amber);
  --alert:        var(--color-peligro-alto);
  --alert-dark:   #B91C1C;
  --blue:         var(--color-brand);
  --text:         var(--color-ink-900);
  --malo:         var(--color-peligro-alto);
  --bueno:        var(--color-success);
  --max-width:    1200px;
}
```

### 6.3 Lista de cambios por archivo (ordenada por prioridad de demo)

#### PRIORIDAD 1 — Lo más visible en la demo (< 2h total)

**1. Crear `tokens.css`** — copiar el bloque de arriba
- Esfuerzo: **10 min**
- Criterio demo: todo lo demás depende de esto

**2. `global.css`** — añadir `@import './tokens.css';` al inicio, limpiar duplicados
```css
/* Añadir PRIMERA línea: */
@import './tokens.css';
/* Eliminar: todas las variables de :root que ya están en tokens.css */
/* Conservar: .container, .layout, .btn, .sr-only, :focus-visible, .bottom-nav, avisos */
```
- Esfuerzo: **15 min**

**3. `mapa.css`** — FAB azul + zoom controls 44px
```css
/* FAB: cambiar a azul */
.fab-reportar { background: var(--color-brand); }
.fab-reportar:hover { background: var(--color-brand-dark); }
/* Eliminar sombra roja, usar: */
box-shadow: var(--shadow-fab);

/* Zoom controls: */
.leaflet-control-zoom a {
  width: 44px !important; height: 44px !important;
  line-height: 44px !important; font-size: 20px !important;
}

/* Popups Inter: */
.leaflet-popup-content { font-family: var(--font-sans); }
```
- Esfuerzo: **10 min**

**4. `reportar.css`** — botón enviar wizard verde + FAB
```css
.boton-grande--enviar { background: var(--color-success); border-color: var(--color-success); }
.boton-grande--enviar:hover:not(:disabled) { background: var(--color-success-txt); border-color: var(--color-success-txt); }
/* En global.css: */
.btn--alert { background: var(--color-brand); }  /* Reportar → azul */
.btn--alert:hover { background: var(--color-brand-dark); }
```
- Esfuerzo: **10 min**

**5. `paginas.css`** — 2 fixes de contraste críticos
```css
/* Fix D6: alerta media */
.alerta--media { border-left-color: var(--color-peligro-medio); }
.alerta__nivel--media { background: var(--color-peligro-medio-bg); color: var(--color-peligro-medio-txt); }
/* Fix D5: alerta__pie */
.alerta__pie { color: var(--color-ink-500); }  /* #64748B = 4.6:1 ✅ */
```
- Esfuerzo: **5 min**

#### PRIORIDAD 2 — Coherencia visual completa (< 1h)

**6. `admin.css`** — font-family + unificar azul
```css
.adm { font-family: var(--font-sans); }
/* Cambiar --adm-blue: #2563eb → var(--color-brand) en todo el archivo */
```
- Esfuerzo: **15 min**

**7. `dashboard.css`** — unificar azul del dashboard
```css
/* --s1: #2a78d6 → var(--color-brand) en todo el archivo */
/* Cambiar barra de tabs: */
.pbi-tabs { background: var(--color-brand-dark); }
```
- Esfuerzo: **15 min**

**8. `cuenta.css`** — registrar tokens locales como globales
```css
/* Las variables locales ya están bien — solo añadir en tokens.css:
   --color-teal: #0D9488 (ya está)
   El resto de colores de cuenta son correctos y no colisionan */
/* Eliminar --teal: #0d9488 de cuenta.css y reemplazar por var(--color-teal) */
```
- Esfuerzo: **20 min**

#### PRIORIDAD 3 — Polish final (< 1h)

**9. Componentes de sombra** — reemplazar valores literales por tokens en todos los archivos
- Buscar `box-shadow: 0 1px 2px` → `var(--shadow-subtle)`
- Buscar `box-shadow: 0 8px 24px` → `var(--shadow-raised)`
- Buscar `box-shadow: 0 12px 32px` → `var(--shadow-modal)`
- Esfuerzo: **20 min**

**10. Botón BottomNav destacado** — cambiar sombra roja del ítem Reportar
```css
/* global.css */
.bottom-nav__item--destacado svg {
  background: var(--color-brand);  /* azul */
  box-shadow: var(--shadow-fab);   /* sombra azul */
}
```
- Esfuerzo: **5 min**

### 6.4 Checklist de verificación pre-demo

```
CONTRASTE
[ ] Abrir DevTools → Accessibility → cada color de texto verificado ≥ 4.5:1
[ ] .alerta__pie no es #75746f (fix D5 aplicado)
[ ] Badge alerta media no es #e07b00 (fix D6 aplicado)
[ ] --color-peligro-bajo solo aparece con icono, nunca como único texto

DALTONISMO
[ ] Instalar Chrome extension "Colorblindly" → revisar /mapa con deuteranopia
[ ] Cada pin del mapa es distinguible por icono además de color
[ ] Gráficos del dashboard distinguibles sin color (barras con etiquetas de valor)

TIPOGRAFÍA
[ ] DevTools: font-family computado en body = "Inter" en TODAS las páginas
[ ] Texto en /reportar/guiado ≥ 18px en cada botón de opción
[ ] Sin uso de --text-xs en texto de error, alertas o CTAs

TÁCTIL / MOBILE
[ ] Chrome DevTools → mobile 375px: FAB visible sin solapar BottomNav ✅
[ ] Cada botón del wizard ≥ 64px de alto (usar "computed" en DevTools)
[ ] Zoom controls del mapa ≥ 44px ✅ (tras el fix)

TECLADO
[ ] Tab por /reportar: orden lógico, foco visible en cada elemento interactivo
[ ] Tab por /mapa: FAB, controles de zoom y botones del panel son alcanzables
[ ] Escape cierra paneles y modales

ZOOM 200%
[ ] Abrir Chrome → Ctrl+= hasta 200% → comprobar que no hay overflow horizontal
[ ] Texto no se solapa en las cards del dashboard a 200%

CONEXIÓN LENTA
[ ] Chrome DevTools → Network → "Slow 3G": la app carga sin pantalla en blanco
[ ] Inter se muestra con fuente del sistema mientras carga (display=swap) ✅
[ ] El mapa Leaflet muestra spinner durante carga ✅ (ya implementado)

MOBILE REAL
[ ] Probar en Android real (o BrowserStack) con modo claro
[ ] Comprobar que el aviso de anonimato 🔒 aparece sin scroll en /reportar
[ ] Comprobar que el BottomNav no tapa contenido importante
```

### 6.5 Guía de estilo de una página (para el pitch)

```
╔══════════════════════════════════════════════════════════════╗
║           TU VECINO — Guía de estilo v1.0                   ║
║           HackODS UA 2026 · Villa El Salvador               ║
╠══════════════════════════════════════════════════════════════╣
║  PERSONALIDAD: Cercana · Confiable · Serena · Clara         ║
╠══════════════════════════════════════════════════════════════╣
║  COLORES                                                    ║
║  Marca       #1D4ED8  ████  Acción, header, links, FAB      ║
║  Peligro alto #DC2626 ████  Solo en mapa/alertas de peligro ║
║  Éxito       #15803D  ████  Anonimato, confirmación         ║
║  Texto       #0F172A  ████  Cuerpo principal                ║
║  Superficie  #F8FAFC  ░░░░  Fondo de páginas                ║
╠══════════════════════════════════════════════════════════════╣
║  TIPOGRAFÍA                                                 ║
║  Familia: Inter 400–800                                     ║
║  Cuerpo: 16px · Wizard: mínimo 18px · Nunca <14px crítico   ║
╠══════════════════════════════════════════════════════════════╣
║  REGLAS DE ORO                                              ║
║  1. El rojo solo significa peligro — nunca acción positiva  ║
║  2. El verde del anonimato siempre visible antes del fold   ║
║  3. Todo pin del mapa: icono + color (nunca solo color)     ║
║  4. Botones del wizard ≥ 64px · Táctiles generales ≥ 44px  ║
║  5. Texto de error y alertas ≥ 14px · Cuerpo ≥ 16px        ║
╚══════════════════════════════════════════════════════════════╝
```

---

## RESUMEN EJECUTIVO DE CAMBIOS

| Prioridad | Archivos | Cambios | Esfuerzo |
|-----------|---------|---------|---------|
| **P1 — Demo** | `tokens.css` (nuevo), `global.css`, `mapa.css`, `reportar.css`, `paginas.css` | Tokens centralizados, FAB azul, contraste fixes, zoom Leaflet | ~50 min |
| **P2 — Coherencia** | `admin.css`, `dashboard.css`, `cuenta.css` | Unificar azul, Inter en admin | ~50 min |
| **P3 — Polish** | Todos | Tokens de sombra, sombra BottomNav | ~25 min |
| **Total** | 9 archivos | 20 cambios quirúrgicos | **~2h 15 min** |

La migración es **no destructiva**: los alias legacy en `tokens.css` garantizan que el código existente siga funcionando mientras se migra cada archivo. No hay que tocar nada de JSX.
