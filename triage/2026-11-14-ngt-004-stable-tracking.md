# NGT-004: stable backup row tracking

Date: 2026-11-14. Status: PUSHED, no PR.

- Bookmark: `codex/stable-backup-list-tracking`
- Commit: `e07fbeaf4f652fd3f6e4d5527d33a53bd6a1ba12`
- Parent/latest fetched upstream main: `f217ce91146c6be358f054f32f030e2503ad3005`

## Scope / overlap

検証済み: Fetch returned Nothing changed; open PRs #716–725 were checked. `jj log -r 'bookmarks() & (files("projects/ngclient/src/app/home/home.component.html") | files("projects/ngclient/src/app/restore/restore.component.html"))'` returned no prepared bookmark changing these templates before this work. The former home/restore search migrations are already on main. No prerequisite PR, server change, or dependency is needed.

Only the two home job loops (list/details) and the restore job loop change from track $index to `track backup.Backup.ID ?? backup`. The existing e2e/backup-list.spec.ts is extended; no new app component/config/dependency is added. Local drafts are held separately in BackupsState.draftBackups and are not inserted into these filteredBackups loops. The nullable API ID uses object identity as a fallback rather than a duplicate null key; this fallback does not promise stable identity across replacement objects lacking IDs. Other index-tracked option/log/filter lists were not changed by this focused task.

## Reproduced problem (検証済み)

A keyboard user focuses Photos (Start action in home list/details; the linked card in Restore). A backuplist notification inserts Archive before the existing rows. Index tracking reuses rows for different jobs, so Photos is no longer the focused action. A DOM identity marker confirms its row is replaced by another row rather than following its job ID.

Commands with direct mise Bun executable, Node/Bun directories on PATH:

- Baseline `bun run build:prod`: exit 0 (baseline-build.log).
- `bun run test:e2e e2e/backup-list.spec.ts --grep 'same job and focus'`: **3 failed** on original templates, first on DOM identity (red.log), then on explicit `toBeFocused`, Expected focused / Received inactive (red-focus.log). The same insertion assertion remains in the final tests, whose names clarify insertion/removal scope.
- After the three-line template fix, `bun run build:prod`: exit 0 (build.log).
- `bun run test:e2e e2e/backup-list.spec.ts e2e/home-search.spec.ts`: **9 passed**, exit 0 (green-e2e.log). All three views retain identity and focus when a preceding row is inserted/removed; identity also survives reordered DTOs, rename and search narrowing/clearing. Search keeps its own focus. Existing empty-list, list/details switch and update/search checks also pass.
- `VITEST_MAX_WORKERS=1 bun run test:ci --include '**/home/*.spec.ts' --include '**/restore/restore*.spec.ts' --include '**/core/states/backups.state*.spec.ts'`: **4 files / 28 passed**, exit 0 (unit.log).
- `node node_modules/typescript/bin/tsc --noEmit -p <config>`: app, spec and e2e configs all exit 0 (three tsc logs).
- Prettier --check on the three changed files: exit 0 (prettier.log). No dedicated lint target was run.

Evidence directory: `tmp/ngt004-20261114`. Browser tests use real Chromium/production UI and existing mocked HTTP/WebSocket fixtures. 未検証: real-server live job changes for this commit, malformed duplicate non-null IDs, and identity preservation of ID-less replacement objects. No real backup was started.

## Confirmed separate limitation: NGT-079

検証済み: Initial tests also asserted focus after arbitrary reorder. With ID tracking the same DOM row survives, but Angular's DOM movement causes Chromium to blur it; this failed at the later reorder assertion in all three views (track-only-reorder-focus.log). This is distinct from focus incorrectly following another job because of index reuse.

The final tests explicitly check identity after reorder and re-focus the action before testing removal. They do NOT claim to fix reorder blur. That assertion was not silently counted as passing; the observation is retained as NGT-079 for a focused follow-up after NGT-004 merges. No broad focus-restoration directive, browser patch or synthetic key was introduced here. Inputs within other dynamic editors were not audited in this task.

## Publication / cleanup

Source pushed with `jj git push --remote origin -b codex/stable-backup-list-tracking`. No PR or Issue comment. Existing implementation bookmarks unchanged. Test preview processes exited; no isolated real server/container was started and no Vitest package edits were made. Triage records pushed separately.

Follow-up (2026-11-14): the user authorized NGT-079 on the same branch. The separate reorder-focus limitation above is now fixed by commit `69f42c12b41af5acfb8a0aad265370c5ccc978ea`; see [NGT-079 evidence](2026-11-14-ngt-079-reorder-focus.md). The final browser tests assert reorder focus without manual refocusing. Historical failing observations above remain as before-fix evidence.

Real-server follow-up (2026-11-14): the combined NGT-004/079 branch at 69f42c12b41af5acfb8a0aad265370c5ccc978ea passed additions, deletions and name-order updates in all three views using an isolated official 2.4.1.101 Canary server. See the real-server follow-up in [NGT-079](2026-11-14-ngt-079-reorder-focus.md) for IDs, raw evidence and cleanup. No further code changes.
