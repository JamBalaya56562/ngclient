# Compare a backup run with the previous version from the log

Fixes duplicati/duplicati#4678

## Summary

- A backup's entry in the log view now has a **Compare with previous version** button. This follows the suggestion in the issue thread to link from the log to COMPARE against the previous version.

- When pressed, the button loads the backup's versions (`GET /api/v1/backup/{id}/filesets`). It finds the version this run created by its time, using the new pure function `findBackupVersion`: the version must fall within the run's BeginTime/EndTime with 60 s of slack, and the one closest to BeginTime wins. The button then opens the command editor with `compare <previous> <this>` already filled in. The user still reviews the command and runs it.

- If the run kept no version (for example nothing changed, or retention has since deleted the version), or if it created the oldest version, the entry says so. It does not silently compare two other versions.

- The command editor only accepts `command=compare` with numeric `base`/`target` from the URL, so a link cannot prefill any other command. Editor state URLs (`?state=`) and normal navigation work as before.

- No server change is needed, because COMPARE already runs through the existing commandline API.

## Original regression checks

These checks were recorded before the latest rebase. Current validation follows below.

- `ng test ngclient --watch=false --include=.../general-log.compare.spec.ts --include=.../commandline.component.spec.ts`: 19 passed.

- Without the change, 4 of those tests fail: the link tests, which assert the router URL and the filesets request, and the COMPARE submit test, which asserts the full `postApiV1Commandline` body.

- The neighbouring general-log, pagination and commandline navigation specs pass (25 tests).

- The original component tests use mocked log/fileset times; live verification is recorded below.


## Current validation (2026-11-17)

- `bun run test:ci`: **2472 tests passed**.
- App and spec TypeScript checks passed.
- `bun run build:prod`: passed.
- Production-build Playwright checks passed: `e2e/job-log-pagination.spec.ts`, `e2e/commandline-navigation.spec.ts`, `e2e/commandline-polling.spec.ts`.
- Isolated Duplicati server with two real backup versions: the latest log entry opens `compare` with base 1 / target 0; the oldest entry reports that there is no earlier version.

Head: [`947ea31ffca525c2fafb837240e2bedf7c2710d5`](https://github.com/JamBalaya56562/ngclient/commit/947ea31ffca525c2fafb837240e2bedf7c2710d5).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
