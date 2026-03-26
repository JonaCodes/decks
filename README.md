# decks

## Project Overview

Leverage the Google Drive & Slides APIs to generate presentations from a set of
templates.

Template deck:
https://docs.google.com/presentation/d/1U_8lwC2qfrhDg6wM2CBnWcN9Cfpol9_B7RgeGn7NfSQ/

## Fast start

1. Install dependencies:
   ```bash
   pnpm install
   pnpm --dir public install
   pnpm --dir server install
   ```
2. See `docs/` for project technical details

## Setting up a new slide

- https://script.google.com/
- Get the BACKEND_BASE_URL and TEMPLATE_PRESENTATION_ID from one of the existing
  project's `Project Settings` -> `Script Properties`
- Deploy the addon to the new project using `pnpm addon:deploy <script-id>`

## Notes

- Root `pnpm dev` runs both frontend and backend dev servers.
- OAuth tokens for the Slides flow are cached locally and should not be
  committed.
