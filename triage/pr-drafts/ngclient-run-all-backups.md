Fixes duplicati/duplicati#2330

## Summary
- Adds a **Start all** button to the actions row of "My backups". It is shown only when there is more than one backup.
- Clicking it opens a confirmation dialog, then goes through the existing paused-server check (`resumeDialogCheck`).
- `BackupsState.startBackups(ids)` then sends the existing `POST /api/v1/backup/{id}/start` for each backup, one request at a time, so the server queues them in list order.
- Disabled backups, the running backup and backups already in the scheduler queue are skipped.
- If one start request fails, the remaining backups are still started. The list is refreshed once at the end. A second click is ignored while the button is still sending requests, and the button shows a loading state.
- No server change is needed. Waiting jobs are already shown as Queued on the home list and on the Status page.

Keep the action controls outside the native My backups heading, preserving its accessible name and the existing responsive layout.

## Testing

- Node.js 26 / Bun 1.4.4, on the rebased branch.
- `VITEST_MAX_WORKERS=1 bun run test:ci`: **2380 passed** (full unit suite).
- `tsc --noEmit` for app and spec configurations: passed.
- `bun run build:prod`: passed.

- `node node_modules/@playwright/test/cli.js test e2e/home-backup-state.spec.ts e2e/home-action-labels.spec.ts`: **8 passed**, against the production build with mocked APIs. E2E type checking also passed.
- Local browser checks used an available port because Windows reserves port 3000; the repository configuration was restored unchanged.
- Four existing browser tests caught the new button text becoming part of the heading name. Separating the heading from its actions fixes this; an explicit heading regression was added and the home action/backup E2E checks passed. A full run passed 192 tests and exposed the existing restore-group request-count race, addressed separately in [#739](https://github.com/duplicati/ngclient/pull/739).

The existing jsdom stylesheet parsing messages were present in the passing unit run.

Based independently on main [ae54d73bf1e5e98fb65dd8060c006f1defc90d01](https://github.com/duplicati/ngclient/commit/ae54d73bf1e5e98fb65dd8060c006f1defc90d01); no predecessor PR is required.
Verified commit: [7dc730fee41ee774935a564146adac824322be8b](https://github.com/JamBalaya56562/ngclient/commit/7dc730fee41ee774935a564146adac824322be8b).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
