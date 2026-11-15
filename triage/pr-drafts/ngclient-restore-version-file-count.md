# Show the file count of each version in the restore version list

Fixes duplicati/duplicati#3694

## Summary
The version picker on the restore page showed the version number, the time and the size. The issue asks for the file count as well, so users who back up removable drives with `--allow-missing-sources` can see which versions contain those files without opening each version.

The fileset list already returns `FileCount`, and `RestoreFlowState` already stores it. This change only updates the option template in `select-files.component.html`:

- With a count and a size: `0: Oct 1, 2026, 9:00:00 PM (3.15 MB, 1,234 files)`
- With a count but zero size: `(0 files)`
- Without a `FileCount`: only the size, as before

The label is an ICU plural (`1 file` / `N files`, with the count formatted by `DecimalPipe`), so it can be translated. The parentheses sit inside the ICU cases because Prettier would otherwise add spaces around the ICU block. No server change is needed.

## Testing
- New `select-files.versions.spec.ts` renders the real template, opens the `sh-select` and reads the dropdown options.
  - Before the change: 2 failed, for example `expected '0: Oct 1, 2026, 9:00:00 PM (3.15 MB)' to match /... 1,234 files\)$/`
  - After the change: 2 passed
- The existing `select-files.component.spec.ts` and `select-files.search.spec.ts` pass (36 tests).
- `ng extract-i18n` succeeds and extracts the two new plural messages.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
