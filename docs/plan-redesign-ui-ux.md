# Tu Vecino — Plan de Rediseño UI/UX
## grupo2-seguridad-ciudadana-ves · HackODS UA 2026

> **Base:** análisis del código real de cada pantalla.
> Cada problema tiene un principio que lo explica. Cada solución tiene un criterio de aceptación concreto.
> No toques código hasta aprobar el plan.

---

## DIAGNÓSTICO: POR QUÉ SE SIENTE DESORDENADO

Hay 4 causas raíz que explican casi todos los problemas:

| Causa | Dónde se ve | Principio violado |
|-------|------------|-------------------|
| **Jerarquía visual plana** | Home, Alertas: todo tiene el mismo peso visual | Ley de Pareto — lo importante debe destacar |
| **Fragmentación de identidad** | 4 paletas distintas entre páginas | Heurística 4 de Nielsen — consistencia |
| **Demasiada información junta sin estructura** | Panel del mapa (8 controles), AlertaCard | Ley de Miller — 7±2 chunks cognitivos |
| **Sin feedback de contexto** | Usuario no sabe dónde está ni qué acaba de pasar | Heurística 1 de Nielsen — visibilidad del estado |

---

## PANTALLA 1: HOME (`/`)

### Qué hay hoy

```
[HERO azul] → título + 2 botones
[4 STATS] → números en grid 4 columnas (texto muy pequeño, sin contexto)
[3 ALERTAS] → cards idénticas sin prioridad visual
[4 MÓDULOS] → cards idénticas sin prioridad visual
[2 ODS] → cards con color de borde
```

### Problemas identificados

**P1.1 — Los 4 stats no comunican urgencia**
- `resumen__label` a 0.82rem con texto largo: "de 43 distritos de Lima en denuncias oficiales (SIDPOL)" → ilegible en mobile
- Número y etiqueta tienen igual peso visual. El ojo no sabe cuál es el dato importante
- El número de "zonas críticas" está en rojo pero no hay icono ni verbo de acción asociado
- **Principio violado:** Gestalt de figura-fondo, Ley de Pareto

**P1.2 — Los 4 módulos son todos iguales**
- 4 cards `.modulo` con la misma altura, borde y peso visual
- El módulo más importante para el pitch ("Reportar") no destaca sobre "Panel municipal"
- En mobile colapsa a 1 columna en orden aleatorio
- **Principio violado:** Heurística 7 (eficiencia), Ley de Hick (menos opciones equivalentes → menos fricción)

**P1.3 — Las alertas recientes sin estado visual de urgencia**
- 3 alertas idénticas visualmente (mismo borde izquierdo de color similar, misma tipografía)
- No hay distinción entre "reporte hace 5 min" y "tendencia de 3 meses"
- **Principio violado:** Gestalt de similitud (si todo se ve igual, nada es urgente)

**P1.4 — Los ODS están al fondo, enterrados**
- El jurado evalúa impacto social con 30% del peso — los ODS deben ser visibles en la demo
- Aparecen como el último elemento de la página, después de los módulos
- **Principio violado:** Ley de Pareto

### Rediseño propuesto — Home

```
╔════════════════════════════════════════════════╗
║  HERO (azul)                                   ║
║  Headline + párrafo                            ║
║  [🔒 Sin DNI · Anónimo]  ← aviso verde        ║
║  [Reportar ahora]  [Ver el mapa]               ║
╠════════════════════════════════════════════════╣
║  STATS — 2 grandes + 2 pequeños               ║
║  ┌─────────────────┐  ┌──────────────────┐    ║
║  │ 🔴 N ZONAS      │  │ N reportes       │    ║
║  │    CRÍTICAS     │  │   esta semana    │    ║
║  │ [Ver mapa →]    │  │                  │    ║
║  └─────────────────┘  └──────────────────┘    ║
║  ┌────────────┐  ┌────────────────────────┐   ║
║  │ N% via IA  │  │  #N de Lima (SIDPOL)  │   ║
║  └────────────┘  └────────────────────────┘   ║
╠════════════════════════════════════════════════╣
║  ODS — CON PÍLDORAS VISUALES (cerca del hero) ║
║  ┌─────────────────────────────────────────┐  ║
║  │ 🟣 ODS 5 · ODS 10                       │  ║
║  │ breve frase de impacto                  │  ║
║  └─────────────────────────────────────────┘  ║
╠════════════════════════════════════════════════╣
║  ALERTA MÁS RECIENTE (1 card destacada)       ║
║  ┌────────────────────────────────────────┐   ║
║  │ 🔴 PELIGRO · hace 12 min              │   ║
║  │  Título de la alerta                   │   ║
║  │  [Ver en mapa →]                       │   ║
║  └────────────────────────────────────────┘   ║
║  Ver todas las alertas →                      ║
╠════════════════════════════════════════════════╣
║  MÓDULOS — 1 destacado + 3 secundarios        ║
║  ┌─────────────────────────────────────────┐  ║
║  │  🟢 REPORTAR AHORA (card grande, verde) │  ║
║  │  "En menos de 60 segundos. Sin DNI."   │  ║
║  └─────────────────────────────────────────┘  ║
║  [🗺 Mapa]  [📊 Dashboard]  [📋 Alertas]     ║
╚════════════════════════════════════════════════╝
```

**Cambios concretos:**
1. Los ODS suben al bloque justo debajo del hero (antes de los stats)
2. Stat "zonas críticas" ocupa el doble de espacio visual con CTA "Ver mapa →" integrado
3. Solo mostrar la alerta más reciente de nivel alta/media (no 3 iguales)
4. Módulo "Reportar" se convierte en un card `full-width` con color de marca, los otros 3 en `grid 3 columnas`
5. Texto de stats reescrito: etiquetas cortas, número grande, unidad pequeña

---

## PANTALLA 2: ALERTAS (`/alertas`)

### Qué hay hoy

```
[Título + párrafo descriptivo largo]
[4 filtros en segmented]
[N AlertaCards idénticas en grid]
[Sección "¿Cómo se generan?" con lista]
```

### Problemas identificados

**P2.1 — AlertaCard mezcla 4 tipos de contenido sin jerarquía**
- Una "alerta" puede ser: reporte vecinal, zona de riesgo, tendencia oficial o estacional
- Visualmente todos son iguales (mismo card, mismo borde)
- El usuario no sabe si es "algo que pasó ahora" o "un análisis de 3 meses"
- **Principio violado:** Ley de Jakob (los usuarios esperan patrones familiares — las alertas de noticias tienen jerarquía temporal clara)

**P2.2 — 4 filtros de igual tamaño, sin indicador de cuántos resultados hay**
- "Análisis (zonas y tendencias)" es un filtro con un nombre demasiado largo para mobile
- No hay counter de resultados por filtro (`Todas (12)`, `Peligro alto (3)`)
- **Principio violado:** Doherty Threshold — sin feedback inmediato sobre cuánto hay

**P2.3 — La sección "¿Cómo se generan?" está al fondo pero es necesaria para entender los filtros**
- El usuario necesita entender qué es una "alerta estacional" antes de filtrar por ella
- Esa información está al final de la página
- **Principio violado:** Heurística 10 (ayuda y documentación deben estar al momento de necesitarla)

**P2.4 — Estado de carga sin feedback visual**
- `{cargando && !data ? <p>Cargando alertas…</p> : null}` — texto plano sin spinner
- **Principio violado:** Heurística 1 (visibilidad del estado del sistema)

### Rediseño propuesto — Alertas

