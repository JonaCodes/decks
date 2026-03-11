# Presentation Builder — Design Spec

## Note

This is an overview doc. The full design doc is here:
`/Users/jona/.claude/plans/dreamy-forging-sparrow.md` - read this as well

## Problem

Creating presentations with custom-styled slide templates is tedious in existing
tools. The user has specific templates with particular formatting (mixed-color
text, positioned elements, branded images, progressive reveal animations) that
need to be reusable and quick to populate.

## Solution

A web-based presentation builder with:

- A visual template editor (DOM-based canvas with snap-to-grid)
- Template instantiation into presentation slides with direct on-canvas editing
- Presentation placeholders (e.g. logo) that update across all slides at once
- A fullscreen presentation mode with progressive element reveal

## Data Model

### presentations

| Column     | Type       | Notes            |
| ---------- | ---------- | ---------------- |
| id         | INTEGER PK | auto-increment   |
| name       | STRING     | required         |
| user_id    | INTEGER FK | references users |
| created_at | TIMESTAMP  |                  |
| updated_at | TIMESTAMP  |                  |

### slides

| Column           | Type       | Notes                        |
| ---------------- | ---------- | ---------------------------- |
| id               | INTEGER PK | auto-increment               |
| presentation_id  | INTEGER FK | CASCADE delete               |
| template_id      | INTEGER FK | nullable, SET NULL on delete |
| order            | INTEGER    | default 0                    |
| background_color | STRING     | default '#ffffff'            |
| created_at       | TIMESTAMP  |                              |
| updated_at       | TIMESTAMP  |                              |

### slide_templates

| Column      | Type       | Notes            |
| ----------- | ---------- | ---------------- |
| id          | INTEGER PK | auto-increment   |
| name        | STRING     | required         |
| description | TEXT       | nullable         |
| metadata    | JSONB      | default {}       |
| user_id     | INTEGER FK | references users |
| created_at  | TIMESTAMP  |                  |
| updated_at  | TIMESTAMP  |                  |

### slide_elements

| Column        | Type       | Notes                                                   |
| ------------- | ---------- | ------------------------------------------------------- |
| id            | INTEGER PK | auto-increment                                          |
| slide_id      | INTEGER FK | nullable, CASCADE                                       |
| template_id   | INTEGER FK | nullable, CASCADE                                       |
| type          | ENUM       | text, split_color_text, shape, image, placeholder_image |
| x, y          | FLOAT      | position in 1920×1080 space                             |
| width, height | FLOAT      | size                                                    |
| rotation      | FLOAT      | degrees                                                 |
| reveal_order  | INTEGER    | nullable (null = always visible)                        |
| properties    | JSONB      | type-specific styling and content                       |
| z_index       | INTEGER    | layering                                                |
| created_at    | TIMESTAMP  |                                                         |
| updated_at    | TIMESTAMP  |                                                         |

Constraint: exactly one of slide_id or template_id must be non-null.

### presentation_placeholders

| Column          | Type       | Notes           |
| --------------- | ---------- | --------------- |
| id              | INTEGER PK | auto-increment  |
| presentation_id | INTEGER FK | CASCADE         |
| placeholder_key | STRING     | e.g. "logo"     |
| image_src       | TEXT       | URL or data URI |
| created_at      | TIMESTAMP  |                 |
| updated_at      | TIMESTAMP  |                 |

Unique constraint on (presentation_id, placeholder_key).

## Element Types

### text

`properties: { content, fontSize, fontWeight, fontFamily, color, textAlign }`

### split_color_text

`properties: { text1, text2, color1, color2, fontSize, fontWeight, fontFamily }`
Two text segments rendered inline with different colors.

### shape

`properties: { borderRadius, backgroundColor, borderColor, borderWidth, shadow }`

### image

`properties: { src, objectFit, borderRadius, shadow }`

### placeholder_image

`properties: { placeholderKey, objectFit, borderRadius, shadow }` Resolves
actual image from presentation_placeholders table by key.

## UI Architecture

Google Slides-inspired layout: left slide panel, center 16:9 canvas, right
composable property panel, top toolbar.

Canvas uses 1920×1080 internal coordinate space with CSS scale transform.
Elements are absolutely-positioned DOM nodes. react-moveable handles
drag/resize/rotate/snap.

Property widgets are composable: ColorPicker, TextFormatting, Border, Shadow,
Image, Position, RevealOrder, ZIndex. Each element type declares which widgets
apply.

## Progressive Reveal

- `reveal_order = null` → always visible
- `reveal_order = N` → revealed on Nth click in presentation mode
- `properties.revealEffect = "appear"` (v1), extensible to slide_in, fade, etc.
- Forward: reveal next element, or advance slide if all revealed
- Backward: hide last revealed, or go to previous slide fully revealed

## Key Libraries

- **react-moveable** (new) — drag, resize, rotate, snap-to-grid, group selection
- **Mantine 8** (existing) — UI chrome
- **Framer Motion** (existing) — reveal animations
- **MobX** (existing) — editor state management

## Architectural Decisions

1. **Bulk save** — editor sends full presentation state, not granular element
   CRUD
2. **Command pattern for undo/redo** — discrete command objects, created at
   gesture end
3. **Single editor component** — shared between template and presentation modes
4. **JSONB properties** — flexible schema, TypeScript for frontend type safety
5. **1920×1080 canvas space** — resolution-independent, CSS scaled to viewport
