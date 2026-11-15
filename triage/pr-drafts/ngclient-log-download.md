# Add a Download button to the log pages

Part of duplicati/duplicati#3246

## Summary
- Adds a Download button to the job log, remote log, stored log and live log pages. It saves the entries exactly as the server returned them, as a pretty printed JSON file named after the log kind, the backup and the time (e.g. `duplicati-remote-log-backup-42-2026-11-14T12-00-00.json`). The button is disabled while there is nothing to save.
- What gets saved depends on the page: the job log saves only the page currently shown, and the stored and remote logs save the entries loaded so far. The full database log is not exported. The live log keeps the order shown on screen.
- The remote log page now imports `ShipButton` like the other log pages, so its `shButton` buttons (the new one and the existing Copy button) get the ship button host classes.
- GUI only. The CLI options the issue also asks for (`--export-*-log`) are not part of this PR, so the issue stays open for them. There is no server change.

## Testing
- `ng test ngclient --watch=false --include=projects/ngclient/src/app/backup/log/log-download.spec.ts --include=projects/ngclient/src/app/backup/log/remote-log/remote-log.component.spec.ts --include=projects/ngclient/src/app/about/logs/logs-download.spec.ts`: 24 passed. The new specs check the saved blob contents and file name, and that the button is disabled when there is nothing to save. The ship button spec fails without the `ShipButton` import.
- `prettier --check` passes, and `ngc -p projects/ngclient/tsconfig.app.json --noEmit` reports no errors.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
