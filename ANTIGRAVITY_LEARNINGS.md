# 🧠 Antigravity Learnings & Guidelines

Este es un documento vivo. Su objetivo es registrar los aprendizajes, preferencias y reglas descubiertas durante el desarrollo para evitar repetir errores y mantener la consistencia.

> **💡 Nota para futuras sesiones (o para copiar a otros proyectos):**  
> Lee este documento antes de empezar a programar o sugerir cambios arquitectónicos importantes.

---

## 🌍 BLOQUE A: Reglas Universales (Frameworks y Arquitectura)
*Estas reglas aplican a cualquier proyecto que utilice estas tecnologías.*

1. **React & Next.js - Regla de los Hooks (ABSOLUTA)**:
   - **Problema conocido:** El error `Rendered more hooks than during the previous render`.
   - **Regla:** Todos los hooks de React (`useState`, `useEffect`, `useMemo`, `useCallback`, etc.) **DEBEN** ser declarados en el nivel superior del componente, **antes** de cualquier retorno condicional (ej. `if (!mounted) return null`). Jamás colocar un hook después de un `return` temprano.

2. **Next.js - Caché y HMR (Hot Module Replacement)**:
   - **Problema conocido:** Error `__webpack_modules__[moduleId] is not a function`.
   - **Regla:** Este es un fallo común del entorno de desarrollo local al modificar archivos en vivo. La solución no suele requerir cambios de código, sino reiniciar el servidor de desarrollo (`npm run dev`) y, si persiste, borrar la carpeta oculta `.next` para limpiar la caché.

---

## 👤 BLOQUE B: Preferencias de Usuario (Noel)
*Estilo de trabajo y comunicación.*

1. **Gestión de Reglas y Contexto**:
   - Evitar crear dogmas absolutos del tipo "NUNCA hagas esto" a menos que sea una limitación física del framework (como la regla de los Hooks).
   - Explicar el *por qué* de las decisiones técnicas. Las reglas deben ser "guías de contexto" (ej. "Prefiere X sobre Y porque Z, a menos que...").

2. **Estilo de Interfaz (UI/UX)**:
   - Priorizar siempre un diseño limpio, moderno y estructurado.
   - En listados y grids, ocultar o atenuar el peso visual de los elementos vacíos (ej. categorías sin vídeos) para no saturar la vista.
   - Mantener el sistema de feedback visual claro pero sutil (ej. puntos de colores para prioridades, sin abusar de textos gigantes).

---

## 🎯 BLOQUE C: Learnings Específicos del Proyecto (Wikilinks Video Hub)
*Reglas y descubrimientos exclusivos para este repositorio.*

1. **Generación de Resúmenes IA (API de Gemini)**:
   - **Modelos:** Se prefiere el uso de `gemini-2.0-flash-lite` para tareas de estructuración estricta de texto (como generar el formato de Notion). El modelo `gemini-2.5-flash` incluye un modo de "pensamiento" (thinking) que consume tokens ocultos y a veces trunca la respuesta final si el límite de tokens es ajustado.
   - **Configuración:** Para que los resúmenes con viñetas no se corten a la mitad, `maxOutputTokens` debe estar configurado al menos en `2000` y, si se usan modelos avanzados, desactivar explícitamente el `thinkingBudget`.

2. **Zustand y Next.js (Hydration Mismatch)**:
   - Dado que el estado global (`useAppStore`) persiste los datos en el `localStorage` del navegador, el renderizado inicial en el servidor no coincide con el del cliente.
   - **Solución estándar:** En cualquier vista que lea del estado (`Home`, `WatchNowView`, `ActionsView`, etc.), se DEBE utilizar un estado local de montaje (`const [mounted, setMounted] = useState(false)`) y un `useEffect` que lo ponga a `true`. Retornar un *spinner* o un contenedor vacío mientras no esté montado.

3. **Sistema de Diseño y CSS**:
   - Usamos variables CSS semánticas para los colores (ej. `bg-surface-low`, `border-surface-high`, `text-onSurface-muted`, `text-primary`) en lugar de colores fijos de Tailwind (como `bg-gray-800`), para asegurar que el modo claro y oscuro funcionen automáticamente.
   - Los colores de prioridad deben ser consistentes: Alta (Ámbar), Media (Azul), Baja (Gris).

4. **Sistema de Etiquetas (Tags)**:
   - Las etiquetas son globales y se gestionan en `Settings`.
   - Al renderizar etiquetas en listas (como `VideoRow`), se debe usar el formato `#nombre` con un estilo compacto para no romper el layout.
   - En componentes de filtrado, las etiquetas deben seleccionarse en modo "AND" (mostrar vídeos que tengan TODAS las etiquetas seleccionadas).

5. **Visualización de Prioridad**:
   - El usuario prefiere que la prioridad siempre incluya el **texto descriptivo** (Alta, Media, Baja) junto al color, para facilitar la identificación sin memorizar el código cromático.
   - Los textos de prioridad deben usar el mismo color hexadecimal de la prioridad para reforzar el vínculo visual.

6. **Next.js - Uso de useSearchParams y Suspense**:
   - Cualquier componente de cliente que utilice `useSearchParams` (como `WatchNowView`) **DEBE** estar envuelto en un límite de `<Suspense>`.
   - **Regla:** Si un componente usa `useSearchParams`, crea un componente interno (ej. `WatchNowContent`) y expórtalo envuelto en `Suspense` para evitar errores de hidratación y fallos de construcción en Next.js.
