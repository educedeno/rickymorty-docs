# Rick & Morty — Documentación interactiva

Página de documentación interactiva para el endpoint de personajes de la API pública de Rick and Morty, con una integración creativa de Google Gemini que genera resúmenes en tres voces distintas: Rick, Morty y la computadora de Rick.

- 🌐 **Demo en vivo:** https://rickymorty-docs.vercel.app/
- 📦 **Código fuente:** https://github.com/educedeno/rickymorty-docs

---

## Tabla de contenido

- [Características](#características)
- [Stack y decisiones arquitectónicas](#stack-y-decisiones-arquitectónicas)
- [Estrategias de rendimiento](#estrategias-de-rendimiento)
- [Integración con IA](#integración-con-ia)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Ejecución local](#ejecución-local)
- [Variables de entorno](#variables-de-entorno)
- [Despliegue](#despliegue)

---

## Características

- **Cuadrícula de personajes** con scroll infinito (52 personajes máximo) y carga progresiva.
- **Vista de detalle** con imagen, datos, episodios, ubicación y JSON crudo plegable.
- **Búsqueda por ID** desde la barra de navegación.
- **Componente "Try it out"** plegable, estilo documentación de API, con request, response y manejo de error 404.
- **Resumen con IA** con tres tonos creativos:
  - 🥒 Rick (cínico, multiverso, primera persona)
  - 😬 Morty (nervioso, tartamudo, primera persona)
  - 🤖 Computadora de Rick (formato log estructurado)
- **Mensaje claro de error 404** cuando un ID no existe.
- **Skeletons** mientras cargan datos y manejo de error global con botón "Reintentar".
- **API key protegida** — nunca llega al cliente.

---

## Stack y decisiones arquitectónicas

### ¿Por qué Next.js 16 con App Router?

Para una página de documentación interactiva, Next.js es la elección natural y moderna por varias razones concretas:

1. **Server Components por defecto.** La página principal y la vista de detalle se renderizan en el servidor, lo que reduce el JavaScript que viaja al navegador y mejora el Time to First Byte. Solo los componentes que necesitan interactividad (buscador, dropdowns, scroll infinito, IA) marcan `"use client"` y se hidratan en el navegador.

2. **API Routes integradas.** El endpoint `/api/summarize` corre en el servidor, lo que me permite leer `process.env.GEMINI_API_KEY` sin exponerla al cliente. No requiere un backend separado.

3. **Routing por sistema de archivos.** Crear `app/character/[id]/page.tsx` automáticamente habilita la ruta `/character/123`. Reduce configuración a cero.

4. **Image Optimization nativa.** El componente `<Image>` sirve imágenes en formatos modernos (WebP/AVIF), con `srcset` automático según viewport, y lazy loading nativo. Pude declarar el dominio remoto de la API una sola vez en `next.config.ts`.

5. **Deploy de un click en Vercel.** Al estar hecho por la misma empresa que mantiene Next.js, el despliegue es trivial: conectar GitHub, configurar variables de entorno, y listo.

### Otras decisiones

- **TypeScript** para tener seguridad de tipos sobre la respuesta de la API y prevenir errores comunes.
- **Tailwind CSS v4** para iterar rápido en estilos sin saltar entre archivos. Variables CSS personalizadas (`--accent`, `--surface`, etc.) para el theming consistente estilo "API docs".
- **Sin librerías UI externas.** Componentes propios (Navbar, Card, Skeleton, Dropdown) — más control, menos peso en el bundle.
- **Google Gemini** como motor de IA por la generosidad de su free tier y la disponibilidad de modelos rápidos (`gemini-2.5-flash-lite`).

---

## Estrategias de rendimiento

Si esta página tuviera que escalar a tráfico masivo, estas son las estrategias que ya están aplicadas o que aplicaría, justificadas en el contexto del proyecto:

### 1. SSG + ISR para listas y detalles

La home (`/`) y cada vista de detalle (`/character/[id]`) se cachean con `revalidate: 3600` en el cliente HTTP de la API de Rick & Morty. Resultado:

- Primera visita: el servidor de Next.js hace fetch a la API externa y guarda el resultado.
- Siguientes visitas dentro de 1 hora: se sirve desde caché — no se vuelve a llamar a la API externa.
- A la hora, la siguiente petición revalida en segundo plano sin afectar al usuario.

En el `next build` se ve confirmado:

```
Route (app)          Revalidate  Expire
┌ ○ /                        1h      1y
└ ƒ /character/[id]          (ISR)
```

**Por qué aplica aquí:** los datos de Rick & Morty son prácticamente inmutables (la serie ya terminó). 1 hora es un balance generoso entre frescura y eficiencia.

**SSG vs SSR — ¿cuándo cada uno?** Elegí SSG con revalidación (ISR) porque los datos no dependen del usuario ni cambian con frecuencia, así que se pueden pre-renderizar una vez y servir desde caché a todos. Usaría SSR (`dynamic = 'force-dynamic'`) si la página dependiera del request: por ejemplo, mostrar contenido personalizado por cookies/sesión, datos en tiempo real como precios o stock, o respuestas que cambian por geolocalización. En esos casos el caché compartido sería incorrecto y vale la pena pagar el costo de renderizar por petición.

### 2. Partial Hydration (Server vs Client Components)

Solo los componentes que requieren JavaScript en el navegador están marcados como cliente:

| Componente | Tipo | Razón |
|---|---|---|
| `app/page.tsx`, `app/character/[id]/page.tsx` | Server | Solo renderizan datos |
| `Navbar` | Client | Input de búsqueda con estado |
| `TryItOut` | Client | Form interactivo + dropdown |
| `CharacterGrid` | Client | Scroll infinito + estado |
| `AISummary` | Client | Dropdown + fetch a IA |
| `CharacterCard`, `Skeleton` | Server | Solo presentación |

**Por qué aplica aquí:** las tarjetas del grid son el contenido más pesado de la home. Al ser Server Components, viajan como HTML puro. El navegador hidrata únicamente las "islas" interactivas, no toda la página.

### 3. Lazy loading de imágenes y carga progresiva

- El componente `next/image` aplica `loading="lazy"` automáticamente a las imágenes fuera del viewport. Las primeras tarjetas se sirven con `priority` (LCP), las demás se cargan al hacer scroll.
- El grid usa **`IntersectionObserver`** con `rootMargin: 400px` para precargar la siguiente página antes de que el usuario llegue al final, evitando esperas perceptibles.

**Por qué aplica aquí:** cada personaje incluye una imagen relativamente pesada. Cargar las 52 al mismo tiempo desperdiciaría ancho de banda en personajes que el usuario quizá nunca verá.

**A nivel de componente con `dynamic()`:** si la app creciera, también dividiría componentes pesados de la vista de detalle. El candidato más claro es `AISummary`: no es crítico para el primer paint, ocupa espacio en el bundle (lógica de dropdown + manejo de estados + fetch) y solo se usa cuando el usuario decide pedir un resumen. Cargarlo con `dynamic(() => import('@/components/AISummary'), { ssr: false, loading: () => <Skeleton /> })` retiraría su código del bundle inicial y lo descargaría on-demand. El bloque de JSON crudo es otro candidato: rara vez se abre y su renderizado escala con el tamaño del payload.

### 4. API Routes server-side para llamadas a terceros

La llamada a Gemini va a `/api/summarize`, no directo desde el navegador. Beneficios:

- **Seguridad:** la API key nunca llega al cliente.
- **Rate limiting controlado:** se puede agregar un middleware de throttling sin tocar el cliente.
- **Caché futura:** se podría cachear la respuesta por `(character.id, tone)` con `unstable_cache` para evitar pagar tokens duplicados.

---

## Integración con IA

El componente `AISummary` permite elegir entre tres voces distintas para describir al personaje. Cada tono usa un prompt cuidadosamente diseñado (ver `src/lib/prompts.ts`).

### Diseño de los prompts

- **Datos curados, no JSON crudo.** Antes de mandar a Gemini, se filtran los campos relevantes (nombre, status, especie, origen, ubicación, episodios). Esto reduce ruido y tokens.
- **Restricciones explícitas.** Cada prompt indica longitud máxima (3 líneas) y formato esperado, evitando respuestas largas o con preámbulos.
- **Variabilidad forzada en Morty.** Se prohíbe explícitamente abrir con "A-aw geez" para que cada generación arranque distinto.
- **Temperatura adaptativa.** Rick y Morty usan `temperature: 0.95` (más creativos), mientras que la computadora usa `0.5` (más fiel al formato de log).
- **Disable thinking.** Para Gemini 2.5 se desactiva el "thinking" interno (`thinkingConfig.thinkingBudget: 0`) ya que estos prompts son simples y se beneficia de respuestas más rápidas.

### Flujo

1. El usuario hace click en "Generar resumen con IA" en la vista detalle.
2. Se abre un dropdown con tres opciones (Rick, Morty, Computadora).
3. Al elegir una, el cliente hace `POST /api/summarize` con `{ character, tone }`.
4. El route handler arma el prompt, llama a Gemini, y devuelve `{ text }`.
5. El componente muestra el resumen con el tono seleccionado, etiquetado como "AI generated", y permite regenerar.

---

## Estructura del proyecto

```
rickmorty-docs/
├── .env.example              # Plantilla de variables de entorno
├── next.config.ts            # Config (incluye remotePatterns para imágenes de la API)
├── package.json
├── public/                   # Archivos estáticos
└── src/
    ├── app/                  # Rutas y páginas (App Router)
    │   ├── layout.tsx        # Layout raíz con navbar y footer
    │   ├── page.tsx          # Home con grid + Try it out
    │   ├── loading.tsx       # Skeleton de la home
    │   ├── error.tsx         # Pantalla de error global
    │   ├── icon.svg          # Favicon (portal verde)
    │   ├── globals.css       # Variables CSS y estilos globales
    │   ├── api/
    │   │   └── summarize/route.ts   # Endpoint server-side a Gemini
    │   └── character/[id]/
    │       ├── page.tsx             # Vista detalle
    │       ├── loading.tsx          # Skeleton del detalle
    │       └── not-found.tsx        # 404 personalizado
    ├── components/
    │   ├── Navbar.tsx               # Logo + buscador por ID
    │   ├── CharacterCard.tsx        # Tarjeta del grid
    │   ├── CharacterGrid.tsx        # Grid con scroll infinito
    │   ├── TryItOut.tsx             # Sección plegable de "Try it out"
    │   ├── AISummary.tsx            # Botón + dropdown + resultado de IA
    │   └── Skeleton.tsx             # Primitivos de loading
    ├── lib/
    │   ├── rickAndMorty.ts          # Cliente de la API externa
    │   └── prompts.ts               # Definición de tonos y prompts
    └── types/
        └── character.ts             # Tipos TypeScript de la API
```

---

## Ejecución local

### Requisitos

- Node.js 20 o superior
- npm (incluido con Node)
- Una API key de Google Gemini (gratis, ver más abajo)

### Pasos

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/educedeno/rickymorty-docs.git
   cd rickymorty-docs
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Configurar la API key de Gemini:**

   Copia el archivo de ejemplo y pega tu key:

   ```bash
   cp .env.example .env.local
   ```

   Luego edita `.env.local` y reemplaza el placeholder por tu key real.

4. **Levantar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

5. **Abrir** [http://localhost:3000](http://localhost:3000) en el navegador.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build de producción |

---

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Sí | API key de Google Gemini |
| `GEMINI_MODEL` | ❌ No | Modelo a usar (por defecto `gemini-2.5-flash`) |

### Cómo obtener la API key de Gemini

1. Ir a [Google AI Studio](https://aistudio.google.com/apikey).
2. Iniciar sesión con una cuenta de Google.
3. Hacer click en **"Create API key"**.
4. Seleccionar (o crear) un proyecto de Google Cloud — es gratis.
5. Copiar la key generada y pegarla en `.env.local` como `GEMINI_API_KEY`.

El free tier es suficiente y no requiere tarjeta de crédito.

> 💡 **En producción (Vercel):** no se sube ningún `.env`. Las variables se configuran en el panel del proyecto, en **Settings → Environment Variables**. Ver la sección [Despliegue](#despliegue) más abajo para el flujo completo.

---

## Despliegue

El proyecto está desplegado en Vercel: https://rickymorty-docs.vercel.app/

Para desplegarlo en tu propia cuenta:

1. Hacer fork del repositorio en Github.
2. Importar el repo desde [vercel.com/new](https://vercel.com/new).
3. Agregar las variables `GEMINI_API_KEY`(tu api key) y `GEMINI_MODEL`(modelo especifico a usar) en el panel de "Environment Variables".
4. Click en "Deploy".

Vercel detecta Next.js automáticamente, optimiza el build, y configura redeploy automático con cada `git push`.

---

## Autor

**Eduardo Cedeño** — prueba técnica para Kushki, mayo 2026.