```
╔════════════════════════════════════════════════╗
║  Alertas comunitarias                          ║
║  "Incidentes, zonas de riesgo y tendencias"   ║
╠════════════════════════════════════════════════╣
║  FILTROS con counters                          ║
║  [Todas (12)] [Mi zona (4)] [Peligro (3)] [+] ║
╠════════════════════════════════════════════════╣
║  SECCIÓN: Incidentes recientes                 ║
║  ┌────────────────────────────────────────┐   ║
║  │ 🔴 PELIGRO · Reporte vecinal · 5 min  │   ║
║  │  Título bold                           │   ║
║  │  Mensaje breve                         │   ║
║  │  [Ver en mapa →]           500 m       │   ║
║  └────────────────────────────────────────┘   ║
║  (más cards del mismo tipo, agrupadas)        ║
╠════════════════════════════════════════════════╣
║  SECCIÓN: Zonas de riesgo                      ║
║  (cards con borde naranja, si las hay)         ║
╠════════════════════════════════════════════════╣
║  SECCIÓN: Análisis y tendencias               ║
║  (cards con borde azul info)                  ║
╠════════════════════════════════════════════════╣
║  [ℹ️] ¿Cómo se generan estas alertas? [+/-]  ║ ← colapsable
╚════════════════════════════════════════════════╝
```

**Cambios concretos:**
1. Agrupar las alertas por tipo con encabezado de sección propio (no mezclarlas en un grid)
2. Añadir counter de resultados en cada filtro
3. Renombrar filtros: "Zonas y análisis" en lugar de "Análisis (zonas y tendencias)"
4. Mover "¿Cómo se generan?" a un acordeón colapsable justo debajo de los filtros
5. Reemplazar `<p>Cargando alertas…</p>` por skeleton cards animados (3 cards grises)

---

## PANTALLA 3: MAPA (`/mapa`)

### Qué hay hoy

```
[Panel sidebar 320px] → 8 controles mezclados sin jerarquía
[Mapa Leaflet] → múltiples capas, panel "En vivo" flotante, FAB
```

### Problemas identificados

**P3.1 — El panel lateral tiene 8 controles sin agrupar visualmente**
El usuario ve: título, descripción, periodo (3 botones), tipo (dropdown), 4 checkboxes de capas, leyenda (8 ítems), resumen con lista de zonas, aviso demo, fuentes.

Eso es 8 grupos de contenido sin separación visual clara entre ellos.
- **Principio violado:** Gestalt de agrupamiento, Ley de Miller (7±2 chunks)

**P3.2 — La leyenda tiene 8 ítems apilados sin jerarquía entre tipos peligrosos e informativos**
- Robo (rojo) y Zona oscura (azul) se muestran con la misma prominencia visual
- No hay separación entre "tipos de peligro" y "tipos informativos"
- **Principio violado:** Gestalt de similitud y jerarquía visual

**P3.3 — Los botones de período ("7d", "30d", "90d") no tienen etiqueta semántica**
- El usuario promedio no sabe si "7d" es el período de los datos mostrados o de los nuevos reportes
- No hay tooltip ni texto de ayuda
- **Principio violado:** Heurística 2 (coincidencia entre sistema y mundo real)

**P3.4 — En mobile el panel complejo queda ARRIBA del mapa**
- En `< 900px`: `grid-template-rows: auto 70vh` — el panel con sus 8 controles se apila sobre el mapa
- El usuario debe hacer scroll en el panel para llegar al mapa
- **Principio violado:** Mobile-first — la acción principal (ver el mapa) debe estar primero

**P3.5 — La lista de zonas críticas no comunica acción**
```
"3 reportes · Robo"  → ¿y qué hago con eso?
```
No hay etiqueta de nivel (peligro/atención), no hay dirección
- **Principio violado:** Heurística 1 (visibilidad del estado) + Heurística 5 (prevención de errores)

### Rediseño propuesto — Mapa

```
DESKTOP:
╔═══════════════════╦═══════════════════════════════╗
║ PANEL (280px)     ║  MAPA                          ║
║                   ║  [Calor] ← botón sobre mapa    ║
║ ── FILTROS ──     ║  [Panel En Vivo] ← colapsado   ║
║ Período  [7d][30d]║                                ║
║ Tipo  [dropdown]  ║           Mapa                 ║
║                   ║                                ║
║ ── CAPAS ──       ║                                ║
║ ☑ Incidentes      ║                                ║
║ ☑ Puntos seguros  ║                                ║
║ ☐ Zonas riesgo    ║                                ║
║                   ║                                ║
║ ── ALERTAS ──     ║      [FAB Reportar]             ║
║ 🔴 Zona 3 · Robo  ║                                ║
║ 🟠 Zona 1 · Acoso ║                                ║
║                   ║                                ║
║ ── LEYENDA ──     ║                                ║
║ [colapsa por def] ║                                ║
╚═══════════════════╩═══════════════════════════════╝

MOBILE: (bottom sheet pattern)
╔════════════════════════════════╗
║           MAPA (100%)          ║
║                                ║
║  [FAB Reportar]                ║
╠════════════════════════════════╣
║ [▲ Filtros y leyenda]          ║ ← bottom sheet
╚════════════════════════════════╝
```

**Cambios concretos:**
1. Dividir el panel en 3 secciones con separadores visuales: `Filtros` / `Capas` / `Alertas críticas` (leyenda colapsada por defecto)
2. Cambiar etiquetas de periodo: "7d → Última semana", "30d → Último mes", "90d → 3 meses"
3. En mobile: convertir el panel en un **bottom sheet** deslizable que no tape el mapa por defecto
4. Lista de zonas críticas: añadir badge de nivel (`🔴 Peligro` / `🟠 Atención`) y verbo de acción ("Ver zona")
5. Separar la leyenda en 2 grupos: "Incidentes (peligro)" y "Otros"

---

## PANTALLA 4: REPORTAR — selector (`/reportar`)

### Qué hay hoy

```
[Aviso anonimato 🔒] ← ya implementado ✅
[Aviso emergencia ⚠️]
[3 cards de modo: mismo tamaño, misma jerarquía]
```

### Problemas identificados

**P4.1 — Las 3 cards de modo tienen la misma jerarquía aunque no son equivalentes**
- "Cuéntame qué pasó" (chat IA) ya tiene badge "Recomendado" ✅
- "Paso a paso" tiene badge "Más fácil" ✅
- "Formulario completo" dice "Para usuarios avanzados" — esto puede excluir cognitivamente a adultos mayores que sí pueden usarlo
- Pero los 3 modos tienen exactamente la misma altura y peso visual → Ley de Hick: 3 opciones equivalentes generan más fricción que 1 recomendada + 2 alternativas
- **Principio violado:** Ley de Hick, Heurística 7 (eficiencia)

**P4.2 — El aviso de emergencia y el aviso de anonimato compiten en la misma posición**
- El usuario ve 2 avisos antes de llegar a las opciones → sobrecarga cognitiva
- El aviso de emergencia es raro (usuario ya llamó al 105) pero ocupa tanto espacio como el aviso de anonimato que es crítico para todos
- **Principio violado:** Ley de Pareto

### Rediseño propuesto — Selector de modo

```
╔════════════════════════════════════════════════╗
║  ¿Cómo quieres reportar?                       ║
║  [🔒 Sin DNI · Sin registro · 100% anónimo]   ║ ← verde, prominente ✅ (ya implementado)
╠════════════════════════════════════════════════╣
║  ┌──────────────────────────────────────────┐  ║
║  │  💬  Cuéntame qué pasó    [Recomendado] │  ║ ← GRANDE (1.5x alto)
║  │  "Escribe o dicta. La IA te ayuda."     │  ║ ← borde azul
║  └──────────────────────────────────────────┘  ║
║                                                ║
║  ┌──────────────┐  ┌──────────────────────┐   ║
║  │ 🟢 Paso a   │  │  📋 Formulario       │   ║
║  │    paso     │  │      completo        │   ║
║  │ [Más fácil] │  │                      │   ║
║  └──────────────┘  └──────────────────────┘   ║
║                                                ║
║  ⚠️ ¿Emergencia en curso? → 105  [minimizado] ║ ← inline, no card
╚════════════════════════════════════════════════╝
```

