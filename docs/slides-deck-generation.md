# Flow: Slides Deck Generation

## Purpose

Use this when working on the Google Slides template generator in `server/slides/`.

## What the flow does

1. Copy a template presentation
2. Discover template slides by speaker notes marker
3. Duplicate requested template slides in payload order
4. Replace text placeholders
5. Replace tagged image slots
6. Remove the original template slides

## How to use this flow

1. Define or update templates in [`server/slides/manifest.ts`](/Users/jona/Documents/projects/decks/server/slides/manifest.ts).
   This is where template keys, descriptions, and allowed fields are mapped.
2. Make the matching template slides in Google Slides.
   Add `template_key: X` in speaker notes, `{{FIELD_NAME}}` for text, and `slot:field_name` in image alt-text.
3. Create the slide payload in [`server/scripts/generate-deck.ts`](/Users/jona/Documents/projects/decks/server/scripts/generate-deck.ts).
   The `slides` array is the actual content and final slide order for the generated deck.
4. Run the generator:
   ```bash
   npx tsx server/scripts/generate-deck.ts
   ```
5. Open the returned deck URL.

Main code:

- [`server/slides/auth.ts`](/Users/jona/Documents/projects/decks/server/slides/auth.ts)
- [`server/slides/manifest.ts`](/Users/jona/Documents/projects/decks/server/slides/manifest.ts)
- [`server/slides/discovery.ts`](/Users/jona/Documents/projects/decks/server/slides/discovery.ts)
- [`server/slides/request-builder.ts`](/Users/jona/Documents/projects/decks/server/slides/request-builder.ts)
- [`server/slides/generate.ts`](/Users/jona/Documents/projects/decks/server/slides/generate.ts)
- [`server/scripts/generate-deck.ts`](/Users/jona/Documents/projects/decks/server/scripts/generate-deck.ts)

## Auth model

Active path: local user OAuth.

Not active: service account auth. See [`server/slides/auth.service-account.ts`](/Users/jona/Documents/projects/decks/server/slides/auth.service-account.ts) for why it was parked and the future workaround.

## Required server env

Add these to [`server/.env`](/Users/jona/Documents/projects/decks/server/.env):

```env
GOOGLE_OAUTH_CLIENT_SECRET_PATH=/absolute/path/to/oauth-client.json
TEMPLATE_PRESENTATION_ID=your-template-presentation-id
```

Optional:

```env
GOOGLE_OAUTH_TOKEN_PATH=/absolute/path/to/local-token-cache.json
```

## Google Cloud setup

In one Google Cloud project:

- enable `Google Drive API`
- enable `Google Slides API`
- configure an OAuth consent screen
- create an OAuth client of type `Desktop app`
- if the app is in testing mode, add the developer Google account as a test user

Scopes used by the code:

- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/presentations`

## Template deck contract

For each template slide:

- speaker notes must include `template_key: X`
- text placeholders use `{{FIELD_NAME}}`
- image placeholders use image alt-text description `slot:field_name`

Current manifest:

- Template `A`: `text`, `img_url`
- Template `B`: `text1`, `text2`, optional `text3`

## First run

Run:

```bash
npx tsx server/scripts/generate-deck.ts
```

On first run, the script prints a Google auth URL. Approve access, then copy the final `http://localhost/...` URL from the browser address bar and paste it back into the terminal. The browser page itself is expected to fail to load.

## Known limits

- This is a local POC flow, not a production auth setup.
- The sample script uses a hardcoded payload.
- Repo-wide TypeScript may have unrelated errors outside the Slides flow; validate touched Slides files directly if needed.
