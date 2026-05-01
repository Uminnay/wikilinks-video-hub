# Design System Strategy: The Kinetic Archivist

## 1. Overview & Creative North Star
This design system is built for the "Kinetic Archivist"—a user who values high-velocity information retrieval and dense, interconnected data. While many productivity tools prioritize "breathable" white space, this system embraces **Information Luxury**. We treat density not as clutter, but as a professional instrument.

The Creative North Star is defined by **Structural Depth**. We move away from the flat "card-on-canvas" template and toward a sophisticated, layered environment. By utilizing intentional asymmetry, overlapping glass panels, and a high-contrast typographic scale, we create an interface that feels like a high-end command center rather than a basic web app.

## 2. Colors & Surface Architecture
The color palette is anchored in deep obsidians and electric violets, designed to reduce eye strain while highlighting critical action paths.

### The "No-Line" Rule
Standard UI relies on 1px borders to separate content. In this system, **1px solid borders for sectioning are prohibited.** Boundaries must be defined through background color shifts.
*   **Surface Hierarchy:** Use the `surface_container` tiers to define logic. A navigation sidebar should sit on `surface_dim`, while the main content area occupies `surface_container_low`. Inner cards should utilize `surface_container_highest` to naturally "lift" off the page without a stroke.
*   **The Glass & Gradient Rule:** For floating elements like command palettes or context menus, use semi-transparent `surface_variant` with a 12px-16px backdrop-blur. 
*   **Signature Textures:** Main CTAs must use a subtle linear gradient from `primary` (#7C5CFC) to `primary_container` (#947DFF) at a 135-degree angle. This provides a tactile "glow" that flat colors cannot replicate.

| Token | Hex | Role |
| :--- | :--- | :--- |
| `background` | #131315 | The base canvas layer. |
| `surface_container_low` | #1B1B1D | Secondary content regions. |
| `surface_container_highest` | #353437 | Interactive card states. |
| `primary` | #7C5CFC | Electric Violet; used for core actions. |
| `tertiary` | #10B981 | Notion Green; used for success and growth metrics. |

## 3. Typography: The Pro-Density Scale
We use **Inter** exclusively, but we manipulate its weight and tracking to achieve an editorial feel. The goal is "High-Contrast Metadata"—making the primary data bold and clear, while secondary metadata is small and sharp.

*   **Display & Headlines:** Use `headline-sm` (1.5rem) with -0.02em tracking for a tight, modern look.
*   **Body:** `body-md` (0.875rem) is the workhorse. Maintain a line height of 1.5 to ensure readability amidst density.
*   **Labels:** To achieve the "Linear" feel, use `label-sm` (0.6875rem) in All Caps with +0.05em letter spacing for metadata (e.g., timestamps, video durations). This distinguishes data from UI labels.

## 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering**, mimicking physical materials stacked in a dark room.

*   **The Layering Principle:** Stacks should follow a logical progression: `surface` (Base) → `surface_container_low` (Section) → `surface_container_highest` (Interactive Element).
*   **Ambient Shadows:** For floating modals, use a custom shadow: `0px 12px 32px rgba(0, 0, 0, 0.4)`. The shadow must be tinted with the `on_surface` color at 4% opacity to create a natural, atmospheric bleed rather than a "dirty" grey smudge.
*   **The "Ghost Border" Fallback:** If a layout absolutely requires a border for accessibility (e.g., input fields), use the **Ghost Border**: the `outline_variant` token at 15% opacity. Never use 100% opaque borders.
*   **Glassmorphism:** Apply to any overlay that sits above the primary content. Use `surface_bright` at 60% opacity with a `saturate(180%)` filter to maintain color vibrancy behind the blur.

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `label-md` text, 4px radius. 
*   **Secondary:** No fill. `surface_container_highest` background on hover. `Ghost Border` visibility.
*   **Tertiary:** Text-only using `primary` color, no padding, used for inline actions.

### Cards & Lists
*   **Forbidden:** Horizontal divider lines between list items.
*   **Solution:** Use 8px of vertical spacing (`surface-container-low`) or a subtle 2% shift in background brightness on alternate rows to define separation.
*   **Cards:** Use `surface_container_low` with a 6px radius. On hover, transition to `surface_container_high`.

### Input Fields
*   **Style:** Minimalist. No background fill when inactive—only a `Ghost Border`. 
*   **Active State:** The border transitions to a 1px `primary` solid line with a subtle outer glow (2px spread) of the same color at 20% opacity.

### Priority Indicators
*   **High:** `error` (#F59E0B) dot with a 4px "pulse" glow.
*   **Medium:** `inverse_primary` (#60A5FA) dot.
*   **Low:** `outline` (#4B5563) dot.
*   *Note: Indicators should always be accompanied by `label-sm` text for accessibility.*

## 6. Do's and Don'ts

### Do:
*   **Do** use intentional asymmetry in dashboard layouts (e.g., a wide 2/3 column for video content and a narrow 1/3 for metadata).
*   **Do** use `title-sm` for card titles to keep the "dense" professional feel.
*   **Do** utilize `backdrop-blur` on the navigation bar to allow content to peek through as the user scrolls.

### Don't:
*   **Don't** use standard 16px padding everywhere. Experiment with "Tight Padding" (12px or 8px) for data-heavy lists to increase information density.
*   **Don't** use pure black (#000000) for backgrounds. Stick to the `background` token (#131315) to maintain the premium, "inky" depth.
*   **Don't** use rounded corners larger than 8px (`xl`). This system is built on precision and sharpness; overly rounded "bubbly" corners break the pro aesthetic.