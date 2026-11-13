# NGT-077: WebSocket connection/injector lifetime

Date: 2026-11-14. Status: PUSHED, no PR.

- Bookmark: `codex/websocket-connection-lifecycle`
- Commit: `9872f7cc5c65c4acf1ba691379f785e657498f1a`
- Parent/upstream main: `f217ce91146c6be358f054f32f030e2503ad3005`

## Scope and overlap

検証済み: Fetch returned Nothing changed. Open PRs #716–725 were checked. `jj log -r 'bookmarks() & files("projects/ngclient/src/app/core/services/server-status-websocket.service.ts")'` returned no prepared bookmark modifying this file before the new branch. NGT-074/075/076 change StatusBarState/status components, and #723/#724 concern long polling/task waiters; none is a prerequisite here. Only the WebSocket service and its existing lifecycle spec changed. ServerStateService, status bar, long polling, auth state and generated OpenAPI are unchanged.

ドキュメント根拠: ServerStateService stops transports on logout and switches them in setConnectionMethod. The WebSocket service already has a connection generation guard for old callbacks, but had no injector destruction hook and retained refresh subscriptions after stop/replacement. AppAuthState uses shared refresh requests; unsubscribing this consumer does not claim to abort the shared HTTP request.

## Red -> green (検証済み)

Added eight failing cases to server-status-websocket.service.spec.ts:
- injector destruction closes socket/detaches handlers;
- destruction cancels reconnect and closes the dialog;
- stop releases auth refresh for auth-reply and 4401 paths;
- destruction releases auth refresh for both paths;
- a destroyed service cannot restart via start/reconnect/reconnectIfNeeded;
- replacing a connection releases its old refresh subscription.

`VITEST_MAX_WORKERS=1 bun run test:ci --include '**/server-status-websocket.service.spec.ts'` before the service change: **8 failed / 20 passed**, exit 1 (tmp/ngt077-20261114/red.log). Observations included an unclosed socket, a second socket after destruction, and refresh.observed still true.

The service now registers DestroyRef cleanup through stop(), ends its refresh consumers with takeUntil on stop/replacement, completes that notifier on destruction, and blocks starting/scheduling a destroyed service. Existing generation guards, protocol/subscription handling, five-second retry interval and auth success/error behavior are retained. A ninth positive test covers synchronous refresh completion during reconnect.

Final command:

```text
VITEST_MAX_WORKERS=1 bun run test:ci --include '**/server-status-websocket*.spec.ts' --include '**/service-hub.component.spec.ts' --include '**/app-auth*.spec.ts'
```

**4 files / 68 passed**, exit 0 (green.log). This includes protocol/lifecycle, service-hub and auth regression checks. No temporary Vitest timeout edits were needed.

## Types, production build and browser checks (検証済み)

Direct mise Node/Bun executables were used with their directories on PATH:

- `node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json`: exit 0 (tsc-tsconfig.app.json.log).
- Same command with projects/ngclient/tsconfig.spec.json: exit 0 (tsc-tsconfig.spec.json.log).
- `bun run build:prod`: exit 0 (build.log).
- `bun run test:e2e e2e/authenticated-page.spec.ts e2e/authenticated-login.spec.ts`: **6 passed**, exit 0 (e2e.log), including recovery without reload after rejected socket/transient refresh failure and Remember Me reload checks.
- Prettier --check on both changed files: exit 0 (prettier.log). No dedicated lint target exists in package scripts; no lint-pass claim.

Browser tests use the existing mocked server/WebSocket fixtures and a real Chromium browser against the production build. The initial pass used fixtures; real-server expiry/refresh recovery was subsequently verified in the follow-up below. 未検証: actual users experiencing injector teardown in production; underlying shared HTTP cancellation. The verified defect is resource ownership/cleanup, not a claim that #283 has newly regressed.

## Publication and cleanup

Source branch pushed with `jj git push --remote origin -b codex/websocket-connection-lifecycle`. No PR or Issue comment. Tests/previews exited; no new real server or container was started for this task. Evidence stays ignored under tmp/ngt077-20261114. Existing bookmarks were not changed. Triage records pushed separately.

## Follow-up: isolated real-server token expiry and refresh failure (2026-11-14)

検証済み: No additional product change was needed. The production UI was built from the unchanged implementation commit `9872f7cc5c65c4acf1ba691379f785e657498f1a`, connected to the official Windows **2.4.1.101 Canary (2026-11-07)** server. Only a newly initialized, isolated server-datafolder was used; no user jobs or user authentication data were accessed. Its JWT configuration was set to a one-minute access-token lifetime while the server was stopped, then restarted.

Command: `./tmp/ngt077-20261114/live/run.ps1`, exit **0**. The harness ran two sequential scenarios in separate browser documents. JWT exp-nbf was asserted to be 60 seconds. In both scenarios, an actual request to the real server seven seconds after expiry returned **401**. The test proxy then cut the existing socket to exercise reconnect with the expired token; the real server rejected that authentication with **4401 Invalid token**. This was not an assertion that a still-open socket automatically closes at token expiry.

| Scenario | Refresh HTTP statuses | Recovered socket | Received after reconnect | Reloads |
| --- | --- | --- | --- | --- |
| Expiry only | 200 from real server | 3 | legacystatus, backuplist, notifications | 0 |
| Expiry + one transient failure | injected 503, then real-server 200 | 4 | legacystatus, backuplist, notifications | 0 |

The recovered sockets sent subscriptions for legacystatus, taskcompleted, notifications, serversettings, remotecontrol, backuplist, progress and taskqueue. Actual frame receipt was asserted for the three services above; event delivery for every other subscription was not separately generated. Real server pause/resume operations then produced Running -> Paused -> Running in the same document. The harness asserted unchanged performance.timeOrigin and no browser page errors. Both scenarios ended with `verified`, reloads=0, finalState=Running.

Evidence: `tmp/ngt077-20261114/live/live.log` (browser close codes, frames, subscriptions, 401 probe, refreshes, final assertions), `ws-proxy.log` (injected=true only on the single 503; subsequent refresh injected=false), server logs and live.mjs/proxy.mjs/seed.mjs/run.ps1/live.ps1. JWT values are not printed to the verification logs. The one 503 is deliberate fault injection, not a naturally failing server response; all other authentication and subscription responses are real.

No additional application changes were made after the existing 68 passing unit tests, 6 passing fixture E2E tests, app/spec tsc and production build. Those original logs and source SHA remain unchanged. Injector destruction cleanup is covered by the unit tests, not by this live token-recovery experiment. Service shutdown and token-recovery are distinct checks.

Cleanup: the seed server, test server and proxy were stopped. Evidence and disposable DBs remain ignored under tmp. An initial empty fixture DB prevented setup; only that zero-byte disposable file was removed before successful initialization. No PR or public Issue comment was posted.

