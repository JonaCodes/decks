# Flow: Repo Orientation

## Purpose

Use this when you are new to the repo and need the shortest path to where things
live.

## Layout

- `addon/`: Google Slides add-on (Apps Script — `Code.gs`, `SlideOps.gs`,
  `Sidebar.html`, clasp config)
- `public/`: Vite app
- `public/src/addon/`: React sidebar UI served inside the add-on iframe
  (`AddonApp`, `TemplateForm`, `ImageField`, `ChatBox`, `EditView`,
  `BrowseView`, `InsertProgress`, `bridge.ts`)
- `server/`: Express server, integrations, scripts
- `server/routes/`: Express route handlers (`templates.ts` —
  `POST /api/sync-templates`)
- `server/scripts/`: local entrypoints and one-off scripts (legacy)
- `shared/`: types shared between server and frontend
  (`shared/templates/types.ts`)
- `prompts/`: slide planner prompt (`slide-planner.ts`), synced template
  definitions (`templates.json`), presenter voice reference (`voice-guide.md`),
  and per-template style examples (`template_examples/`)
- `plans/`: implementation plans, useful for intent but not the source of truth

## Current state

- The Google Slides add-on is the primary flow. Two ways to insert slides:
  1. **Single slide**: pick a template in the sidebar, fill fields, insert.
  2. **Batch from plan**: generate a deck plan with an external LLM using the
     prompt from `prompts/slide-planner.ts`, paste the JSON into the sidebar's
     ChatBox — all slides insert immediately at the end of the presentation.
     The addon enters edit mode where the user can edit text and images
     in place for whichever slide they're viewing, then clicks "Done" to
     finalize.
- `public/src/addon/` is the active React frontend (sidebar UI). The rest of
  `public/src/` (main Vite app) is still unused.
- The old local-script generation flow (`server/scripts/generate-deck.ts`) is no
  longer the focus.

## Read this next

- For Slides work:
  [slides-deck-generation.md](/Users/jona/Documents/projects/decks/docs/slides-deck-generation.md)
- For clipboard image paste:
  [image-upload-flow.md](/Users/jona/Documents/projects/decks/docs/image-upload-flow.md)
