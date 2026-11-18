# Post-#769 maintenance

検証済み: main/origin updated to 912186a9786504f314d2a8bf126321ac170cb605. GitHub PR metadata confirms #758–765 merged; every deleted head was also verified as an ancestor of upstream/main. Eight implementation bookmarks deleted locally and on origin. Merged code remains in main history; reachable main commits are not abandoned or physically pruned.

Rebased five backend-dependent implementation branches and triage onto main. Four pinned image/evidence refs remain unchanged, as does the other jj workspace. No new PR or comment created. Backend dependencies not rechecked in this maintenance; previous blocked status is retained pending a fresh backend review.

Skip-next-run conflicted with #768's replacement of the Home menu. Resolved by integrating its action into BackupActionsDialog, preserving feature gating, enabled-job and schedule checks. Home handles the returned skip action. No old sh-menu was retained. Added two dialog regressions; the existing unsupported-server/default-job cases remain covered.

Commands (direct mise binaries):
- jj git fetch --all-remotes
- jj log -r '<merged-head> ~ ancestors(main@upstream)' — empty for all eight heads
- jj bookmark delete <eight merged bookmarks>; jj git push --remote origin --bookmark <each>
- jj bookmark set main -r main@upstream; jj git push --remote origin -b main
- jj rebase -b <each of five branches and triage> -d main
- bun run test:ci --include=**/backup-actions-dialog.spec.ts --include=**/backups.skip-next-run.spec.ts — 2 files / 10 tests passed
- node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json — no diagnostics
- node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json — no diagnostics, command exit 0
- bun run build:prod — exit 0, Application bundle generation complete

Initial Vitest execution started no tests: worker startup exceeded 60 seconds. Retried with local START_TIMEOUT/WORKER_START_TIMEOUT temporarily set to 300 seconds; original bytes restored in finally and defaults 6e4/9e4 verified. No dependency/config timeout change is committed.

未検証: whole suite/build on all five rebased branches, live-server interaction with the new skip action, and refreshed backend dependency PR status. The focused tests/type checks/build above apply to the conflict-resolved skip branch. Other branches rebased without conflicts; do not interpret this as all-branch runtime verification.
