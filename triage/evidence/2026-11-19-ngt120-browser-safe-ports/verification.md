# NGT-120 — browser-safe live proxy allocation

PR: https://github.com/duplicati/ngclient/pull/777
Bookmark: codex/live-browser-safe-ports
Full source SHA: 5e5c800205873bd98046094458c7cac31d118598
Direct parent main: 6cfac9f58d13b31f141404665d9488f8e0d45bbe

## Fix and evidence

検証済み: the original failure in #401 verification used browser proxy port 6697 and stopped before login with ERR_UNSAFE_PORT. The historical log is at ../2026-11-19-five-issue-regressions/issue401/unsafe-port.log.

The browser-facing proxy now binds directly to a random loopback port in 49152–65535, with at most 32 attempts for EADDRINUSE/EACCES. Each unavailable candidate gets a fresh random choice, so contiguous reserved ranges do not consume all attempts by adjacent scanning. Other listen errors propagate. The actual HTTP server keeps the successful port bound; no separate reserve-close-rebind window is added. The backend API reservation remains unchanged, because it is accessed by the proxy/APIRequestContext rather than Chromium.

ドキュメント根拠: Chromium's current standard kRestrictedPorts list is below this range: https://chromium.googlesource.com/chromium/src/+/refs/heads/main/net/base/port_util.cc . The range avoids copying/maintaining that whole list. Current browser acceptance is also observed by the actual Chromium page tests; no protection-bypass flags or duplicate Playwright config were added.

検証済み red: before the allocator change, the same listen behavior was extracted into a helper with default port 0. A deterministic preferred candidate 6697 reproduces actual Chromium ERR_UNSAFE_PORT. Selecting an already occupied candidate fails EADDRINUSE. Result: 2 failed / 1 passed (red.log). A denied contiguous range fault also exposed exhaustion with adjacent scanning (red-range.log). EACCES range denial/exhaustion are deterministic error injections, not claims that an actual OS reservation was observed. One exploratory exhaustion assertion initially counted Node HTTP's own listening handler as leaked; the final test compares against the pre-existing handler count.

検証済み green: five tests cover forbidden low hints, actual occupied candidates with both HTTP servers still usable, non-retryable already-listening errors, injected reserved ranges followed by real browser access, and bounded exhaustion without temporary listener leaks. All five passed (green-ports.log). The helper stays in existing fixture.ts; only fixture-ports.spec.ts is added.

## Main-based verification

Direct mise executables resolved by glob. Source branch code changes only the live fixture/spec, not application code.

- node node_modules/typescript/bin/tsc -p e2e/tsconfig.json — exit 0.
- node node_modules/prettier/bin/prettier.cjs --check e2e/live/fixture.ts e2e/live/fixture-ports.spec.ts — passed.
- bun run build:prod — exit 0 (build.log).
- PLAYWRIGHT_MODE=live node node_modules/@playwright/test/cli.js test fixture-ports.spec.ts --reporter=list — five passed; no .NET server needed for the focused HTTP/browser cases.
- PLAYWRIGHT_MODE=live DUPLICATI_SERVER_PATH=<isolated copied server> node node_modules/@playwright/test/cli.js test --reporter=list --output tmp/ngt120-20261119/base-results — full 14 passed: the nine existing real-server backup/restore/deletion/editor cases plus five new allocator cases (base-live.log).

検証済み: a live systeminfo request recorded Windows Debug / CLR 11.0.0 in runtime.json. The copied net10-targeted Debug assemblies report product version 1.0.0+7111ac741f315e038bbccb5e33fdce29eade8a86, as in the previous immutable copied-server manifest. Child-only DOTNET_ROOT points at mise .NET11 and DOTNET_ROLL_FORWARD=LatestMajor. This is not a net11-targeted rebuild; packaged-release execution and a full frontend unit suite were not performed. Live CI automation remains separate NGT-081 work.

## Relationship to open #771

検証済み: #771 head stayed 7251bc8806ceafebcad1b4f655cd79f401deba68. It adds auth options/restart/disconnect hooks to the same fixture, not a port allocator. A temporary two-parent jj merge with this branch produced one textual conflict because the proxy startup lines are adjacent to #771's expanded use(...) block. This is not a functional/stack dependency, but one PR needs a small rebase after the other lands.

Resolution tested in temporary merge 4c0a260d35c5a7f2bff6ce9b83e5759c28d5d04a: keep await listenOnBrowserSafePort(proxy), followed by #771's full use object with disconnectWebSockets. Do not restore proxy.listen(0).

The temporary combined tree was rebuilt, because #771 includes its backup-list refresh failure-path fix. E2E tsc and production build passed (compat-types.log / compat-build.log). Both real-server auth-reconnect cases selected with --grep 'one failed refresh' passed: WebSocket and long polling, real token expiry, injected refresh 503 then real 200, no page errors/reloads. JSON evidence is attached. Both report CLR 11.0.0.

Afterward the temporary merge was abandoned, #771's bookmark was verified unchanged, and the original main-based production build was restored. Generated-directory moves were checked to remain within the workspace and used native Move-Item; no user data was deleted. A final jj git fetch --all-remotes reported no change, confirming main/source/#771 heads still matched the tested snapshots before publication. PR #777 has one commit directly on main and contains no #771 implementation.

## Cleanup and limits

The source bookmark was pushed to origin; no Issue-closing keyword is needed for internal task NGT-120. PR #777 explains the textual overlap and tested resolution. Existing PR branches, four pinned image refs and the other workspace remain untouched. Generated base and combined builds are kept/restored under ignored tmp/dist for reproducibility. Temporary test servers are isolated; no user jobs are operated. No full default browser or Angular unit suite was run for this test-fixture-only change. Existing NO_COLOR/FORCE_COLOR diagnostics remain in runner output.
