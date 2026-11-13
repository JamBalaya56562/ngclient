# NGT-078: Advanced option actions incorrectly exposed as disabled

Date: 2026-11-14. Status: PUSHED, no PR or Issue comment.

- Bookmark: `codex/advanced-options-actions`
- Commit: `20bb08440344732db8390e9306ce4542cf5009a1`
- Parent/upstream main: `f217ce91146c6be358f054f32f030e2503ad3005`
- Independent of existing PRs and prepared bookmarks; no server API dependency.

## Findings and scope

検証済み: Before the change, Add was reported disabled because its containing toggle-card heading had role="button" and aria-disabled="true". Actual coordinate mouse clicks and Tab/Enter could still add an option and save/reload it. This is an incorrect inherited accessibility state, not an inability to save new options.

The permanently open options card now uses a native section/header with its action buttons outside the heading. More actions has a localized accessible name. Option values and serialization are unchanged. No Hidden/System shortcut is restored; #637 awaits a reply to https://github.com/duplicati/ngclient/issues/637#issuecomment-6866136054 .

## Commands and observed output

Direct mise Bun/Node executables were used with the Node/Bun directories on PATH.

- `bun run test:e2e e2e/attribute-exclusions.spec.ts --grep 'adding an attribute'`: before fix, 2 failed at toBeEnabled (Expected enabled / Received disabled). Evidence: `tmp/advanced-option-actions-20261114/red-e2e.log`.
- `bun run test:e2e e2e/attribute-exclusions.spec.ts e2e/advanced-settings-save.spec.ts`: after fix, 7 passed (27.9s). Evidence: `green-e2e.log` in the same directory.
- `VITEST_MAX_WORKERS=1 bun run test:ci --include '**/backup/options/**/*.spec.ts' --include '**/settings/advanced-options-settings/*.spec.ts' --include '**/restore-flow/options/*.spec.ts'`: 8 files / 83 passed (`unit.log`). Known jsdom CSS parsing messages remain.
- `bun run build:prod`: exit 0 (`fixed-build.log`).
- `node node_modules/typescript/bin/tsc --noEmit -p <config>`: app, spec and e2e tsconfigs all exit 0 (individual tsc logs).
- Prettier --check of all four changed files: exit 0 (`prettier.log`). No dedicated lint target was run.

## Isolated real server

検証済み: `live.ps1 baseline` and `live.ps1 fixed` used a real Windows Duplicati 2.4.1.101 Canary server, separate data/source/remote directories, and production UI; no API mocking. Both mouse and keyboard added Hidden/System, saved and reloaded. Fixed UI also edited through More actions, added Archive, then saved/reloaded Hidden,System,Archive. No page errors. Before: Add.enabled=false; after: true. Raw API/DOM evidence is in baseline-events.json / fixed-events.json and baseline-live.log / fixed-live.log under the evidence directory. Screenshots: baseline-mouse.png, baseline-keyboard.png, fixed-mouse.png, fixed-keyboard.png and their final variants. Baseline and fixed mouse screenshots were visually inspected.

未検証: The server binary embedded source SHA and actual NVDA/JAWS speech. Browser accessibility state and real keyboard input were verified.

## Cleanup

検証済み: Own server/proxy processes stopped; ports 8720/8721 no longer listen. Temporary Vitest startup timeout edits restored to original bytes (SHA256 1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD). Evidence and scripts remain ignored under tmp. Existing implementation branches were not changed. Source pushed to origin; no PR created.
