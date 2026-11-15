# Group digits of file counts in the status bar

Fixes duplicati/duplicati#3041

## Summary
The status bar showed file counts as plain numbers, for example `168338 files (255 GB) to go`. Sizes already go through the locale-aware bytes pipe. File counts did not.

This PR formats the file counts with `formatNumber` and the active `LOCALE_ID`, so the text reads `168,338` in English and `168.338` in German. It covers:
- `Counting (N files found, …)`
- `N files (…) to go` for backup, restore and sync
- `Synchronizing secondary destination: N files (…) to go`
- `Files processed X/Y`

I used `formatNumber` with `inject(LOCALE_ID)` rather than `DecimalPipe` because `DecimalPipe` is provided only in `app.config`. The `$localize` placeholders are unchanged, so existing translations keep their message IDs.

The other two points in the issue are left out. The text cut-off was traced to browser caching in the thread, and the "Running" display belongs to the 2018 UI, which has since been replaced.

## Testing
- `ng test ngclient --watch=false --include=projects/ngclient/src/app/core/components/status-bar/status-bar.state.spec.ts`
  - Without the change: 5 of the 23 tests fail, for example `expected '168338 files (800 bytes) to go ' to contain '168,338 files (800 bytes) to go'`.
  - With the change: all 23 tests pass.
- New spec cases cover remaining files, counting, secondary destination sync, the processed counter, and a `de` locale that uses a different separator.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
