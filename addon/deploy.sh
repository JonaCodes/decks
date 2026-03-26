#!/bin/bash
# Pushes addon code to another Apps Script project, then restores .clasp.json.
# Usage: pnpm addon:deploy <script-id>
set -e

SCRIPT_ID="$1"
if [ -z "$SCRIPT_ID" ]; then
  echo "Usage: pnpm addon:deploy <script-id>"
  exit 1
fi

ORIGINAL=$(cat .clasp.json)
trap 'echo "$ORIGINAL" > .clasp.json' EXIT

jq --arg id "$SCRIPT_ID" '.scriptId = $id' .clasp.json > .clasp.tmp && mv .clasp.tmp .clasp.json
clasp push
echo "Deployed to $SCRIPT_ID"
