## Summary

The restore-group browser test snapshots the total number of listing requests as soon as a version-listing request has arrived. The component can still issue a normal read for a saved file while the new version renders, so the later equality check fails depending on timing.

On unmodified main, ten repetitions of both test cases produced 8 failures and 12 passes. Each failure expected three requests but received four; the additional request was for `/data/old-one.txt`, not the virtual `/data/` group.

Assert the actual contract after inspecting the restore payload: listing requests may only contain real saved source paths, never a virtual group or an invented parent prefix. Keep the existing exact-version, selected-file and recursive-folder restore assertions. This changes only the test, with no retries, added delays or production changes.

## Testing

- Node.js 26 / Bun 1.4.4, on the rebased branch.
- `VITEST_MAX_WORKERS=1 bun run test:ci`: **2374 passed** (full unit suite).
- `tsc --noEmit` for app and spec configurations: passed.
- `bun run build:prod`: passed.

- `node node_modules/@playwright/test/cli.js test e2e/restore-file-groups.spec.ts --repeat-each=20`: **40 passed**, against the production build with mocked APIs. E2E type checking also passed.
- Local browser checks used an available port because Windows reserves port 3000; the repository configuration was restored unchanged.

The existing jsdom stylesheet parsing messages were present in the passing unit run.

Based independently on main [ae54d73bf1e5e98fb65dd8060c006f1defc90d01](https://github.com/duplicati/ngclient/commit/ae54d73bf1e5e98fb65dd8060c006f1defc90d01); no predecessor PR is required.
Verified commit: [8e3bbc612a42134c71c6d7bdf809845fd72e1457](https://github.com/JamBalaya56562/ngclient/commit/8e3bbc612a42134c71c6d7bdf809845fd72e1457).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
