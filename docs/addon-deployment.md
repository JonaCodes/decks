# Addon Deployment

## Project structure

- `addon/` — Google Apps Script files (`Code.gs`, `SlideOps.gs`,
  `SlideHelpers.gs`, `BatchEditOps.gs`, `Sidebar.html`)
- `addon/.clasp.json` — clasp config pointing to the main GAS project (bound to
  "Generated Deck - Test")
- `public/` — React app loaded in the sidebar as an iframe
- `server/` — Express backend

The sidebar communicates via a postMessage bridge: React iframe ↔ `Sidebar.html`
↔ `google.script.run`.

## Normal development workflow

```bash
pnpm addon:push    # push to the main project (Generated Deck - Test)
```

The Stop hook in `.claude/settings.local.json` runs `pnpm addon:push` and
`pnpm addon:deploy <skills-id>` automatically at the end of every Claude Code
session — no manual push needed for the two active projects.

Works reliably. All features (template discovery, slide insertion, batch
editing) work on this presentation.

## The multi-presentation problem

Copying a Google Slides presentation copies its container-bound script too — but
that copy is frozen at copy time. `clasp push` only updates the original
project. The copy has stale code and no `TEMPLATE_PRESENTATION_ID` in Script
Properties.

Container-bound scripts also cannot be deployed as cross-document Editor
Add-ons.

## What was tried and why it failed

### Bridge-based setup (new handlers in Sidebar.html)

Added `getTemplatePresentationId()` / `setTemplatePresentationId()` to `Code.gs`
and new postMessage handlers to `Sidebar.html`. The handlers for newly added
functions never resolved — bridge calls hung indefinitely. Root cause unclear;
likely GAS HTML service sandboxing.

### Setup form in Sidebar.html using `google.script.run` directly

Moved setup UI into native HTML inside `Sidebar.html`.
`google.script.run.setTemplatePresentationId()` also hung. At this point it
became clear the issue was that the bound script on the copy was stale — changes
to `Sidebar.html` were never live there. Every `clasp push` had been updating
the wrong project.

### Test deployment as Editor Add-on (container-bound project)

The new Apps Script editor's test deployment dialog for Editor Add-ons shows no
Install button and gives no confirmation. Container-bound scripts cannot be
deployed as cross-document add-ons.

### Standalone project + test deployment

Created a new standalone project via:

```bash
clasp create --type standalone --title "Decks"
```

Changed `createMenu` to `createAddonMenu()`, added `onInstall()`. Deployed as
test Editor Add-on. Still no addon appeared under Extensions in Slides. Test
deployments for Editor Add-ons appear silently broken in the current Apps Script
UI — "Manage add-ons" was greyed out.

## Current solution: per-presentation deploy script

Push code directly to any presentation's bound script by temporarily swapping
the script ID in `.clasp.json`:

```bash
pnpm addon:deploy <script-id>
```

`pnpm addon:deploy` (defined in `package.json`) runs
`cd addon && bash deploy.sh`. The script lives at `addon/deploy.sh` and works as
follows: it reads the current `.clasp.json` with `jq`, swaps in the given script
ID, runs `clasp push`, then restores the original `.clasp.json` on exit via a
`trap`. Requires `jq` to be installed.

After deploying, set `TEMPLATE_PRESENTATION_ID` in that project's Script
Properties manually (Apps Script editor > Project Settings > Script Properties).

For the main project, continue using `pnpm addon:push`.

## Future work

### Proper multi-presentation distribution

To use the addon on arbitrary presentations or share with other users, it must
be published to the **Google Workspace Marketplace** (can be unlisted or
domain-internal). This requires:

- A Google Cloud project linked to the Apps Script project
- OAuth consent screen configuration
- Submitting for review (domain-internal deployment can skip public review)

### Architecture consideration

The current approach (`SlidesApp.getUi().showSidebar()`) is the old Editor
Add-on pattern. Google is pushing toward card-based Workspace Add-ons. If
publishing to the Marketplace, evaluate whether to migrate.

### Per-document template IDs

`TEMPLATE_PRESENTATION_ID` is currently a script property (shared across all
invocations of that script). If different presentations ever need different
template decks, switch to `PropertiesService.getDocumentProperties()` instead of
`getScriptProperties()`.
