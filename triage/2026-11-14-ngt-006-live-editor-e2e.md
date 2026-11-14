# NGT-006: opt-in isolated real-server editor persistence E2E

Date: 2026-11-14. Status: PUSHED, no PR. This is a first slice of real-server coverage, not completion of #273.

- Bookmark: `codex/live-editor-persistence-e2e`
- Commit: `f2a73b7f33edbfd134d139339e35852a3b123436`
- Parent/latest fetched upstream main: `f217ce91146c6be358f054f32f030e2503ad3005`

## Scope and overlap

検証済み: `jj git fetch --all-remotes` returned Nothing changed. Open PRs #716–725 were checked. The prepared-bookmark file filter for playwright.config.ts, README.md and e2e/live returned no competing change. This branch is independent of NGT-004/079 and NGT-077; application code is unchanged. NGT-031 pause and NGT-032 deletion UI coverage are not repeated. Deleting the test-created job is fixture cleanup, not a new deletion UI test.

A single existing playwright.config.ts now selects e2e/startup/live modes. Default mock E2E and startup measurement retain their existing commands/ports. The optional live mode uses e2e/live and starts no default preview; its worker fixture owns a local Duplicati process and HTTP/WebSocket forwarding proxy. No second config, dependency, package script or CI job is added.

The fixture requires DUPLICATI_SERVER_PATH pointing to a local server executable, not an existing server URL. It creates a fresh server-datafolder, random password, loopback ports and disposable files under Playwright output. It stops its own server/proxy in finally, retains diagnostics, and never recursively deletes user folders. README documents execution, prerequisites and retained data; abrupt runner termination may bypass teardown.

The new test creates a job with no schedule, opens it through the actual Home Edit action, changes Description, jumps to Options, saves using Enter, and checks stored settings through a separate real authenticated API context. Destination/source and dry-run/attribute settings must be retained. It reloads the page, returns to General and checks persistence. There is no route.fulfill or mocked WebSocket; no backup or restore task is run.

## Executed checks (検証済み)

Direct mise Bun/Node executables were used; Node/Bun directories were placed on PATH.

- `node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json`: exit 0 (tmp/ngt006-20261114/tsc.log).
- `bun run test:e2e --list`: default **164 tests / 53 files**, no live spec (default-list.log).
- `PLAYWRIGHT_MODE=startup bun run test:e2e --list`: **10 tests / 1 file**, existing measurement suite (startup-list.log).
- `PLAYWRIGHT_MODE=live bun run test:e2e --list`: **1 test / 1 file** (live-list.log).
- `bun run build:prod`: exit 0 (build.log).
- `PLAYWRIGHT_MODE=live DUPLICATI_SERVER_PATH=<official Windows executable> bun run test:e2e`: **1 passed**, exit 0 (live.log). Windows package metadata reports `2.4.1.101-Canary-20261107+424b1360b0d0767b3a67a874b4d99c92f17a877f`, FileVersion 2.4.1.101 (server-version.json). The test attaches the real API server version to the report.
- Negative configuration check: live mode without DUPLICATI_SERVER_PATH intentionally exits nonzero and reports `Set DUPLICATI_SERVER_PATH ...`, before spawning a server (missing-executable.log). This is expected validation, not a product failure.
- Normal `bun run test:e2e e2e/editor-save.spec.ts e2e/authenticated-page.spec.ts`: **8 passed**, exit 0 (default-smoke.log).
- Prettier --check for all four changed files: exit 0 (prettier.log).

No application bug was changed, so no artificial pre-fix failing test is claimed. Unit suites were not rerun for test/config/documentation-only changes; relevant production browser tests and the E2E type check validate this scope. Startup test selection was checked, but the full performance experiment was not run. Existing CI workflows were not executed locally or modified.

## Evidence / cleanup

Live output was copied before subsequent Playwright runs cleaned test-results: tmp/ngt006-20261114/live-results/live-server-cdQAFk contains server.log, the isolated SQLite database and source/remote fixtures. An offline read-only SQLite check exited 0 with remainingTestJobs=0 and remoteFiles=0 (cleanup.log, check-cleanup.mjs). Process inspection found no Duplicati.Server.exe with this fixture's live-server path after completion. No existing user server/account/job was used. The live test's success includes worker teardown completion.

