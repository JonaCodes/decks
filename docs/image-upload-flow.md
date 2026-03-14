# Flow: Image Upload (Clipboard Paste)

## Purpose

Use this when working on how pasted images get from the user's clipboard into a
Google Slides image placeholder.

## What the flow does

1. User presses Cmd+V in an image field in the sidebar.
2. `ImageField.tsx` captures the paste event, reads the image from
   `clipboardData.items`, and converts it to base64 via `FileReader`.
3. `sendUploadImage(base64, mimeType)` in `bridge.ts` sends an `uploadImage`
   message through `Sidebar.html` → `google.script.run.uploadImage()`.
4. `SlideOps.uploadImage()` in Apps Script:
   - Decodes the base64 into a blob via `Utilities.newBlob` +
     `Utilities.base64Decode`
   - Appends a temporary blank slide to the active presentation
   - Inserts the blob: `tempSlide.insertImage(blob)`
   - Calls `img.getContentUrl()` to get a Google-hosted URL (synchronous within
     `SlidesApp` — no REST API round-trip needed)
   - Deletes the temp slide immediately
   - Returns `{ url: contentUrl }`
5. The URL populates the image field. On submit it flows into the normal
   `insertTemplateSlide` → `_replaceImagePlaceholder` → `asImage().replace(url)`
   path unchanged.

No Drive files are created. The image is embedded in the presentation at
insertion time.

## Main code

- [`public/src/addon/ImageField.tsx`](/Users/jona/Documents/projects/decks/public/src/addon/ImageField.tsx)
  — paste handler, base64 conversion, loading/preview states
- [`public/src/addon/bridge.ts`](/Users/jona/Documents/projects/decks/public/src/addon/bridge.ts)
  — `sendUploadImage` function and `uploadImageResult` handler
- [`addon/Sidebar.html`](/Users/jona/Documents/projects/decks/addon/Sidebar.html)
  — relays `uploadImage` messages to Apps Script
- [`addon/SlideOps.gs`](/Users/jona/Documents/projects/decks/addon/SlideOps.gs)
  — `uploadImage()` function (temp slide + `getContentUrl`)
