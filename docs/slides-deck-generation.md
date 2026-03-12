# Flow: Slides Deck Generation

## Purpose

Use this when working on the Google Slides add-on flow that inserts template
slides into a user's active presentation.

## What the flow does (add-on)

1. User opens the "Decks" sidebar via the add-on menu in Google Slides.
2. The React sidebar UI (`public/src/addon/`) fetches available templates from
   `GET /api/templates` on the Express server.
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
  — core slide-insert logic (Apps Script)
- [`addon/Sidebar.html`](/Users/jona/Documents/projects/decks/addon/Sidebar.html)
  — iframe wrapper + postMessage bridge
- [`public/src/addon/`](/Users/jona/Documents/projects/decks/public/src/addon/)
  — React sidebar UI (`AddonApp`, `TemplateForm`, `ChatBox`, `bridge.ts`)
- [`server/routes/templates.ts`](/Users/jona/Documents/projects/decks/server/routes/templates.ts)
  — `GET /api/templates`, `POST /api/plan-slides` (stub for future LLM slide
  planning from the chat box)
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

- speaker notes must include `template_key: X`
- text placeholders use `{{FIELD_NAME}}`
- image placeholders use image alt-text description `slot:field_name`

Current manifest (`server/slides/manifest.ts`):

- Template `A`: `text`, `img_url`
- Template `B`: `text1`, `text2`, optional `text3`

## Required server env

Add these to [`server/.env`](/Users/jona/Documents/projects/decks/server/.env):

```env
TEMPLATE_PRESENTATION_ID=your-template-presentation-id
```

## Auth model

The add-on runs inside Google Slides as the authenticated user — no separate
OAuth setup is needed for the add-on itself.

Not active: service account auth and local user OAuth (used by the old
local-script flow). See
[`deprecated/server-slides-local-script/slides/auth.service-account.ts`](/Users/jona/Documents/projects/decks/deprecated/server-slides-local-script/slides/auth.service-account.ts)
for why service account auth was parked.

## Legacy: local-script flow

These files have been moved to `deprecated/server-slides-local-script/`. See the
README there for details on how to revive the flow if needed.

## Known limits

- `POST /api/plan-slides` is a stub — LLM-based slide planning from the chat box
  is not yet implemented.
- Repo-wide TypeScript may have unrelated errors outside the active flow;
  validate touched files directly if needed.
