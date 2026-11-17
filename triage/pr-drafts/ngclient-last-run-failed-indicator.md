# Show when the last run of a backup failed on the home page

Part of duplicati/duplicati#2764

## Summary
The home page only shows the last *successful* run, so a backup whose latest attempt failed looks the same as a healthy one. The server already records `LastErrorDate` and `LastErrorMessage` when a run fails, and `FolderStatusService.DetermineStatus` treats a job as failed when that error is at least as new as the last finished run.

This PR applies the same rule in the client:

- `getLastRunError()` / `lastRunError` pipe in `last-run.pipe.ts`. It compares `LastErrorDate` with the operation-specific finished key (`LastSyncFinished` for sync jobs, `LastBackupFinished` otherwise). For backup jobs whose metadata predates the finished key, it falls back to `LastBackupDate`.

- On the backup card (regular and externally managed), a red **Last run failed** chip. In the details table's Last run column, a **Failed** chip (hidden while the job is running). Both show the recorded error message as a tooltip.

- Jobs whose latest run completed look exactly as before. No server change is needed.

The yellow "warning" state from the issue is not included. This is a partial implementation, so this PR does not close the issue.

## Original regression checks

These checks were recorded before the latest rebase. Current validation follows below.

- `ng test ngclient --watch=false --include=.../last-run.pipe.spec.ts --include=.../home.component.spec.ts`: 29 passed. New cases cover newer or older error, equal timestamps, missing finished time, the `LastBackupDate` fallback, sync keys, an empty message and an unparsable date.

- New Playwright test `e2e/home-backup-state.spec.ts` › "home last run failure": it checks that only the job whose latest run failed gets the chip, in both views, and that the tooltip shows the error message. It fails without the template/pipe change (`sh-chip.error` not found) and passes with it.


## Current validation (2026-11-17)

- `bun run test:ci`: **2474 tests passed**.
- App and spec TypeScript checks passed.
- `bun run build:prod`: passed.
- Production-build Playwright checks passed: `e2e/home-backup-state.spec.ts`.

Head: [`8fc77558945b6de7ea2ee771e33991090e76787d`](https://github.com/JamBalaya56562/ngclient/commit/8fc77558945b6de7ea2ee771e33991090e76787d).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
