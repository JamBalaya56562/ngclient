Fixes duplicati/duplicati#3694

## Summary
The version picker on the restore page showed the version number, the time and the size. The issue asks for the file count as well, so users who back up removable drives with `--allow-missing-sources` can see which versions contain those files without opening each version.

The fileset list already returns `FileCount`, and `RestoreFlowState` already stores it. This change updates the version picker labels:

- With a count and a size: `0: Oct 1, 2026, 9:00:00 PM (3.15 MB, 1,234 files)`
- With a count but zero size: `(0 files)`
- Without a `FileCount`: only the size, as before

The label is an ICU plural (`1 file` / `N files`, with the count formatted by `DecimalPipe`), so it can be translated. The parentheses sit inside the ICU cases because Prettier would otherwise add spaces around the ICU block. No server change is needed.

## Testing

- Node.js 26 / Bun 1.4.4, on the rebased branch.
- `VITEST_MAX_WORKERS=1 bun run test:ci`: **2376 passed** (full unit suite).
- `tsc --noEmit` for app and spec configurations: passed.
- `bun run build:prod`: passed.

- `node node_modules/@playwright/test/cli.js test e2e/restore-lifecycle.spec.ts e2e/restore-search.spec.ts`: **6 passed**, against the production build with mocked APIs. E2E type checking also passed.
- Local browser checks used an available port because Windows reserves port 3000; the repository configuration was restored unchanged.

The existing jsdom stylesheet parsing messages were present in the passing unit run.

Based independently on main [ae54d73bf1e5e98fb65dd8060c006f1defc90d01](https://github.com/duplicati/ngclient/commit/ae54d73bf1e5e98fb65dd8060c006f1defc90d01); no predecessor PR is required.
Verified commit: [22dcf2c3a50d5c127bb69c9cf36dc33b1bca134c](https://github.com/JamBalaya56562/ngclient/commit/22dcf2c3a50d5c127bb69c9cf36dc33b1bca134c).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
