# Show the folder a shortcut source path points to

Fixes duplicati/duplicati#3519

## Summary
Source paths picked from the special folders are stored as tokens such as `%HOME%`, and the source list on the Source Data step showed only the token. When the server runs as a service the token resolves to the service account's folder (for example `/root`), and the user had no way to see that before saving the job.

This change shows the resolved folder next to the token, e.g. `%HOME% (/root)`, and uses it as the tooltip. It uses the existing `SysinfoState.resolveShorthandPath` (backed by `SpecialFolders` from `/api/v1/systeminfo`). The stored source value is unchanged, and plain paths look the same as before.

The other part of the issue (the error from backing up the job database's journal) is already handled on the server by the blacklisted database paths.

## Testing
- New spec in `source-data.component.spec.ts`: renders a job with `%HOME%` and `/documents/` against a sysinfo whose `SpecialFolders` maps `%HOME%` to `/root`, using the real `resolveShorthandPath`. It checks the row text, the tooltip and that the form value is unchanged. The spec fails without the change (`Received "%HOME%"`) and passes with it (7/7).
- Prettier check on the touched files.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
