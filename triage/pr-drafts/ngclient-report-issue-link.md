Fixes duplicati/duplicati#2259

## Summary
- Adds a "Report an issue" entry to the sidenav, below "Visit forum". It opens https://github.com/duplicati/duplicati/issues/new/choose in a new tab, so the reporter can pick the bug report or the feature request template.
- It is marked up the same way as the existing Documentation and forum links (`action`, `i18n`, external-link suffix icon) and uses the `bug` icon. The build-time `gen:font` step adds that icon to the font.
- Adds `layout.component.spec.ts`, which renders the real layout template and checks the new link's href and target. It also checks that the Documentation and forum links are still there.

## Testing

- Node.js 26 / Bun 1.4.4, on the rebased branch.
- `VITEST_MAX_WORKERS=1 bun run test:ci`: **2376 passed** (full unit suite).
- `tsc --noEmit` for app and spec configurations: passed.
- `bun run build:prod`: passed.

- `node node_modules/@playwright/test/cli.js test e2e/sidebar-navigation.spec.ts`: **5 passed**, against the production build with mocked APIs. E2E type checking also passed.
- Local browser checks used an available port because Windows reserves port 3000; the repository configuration was restored unchanged.

The existing jsdom stylesheet parsing messages were present in the passing unit run.

Based independently on main [ae54d73bf1e5e98fb65dd8060c006f1defc90d01](https://github.com/duplicati/ngclient/commit/ae54d73bf1e5e98fb65dd8060c006f1defc90d01); no predecessor PR is required.
Verified commit: [3d47a88359a8016af20233e99453e5cfd411b541](https://github.com/JamBalaya56562/ngclient/commit/3d47a88359a8016af20233e99453e5cfd411b541).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
