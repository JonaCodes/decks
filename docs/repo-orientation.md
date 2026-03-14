# Flow: Repo Orientation

## Purpose

Use this when you are new to the repo and need the shortest path to where things
live.

## Layout

- `addon/`: Google Slides add-on (Apps Script — `Code.gs`, `SlideOps.gs`,
  `Sidebar.html`, clasp config)
- `public/`: Vite app
- `public/src/addon/`: React sidebar UI served inside the add-on iframe
  (`AddonApp`, `TemplateForm`, `ImageField`, `ChatBox`, `bridge.ts`)
- `server/`: Express server, integrations, scripts
- `server/routes/`: Express route handlers (`templates.ts` —
  `POST /api/plan-slides`)
- `server/scripts/`: local entrypoints and one-off scripts (legacy)
- `shared/`: types shared between server and frontend
  (`shared/templates/types.ts`)
- `plans/`: implementation plans, useful for intent but not the source of truth

## Current state

- The Google Slides add-on is the primary flow. Users open the "Decks" sidebar
  inside Google Slides, pick a template, fill fields, and the add-on inserts the
  slide directly into the active presentation.
- `public/src/addon/` is the active React frontend (sidebar UI). The rest of
  `public/src/` (main Vite app) is still unused.
- The old local-script generation flow (`server/scripts/generate-deck.ts`) is no
  longer the focus.

## Read this next

- For Slides work:
  [slides-deck-generation.md](/Users/jona/Documents/projects/decks/docs/slides-deck-generation.md)
- For clipboard image paste:
  [image-upload-flow.md](/Users/jona/Documents/projects/decks/docs/image-upload-flow.md)
