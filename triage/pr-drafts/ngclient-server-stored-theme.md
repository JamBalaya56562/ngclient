Fixes duplicati/duplicati#3851

## Summary
The dark/light theme was saved only in the browser's localStorage. Opening the UI in another browser, a private window or on another machine brought back the default theme, and one server could not be given a different look from another to tell them apart.

- When the user explicitly picks a theme (header toggle or Settings), the choice is also written to the server's existing UI settings store: `PATCH /api/v1/uisettings/ngclient` with `{ "theme": "dark" | "light" }`.
- The authenticated layout reads `GET /api/v1/uisettings/ngclient` when it loads and applies the stored theme over the browser's value.
- If the server has no stored theme, has an unknown value, or the request fails, the browser's own choice is kept. Existing installs therefore look the same until someone picks a theme.
- A theme picked while the server value is still loading is not overwritten.
- No server change is needed: the `/uisettings/{scheme}` endpoints already exist and require authorization.

## Testing

- Node.js 26 / Bun 1.4.4, on the rebased branch.
- `VITEST_MAX_WORKERS=1 bun run test:ci`: **2381 passed** (full unit suite).
- `tsc --noEmit` for app and spec configurations: passed.
- `bun run build:prod`: passed.

- `node node_modules/@playwright/test/cli.js test`: **194 passed**, against the production build with mocked APIs. E2E type checking also passed.
- Local browser checks used an available port because Windows reserves port 3000; the repository configuration was restored unchanged.
- Updated the browser API fixture for GET/PATCH UI settings after both existing theme tests failed on unexpected requests. Added checks that server preferences override fresh browser preferences without being written back. The full E2E suite then passed.

The existing jsdom stylesheet parsing messages were present in the passing unit run.

Based independently on main [ae54d73bf1e5e98fb65dd8060c006f1defc90d01](https://github.com/duplicati/ngclient/commit/ae54d73bf1e5e98fb65dd8060c006f1defc90d01); no predecessor PR is required.
Verified commit: [fab37158bba905a991840010f34578a2a356f6f0](https://github.com/JamBalaya56562/ngclient/commit/fab37158bba905a991840010f34578a2a356f6f0).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
