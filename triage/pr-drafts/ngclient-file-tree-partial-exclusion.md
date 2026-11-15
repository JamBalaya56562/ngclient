# Mark backed-up folders that have excluded subpaths

Fixes duplicati/duplicati#3191

## Summary
When a folder is selected for backup and a subfolder inside it is later excluded, the folder still looks fully included. Looking only at the top of the tree, there is no way to tell that part of it is left out.

This PR flags folders that are included, either directly or through a parent, and that have an exclude filter written as a path below them (`-/home/user/cache/`):
- the row gets a `partially-excluded` class, which draws a dashed border
- the row gets an `aria-description` and a `title` that read "Some items inside this folder are excluded"

The flag is computed for both the browse tree and the search result tree, and only in multi-select mode. Regular-expression and filter-group excludes are not considered, because matching them would mean evaluating every descendant. The row's checked state (`aria-checked`) and the selection behaviour are unchanged.

## Testing
- New `file-tree.excluded-descendants.spec.ts` renders the real template:
  - the selected folder and the folders between it and the excluded subfolder get the class and the description
  - the excluded folder, its siblings and folders outside the backup do not
  - a selection whose excludes are elsewhere, or that has no excludes, is not marked
- Without the component change, 1 of the 3 tests fails (`expected false to be true`). With the change, all 3 pass.
- All file-tree specs pass: 15 files, 186 tests. `tsc --noEmit` and `prettier --check` are clean.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