**Cambios concretos:**
1. Card "Cuéntame qué pasó" ocupa el ancho completo y es 1.5x más alta que las otras dos
2. Las otras 2 cards van en grid 2 columnas debajo
3. El aviso de emergencia se reduce a una línea de texto inline (no card) al final — sigue siendo accesible pero no compite visualmente
4. Cambiar "Para usuarios avanzados" → "Llena tú los campos" en la card de formulario

---

## PANTALLA 5: WIZARD GUIADO (`/reportar/guiado`)

### Qué hay hoy

```
[← Cambiar forma de reportar]
[Paso N de 4: nombre del paso]
[Barra de progreso]
[H1 pregunta]
[Botones de opciones / Selector de ubicación]
[Botones de navegación Atrás / Siguiente]
```

### Problemas identificados

**P5.1 — El paso 1 tiene 7 opciones de tipo de incidente en botones grandes**
- 7 opciones = excede el límite de Miller (7±2 pero en móvil se siente mucho)
- Visualmente: todos los botones tienen el mismo peso, sin grupos
- El color de cada tipo está solo en el icono SVG (muy pequeño) — el botón completo no cambia de color
- **Principio violado:** Ley de Miller, Gestalt de similitud

**P5.2 — El paso 2 (ubicación) mezcla dos acciones distintas sin separación clara**
- "Toca el botón azul para usar tu ubicación, o toca el lugar en el mapa" → dos instrucciones en una línea
- El usuario adulto mayor debe elegir entre 2 interacciones muy distintas (GPS vs tap en mapa) sin orientación visual de cuál es más fácil
- **Principio violado:** Ley de Hick, Principio de un solo camino preferente

**P5.3 — El paso 4 (confirmación) muestra "Lugar marcado en el mapa ✓" como único feedback de ubicación**
- No muestra coordenadas ni nombre de zona ni mapa pequeño
- El adulto mayor no sabe si su ubicación fue registrada correctamente
- **Principio violado:** Heurística 1 (visibilidad del estado del sistema)

### Rediseño propuesto — Wizard

**Paso 1 — ¿Qué pasó? (dividir en 2 grupos visuales)**
```
╔════════════════════════════════════════╗
║  🔴 ES PELIGROSO                       ║ ← encabezado de grupo, fondo muy sutil
║  [🔴 Me robaron algo]                  ║ ← botón completo con fondo rojo suave al hover
║  [🟠 Intentaron robarme]               ║
║  [🟡 Me acosaron]                      ║
║                                        ║
║  📌 LO VI O LO NOTÉ                   ║ ← segundo grupo
║  [⬛ Vi algo sospechoso]               ║
║  [💡 Hay una zona muy oscura]          ║
║  [🏚 Hay un espacio abandonado]        ║
║  [📌 Otra cosa]                        ║
╚════════════════════════════════════════╝
```

**Paso 2 — ¿Dónde fue? (un camino preferente)**
```
╔════════════════════════════════════════╗
║  ¿Dónde fue?                           ║
║                                        ║
║  [📍 Usar mi ubicación actual]         ║ ← botón GRANDE, verde, primero
║  "Es lo más rápido y preciso"         ║ ← subtexto de ayuda
║                                        ║
║  ─── o si no funciona ───              ║ ← separador claro
║                                        ║
║  Toca el lugar en el mapa              ║
║  [mapa pequeño para tocar]             ║
╚════════════════════════════════════════╝
```

**Paso 4 — Confirmación con miniatura de mapa**
```
╔════════════════════════════════════════╗
║  ¿Está todo bien?                      ║
║                                        ║
║  Qué pasó: 🔴 Me robaron algo          ║
║  Cuándo:   Ahora mismo                 ║
║  Dónde:    [miniatura del mapa 120px]  ║ ← mapa pequeño con pin
║                                        ║
║  [✅ Enviar reporte]                   ║ ← verde, 72px, ancho completo
║  [← Corregir algo]                    ║
╚════════════════════════════════════════╝
```

---

## PANTALLA 6: CHAT IA (`/reportar/chat`)

### Qué hay hoy

```
[← Cambiar forma de reportar]
[H1 + párrafo]
[Ventana de chat con burbujas]
[Burbuja de detección con tabla tipo/zona/confianza]
[Botones Sí correcto / Corregir]
[Selector de ubicación]
[Input + mic + enviar]
[Botones de ejemplos]
```

### Problemas identificados

**P6.1 — La burbuja de detección usa una tabla `<ul><li><span>Tipo</span>…</li>` que es densa y fría**
- Muestra: `Tipo | Robo`, `Zona | Jr. Paraíso`, `89% seguro`
- Se parece más a un formulario que a una confirmación conversacional
- Rompe el tono cercano del chat
- **Principio violado:** Consistencia de tono (Gestalt de continuidad en la conversación)

**P6.2 — Los botones "Sí, correcto" / "Corregir" aparecen flotando sin contexto visual de a qué se refieren**
- Están en `.chat__acciones` debajo de la última burbuja, con `padding-left: 2.6rem`
- En mobile, si la ventana tiene scroll, el usuario puede no verlos sin desplazarse
- **Principio violado:** Heurística 3 (control y libertad del usuario — las opciones deben ser siempre visibles)

**P6.3 — El selector de ubicación (fase "ubicacion") aparece como elemento del chat, en el flujo de burbujas**
- El mapa selector dentro de la ventana de chat hace que el flujo sea visualmente inconsistente
- El chat es 2D (texto), el mapa es un elemento 3D/espacial — colisión cognitiva
- **Principio violado:** Gestalt de continuidad, coherencia de medio

**P6.4 — Los ejemplos de frases están debajo del input, en texto pequeño**
- En mobile desaparecen del viewport cuando el teclado está abierto
- **Principio violado:** Heurística 7 (eficiencia de uso)

### Rediseño propuesto — Chat IA

**Burbuja de detección (más conversacional):**
```
╔══════════════════════════════════════════╗
║ 🏘️                                      ║
║  "¡Entendí! Esto es lo que detecté:"   ║ ← texto conversacional
║  ┌──────────────────────────────────┐  ║
║  │ 🟠 Intentaron robarme           │  ║ ← chip grande con color de fondo
║  │ 📍 Jr. Paraíso                  │  ║ ← ubicación como chip
║  │ ████████░░  89% seguro          │  ║ ← barra de confianza
║  └──────────────────────────────────┘  ║
║  ¿Es correcto?                         ║
╚══════════════════════════════════════════╝
[✅ Sí, así fue]  [✏️ Quiero corregir]  ← fijos en la parte inferior
```

**Selector de ubicación (fuera del chat, como paso separado):**
```
En lugar de incrustar el mapa en el chat:
→ Cuando llega la fase "ubicacion", mostrar una transición suave hacia
  una vista de "Paso 2: ¿Dónde fue?" — igual que el wizard, fuera del chat
→ El chat queda visible en scroll-up, pero el mapa ocupa toda la pantalla
```

**Ejemplos de frases (antes del input, siempre visibles):**
```
Mueve los chips de ejemplo ENCIMA del input (no debajo)
Chips horizontales desplazables con scroll: 
["Me siguieron…"] ["Hay un poste apagado…"] ["Intentaron robarme…"]
```

---

## PANTALLA 7: ALERTACARD — componente

### Problemas identificados

**P7.1 — 4 tipos de alerta con la misma presentación visual**
- Reporte vecinal, Zona de riesgo, Tendencia oficial, Estacional → todos igual
- El usuario no puede distinguir "esto pasó ahora" de "esto es un análisis estadístico"
- **Principio violado:** Ley de Jakob — las noticias urgentes tienen diseño distinto a los análisis

**P7.2 — `.alerta__meta` lista 4 datos en la misma línea de texto**
- `▲ Peligro · Reporte vecinal · hace 5 min · [DEMO]` → sobrecarga visual
- **Principio violado:** Gestalt de agrupamiento — datos relacionados van juntos, datos secundarios van después

