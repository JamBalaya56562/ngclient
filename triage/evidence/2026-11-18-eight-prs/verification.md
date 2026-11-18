# Eight independent PRs prepared from triage (2026-11-18)

Base: upstream/main e632fdd59a5bef4c6791612918de0c53c93ced9c. The GitHub API still reported this SHA immediately before final browser verification. Existing open ngclient PR: #757 only; it changes Playwright dependencies rather than these feature files. Existing backend-dependent branches were not published or rewritten.

## Verification and limitations

- Verified: every implementation bookmark is an independent child of main; no stack parent is included. Per-branch full unit, app/spec/e2e TypeScript and production build results are in results.json and the corresponding logs.
- Executed by validate.ps1 using the mise-managed Node/Bun executables: `tsc --noEmit -p projects/ngclient/tsconfig.app.json`, `tsc --noEmit -p projects/ngclient/tsconfig.spec.json`, `tsc --noEmit -p e2e/tsconfig.json`, `bun run test:ci`, `bun run build:prod`. Changed files were formatted with Prettier. This repository has no lint script; no ESLint success is claimed.
- Local Vitest worker startup limits were temporarily extended in the installed node_modules package because of startup load. The original file is restored at cleanup; no dependency or timeout patch is committed.
- Existing jsdom `Could not parse CSS stylesheet` output remains. The production builds completed. These records do not claim warning-free output.
- browser.ps1 temporarily selects an available browser and isolated preview port in the single root Playwright configuration, then restores its original bytes. No second configuration is committed. Feature checks used Edge157; changelog/deletion/final database-choice checks also used Chromium159. The old Edge popup failure and the successful Chromium159 rerun are both retained; dependency correction belongs to existing #757.
- The live fixture used the packaged 2.4.1.101 Canary executable in an isolated server-datafolder. Database verification logs also record systeminfo.ServerVersion/ServerVersionName. Its embedded source commit is unverified. No existing user jobs were accessed. Fixture-owned server processes are stopped in finally blocks.

## Scope and red/green evidence

- NGT-107: update notifications request the available update's changelog, while ordinary navigation requests the installed version. Five contract tests failed before the route/query implementation; full suite passed afterward. Query changes cancel obsolete loads. Existing markdown conversion is intentionally unchanged.
- NGT-108: shared CLI databases cannot be selected for deletion, and an unavailable ownership check keeps the database. Two new tests failed before the guard; full suite and five deletion browser cases passed afterward. Remote-size reporting remains separate work.
- NGT-104: the suspected keyboard re-expansion bug did not reproduce in current-main unit/DOM checks. Two regression tests cover loaded and empty folder reopening, focus and unchanged selection. This is test coverage, not a claimed production bug fix or whole-browser audit.
- NGT-080: command and metadata fields use Angular22's public compatForm/FormField APIs with nullable-text adapters. Reactive controls remain the source of truth, preserving command generation and URL state. Full unit/build and browser argument/edit/failure/Back behavior passed. Refs #497 only: other forms and broader migration remain.
- NGT-110: only new unencrypted remote Backup saves require explicit confirmation. Cancellation, duplicate clicks, stale callbacks and disposal are guarded. Existing/encrypted/local/Sync saves retain their flow. Two regression cases failed before implementation; five added cases and full suite passed afterward. Weak/generated passwords, encryption changes and source-path checks remain separate work.
- NGT-109: after successful destination testing, an existing CLI database can be reused, rejected or canceled. Four component tests failed before implementation. Live testing then exposed a missing `existingdb=true` query: sending DBPath in the body alone resulted in a different saved path. A dedicated query assertion failed (1 failed / 35 passed), then was fixed and the full suite passed. Sync skips lookup, and changing to Sync prevents submitting a previously selected versioned database. Existing jobs skip lookup. The backend performs the authoritative URI-to-database lookup; no new API is introduced.
- NGT-071: the console Connect control is a native RouterLink anchor. With a real duplicati provider option in the fixture, restoring the main button produced 1 failed / 2 passed; the anchor passes, including modified-click and unchanged destination assertions. No state-changing or disabled action is converted.
- NGT-082: the existing live suite gains one wizard-created AES job; its existing API-prepared cases are retained. All six real-server cases passed, including direct restore and wrong/empty passphrase recovery. Restored UTF-8/binary bytes match the originals after sources are changed. Refs #273 only: CI server pinning/automatic live execution remains NGT-081.