Source pushed with `jj git push --remote origin -b codex/live-editor-persistence-e2e`. No PR/Issue comment or Fixes #273 claim. Existing implementation bookmarks unchanged; triage records pushed separately.

未検証: running this fixture on Linux/MacOS, full CI execution, external destination backends, encrypted backup/restore round trips, multiple live tests sharing a worker, forced process termination. The first real-server runner and one persistence flow are prepared; add broader backup/restore coverage after this infrastructure is merged, rather than duplicating the launcher across independent branches.

## Follow-up: real backup -> selected-folder restore (2026-11-14)

Status: PUSHED on the same `codex/live-editor-persistence-e2e` bookmark. New commit `fbce07898852c974021b5b6f3a21219bdb62249b`, parent `f2a73b7f33edbfd134d139339e35852a3b123436`. No application code or Playwright configuration change in this follow-up.

検証済み: e2e/live/backup-restore.spec.ts arranges a disposable job through the real API, starts the actual backup from the Home UI, polls the real task to Completed and asserts one fileset plus a remote dlist volume. It then changes both original source files, opens the saved job in Restore, expands/selects Documents, chooses a new fixture-only restore location and submits through the UI. Restore completed is required before examining the destination.

The restored folder contains exactly message.txt and bytes.bin, not sibling unselected.txt. Both buffers must equal their backup-time contents (UTF-8 Japanese/Czech text and binary bytes including 0/255), while the current source text differs. A separate offline evidence check confirms BOTH restored files differ from the changed sources and match the backup-time SHA256 values:

- message.txt: `b9f997c00f9012fc6bd5d576adf12fc67f9593781c95886eeedbd2f1482f3b83`
- bytes.bin: `f607c04ee6f29f9041f5d1dc9062d696fd8f10f75b0205724b1fe1cd124410de`

Commands/results (direct mise binaries; logs under tmp/ngt006-roundtrip-20261114):

- `PLAYWRIGHT_MODE=live DUPLICATI_SERVER_PATH=<same isolated official Windows 2.4.1.101 Canary executable> bun run test:e2e`: **2 passed**, exit 0 (live.log), including the previous editor-persistence case. Real local HTTP/WebSocket traffic, no route mocking.
- `node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json`: exit 0 (tsc.log).
- Prettier --check on the three changed files: exit 0 (prettier.log).
- Default `bun run test:e2e --list`: unchanged **164 tests / 53 files** (default-list.log); the two live cases remain opt-in.
- `bun run build:prod`: exit 0 (build.log).
- `node tmp/ngt006-roundtrip-20261114/verify-evidence.mjs`: exit 0; matching content hashes, remainingJobs=0, backupVolumes=3 (content-and-cleanup.json).

Initial run: the new test timed out waiting five seconds for post-login navigation, although trace showed auth/login=200 and systeminfo=200 taking about four seconds. Both live tests now wait conditionally up to 20 seconds for that navigation. The final two-test run passes. Initial-navigation-timeout.log retains the failed attempt; no application auth fix or artificial product red/green claim is made.

Real jobs/files/server data are confined to the fixture's newly created output directory. Schedule=null; snapshot-policy=off; unencrypted local file backend. The backup/restore job cleanup deletes its own local DB and job settings with delete-remote-files=false. Retained isolated backup volumes provide diagnostic evidence; no user remote data is deleted. Worker teardown stopped its server/proxy; process inspection found no remaining Duplicati.Server.exe carrying this fixture's live-server path. Raw successful artifacts were copied to tmp/ngt006-roundtrip-20261114/live-results before any future Playwright cleanup.

README now distinguishes the settings-only case from the real backup/restore case. This covers local same-OS Windows backup/restore, not cross-OS, encrypted/remote providers, backup creation through every wizard page, or all of #273. No PR/Issue comment; other implementation bookmarks untouched. Source and triage pushed separately.

## Follow-up: AES-encrypted backup and restore (2026-11-14)

Status: PUSHED on the same `codex/live-editor-persistence-e2e` bookmark. Commit `54cdb1ea40726712f31092a122e033fc19bc9124`, parent `fbce07898852c974021b5b6f3a21219bdb62249b`. No application, runner configuration or dependency changes.

The existing round-trip spec is parameterized for unencrypted and AES-encrypted backups, with separate fixture directories and generated job names. The AES case generates a random passphrase, saves it using the server's canonical encryption-module/passphrase setting names, starts the backup through the Home UI and verifies every resulting backup volume ends with .aes. Restore uses the passphrase stored on this isolated job; it does not exercise interactive entry of a forgotten/missing passphrase.

