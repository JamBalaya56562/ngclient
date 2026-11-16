Part of duplicati/duplicati#3246

## Summary
- Adds a Download button to the job log, remote log, stored log and live log pages. It saves the entries exactly as the server returned them, as a pretty printed JSON file named after the log kind, the backup and the time (e.g. `duplicati-remote-log-backup-42-2026-11-14T12-00-00.json`). The button is disabled while there is nothing to save.
- What gets saved depends on the page: the job log saves only the page currently shown, and the stored and remote logs save the entries loaded so far. The full database log is not exported. The live log keeps the order shown on screen.
- The remote log page now imports `ShipButton` like the other log pages, so its `shButton` buttons (the new one and the existing Copy button) get the ship button host classes.
- GUI only. The CLI options the issue also asks for (`--export-*-log`) are not part of this PR, so the issue stays open for them. There is no server change.

## Testing

- Node.js 26 / Bun 1.4.4, on the rebased branch.
- `VITEST_MAX_WORKERS=1 bun run test:ci`: **2383 passed** (full unit suite).
- `tsc --noEmit` for app and spec configurations: passed.
- `bun run build:prod`: passed.

- `node node_modules/@playwright/test/cli.js test e2e/job-log-pagination.spec.ts e2e/remote-log.spec.ts e2e/server-logs.spec.ts`: **3 passed**, against the production build with mocked APIs. E2E type checking also passed.
- Local browser checks used an available port because Windows reserves port 3000; the repository configuration was restored unchanged.

The existing jsdom stylesheet parsing messages were present in the passing unit run.

Based independently on main [ae54d73bf1e5e98fb65dd8060c006f1defc90d01](https://github.com/duplicati/ngclient/commit/ae54d73bf1e5e98fb65dd8060c006f1defc90d01); no predecessor PR is required.
Verified commit: [d620ef7f233505c2a4381ca077091d34214159ee](https://github.com/JamBalaya56562/ngclient/commit/d620ef7f233505c2a4381ca077091d34214159ee).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
