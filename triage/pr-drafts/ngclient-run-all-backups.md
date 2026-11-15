# Add a Start all button to the backup list

Fixes duplicati/duplicati#2330

## Summary
- Adds a **Start all** button to the actions row of "My backups". It is shown only when there is more than one backup.
- Clicking it opens a confirmation dialog, then goes through the existing paused-server check (`resumeDialogCheck`).
- `BackupsState.startBackups(ids)` then sends the existing `POST /api/v1/backup/{id}/start` for each backup, one request at a time, so the server queues them in list order.
- Disabled backups, the running backup and backups already in the scheduler queue are skipped.
- If one start request fails, the remaining backups are still started. The list is refreshed once at the end. A second click is ignored while the button is still sending requests, and the button shows a loading state.
- No server change is needed. Waiting jobs are already shown as Queued on the home list and on the Status page.

## Testing
- `ng test ngclient --watch=false --include=projects/ngclient/src/app/home/home.component.spec.ts --include=projects/ngclient/src/app/core/states/backups.start-all.spec.ts`: 10 passed. With the source change removed, the build fails (`startBackups` does not exist).
- The new home tests use the real `BackupsState` with a stubbed `DuplicatiServer`. They check:
  - after confirming, a start request is sent only for each eligible backup, in list order
  - cancelling sends nothing
  - when there is nothing to start, no dialog opens
- The new state tests check sequential sending, continuing after a failed request, a single refresh at the end, and that a second call is ignored while the first is still running.
- `ngc -p projects/ngclient/tsconfig.app.json --noEmit` passes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
