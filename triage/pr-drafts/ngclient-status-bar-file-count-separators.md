Part of duplicati/duplicati#3041

## Summary
The status bar showed file counts as plain numbers, for example `168338 files (255 GB) to go`. Sizes already go through the locale-aware bytes pipe. File counts did not.

This PR formats the file counts with `formatNumber` and the active `LOCALE_ID`, so the text reads `168,338` in English and `168.338` in German. It covers:
- `Counting (N files found, …)`
- `N files (…) to go` for backup, restore and sync
- `Synchronizing secondary destination: N files (…) to go`
- `Files processed X/Y`

I used `formatNumber` with `inject(LOCALE_ID)` rather than `DecimalPipe` because `DecimalPipe` is provided only in `app.config`. The `$localize` placeholders are unchanged, so existing translations keep their message IDs.

This PR addresses item 1 only. Text layout and the other progress-detail behavior are outside its scope, so the issue remains open.

## Testing

- Node.js 26 / Bun 1.4.4, on the rebased branch.
- `VITEST_MAX_WORKERS=1 bun run test:ci`: **2379 passed** (full unit suite).
- `tsc --noEmit` for app and spec configurations: passed.
- `bun run build:prod`: passed.

- `node node_modules/@playwright/test/cli.js test e2e/home-backup-state.spec.ts`: **3 passed**, against the production build with mocked APIs. E2E type checking also passed.
- Local browser checks used an available port because Windows reserves port 3000; the repository configuration was restored unchanged.

The existing jsdom stylesheet parsing messages were present in the passing unit run.

Based independently on main [ae54d73bf1e5e98fb65dd8060c006f1defc90d01](https://github.com/duplicati/ngclient/commit/ae54d73bf1e5e98fb65dd8060c006f1defc90d01); no predecessor PR is required.
Verified commit: [d2b6007344741ca7c80205171b275bd449cac464](https://github.com/JamBalaya56562/ngclient/commit/d2b6007344741ca7c80205171b275bd449cac464).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
