# NGT-041 / #283 — real-server recovery coverage and failed list refresh fix

PR: https://github.com/duplicati/ngclient/pull/771 — Closes #283.
Source: 7251bc8806ceafebcad1b4f655cd79f401deba68, direct parent main 6cfac9f58d13b31f141404665d9488f8e0d45bbe. No pending backend implementation dependency. feat/skip-next-scheduled-run shares backups.state.ts but only adds a separate method; it does not modify getBackups. No open PR duplication was found before publishing.

## Verified behavior

検証済み: the four new cases use production UI and isolated real servers. Each server creates its own JWT configuration, is stopped before its disposable SQLite JWT row is changed to a one-minute access lifetime, and is restarted. The CLI token-duration option controls refresh lifetime, so it is not used to shorten access tokens. Each test asserts exp-nbf=60 and waits for an actual server-side HTTP 401 for the original token; browser time and token contents are not forged.

WebSocket is enabled for two cases and disabled through the real API-extension server option for the other two. Only one refresh HTTP 503 is injected in each transient case, using Playwright routing. Successful login/refresh, WebSocket authentication/subscription messages and status polling all reach the server. No fake successful auth/status response is used.

All four final cases passed: normal expiry gives refresh [200], transient refresh failure gives [503,200]. WebSocket reconnects receive legacystatus, backuplist and notifications on the new socket; server rejection is observed through failed authentication/4401. Long polling opens zero WebSockets, observes real status 401, then receives successful updates. Admin Pause/Resume changes reach the same browser document; performance.timeOrigin stays identical. Final JSON evidence records zero page errors and zero reloads for every case.

## Actual bug exposed and red → green

検証済み: the first full run had 12 passing cases and one failure, longpoll/transient, because pageerror contained Object even though reconnect and Pause/Resume already worked. Its trace showed concurrent GET serverstate and GET backups?orderBy=id returning 401, then the injected refresh 503, followed by the uncaught Object event. The failed trace remains locally at tmp/live-reconnect283-20261118/results/auth-reconnect-longpoll-re-41fdf-d-refresh-without-reloading-chromium/trace.zip; it is not published because traces can contain disposable auth tokens.

A focused unit test reproduced the missing getBackups error handling and immediate retry being blocked by the failed request's timestamp: 1 failed / 5 passed before implementation (red-unit.log). The six-line getBackups change catches the already-reported HTTP failure, keeps the last list, restores the earlier timestamp if this remains the latest request, and completes without an unhandled error. It does not add a retry loop or change transport retry timing. The unit asserts the previous list/loading state and a successful subsequent fetch.

After the fix, the related four unit files passed all 67 tests, and the whole live suite passed all 13 cases, including the existing nine backup/restore/deletion/editor cases. See unit.log and live.log. This is a scoped production failure-path fix plus E2E coverage, not a test-only PR.

## Commands and provenance

Direct mise binaries resolved by glob; no mise exec/shim.

- bun run test:ci --include=**/backups.refresh.spec.ts — red: 1 failed / 5 passed.
- bun run test:ci --include=**/server-status-websocket*.spec.ts --include=**/server-status-longpoll.service.spec.ts --include=**/backups.refresh.spec.ts — green: 4 files, 67 passed.
- node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json — exit 0.
- node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json — exit 0.
- node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json — exit 0.
- bun run build:prod — exit 0, Application bundle generation complete (build.log).
- node node_modules/prettier/bin/prettier.cjs --check README.md e2e/live/fixture.ts e2e/live/auth-reconnect.spec.ts projects/ngclient/src/app/core/states/backups.state.ts projects/ngclient/src/app/core/states/backups.refresh.spec.ts — passed.
- PLAYWRIGHT_MODE=live DUPLICATI_SERVER_PATH=<isolated-server-executable> node node_modules/@playwright/test/cli.js test --reporter=list --output tmp/live-reconnect283-20261118/green-results — 13 passed.

検証済み: systeminfo reports Debug 1.0.0.0 and CLR 11.0.0 in all final case JSONs. Server DLL product version is 1.0.0+7111ac741f315e038bbccb5e33fdce29eade8a86; manifest copied from the immutable copied-server provenance record. The assemblies target net10.0 and run with child-only DOTNET_ROOT pointing to mise .NET11 and DOTNET_ROLL_FORWARD=LatestMajor. They were not rebuilt for net11. Packaged-release execution of the new spec and exact clean build-source correspondence are 未検証.

Existing mocked authenticated-login coverage remains unchanged. Existing manual evidence was under tmp/reconnect283 and tmp/ngt077-20261114/live. New permanent tests reuse the single root Playwright configuration. The fixture's default options retain existing behavior; all nine default live cases passed after the extension. No new config or backend endpoint was added.

Vitest startup limits were temporarily extended locally, then restored byte-for-byte; START_TIMEOUT=6e4 / WORKER_START_TIMEOUT=9e4 confirmed. Only related unit tests were run, not the whole frontend unit suite. Live CI automation remains separate NGT-081 work. Logs may contain existing NO_COLOR/FORCE_COLOR or CSS diagnostics; no claim of a warning-free global suite is made.

## Maintenance interleaved at the user's request

PR #770 merged and #215 closed as completed. Its head was verified as an ancestor of main; codex/live-delete-versions was deleted locally and on origin. Fork main was updated to 6cfac9f58d13b31f141404665d9488f8e0d45bbe. Five backend-waiting implementation branches and triage were rebased and pushed without conflicts; all local/origin heads were compared equal. Four pinned evidence/image refs and the claude-fixes workspace were preserved. Commits required by main history were retained, not physically pruned. All five branches were not individually rebuilt in that maintenance; validation above applies to the #283 branch.

Test servers are isolated by random ports, passwords and data directories. No user jobs are touched. Fixture teardown stopped all task servers; matching process count was zero after the final run. Raw artifacts stay ignored under tmp/live-reconnect283-20261118.