**P7.3 — El link "Ver en el mapa →" en `.alerta__pie` tiene ratio de contraste insuficiente**
- `color: var(--blue)` = `#1D4ED8` sobre `#ffffff` = 7.2:1 ✅ — OK
- Pero en `.alerta__pie { color: #75746f }` el texto de fuente tiene ratio 4.3:1 ❌

### Rediseño propuesto — AlertaCard

```
ANTES:
┌─────────────────────────────────────────────┐
│ ▲ Peligro · Reporte vecinal · hace 5 min    │ ← todo junto
│ [icono] Título de la alerta                 │
│ Mensaje de la alerta...                     │
│ Fuente · a 500m de ti        Ver en mapa →  │
└─────────────────────────────────────────────┘

DESPUÉS:
┌─────────────────────────────────────────────┐
│ [🔴 PELIGRO]  [Reporte vecinal]             │ ← 2 badges separados
│                                hace 5 min  │ ← timestamp alineado a la derecha
│ [🔴 icono] Título de la alerta              │ ← título más prominente
│ Mensaje breve...                            │
│ ─────────────────────────────────────────── │ ← separador sutil
│ 📍 500m de ti           [Ver en el mapa →]  │ ← footer limpio
└─────────────────────────────────────────────┘
```

---

## TABLA DE PRIORIDADES

| # | Pantalla | Cambio | Principio | Impacto demo | Esfuerzo |
|---|---------|--------|-----------|-------------|---------|
| 1 | AlertaCard | Separar badges + timestamp derecha + footer limpio | Gestalt | Alto | 1h |
| 2 | Home | ODS junto al hero + stat zonas críticas grande con CTA | Pareto | Alto | 1h |
| 3 | Home | Card "Reportar" ancho completo, otros 3 en grid | Hick | Alto | 30min |
| 4 | /reportar | Card chat grande, otros 2 en grid | Hick | Alto | 30min |
| 5 | /reportar | Aviso emergencia → texto inline al fondo | Pareto | Medio | 15min |
| 6 | Chat IA | Burbuja de detección conversacional (chips en lugar de tabla) | Gestalt | Alto | 2h |
| 7 | Chat IA | Chips de ejemplo ENCIMA del input | Nielsen 7 | Medio | 30min |
| 8 | Mapa | Panel 3 secciones con separadores | Miller | Medio | 1h |
| 9 | Mapa | Renombrar períodos (7d → "Última semana") | Nielsen 2 | Medio | 15min |
| 10 | Mapa | Bottom sheet en mobile | Mobile-first | Medio | 2h |
| 11 | Alertas | Agrupar por tipo con encabezados de sección | Jakob | Alto | 1h |
| 12 | Alertas | Counter en filtros + skeleton de carga | Doherty | Medio | 1h |
| 13 | Wizard | Paso 1: dividir 7 opciones en 2 grupos | Miller | Medio | 30min |
| 14 | Wizard | Paso 2: GPS primero, mapa como alternativa | Hick | Medio | 30min |
| 15 | Wizard | Paso 4: miniatura de mapa en resumen | Nielsen 1 | Medio | 1h |

**Quick wins (< 2h total, máximo impacto):** items 1, 2, 3, 4, 5, 9

---

## CRITERIOS DE ACEPTACIÓN GLOBALES

```
JERARQUÍA VISUAL
[ ] En cada pantalla, hay UN elemento que domina visualmente sobre los demás
[ ] El CTA más importante es visualmente más grande o más prominente que los demás
[ ] El aviso 🔒 anónimo es visible sin scroll en /reportar

INFORMACIÓN
[ ] AlertaCard: el tipo de alerta (reporte/zona/tendencia) es distinguible de un vistazo
[ ] Mapa: el panel lateral tiene 3 secciones claramente separadas
[ ] Chat: la burbuja de detección usa tono conversacional, no tabla

FEEDBACK
[ ] Todo estado de carga tiene spinner o skeleton, no texto plano
[ ] El wizard siempre muestra en qué paso está y cuántos quedan
[ ] Después de enviar un reporte, se muestra un resumen de lo guardado

MOBILE
[ ] Home: el módulo "Reportar" es el primero y más grande en 375px
[ ] Mapa: en 375px el mapa es visible sin scroll
[ ] Chat: los chips de ejemplo son visibles con el teclado abierto
```

---

## GUÍA RÁPIDA DE ESTILO DE ESCRITURA (microcopy)

| Contexto | ❌ Ahora | ✅ Propuesto |
|---------|---------|------------|
| Botón reportar | "Reportar un incidente" | "Reportar ahora" |
| Formulario avanzado | "Para usuarios avanzados" | "Llena tú los campos" |
| Período mapa | "7d" | "Última semana" |
| Carga alertas | "Cargando alertas…" | spinner + "Buscando lo más reciente…" |
| Stat zonas críticas | "zonas críticas detectadas" | "zonas de alto riesgo ahora" |
| Wizard paso 2 | "Toca el botón azul para usar tu ubicación, o toca el lugar en el mapa" | "📍 Usar mi ubicación" (botón) + "o toca el mapa" (texto pequeño) |
| Confirmación wizard | "Lugar marcado en el mapa ✓" | miniatura del mapa |
| Burbuja detección | "Tipo: Intento de robo" | "🟠 Intentaron robarme" (chip con color) |

---

## ARQUITECTURA DE INFORMACIÓN Y NAVEGACIÓN

### Problema actual: 2 sistemas de navegación desconectados

La app tiene un **header** (desktop) y un **BottomNav** (mobile) con rutas distintas y en distinto orden:

| Posición | Header (desktop) | BottomNav (mobile) |
|----------|-----------------|-------------------|
| 1 | Inicio | Inicio |
| 2 | **Panel municipal** ← 2º lugar | Mapa |
| 3 | Mapa | **Reportar** ← 3º lugar (destacado) |
| 4 | Alertas | Alertas |
| 5 | Contacto | — (no está en mobile) |
| — | — | Dashboard (no está en mobile) |

**Problemas:**
- El orden no refleja la frecuencia de uso del vecino promedio — "Panel municipal" no debería ser el segundo ítem del header para alguien que solo quiere reportar
- "Contacto" aparece en el header desktop pero no en mobile — y es crítico (números de emergencia)
- "Dashboard" no tiene entrada desde mobile
- El header tiene 5 ítems + botón "Reportar" = 6 elementos de navegación → excede Miller

---

### Propuesta: arquitectura de información reorganizada

#### Principio guía: **dos usuarios, dos modos de navegación**

```
VECINO (mobile-first, objetivo: reportar o ver el mapa)
  Inicio → Reportar → Mapa → Alertas → Emergencias

FUNCIONARIO (desktop, objetivo: dashboard y datos)
  Dashboard → Mapa → Alertas → Reportes (admin)
```

#### IA (Information Architecture) completa

```
Tu Vecino
├── Inicio (/)
│   ├── → Reportar (CTA principal)
│   ├── → Mapa (CTA secundario)
│   ├── Stats en tiempo real
│   ├── Alerta más urgente
│   ├── ODS 5 y 10 (cerca del hero)
│   └── Módulos (Mapa, Dashboard, Alertas, Reportar)
│
├── Mapa (/mapa)
│   ├── Filtros: período, tipo de incidente
│   ├── Capas: incidentes, calor, zonas, comisarías
│   ├── Leyenda (colapsable)
│   ├── Zonas críticas (lista)
│   └── Panel "En vivo" (colapsable)
│
├── Reportar (/reportar)
│   ├── Chat IA (/reportar/chat)        ← modo recomendado
│   ├── Paso a paso (/reportar/guiado)  ← adultos mayores
│   └── Formulario (/reportar/formulario) ← avanzado
│
├── Alertas (/alertas)
│   ├── Filtro: Todas / Mi zona / Peligro alto / Análisis
│   ├── Sección: Incidentes recientes
│   ├── Sección: Zonas de riesgo
│   └── Sección: Tendencias y análisis
│
├── Dashboard (/dashboard)             ← SOLO funcionario
│   ├── Pestaña: Reportes vecinales
│   └── Pestaña: Denuncias oficiales SIDPOL
│
├── Emergencias (/contacto)            ← renombrar a "Emergencias"
│   ├── Números de emergencia (105, 116, 106, 100)
│   └── Comisarías cercanas
│
├── Mi cuenta (/mi-cuenta)             ← si está logueado
└── Admin (/admin)                     ← SOLO admin
```