検証済み: Both cases change source text and binary files after successful backup, then restore the selected folder through the UI to a new directory. Exactly message.txt and bytes.bin are restored; both buffers equal the backup-time contents, not the changed sources, and sibling unselected.txt is absent. No API/WebSocket mocking is used. The server is the same official isolated Windows 2.4.1.101 Canary executable used in previous slices.

Commands/results (direct mise executables; evidence under tmp/ngt006-encrypted-20261114):

- `PLAYWRIGHT_MODE=live DUPLICATI_SERVER_PATH=<local executable> bun run test:e2e`: **3 passed**, exit 0 (live.log): unencrypted round trip, AES-encrypted round trip, editor persistence.
- `node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json`: exit 0 (tsc.log).
- Prettier --check on README.md and the shared round-trip spec: exit 0 (prettier.log).
- Default `bun run test:e2e --list`: unchanged **164 tests / 53 files** (default-list.log); live tests remain opt-in.
- `bun run build:prod`: exit 0 (build.log).
- Offline `node tmp/ngt006-encrypted-20261114/verify-evidence.mjs`: exit 0 (content-and-cleanup.json). Both cases have matching expected/restored SHA256 and different changed-source hashes. AES remote storage contains 3 .aes volumes, each beginning with the AES format header. remainingJobs=0.

Initial AES attempt returned HTTP 400 Missing passphrase before any backup. The test had passed --passphrase/--encryption-module names to the configuration API; the existing application serializer uses bare passphrase/encryption-module. Correcting the fixture to the canonical API names resolved this setup error. Initial-setting-name-error.log retains the attempt; no backend/application regression is claimed.

Successful server data and volumes are retained under tmp/ngt006-encrypted-20261114/live-results. Test-created jobs/local backup DBs were removed with delete-remote-files=false; isolated backup volumes are kept as diagnostic evidence. Process inspection found no remaining Duplicati.Server.exe with a live-server fixture path. No user jobs/data were used.

README documents the generated stored passphrase and encrypted-volume checks. Previously unverified encrypted backup/restore is now covered for local same-OS Windows AES with a saved key. Wrong/missing keys, direct restore without saved configuration, Linux/MacOS and other encryption/storage modules remain unverified. No PR, Issue comment or Fixes #273 claim. Triage pushed separately; source bookmark on origin is 54cdb1ea40726712f31092a122e033fc19bc9124.

## Follow-up: encrypted direct restore without saved settings (2026-11-14)

Status: PUSHED on the same `codex/live-editor-persistence-e2e` bookmark. Commit `495e055ee0ff2b0b73faa927bb1779fe1596ed1d`, parent `54cdb1ea40726712f31092a122e033fc19bc9124`. Application and runner configuration remain unchanged.

検証済み: A third mode in the shared round-trip spec creates an AES backup through the real Home Start action, changes original file contents, deletes the original job with delete-local-db=true / delete-remote-files=false, and asserts GET /api/v1/backups returns an empty list. It reloads the app to discard in-memory state, opens Direct restore from backup files, enters the target URL, skips the optional destination probe, and fills the passphrase field on screen. The temporary-job POST must contain exactly that UI-entered passphrase and return an ID different from the original job. The normal UI copytotemp -> restore path runs against the actual server; both temporary IDs are tracked for cleanup.

After selecting Documents and a fresh restore location, Restore completed is required. Exactly message.txt and bytes.bin must be restored; their buffers match the backup-time values, not the changed source files. The unselected sibling is absent. There is no saved job selection, imported configuration, API-supplied restore passphrase, or mocked response in this restore flow. API calls arrange the original backup job, confirm its deletion and clean up only fixture-owned IDs.

Commands/results (direct mise binaries, tmp/ngt006-direct-20261114):

- `PLAYWRIGHT_MODE=live DUPLICATI_SERVER_PATH=<isolated official Windows 2.4.1.101 Canary executable> bun run test:e2e`: **4 passed**, exit 0 (live.log): unencrypted, AES with saved settings, AES without saved settings, editor persistence.
- `node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json`: exit 0 (tsc.log).
- Prettier --check on README.md and the shared spec: exit 0 (prettier.log).
- Default `bun run test:e2e --list`: unchanged **164 tests / 53 files** (default-list.log); live cases remain opt-in.
- `bun run build:prod`: exit 0 (build.log).
- Offline `node tmp/ngt006-direct-20261114/verify-evidence.mjs`: exit 0. All three round-trip directories have matching expected/restored SHA256, changed-source hashes differ, encrypted volumes have AES headers, and remainingJobs=0 (content-and-cleanup.json).