## New observations kept separate

- NGT-116 / INVESTIGATE: available changelog text displayed an Angular SafeValue diagnostic suffix in the browser. Both main and this branch use the same bypassSecurityTrustHtml(...).toString conversion. The route fix leaves it unchanged; the new browser check asserts the heading prefix and exact requested source flags. A standalone main browser reproduction and regression fix remain unverified.
- NGT-117 / INVESTIGATE: cold navigation directly to deletion rendered a blank job name and requested filesystem validation with no path. The unchanged deletion component depends on the shared backup list; visiting Home first is the normal tested path. This was observed on the NGT-108 artifact, not independently reproduced on pure main. Keep its loading issue separate from the new ownership guard.

## Reproduction helpers

Local helper originals and cached per-branch builds are in ignored `tmp/eight-prs-20261118/`. `validate.ps1` performs full checks; `browser.ps1` restores configuration in finally; `database-live.ps1` plus `database-live.spec.ts` creates a tiny CLI backup and verifies reuse/deletion protection using an isolated fixture. `live-roundtrips-browser.log` records all six existing/new live restore cases. These are verification tools, not additional permanent Playwright configurations.

Angular API reference (documentation evidence): https://angular.dev/api/forms/signals/compat/compatForm and https://angular.dev/api/forms/signals/FormField .

## Final live database result

Verified: systeminfo reported `2.4.1.101 - 2.4.1.101_canary_2026-11-07`; the CLI backup exited 0. API lookup found its registry entry. UI reuse saved the identical DBPath and a fresh GET confirmed it; `isdbusedelsewhere` returned `inuse: true`. The deletion checkbox was disabled, its warning visible, and the DELETE requested `delete-local-db=false`. Afterward, the job was absent from the real backups list, SQLite bytes matched their before value and remote filenames were unchanged. The corrected verification test passed (1 passed). Earlier failures from helper selectors, BOM handling and incorrect expected GET status are not product regressions. See logs/database-live.log.

## Final checked heads

| Task | Bookmark | Full SHA | Unit tests | App/spec/E2E types | Production |
|---|---|---|---|---|---|
| NGT-107 | codex/update-changelog-source | 38cc098a8bae72387bc555eee24a65d4a34a9a6b | 2531 passed | pass | pass |
| NGT-108 | codex/guard-shared-database-deletion | 609a99e89fb36fd5b439367c2ba3d2a11c047cbc | 2528 passed | pass | pass |
| NGT-104 | codex/file-tree-reexpansion-coverage | 7fca959926889cf082015a209f3ba2c11118dc67 | 2528 passed | pass | pass |
| NGT-080 | codex/command-editor-signal-fields | c935b0836bab310a7a426f2eff9f15231fc1870b | 2527 passed | pass | pass |
| NGT-110 | codex/remote-encryption-save-confirmation | e5add38be8e8e739b141787b4b9171d5f5219379 | 2531 passed | pass | pass |
| NGT-109 | codex/reuse-existing-local-database | af3626f30666828803d76931f649701d6c4e1e39 | 2533 passed | pass | pass |
| NGT-071 | codex/native-console-connection-link | 1e042d69cdcb07676911a69f46475ff70dee68b4 | 2527 passed | pass | pass |
| NGT-082 | codex/live-backup-wizard-roundtrip | 9b53c5c762e0a7a93a9a5200049b86975768248f | 2526 passed | pass | pass |