---

### Navegación header — rediseño

**Problema actual:** 6 ítems en orden incorrecto, "Panel municipal" en 2.º lugar.

**Propuesta:** 4 ítems para el vecino + acceso contextual al dashboard

```
ANTES:  [Inicio] [Panel municipal] [Mapa] [Alertas] [Contacto]  +  [Reportar]

DESPUÉS:
[Logo Tu Vecino]    [Mapa]  [Alertas]  [Emergencias]    [Reportar ↑]  [Mi cuenta]
                                                          ← CTA azul, no rojo
```

**Cambios en `navigation.js`:**
```js
export const NAV_LINKS = [
  { id: 'mapa',       label: 'Mapa',         to: '/mapa' },
  { id: 'alertas',    label: 'Alertas',      to: '/alertas' },
  { id: 'contacto',   label: 'Emergencias',  to: '/contacto' },  // renombrar label
]
// Dashboard se accede desde la Home (módulo) o desde Mi cuenta (si es funcionario)
// No ocupa espacio en la nav principal — es para un perfil específico
```

**Justificación:**
- Ley de Hick: menos ítems = menor tiempo de decisión
- Ley de Pareto: el 80% de los vecinos usa 3 acciones (Reportar, ver Mapa, ver Alertas)
- "Panel municipal" desaparece de la nav principal — el vecino promedio no lo necesita; el funcionario llega por la Home o por su perfil
- "Contacto" → "Emergencias": el label actual no comunica urgencia — un adulto mayor buscando el número de la policía no sabría que está en "Contacto"

---

### Navegación BottomNav — rediseño

**Problema actual:** 4 ítems (Inicio, Mapa, Reportar, Alertas) — falta Emergencias y Dashboard.

**Propuesta:**

```
ANTES:  [🏠 Inicio] [🗺 Mapa] [📍 Reportar ★] [🔔 Alertas]

DESPUÉS: [🏠 Inicio] [🗺 Mapa] [📍 Reportar ★] [🔔 Alertas] [🚨 SOS]
                                                              ← nuevo ítem
```

**Cambio en `BottomNav.jsx`:**
```js
const ITEMS = [
  { to: '/',          label: 'Inicio',      Icono: IconoInicio,    end: true },
  { to: '/mapa',      label: 'Mapa',        Icono: IconoMapa },
  { to: '/reportar',  label: 'Reportar',    Icono: IconoPin,       destacado: true },
  { to: '/alertas',   label: 'Alertas',     Icono: IconoAlerta },
  { to: '/contacto',  label: 'SOS',         Icono: IconoEmergencia },
]
```

**Justificación:**
- El adulto mayor que sale de casa necesita el número de la policía a 1 tap — no debería tener que abrir el menú hamburguesa del header
- "SOS" como label es universalmente reconocido — más claro que "Contacto" o "Emergencias" para acceso rápido
- Pasar de 4 a 5 ítems es viable en 375px (`flex-1` = 75px por ítem, suficiente)

---

### Orden de secciones dentro de cada página

#### Home — orden propuesto

```
1. HERO (título + CTA + aviso anonimato)
   Principio: primera impresión, Ley de Pareto
   
2. ODS 5 y 10 (píldoras visuales, 2 chips horizontales)
   Principio: el jurado evalúa impacto social con 30% — debe verlos enseguida
   Hoy están al FINAL — error crítico para la demo
   
3. STATS (2 grandes + 2 pequeños)
   Principio: prueba social — "ya están pasando cosas, reporta tú también"
   
4. ALERTA MÁS URGENTE (1 card, si nivel alta o media)
   Principio: Gestalt de figura-fondo — 1 elemento urgente > 3 iguales
   
5. MÓDULOS (1 grande "Reportar" + 3 secundarios)
   Principio: Ley de Hick — 1 acción clara antes que 4 equivalentes
   
6. PIE (footer)
```

#### Mapa — orden del panel lateral propuesto

```
1. FILTROS (período + tipo)         ← el usuario llegó para buscar algo
2. CAPAS (checkboxes)               ← personalización secundaria
3. ZONAS CRÍTICAS (lista con nivel) ← resultado/insight principal
4. LEYENDA (colapsable por defecto) ← referencia, no siempre necesaria
5. FUENTES (pie del panel)          ← credibilidad, no acción
```

**Hoy el orden es:** título, período, tipo, capas, leyenda, resumen/zonas, demo, fuentes
→ La leyenda (referencia pasiva) aparece ANTES de las zonas críticas (insight accionable)

#### Alertas — orden de secciones propuesto

```
1. HEADER (título + descripción 1 línea)
2. FILTROS (con counters)
3. ¿Cómo funciona? (acordeón colapsable, 1 clic para ver) ← cerca de los filtros
4. INCIDENTES RECIENTES (grupo con encabezado)
5. ZONAS DE RIESGO (grupo con encabezado, si las hay)
6. TENDENCIAS Y ANÁLISIS (grupo con encabezado, si las hay)
7. CTA: "¿Viste algo? → Reportar"
```

**Hoy el orden es:** header, filtros, cards mezcladas, "¿Cómo se generan?" al fondo
→ La explicación está al final cuando debería estar cerca de los filtros

#### Formulario de reporte — orden de campos propuesto

```
ANTES (2 columnas):
  Col izq: [Tipo] [Descripción] [Fecha/Hora + Referencia] [Enviar]
  Col der: [Mapa de ubicación]

DESPUÉS (1 columna en mobile, 2 en desktop):
  Col izq:                           Col der:
  1. ¿Qué pasó? (chips de tipo)      1. ¿Dónde fue? (mapa)
  2. ¿Qué ocurrió? (textarea)
  3. ¿Cuándo? + Referencia (fila)
  4. [Enviar reporte]
```

El orden actual está bien — el problema es que en mobile la segunda columna (mapa) queda debajo de todo el formulario, por lo que el usuario llena el formulario sin ver el mapa y luego tiene que desplazarse hacia abajo para marcar la ubicación.

**Propuesta mobile:** en < 860px, el mapa sube después del selector de tipo (antes de la descripción), porque la ubicación orienta al usuario sobre qué está describiendo.

---

### Flujos de usuario completos (happy paths)

#### Flujo vecino que reporta (mobile, sin cuenta)

```
HOME → toca [Reportar ahora]
→ /reportar → ve aviso 🔒 → elige modo
  → [Chat IA] o [Paso a paso]

SI elige Chat IA:
  → /reportar/chat
  → escribe/dicta → IA detecta → ve chips + barra confianza
  → toca [✅ Sí, así fue]
  → marca ubicación en mapa
  → toca [Enviar reporte]
  → pantalla de ÉXITO con resumen
  → toca [Ver en el mapa →]
  → /mapa?lat=…&lng=… → ve su pin aparecer

SI elige Paso a paso:
  → /reportar/guiado
  → toca tipo → marca ubicación → toca cuándo
  → ve resumen con miniatura → toca [Enviar]
  → pantalla de ÉXITO
  → [Ver en el mapa →]
```

#### Flujo vecino que busca alertas de su zona

```
HOME → toca [🔔 Alertas] en BottomNav
→ /alertas → ve "Todas" por defecto
→ toca [Mi zona] → app pide permiso GPS → muestra alertas cercanas ordenadas por distancia
→ toca una alerta → toca [Ver en el mapa →]
→ /mapa centrado en esa zona
→ toca [FAB Reportar] si quiere reportar
```

#### Flujo adulto mayor (modo SOS / emergencia)

