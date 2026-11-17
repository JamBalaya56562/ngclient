# Mark backed-up folders that have excluded subpaths

Fixes duplicati/duplicati#3191

## Summary
When a folder is selected for backup and a subfolder inside it is later excluded, the folder still looks fully included. Looking only at the top of the tree, there is no way to tell that part of it is left out.

This PR flags folders that are included, either directly or through a parent, and that have an exclude filter written as a path below them (`-/home/user/cache/`):

- the row gets a `partially-excluded` class, which draws a dashed border

- the row gets an `aria-description` and a `title` that read "Some items inside this folder are excluded"

The flag is computed for both the browse tree and the search result tree, and only in multi-select mode. Regular-expression and filter-group excludes are not considered, because matching them would mean evaluating every descendant. The row's checked state (`aria-checked`) and the selection behaviour are unchanged.

## Original regression checks

These checks were recorded before the latest rebase. Current validation follows below.

- New `file-tree.excluded-descendants.spec.ts` renders the real template:
  - the selected folder and the folders between it and the excluded subfolder get the class and the description
  - the excluded folder, its siblings and folders outside the backup do not
  - a selection whose excludes are elsewhere, or that has no excludes, is not marked

- Without the component change, 1 of the 3 tests fails (`expected false to be true`). With the change, all 3 pass.

- All file-tree specs pass: 15 files, 186 tests. `tsc --noEmit` and `prettier --check` are clean.


## Current validation (2026-11-17)

- `bun run test:ci`: **2464 tests passed**.
- App and spec TypeScript checks passed.
- `bun run build:prod`: passed.
- The full unit suite ran on `8fb2fde2a84cc134d8bfa320b8dc0e1c7eef47e0`; only line endings changed afterward. LF-normalized SHA-256 values match. The production build and browser tests use the published head.
- Production-build Playwright checks passed: `e2e/file-tree-keyboard.spec.ts`, `e2e/file-tree-range.spec.ts`, `e2e/attribute-exclusions.spec.ts`.

Head: [`e4d73be2e504746c3797ec80c7511f860339945a`](https://github.com/JamBalaya56562/ngclient/commit/e4d73be2e504746c3797ec80c7511f860339945a).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
