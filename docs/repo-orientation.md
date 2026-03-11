# Flow: Repo Orientation

## Purpose

Use this when you are new to the repo and need the shortest path to where things
live.

## Layout

- `public/`: Vite app
- `server/`: Express server, Sequelize wiring, integrations, scripts
- `server/slides/`: Google Slides generation flow
- `server/scripts/`: local entrypoints and one-off scripts
- `plans/`: implementation plans, useful for intent but not the source of truth

## Current state

- The frontend is unused.
- The server owns most of the meaningful behavior.
- The Google Slides generator is a local POC flow that copies a template deck,
  duplicates template slides, fills placeholders, and returns a generated deck
  URL.

## Read this next

- For Slides work:
  [slides-deck-generation.md](/Users/jona/Documents/projects/decks/docs/slides-deck-generation.md)
