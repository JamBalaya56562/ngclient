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

Browser tests use the existing mocked server/WebSocket fixtures and a real Chromium browser against the production build. 未検証: a new real-server token-expiry or network-loss experiment for this commit; actual users experiencing injector teardown in production; underlying shared HTTP cancellation. The verified defect is resource ownership/cleanup, not a claim that #283 has newly regressed.

## Publication and cleanup

Source branch pushed with `jj git push --remote origin -b codex/websocket-connection-lifecycle`. No PR or Issue comment. Tests/previews exited; no new real server or container was started for this task. Evidence stays ignored under tmp/ngt077-20261114. Existing bookmarks were not changed. Triage records pushed separately.
