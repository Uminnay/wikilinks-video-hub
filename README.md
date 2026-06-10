# Wikilinks Video Hub

Wikilinks es una aplicación web personal para guardar, clasificar y convertir enlaces en conocimiento accionable. El proyecto nació como un gestor de vídeos de YouTube, pero actualmente incluye también enlaces web, acciones/tareas, búsqueda global, preparación/exportación a Notion, login con Supabase y soporte PWA para uso móvil.

App pública: [https://wikilinks.liagil.es](https://wikilinks.liagil.es)

Repositorio: [https://github.com/Uminnay/wikilinks-video-hub](https://github.com/Uminnay/wikilinks-video-hub)

## Funcionalidades principales

- **Vídeos de YouTube**: alta por URL, detección de duplicados, categorías, prioridades, etiquetas, estados, historial y papelera.
- **Metadatos automáticos de YouTube**: extracción de ID, título, canal, miniatura, duración y fecha de publicación mediante YouTube Data API con fallback a oEmbed.
- **Enlaces web**: módulo propio para guardar páginas, artículos, herramientas o recursos con título, categoría, prioridad, etiquetas y estados.
- **Open Graph**: enriquecimiento de enlaces web con título, descripción e imagen cuando la página lo permite.
- **Resumen con IA**: análisis bajo demanda en el detalle del vídeo usando Gemini, orientado a decidir si merece la pena ver el recurso.
- **Acciones/tareas**: tareas pendientes o completadas, con posibilidad de vincularlas a vídeos y enlaces web.
- **Notion**: preparación de recursos seleccionados y exportación a una base de datos de Notion configurada por el usuario.
- **Búsqueda global**: búsqueda sobre vídeos, enlaces web y acciones.
- **Personalización**: categorías, etiquetas, prioridades, filtros de tiempo, tema claro/oscuro y tamaño de texto.
- **PWA/móvil**: manifest, service worker, navegación móvil y soporte de `share_target` para capturar enlaces compartidos.
- **Autenticación**: login con Google mediante Supabase Auth.

## Stack técnico

- Next.js 14 con App Router
- React 18
- TypeScript
- Tailwind CSS
- Zustand para estado global
- Supabase Auth y base de datos
- Gemini API para resumen/análisis
- YouTube Data API y oEmbed para metadatos
- Notion API para exportación
- next-pwa para soporte PWA
- Docker y Docker Compose para despliegue

## Estructura del proyecto

```text
src/app
  (app)                Rutas privadas de la aplicación
  api/youtube          Metadatos de YouTube
  api/summarize        Resumen/análisis con Gemini
  api/opengraph        Metadatos Open Graph de enlaces web
  api/notion           Exportación a Notion
  login                Pantalla de autenticación

src/components/features
  AddVideoModal        Alta de vídeos
  AddWebLinkModal      Alta de enlaces web
  VideoDetailView      Detalle de vídeo, IA y acciones
  WebLinkDetailView    Detalle de enlace web y acciones
  ActionsView          Vista global de tareas
  NotionView           Preparación y exportación a Notion
  GlobalSearchModal    Búsqueda global

src/store/useAppStore.ts
  Estado global y operaciones contra Supabase

supabase/migrations
  Esquema principal de tablas y migraciones
```

## Variables de entorno

Crear un archivo `.env.local` para desarrollo local. No debe subirse a Git.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
YOUTUBE_API_KEY=
```

Notas:

- `YOUTUBE_API_KEY` es recomendable para obtener duración y fecha de publicación. Si no está disponible, la app usa oEmbed como fallback parcial.
- `GEMINI_API_KEY` es necesaria para generar resúmenes con IA.
- La configuración de Notion se introduce desde la propia app en Ajustes > Integraciones.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Despliegue

El proyecto incluye `Dockerfile`, `docker-compose.yml` y un workflow de GitHub Actions para desplegar en VPS al hacer push a `main`.

El workflow ejecuta en el servidor:

```bash
git pull origin main
docker compose up -d --build
```

## Estado del proyecto

El estado revisado del repositorio indica que la rama principal es `main`, el remoto apunta a `Uminnay/wikilinks-video-hub` y el código local está sincronizado con GitHub.

La aplicación pública está protegida por login, por lo que las funcionalidades internas requieren autenticación para probarse visualmente.

## Memoria del proyecto

La memoria ejecutiva y técnica del proyecto está disponible en:

[docs/memoria-wikilinks-app.html](docs/memoria-wikilinks-app.html)

## Limitaciones conocidas

- El resumen IA actual se genera a partir de metadatos como título y canal; no usa todavía transcripción completa del vídeo.
- La imagen Open Graph de enlaces web se obtiene en segundo plano, pero conviene revisar la persistencia de `og_image_url` en base de datos si se quiere conservarla siempre.
- La vista global de acciones muestra mejor el contexto de vídeos que el de enlaces web, aunque el modelo ya soporta `web_link_id`.

## Autoría

Proyecto desarrollado como trabajo de aplicación web personal para organizar vídeos, enlaces y conocimiento práctico.