```
HOME o cualquier página → toca [🚨 SOS] en BottomNav (siempre visible)
→ /contacto (renombrado "Emergencias")
→ ve 4 botones GRANDES con número y nombre:
  [Policía 105] [Bomberos 116] [SAMU 106] [Línea 100]
→ toca → llamada directa
```

#### Flujo funcionario municipal (desktop)

```
HOME → módulo [📊 Panel municipal] → /dashboard
→ Pestaña "Reportes vecinales"
  → 5 KPIs, mapa de calor, tipos, línea de tiempo, top zonas
  → toca zona en tabla → /mapa?lat=…&lng=…
→ Pestaña "Denuncias oficiales (SIDPOL)"
  → datos MININTER por año y modalidad
→ [Exportar CSV]
```

---

### Contacto / Emergencias — rediseño de la página

**Problema actual:** la página `/contacto` tiene un grid de 4 columnas con números pequeños + lista de comisarías. El número de emergencia (el dato más crítico) no es el más prominente visualmente.

**Propuesta:**

```
ANTES:
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ 105  │ │ 116  │ │ 106  │ │ 100  │  ← 4 columnas iguales, números 2rem
└──────┘ └──────┘ └──────┘ └──────┘
Comisarías: lista detallada...

DESPUÉS:
┌──────────────────────────────────┐
│  🚨 EMERGENCIAS                  │
│                                  │
│  ┌──────────────────────────┐    │
│  │   📞 105               │    │ ← botón enorme, rojo, tap-to-call
│  │   POLICÍA NACIONAL      │    │
│  └──────────────────────────┘    │
│                                  │
│  [116 Bomberos] [106 SAMU]       │ ← 2 botones medianos en fila
│  [100 Línea 100 — violencia]     │ ← ancho completo (descripción necesaria)
│                                  │
│  Comisarías PNP más cercanas     │
│  [lista compacta con distancia]  │
└──────────────────────────────────┘
```

**Cambios concretos en `ContactoPage.jsx` + `paginas.css`:**
1. 105 (Policía) ocupa un botón hero completo — es el 95% de los casos de uso
2. 116, 106, 100 en grid 2 columnas debajo
3. 100 (Línea 100) ocupa ancho completo porque su descripción es larga y crítica para ODS 5
4. Renombrar `<h1>Contacto</h1>` → `<h1>Emergencias y contacto</h1>`
5. Renombrar en `navigation.js`: `label: 'Contacto'` → `label: 'Emergencias'`

---

### Resumen de cambios de navegación por archivo

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `navigation.js` | Reordenar NAV_LINKS: Mapa · Alertas · Emergencias (quitar Dashboard e Inicio) | 🔴 Alta |
| `navigation.js` | Renombrar `label: 'Contacto'` → `'Emergencias'` | 🔴 Alta |
| `BottomNav.jsx` | Añadir ítem SOS/Emergencias (5.º ítem) | 🔴 Alta |
| `Header.jsx` | Actualizar a nuevo orden NAV_LINKS (automático si se usa el modelo) | 🟠 Media |
| `Footer.jsx` | Reordenar lista: primero Reportar, luego Mapa, Alertas, Emergencias, Dashboard | 🟠 Media |
| `ContactoPage.jsx` | Botón 105 hero + rediseño de jerarquía de números | 🟠 Media |
| `paginas.css` | `.emergencia` → botón 105 con `min-height: 72px`, más prominente | 🟠 Media |
| `HomePage.jsx` | ODS sube al bloque 2 (después del hero), antes de los stats | 🔴 Alta |
| `MapaPage.jsx` | Panel lateral: reordenar secciones + separadores visuales | 🟠 Media |
| `AlertasPage.jsx` | Agrupar alertas por tipo + acordeón "¿Cómo funciona?" | 🟠 Media |

---


---

## MVP GANADORA — MEJORAS DE ALTO IMPACTO

> Estas son las mejoras que combinan impacto en el pitch (jurado) + impacto real en el usuario. No son ideas vagas: cada una tiene un lugar exacto en el código, un "momento wow" para la demo y un criterio de aceptación.

---

### MEJORA 1 — "El pin que aparece en tiempo real" (ya funciona — potenciarlo visualmente)

**Lo que tiene:** WebSocket emite evento `reporte` → marcador nuevo aparece en el mapa con animación `llegada` y badge `NUEVO` en el PanelEnVivo.

**El problema:** La animación del pin es solo un CSS en el item de la lista lateral — el marcador Leaflet en el mapa **no anima**. Para el demo, si proyectas en pantalla grande, el pin simplemente aparece sin drama.

**La mejora:** Cuando llega un reporte nuevo, el marcador Leaflet debe:
1. Aparecer con un **pulse ring** (3 anillos que se expanden y desvanecen, 2s)
2. El mapa volar suavemente hacia él (ya implementado con `setDestino` ✅)
3. El PanelEnVivo scroll automático al ítem nuevo

**Archivo:** [`capas.jsx`](../frontend/src/views/components/mapa/capas.jsx) — añadir clase CSS `.marcador-nuevo` al `divIcon` del reporte nuevo durante 3s

**CSS en mapa.css:**
```css
@keyframes pulse-ring {
  0%   { transform: scale(1);   opacity: 0.8; }
  70%  { transform: scale(2.5); opacity: 0; }
  100% { transform: scale(2.5); opacity: 0; }
}
.pin-nuevo::after {
  content: ''; position: absolute; inset: -6px;
  border-radius: 50%; border: 3px solid var(--color-tipo, #DC2626);
  animation: pulse-ring 1.4s ease-out 3;
  pointer-events: none;
}
```

**Momento wow en la demo:** "Escribo 'me siguieron' → confirmo → en 2 segundos aparece el pin en el mapa de todos los que están en la sala, con estos anillos que se expanden."

**Impacto en criterios:** Técnica 25% + Innovación 25%

---

### MEJORA 2 — Pantalla de éxito que cierra el loop emocional

**Lo que tiene:** [`ReporteEnviado.jsx`](../frontend/src/views/components/reporte/ReporteEnviado.jsx) muestra:
```
✓  ¡Reporte enviado! Gracias, vecino/a
   Tu reporte de robo (#123) ya aparece en el mapa de todos los vecinos.
   [Ver en el mapa]  [Hacer otro reporte]
```

**El problema:** Es funcional pero emocionalmente neutro. No confirma lo que se guardó, no refuerza la promesa de impacto, no invita a compartir.

**La mejora — pantalla de éxito rediseñada:**
```
╔══════════════════════════════════════════════╗
║                                              ║
║   ✅  (animación de check verde, 0.6s)       ║
║                                              ║
║   ¡Gracias, vecino/a!                        ║
║   Tu reporte ya está en el mapa              ║
║                                              ║
║   ┌──────────────────────────────────────┐   ║
║   │  🟠 Intentaron robarme              │   ║
║   │  📍 Jr. Paraíso · Sector 3          │   ║
║   │  🕐 Ahora · 🔒 Anónimo              │   ║
║   └──────────────────────────────────────┘   ║
║                                              ║
║   Con tu reporte, el serenazgo puede        ║
║   priorizar esta zona esta noche.           ║
║                                              ║
║   [🗺 Ver en el mapa →]                      ║
║   [+ Reportar otro incidente]               ║
║                                              ║
╚══════════════════════════════════════════════╝
```

**Frase de impacto:** "Con tu reporte, el serenazgo puede priorizar esta zona esta noche." — conecta el acto individual del vecino con el impacto colectivo. Es la promesa del ODS en 1 línea.

**Archivo:** [`ReporteEnviado.jsx`](../frontend/src/views/components/reporte/ReporteEnviado.jsx)
- Añadir resumen con tipo, zona y timestamp del reporte
- Añadir la frase de impacto
- Animación de check con CSS (no librería)

**Impacto en criterios:** Impacto social 30% + Presentación 20%

---

### MEJORA 3 — "Vecinos conectados" como social proof visible en el Home

