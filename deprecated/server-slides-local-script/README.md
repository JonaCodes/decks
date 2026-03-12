# Deprecated: server-slides-local-script

## What it did

CLI script that called the Google Slides API directly from the server to copy a
template deck, duplicate slides, fill text and image placeholders, and return a
new deck URL.

## Why deprecated

Replaced by the Google Slides add-on flow (`addon/SlideOps.gs`), which inserts
slides into the active presentation from within Google Slides. The add-on
approach avoids separate OAuth setup and runs as the authenticated user inside
Slides.

## If you want to revive it

Entry point is `scripts/generate-deck.ts`. Add the following to `server/.env`:

```env
GOOGLE_OAUTH_CLIENT_SECRET_PATH=/path/to/oauth-client-secret.json
TEMPLATE_PRESENTATION_ID=your-template-presentation-id
```

Then run the script with `tsx` or compile and execute with Node.

Note: `slides/auth.service-account.ts` documents why service account auth was
abandoned (Drive storage quota issue on service accounts). Use the OAuth user
flow in `slides/auth.ts` instead.
