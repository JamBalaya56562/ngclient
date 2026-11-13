# NGT-049 / #627: existing-job editor navigation and saving

Date: 2026-11-14. Verified main: `f217ce91146c6be358f054f32f030e2503ad3005`.

## Result

検証済み: No additional application fix was needed for direct navigation and saving from each existing-job editor page. No implementation branch was created and no existing branch changed. This investigation is recorded on triage only. No PR or Issue comment was posted.

ドキュメント根拠: Issue #627 requests direct tabs, a Save button and an optional guided tour. The maintainer explains that existing steps are clickable and Continue saves in edit mode. Current main additionally contains commit `52090bceb4c8b8736ab14eb1af08135bff24c8ae` (Add an explicit save action throughout the existing backup editor), including backup.editor-save.spec.ts and e2e/editor-save.spec.ts. `jj log` and `jj show -r 52090bce --summary` confirmed that history. Open PRs #716–725 and prepared bookmarks were checked; no new duplicate implementation is warranted.

## Real production UI and server

検証済み: A fresh `bun run build:prod` succeeded (exit 0). The resulting main production UI was connected to an isolated Windows Duplicati 2.4.1.101 Canary server. Each server run used a fresh --server-datafolder and test-only source/remote folders, loopback ports 8720/8721. No backup was run, and no existing user job was used. No API mocking.

`tmp/editor627-20261114/live.ps1 verified` exited 0. It changed the description on General, jumped directly to Options without saving first, saved there, and then visited Schedule, Destination, Source Data and General. On every page, Save changes was visible/enabled, PUT succeeded, the URL stayed on the page, and API readback retained the description, destination URL and existing dry-run option. Each page was reloaded afterward; the final General input retained the description. Schedule saving used keyboard Enter; the other save actions used mouse clicks. Output contains five saved-in-place and five reloaded events and completed/errors=[].

Evidence (ignored local files): `tmp/editor627-20261114/verified-live.log`, `events.json`, `general-saved.png`, `options-save-action.png`, `live.mjs`, `live.ps1`. The General screenshot was visually inspected. Server binary embedded source SHA is 未検証.

An unrelated server filesystem listing error occurred while enumerating an old workspace link under the test folders' ancestor tmp directory. This did not prevent any of the five saves/API readbacks/reloads. No general filesystem health or backup/restore operation is claimed here. The log is retained in verified-server-stdout.log / verified-server.log.

## Remaining request and next action

検証済み（画面）: Navigation is still styled as wizard steps; direct links and Save changes already work. A literal tab redesign and guided tour are separate feature requests, not established functional bugs. 未検証: user acceptance of the current discoverability, all optional settings, actual screen-reader speech. Ask whether the current version meets the reporter's editing needs before proposing that the whole Issue be closed. No automatic Fixes/Closes claim.

## Related tests

`bun run test:e2e e2e/editor-save.spec.ts`: 5 passed (22.5s), including save availability on all pages, keyboard single-flight saving, retry after failure, validation navigation and unchanged creation flow. Evidence: e2e.log. Initial sandbox preview/test attempts did not complete and were stopped; subsequent successful tests ran outside the sandbox. Those attempt logs are retained separately. These are existing tests; no artificial red/green claim is made for an unchanged implementation.

検証済み: un run test:ci --include '**/backup/backup.editor-save.spec.ts' with VITEST_MAX_WORKERS=1: 1 file / 8 tests passed (unit.log), exit 0. No temporary Vitest package changes were needed. Production build output is build.log. Own isolated server/proxy processes were stopped in finally; ports 8720/8721 were checked after completion. Application working copy had no changes before switching to triage.