**Lo que tiene:** El PanelEnVivo del mapa muestra `· 3 vecinos conectados` en texto gris pequeño dentro del panel lateral.

**El problema:** Nadie lo ve. Está escondido dentro de un panel colapsable en /mapa.

**La mejora:** Llevar ese dato al **hero del Home** como prueba social en tiempo real:

```
HERO:
"Tu vecino/a ya reportó. ¿Tú ya revisaste el mapa?"
👀 3 vecinos conectados ahora mismo   ← badge verde animado, en tiempo real
```

**Por qué importa:** La prueba social activa es el disparador de acción más poderoso en seguridad ciudadana. Ver que "hay gente ahí ahora" rompe la parálisis del espectador. Es el diferenciador vs. una app de denuncias normal.

**Implementación:**
- En `HomePage.jsx`: suscribir al `EventosContext` y leer `conectados`
- Mostrar como badge debajo del párrafo del hero: `· N vecino(s) revisando el mapa ahora`
- Desaparecer si `conectados === 0` (no mostrar "0 conectados")

**Archivo:** [`HomePage.jsx`](../frontend/src/views/pages/HomePage.jsx) + [`EventosContext.jsx`](../frontend/src/context/EventosContext.jsx)

**Impacto en criterios:** Innovación 25% + Impacto social 30%

---

### MEJORA 4 — "Confirmación comunitaria" más visible en el mapa

**Lo que tiene:** El popup del mapa tiene un botón "Marcar como real" con contador `👀 N vecinos lo confirmaron`. Implementado en [`capas.jsx`] con la clase `.popup-confirmar`.

**El problema:** Está escondido en el popup — el usuario tiene que tocar el pin, leer el popup y encontrar el botón. Para la demo, nadie llega a ver esta funcionalidad.

**La mejora:** En el PanelEnVivo, mostrar el contador de confirmaciones de forma más prominente y con CTA:

```
ANTES:
[🟠 Robo · Jr. Paraíso · hace 5 min]  👀 2

DESPUÉS:
[🟠 Robo · Jr. Paraíso · hace 5 min]
[👀 2 vecinos lo confirman]  [¿También lo viste? +1]
```

Esto convierte el mapa en una red de confirmación social — cada vecino puede validar el reporte de otro. Para la demo: en la sala, 3 personas confirman el mismo reporte en vivo.

**Archivo:** [`PanelEnVivo.jsx`](../frontend/src/views/components/mapa/PanelEnVivo.jsx) — añadir botón `+1 Confirmar` en cada ítem de la lista

**Impacto en criterios:** Innovación 25% — "pensar con IA" incluye la comunidad como fuente de validación

---

### MEJORA 5 — Stat "86% invisible" en el Hero como gancho narrativo

**Lo que tiene:** El hero dice "Haciendo visible la inseguridad que no se denuncia". Es correcto pero abstracto.

**La mejora:** Hacer el dato concreto y local:

```
ANTES:
"Haciendo visible la inseguridad que no se denuncia."

DESPUÉS:
"El 86% de los delitos en Lima nunca llega a una estadística.
 En Villa El Salvador, tus vecinos están cambiando eso."
```

Y debajo del párrafo, la stat en tiempo real:
```
📊 23 incidentes reportados esta semana que nunca habrían llegado a la comisaría
```

**Fuente del dato:** 86% = INEI ENAPRES 2023. Hardcodeable como supuesto explícito en el código.
**La cifra en tiempo real:** `k.total` × 0.86 (supuesto: 86% de reportes vecinales no se habrían denunciado formalmente).

**Archivo:** [`HomePage.jsx`](../frontend/src/views/pages/HomePage.jsx) — cambiar el `<p>` del hero

**Impacto en criterios:** Impacto social 30% + Presentación 20%

---

### MEJORA 6 — Dashboard: "Acción sugerida" más prominente en top zonas

**Lo que tiene:** La tabla `Top 5 zonas` en [`PanelCiudadano.jsx`] tiene una columna "Acción sugerida" con texto breve.

**El problema:** Es texto de 0.82rem en la última columna de una tabla — invisible para el funcionario en una proyección.

**La mejora — cards de zona crítica en lugar de tabla:**

```
ANTES:
┌─────────────────────────────────────────────────────┐
│ Zona          │ Reportes │ Tipo dominante │ Acción  │
│ Jr. Paraíso   │   8      │ Robo          │ Patrull.│
│ Av. Central   │   6      │ Acoso         │ Iluminar│
└─────────────────────────────────────────────────────┘

DESPUÉS:
┌─────────────────┐  ┌─────────────────┐
│ 🔴 1            │  │ 🟠 2            │
│ Jr. Paraíso     │  │ Av. Central     │
│ 8 reportes      │  │ 6 reportes      │
│ ── Robo ──      │  │ ── Acoso ──     │
│ Priorizar       │  │ Mejorar         │
│ patrullaje      │  │ iluminación     │
│ [Ver en mapa →] │  │ [Ver en mapa →] │
└─────────────────┘  └─────────────────┘
```

**Para la demo:** el funcionario dice "aquí tenemos las 5 zonas prioritarias para esta semana — con la acción concreta que el sistema recomienda para cada una". Eso es IA que piensa con el usuario.

**Archivo:** [`PanelCiudadano.jsx`](../frontend/src/views/components/dashboard/PanelCiudadano.jsx) — reemplazar `<table>` del top zonas por cards con `grid auto-fill`

**Impacto en criterios:** Innovación 25% + Impacto social 30%

---

### MEJORA 7 — Onboarding de 1 pantalla para el vecino nuevo

**Lo que tiene:** No hay onboarding. El usuario llega al Home y tiene que descubrir por sí solo qué es la app.

**La mejora:** Un banner de bienvenida que aparece **solo la primera vez** (localStorage flag), colapsable con 1 tap:

```
╔══════════════════════════════════════════════╗
║  👋 Bienvenido/a a Tu Vecino                 ║
║  Puedes reportar un incidente en 60 segundos,║
║  sin registrarte y de forma totalmente anónima║
║                                              ║
║  [Reportar ahora →]      [×  Ya entendí]     ║
╚══════════════════════════════════════════════╝
```

Implementar con `localStorage.getItem('tv-bienvenida')` — si no existe, mostrar el banner. Al cerrar, `localStorage.setItem('tv-bienvenida', '1')`.

**Archivo:** `HomePage.jsx` — añadir componente `BannerBienvenida` con lógica de localStorage
**Esfuerzo:** 30 min

**Impacto en criterios:** Impacto social 30% (ODS 10 — inclusión digital: el adulto mayor que nunca usó la app sabe qué hacer desde el primer segundo)

---

### MEJORA 8 — Microcopy de confianza en cada paso del flujo

**Lo que tiene:** El flujo de reporte es funcional pero frío. Los mensajes son informativos, no empáticos.

**Los cambios de microcopy con mayor impacto (todos en < 1h):**

| Dónde | Texto actual | Texto propuesto | Por qué |
|-------|-------------|----------------|---------|
| `/reportar` párrafo header | "Elige la forma que te resulte más cómoda." | "Solo toma 60 segundos. Nadie sabrá que fuiste tú." | Elimina la última duda antes de reportar |
| Wizard paso 1 h1 | "¿Qué pasó?" | "¿Qué pasó? Cuéntanos con confianza." | Reduce ansiedad en adultos mayores |
| Chat saludo inicial | "Hola, vecino/a. ¿Qué pasó? Cuéntame con tus palabras." | "Hola 👋 Estoy aquí para ayudarte. ¿Qué pasó? Cuéntame como quieras, en tus palabras." | Más cálido, refuerza que no hay forma incorrecta |
| Éxito | "¡Reporte enviado! Gracias, vecino/a" | "¡Gracias! Tu reporte ya está visible. Acabas de hacer Villa El Salvador un poco más segura." | Cierra el loop emocional con impacto |
| Mapa sin datos | "Aún no hay reportes en este periodo." | "Todo tranquilo por ahora. Si ves algo, puedes reportarlo aquí →" | Estado vacío con CTA positivo |
| Alertas vacío | "No hay alertas de este tipo por ahora." | "Sin alertas de este tipo. ¡Eso es buena señal! Si ves algo, repórtalo." | Mismo principio |
| Dashboard sin datos | `<p>Cargando…</p>` | Skeleton de KPIs + spinner | Heurística 1 |

