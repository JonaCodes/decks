# Flow: Slides Deck Generation

## Purpose

Use this when working on the Google Slides add-on flow that inserts template
slides into a user's active presentation.

## What the flow does (add-on)

### Single-slide insert

1. User opens the "Decks" sidebar via the add-on menu in Google Slides.
2. The React sidebar UI (`public/src/addon/`) fetches available templates via
   `bridge.ts` → `Sidebar.html` → `google.script.run`, which calls
   `SlideOps.discoverTemplates()` in Apps Script to read template metadata
   directly from the template deck's speaker notes at runtime. Each slide's
   thumbnail is fetched server-side via `UrlFetchApp` (bypassing Google CDN's
   cross-origin 429), encoded as a base64 data URL, and cached for 24 hours via
   `CacheService` — so the browser never makes a direct request to Google's CDN.
3. User picks a template, fills in the fields, and submits. Image fields accept
   a URL or a clipboard paste (Cmd+V) — see
   [image-upload-flow.md](/Users/jona/Documents/projects/decks/docs/image-upload-flow.md).
4. **Insert is fire-and-forget**: the sidebar returns to browse view immediately
   while the insert runs in the background via `useBackgroundInserts`. A small
   loader in BrowseView tracks in-flight inserts and surfaces errors. The
   `title` field value is retained across consecutive manual inserts so users
   don't have to retype it for each slide.
5. `bridge.ts` sends a `postMessage` → `Sidebar.html` → `google.script.run`.
   `SlideOps.gs` finds the matching template slide in the template deck (by
   `template_key` in speaker notes), copies it into the active presentation
   after the currently selected slide, replaces `{{FIELD}}` text placeholders,
   and swaps `slot:field` image placeholders. Each inserted text element is
   tagged with a `field:<name>` description marker so it can be found later for
   batch editing.

### Batch insert from a deck plan

1. Use `prompts/slide-planner.ts` to generate a system prompt, then feed it to
   an external LLM with a topic/objectives. The LLM returns a JSON array of
   planned slides (`type: "template"`), each with `fields` and optional
   `image_suggestions`.
2. Paste the JSON into the ChatBox at the bottom of the sidebar.
3. All slides insert immediately at the end of the presentation
   (`appendToEnd: true`), one after another with no artificial delay.
   Placeholders (text and image) are preserved during insertion for later
   editing.
4. The add-on enters **edit mode**: it polls the current slide and shows
   editable fields for whichever slide the user is viewing. User clicks the
   "Update" button to save changes to the current slide (text and image updates
   apply via `Promise.all`, with loading feedback). Image changes propagate to
   later slides marked `reuse_previous_visual`. When the user clicks "Done",
   remaining placeholders are cleaned up.

### Batch edit inserted slides

1. Select one or more already-inserted template slides in the Google Slides
   filmstrip.
2. Click the pencil icon in the sidebar (shows loading spinner during metadata
   fetch) to enter **batch-edit mode**.
3. `BatchEditOps.getSelectedSlidesMetadata()` reads the selected slides,
   scanning for `field:` and `slot:` description markers left behind during
   insertion, and returns the current values for each field.
4. The sidebar shows a form with unique text field names across the selection.
   If a field has the same value on all slides, it's pre-filled; otherwise, the
   placeholder shows `(mixed)`.
5. Edit fields; click the "Update" button to save changes. All field updates
   across all selected slides are sent via `Promise.all` (button shows loading
   state). Local state updates after server confirms. Errors are shown in an
   alert above the button.
6. Click "Done" to return to browse view.

## Main code

- [`addon/Code.gs`](/Users/jona/Documents/projects/decks/addon/Code.gs) — add-on
  entry point (`onOpen`, `showSidebar`)
- [`addon/SlideOps.gs`](/Users/jona/Documents/projects/decks/addon/SlideOps.gs)
  — core slide-insert logic and `discoverTemplates()` (Apps Script)
- [`addon/SlideHelpers.gs`](/Users/jona/Documents/projects/decks/addon/SlideHelpers.gs)
  — private helpers shared across `SlideOps.gs` and `BatchEditOps.gs`
  (`_parseNoteValue`, `_parseDescription`, `_discoverSlideFields`,
  `_findTemplateSlide`, `_replaceImagePlaceholder`, `_findSlideById`,
  `_removeImagePlaceholder`, `_readSlideFieldValues`)
- [`addon/BatchEditOps.gs`](/Users/jona/Documents/projects/decks/addon/BatchEditOps.gs)
  — batch edit logic (`getSelectedSlidesMetadata()`, `updateSlideFieldText()`)
  (Apps Script)
- [`addon/appsscript.json`](/Users/jona/Documents/projects/decks/addon/appsscript.json)
  — declares the Slides Advanced Service (`enabledAdvancedServices`) and the
  `script.external_request` scope (`UrlFetchApp`) required for thumbnail
  fetching
- [`addon/Sidebar.html`](/Users/jona/Documents/projects/decks/addon/Sidebar.html)
  — iframe wrapper + postMessage bridge
- [`public/src/addon/`](/Users/jona/Documents/projects/decks/public/src/addon/)
  — React sidebar UI (`AddonApp`, `TemplateForm`, `ImageField`, `ChatBox`,
  `EditView`, `BrowseView`, `InsertProgress`, `BatchEditView`, `useInsertPhase`,
  `useBatchEdit`, `useDirtyForm`, `bridge.ts`). `useDirtyForm` tracks form
  state, dirty fields, and reset logic — used by `EditView` and `BatchEditView`
  for the explicit "Update" button flow.
- [`server/routes/templates.ts`](/Users/jona/Documents/projects/decks/server/routes/templates.ts)
  — `POST /api/sync-templates` (writes discovered templates to
  `prompts/templates.json` for use in the planner prompt)
- [`shared/templates/types.ts`](/Users/jona/Documents/projects/decks/shared/templates/types.ts)
  — canonical shared types (`TemplateDefinition`, `PlannedSlide`, `SlideRecord`,
  `ImageSuggestion`, `SlideFieldValue`, `SlideMetadata`, etc.)
- [`prompts/slide-planner.ts`](/Users/jona/Documents/projects/decks/prompts/slide-planner.ts)
  — generates the system prompt for the external LLM slide planner; reads
  `prompts/templates.json` and references `prompts/template_examples/*.md` and
  `prompts/voice-guide.md`
- [`prompts/voice-guide.md`](/Users/jona/Documents/projects/decks/prompts/voice-guide.md)
  — presenter voice/style reference read by the planner's voice-pass subagents
- [`prompts/template_examples/`](/Users/jona/Documents/projects/decks/prompts/template_examples/)
  — per-template style examples read by the planner's voice-pass subagents

## Deployment

Push add-on code to Apps Script via clasp:

```bash
pnpm addon:push                       # main project (Generated Deck - Test)
pnpm addon:deploy <script-id>         # any other presentation's bound script
```

The Stop hook in `.claude/settings.local.json` auto-runs both commands at the
end of every Claude session — no manual push needed during normal development.

The server must be running with HTTPS (mkcert) so the sidebar iframe can reach
it from the Google Slides origin.

## Template deck contract

For each template slide in the template presentation:

- speaker notes must include:
  - `template_key: X` — unique key used to look up the slide
  - `name: My Template Name` — human-readable name shown in the sidebar
  - `description: ...` — shown in the sidebar; supports multiple lines; **must
    be the last field** in the speaker notes
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

- Repo-wide TypeScript may have unrelated errors outside the active flow;
  validate touched files directly if needed.
