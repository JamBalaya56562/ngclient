# Store the selected theme on the server

Fixes duplicati/duplicati#3851

## Summary
The dark/light theme was saved only in the browser's localStorage. Opening the UI in another browser, a private window or on another machine brought back the default theme, and one server could not be given a different look from another to tell them apart.

- When the user explicitly picks a theme (header toggle or Settings), the choice is also written to the server's existing UI settings store: `PATCH /api/v1/uisettings/ngclient` with `{ "theme": "dark" | "light" }`.
- The authenticated layout reads `GET /api/v1/uisettings/ngclient` when it loads and applies the stored theme over the browser's value.
- If the server has no stored theme, has an unknown value, or the request fails, the browser's own choice is kept. Existing installs therefore look the same until someone picks a theme.
- A theme picked while the server value is still loading is not overwritten.
- No server change is needed: the `/uisettings/{scheme}` endpoints already exist and require authorization.

## Testing
- `ng test ngclient --watch=false --include=projects/ngclient/src/app/layout/layout.state.spec.ts`: 14 passed. With the change reverted (keeping only an empty `loadServerTheme()` so it compiles), 2 fail: the PATCH on selection and the server value taking precedence.
- The new specs assert the outbound `getApiV1UisettingsByScheme` / `patchApiV1UisettingsByScheme` calls, the `dark`/`light` class on the document and the localStorage write. They also cover: no write without an explicit selection, the browser value kept when the server has nothing, has an unknown value or fails, and no overwrite of a selection made during loading.
- `tsc -p projects/ngclient/tsconfig.app.json --noEmit` reports no errors, and Prettier passes on the touched files.
- Not tested end to end against a running server.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