---

### MEJORA 9 — "Mapa de ruta segura" (pitch-only, mencionar en demo)

**No implementar ahora.** Solo mencionar en el pitch como roadmap:

> "El siguiente paso es que el mapa no solo muestre dónde están los peligros, sino que calcule la ruta más segura desde tu ubicación hasta tu destino, evitando zonas de alto riesgo activo. Los datos ya están — solo falta conectar Leaflet Routing Machine con nuestra capa de zonas críticas."

Esto es "pensar con IA" llevado al extremo: la IA no solo muestra datos, sugiere acciones preventivas.

---

### TABLA MAESTRA DE TODAS LAS MEJORAS (priorizada para MVP ganadora)

| # | Mejora | Archivo(s) | Tipo | Impacto demo | Esfuerzo | Prioridad |
|---|--------|-----------|------|-------------|---------|-----------|
| M1 | Pulse ring en pin nuevo en tiempo real | `capas.jsx` + `mapa.css` | CSS/JS | ⭐⭐⭐⭐⭐ | 1h | 🔴 |
| M2 | Pantalla éxito con resumen + frase impacto | `ReporteEnviado.jsx` | JSX | ⭐⭐⭐⭐⭐ | 1h | 🔴 |
| M3 | Vecinos conectados en el hero del Home | `HomePage.jsx` | JSX | ⭐⭐⭐⭐ | 45min | 🔴 |
| M4 | Stat "86% invisible" en hero + cifra real | `HomePage.jsx` | JSX | ⭐⭐⭐⭐⭐ | 30min | 🔴 |
| M5 | ODS junto al hero (antes de stats) | `HomePage.jsx` | JSX | ⭐⭐⭐⭐⭐ | 20min | 🔴 |
| M6 | Card "Reportar" ancho completo en Home | `HomePage.jsx` + CSS | JSX/CSS | ⭐⭐⭐⭐ | 30min | 🔴 |
| M7 | Nav: quitar Dashboard, añadir Emergencias | `navigation.js` + `BottomNav.jsx` | JS/JSX | ⭐⭐⭐ | 20min | 🔴 |
| M8 | AlertaCard rediseñada (badges + footer) | `AlertaCard.jsx` + `paginas.css` | JSX/CSS | ⭐⭐⭐⭐ | 1h | 🔴 |
| M9 | Microcopy de confianza en todos los flujos | JSX múltiples | Texto | ⭐⭐⭐⭐⭐ | 45min | 🔴 |
| M10 | Onboarding banner primera vez | `HomePage.jsx` | JSX | ⭐⭐⭐ | 30min | 🟠 |
| M11 | Burbuja detección conversacional (chips) | `ReportarChatPage.jsx` + CSS | JSX/CSS | ⭐⭐⭐⭐⭐ | 2h | 🟠 |
| M12 | Chips de ejemplo encima del input | `ReportarChatPage.jsx` + CSS | JSX/CSS | ⭐⭐⭐ | 30min | 🟠 |
| M13 | Mapa panel: 3 secciones + reordenar | `MapaPage.jsx` + `mapa.css` | JSX/CSS | ⭐⭐⭐ | 1h | 🟠 |
| M14 | Alertas agrupadas por tipo | `AlertasPage.jsx` + CSS | JSX/CSS | ⭐⭐⭐⭐ | 1.5h | 🟠 |
| M15 | Confirmación comunitaria visible en PanelEnVivo | `PanelEnVivo.jsx` | JSX | ⭐⭐⭐⭐ | 1h | 🟠 |
| M16 | Dashboard: cards de zona crítica en lugar de tabla | `PanelCiudadano.jsx` + CSS | JSX/CSS | ⭐⭐⭐⭐ | 1.5h | 🟠 |
| M17 | Contacto: botón 105 hero + rediseño | `ContactoPage.jsx` + CSS | JSX/CSS | ⭐⭐⭐ | 45min | 🟠 |
| M18 | Wizard: grupos en paso 1 + GPS primero en paso 2 | `ReportarGuiadoPage.jsx` + CSS | JSX/CSS | ⭐⭐⭐ | 1h | 🟡 |
| M19 | Formulario: mapa sube en mobile | `ReportarFormularioPage.jsx` + CSS | JSX/CSS | ⭐⭐ | 30min | 🟡 |
| M20 | Mapa ruta segura (pitch-only) | — | Roadmap | ⭐⭐⭐⭐⭐ | — | 📢 Pitch |

**Tiempo total estimado (M1–M17):** ~14 horas de implementación

---

### GUION DE DEMO — "El minuto de impacto"

Este es el flujo de demo de 90 segundos que usa todas las mejoras de esta lista:

```
[0s]   Proyectar Home — se ve:
       "El 86% de los delitos en Lima nunca llega a una estadística."
       "👀 4 vecinos conectados ahora mismo"
       ODS 5 y 10 justo debajo del hero
       Stats: N zonas críticas · N reportes esta semana

[10s]  Tocar [Reportar ahora] →
       /reportar — se ve el aviso verde 🔒 arriba
       Tocar [Chat IA — Recomendado]

[20s]  Escribir "me siguieron del mercado a mi casa"
       Se ve: "Identificando el tipo de incidente…"
       Bot responde: 🟡 Acoso — 92% seguro + barra verde
       Tocar [✅ Sí, así fue]
       Marcar ubicación en el mapa

[40s]  Tocar [Enviar reporte] →
       Pantalla de éxito:
       "¡Gracias! Acabas de hacer Villa El Salvador un poco más segura."
       Resumen: Acoso · Jr. Paraíso · Ahora · 🔒 Anónimo

[50s]  Tocar [Ver en el mapa →] →
       /mapa — se ve el pin amarillo aparecer CON anillos de pulse
       Mapa voló automáticamente hacia el pin
       Panel En Vivo muestra "NUEVO — Acoso · Jr. Paraíso"
       En otra pantalla/dispositivo: alguien ve el mismo pin aparecer

[70s]  Abrir /dashboard →
       5 KPIs, mapa de calor
       Cards de zonas críticas: "Jr. Paraíso — 8 reportes — Priorizar patrullaje"
       "Con estos datos, el serenazgo sabe dónde ir esta noche."

[90s]  Cerrar con Home — se ve el badge "5 vecinos conectados ahora mismo"
       "Esto es 'pensar con IA' — no ejecutarla. La comunidad calibra, confirma y actúa."
```

---

### ARGUMENTO POR CRITERIO DEL JURADO

**Impacto Social (30%)**
> *"23 incidentes esta semana que nunca habrían llegado a una estadística. ODS 5: acoso reportado de forma anónima en 20 segundos. ODS 10: botones de 64px y letra grande para el adulto mayor que nunca usó una app."*

**Innovación (25%)**
> *"La IA no solo clasifica — muestra su confianza, pregunta cuando duda, y la comunidad puede confirmar o corregir sus clasificaciones. 5 vecinos conectados ahora mismo, validando los datos en tiempo real. Eso es 'pensar con IA'."*

**Técnica (25%)**
> *"WebSocket propio, MySQL, datos SIDPOL del MININTER integrados, fallback de clasificador local sin API key. El pin aparece en el mapa de todos los usuarios en < 2 segundos. Deploy en Docker para cualquier municipio del país."*

**Presentación (20%)**
> *"Una pantalla, un dato, una acción. Cada pantalla tiene un elemento dominante. El flujo completo — desde 'me siguieron' hasta el pin en el mapa de todos — tarda 50 segundos."*

