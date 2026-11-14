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
