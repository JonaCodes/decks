# Flow: Slides Deck Generation

## Purpose

Use this when working on the Google Slides add-on flow that inserts template
slides into a user's active presentation.

## What the flow does (add-on)

1. User opens the "Decks" sidebar via the add-on menu in Google Slides.
2. The React sidebar UI (`public/src/addon/`) fetches available templates via
   `bridge.ts` → `Sidebar.html` → `google.script.run`, which calls
   `SlideOps.discoverTemplates()` in Apps Script to read template metadata
   directly from the template deck's speaker notes at runtime. Each slide's
   thumbnail is fetched server-side via `UrlFetchApp` (bypassing Google CDN's
   cross-origin 429), encoded as a base64 data URL, and cached for 6 hours via
   `CacheService` — so the browser never makes a direct request to Google's CDN.
3. User picks a template, fills in the fields, and submits.
4. The sidebar sends a `postMessage` via `bridge.ts` → `Sidebar.html` →
   `google.script.run` (Apps Script).
5. `SlideOps.gs` finds the matching template slide in the template deck (by
   `template_key` in speaker notes), copies it into the active presentation,
   replaces `{{FIELD}}` text placeholders, and swaps `slot:field` image
   placeholders.

## Main code

- [`addon/Code.gs`](/Users/jona/Documents/projects/decks/addon/Code.gs) — add-on
  entry point (`onOpen`, `showSidebar`)
- [`addon/SlideOps.gs`](/Users/jona/Documents/projects/decks/addon/SlideOps.gs)
  — core slide-insert logic and `discoverTemplates()` (Apps Script)
- [`addon/appsscript.json`](/Users/jona/Documents/projects/decks/addon/appsscript.json)
  — declares the Slides Advanced Service (`enabledAdvancedServices`) and the
  `script.external_request` scope (`UrlFetchApp`) required for thumbnail fetching
- [`addon/Sidebar.html`](/Users/jona/Documents/projects/decks/addon/Sidebar.html)
  — iframe wrapper + postMessage bridge
- [`public/src/addon/`](/Users/jona/Documents/projects/decks/public/src/addon/)
  — React sidebar UI (`AddonApp`, `TemplateForm`, `ChatBox`, `bridge.ts`)
- [`server/routes/templates.ts`](/Users/jona/Documents/projects/decks/server/routes/templates.ts)
  — `POST /api/plan-slides` (stub for future LLM slide planning from the chat
  box; `GET /api/templates` removed — templates are now discovered via Apps
  Script)
- [`shared/templates/types.ts`](/Users/jona/Documents/projects/decks/shared/templates/types.ts)
  — canonical shared types used by both server and frontend

## Deployment

Push add-on code to Apps Script via clasp:

```bash
pnpm addon:push
```

The server must be running with HTTPS (mkcert) so the sidebar iframe can reach
it from the Google Slides origin.

## Template deck contract

For each template slide in the template presentation:

- speaker notes must include:
  - `template_key: X` — unique key used to look up the slide
  - `name: My Template Name` — human-readable name shown in the sidebar
  - `description: Short description` — shown in the sidebar
- text placeholders use `{{FIELD_NAME}}` (required) or `{{?FIELD_NAME}}`
  (optional — omitted from the form if not filled in)
- image placeholders use image alt-text description `slot:field_name`

Template metadata is auto-discovered at runtime from these speaker notes by
`SlideOps.discoverTemplates()` — no separate manifest file is needed.

## Required server env

Add these to [`server/.env`](/Users/jona/Documents/projects/decks/server/.env):

```env
TEMPLATE_PRESENTATION_ID=your-template-presentation-id
```

## Auth model

The add-on runs inside Google Slides as the authenticated user

## Known limits

- `POST /api/plan-slides` is a stub — LLM-based slide planning from the chat box
  is not yet implemented.
- Repo-wide TypeScript may have unrelated errors outside the active flow;
  validate touched files directly if needed.