The initial discovery attempt had a duplicate test title and was corrected before server execution (duplicate-title-attempt.log); no product failure is claimed. Successful artifacts were copied to live-results under the evidence directory. Generated passphrases belong only to these disposable fixture backups; no user data/configuration was used. All test-created jobs/local DBs, including the two direct-restore temporary jobs, were cleaned up. Backup volumes remain as ignored diagnostics; delete-remote-files=false throughout. Process inspection found no remaining Duplicati.Server.exe using the live-server fixture path.

README now describes the direct-restore case. Earlier lack of interactive passphrase/direct-restore coverage is superseded by this result. Wrong/missing passphrase recovery, other operating systems/providers and all wizard creation pages remain unverified. No PR/Issue comment or automatic Issue-close claim. Source and triage pushed separately.

## Follow-up: wrong passphrase -> correction -> direct restore (2026-11-14)

Status: PUSHED on `codex/live-editor-persistence-e2e`. Commit `c8c1ca9895099d03a024701988c6310e44453344`, parent `495e055ee0ff2b0b73faa927bb1779fe1596ed1d`. Only the shared live spec and README changed; no application fix was necessary.

検証済み: The new aes-retry mode follows the existing encrypted direct-restore setup (original job/local DB deleted, empty saved-job list, application state reloaded). It enters a newly generated wrong passphrase in the actual screen and verifies the temporary-job request uses that value. The real server can list filesets with that value, but its subsequent only_paths database-repair task fails. The test waits for the **Restore database repair failed** dialog and checks the task error contains decryption/passphrase/password/key wording. At that point there must be zero POST restore requests and the destination directory must still be empty.

Recovery uses UI actions: Cancel the error dialog, browser Back, return through the destination/encryption screens (re-entering the target URL if needed), and type the correct passphrase. A fresh temporary job is created with the corrected value. The same document reaches the file list (unchanged performance.timeOrigin), then selection and actual restore succeed. Exactly one restore request is sent, and only message.txt/bytes.bin are restored, matching the original buffers rather than the changed source. All failed/corrected/copied temporary IDs are tracked and deleted in finally. No API request injects a corrected credential into an existing job and no mocked responses are used.

Checks, direct mise executables, evidence tmp/ngt006-retry-20261114:

- Targeted `PLAYWRIGHT_MODE=live DUPLICATI_SERVER_PATH=<official isolated Windows 2.4.1.101 Canary executable> bun run test:e2e --grep correcting`: **1 passed**, exit 0 (targeted.log).
- Same live command without grep: **5 passed**, exit 0 (live.log): unencrypted, saved-key AES, direct AES, corrected-key direct AES, editor persistence.
- `node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json`: exit 0 (tsc.log).
- Prettier --check on README.md and the shared spec: exit 0 (prettier.log).
- Default `bun run test:e2e --list`: unchanged **164 tests / 53 files** (default-list.log).
- `bun run build:prod`: exit 0 (build.log).
- Offline `node tmp/ngt006-retry-20261114/verify-evidence.mjs`: exit 0. All four round trips have matching expected/restored hashes and different changed-source hashes; encrypted volumes have AES headers; remainingJobs=0 (content-and-cleanup.json).

Initial harness attempts were corrected: a duplicate test title prevented discovery, and an assumption that list-filesets itself would reject the wrong key was false (Success=true). The final test targets the observed repair failure instead. These are test-development observations, not an application bug fix or a product red/green claim. Attempt logs are retained separately.

The successful live-results copy preserves isolated server data, source/restore files and local encrypted volumes. Process inspection found no remaining Duplicati.Server.exe for this fixture. Test-created jobs and temporary jobs were cleaned up, remote deletion remained false, and no user server/data was used. The README explains this recovery scope. Wrong-key recovery is now covered for the tested local Windows AES flow; other providers/OSes and different recovery paths remain unverified. No PR/Issue comment or Fixes #273 claim. Source and triage pushed separately.
