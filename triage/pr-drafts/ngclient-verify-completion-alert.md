Fixes duplicati/duplicati#1510

## Summary
- The home page "Verify files" action only flashed a success mark when the verify request was accepted. That means the task was queued, not that the verification passed, so the result could only be found in the log.
- `verifyFiles` now waits for the queued task through the existing `ServerStateService.waitForTaskToComplete`, the same way the restore flow does. When the task finishes, it shows a success alert, or an error alert with the task's error message if the task failed or finished with errors in its results.
- Fix the service hub preview so the result is visible when there are no server notifications and is not replaced by an existing notification.
- No server change. `GET /api/v1/task/{id}` already reports `Failed` when the task throws and sets `ErrorMessage` when the results contain errors.

## Testing

- Node.js 26 / Bun 1.4.4, on the rebased branch.
- `VITEST_MAX_WORKERS=1 bun run test:ci`: **2381 passed** (full unit suite).
- `tsc --noEmit` for app and spec configurations: passed.
- `bun run build:prod`: passed.

- `node node_modules/@playwright/test/cli.js test e2e/home-backup-state.spec.ts e2e/home-action-labels.spec.ts e2e/authenticated-page.spec.ts`: **10 passed**, against the production build with mocked APIs. E2E type checking also passed.
- Local browser checks used an available port because Windows reserves port 3000; the repository configuration was restored unchanged.

The existing jsdom stylesheet parsing messages were present in the passing unit run.

Based independently on main [ae54d73bf1e5e98fb65dd8060c006f1defc90d01](https://github.com/duplicati/ngclient/commit/ae54d73bf1e5e98fb65dd8060c006f1defc90d01); no predecessor PR is required.
Verified commit: [e80484104552ed9857712a68bc15aa472e25cced](https://github.com/JamBalaya56562/ngclient/commit/e80484104552ed9857712a68bc15aa472e25cced).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
