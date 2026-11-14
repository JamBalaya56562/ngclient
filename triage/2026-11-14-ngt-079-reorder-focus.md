# NGT-079: preserve focus when keyed backup rows move

Date: 2026-11-14. Status: PUSHED on the SAME NGT-004 branch, no PR.

- Bookmark: `codex/stable-backup-list-tracking`
- New commit: `69f42c12b41af5acfb8a0aad265370c5ccc978ea`
- Parent (NGT-004): `e07fbeaf4f652fd3f6e4d5527d33a53bd6a1ba12`
- Branch base main: `f217ce91146c6be358f054f32f030e2503ad3005`

## Scope and implementation

検証済み: The remaining reorder blur from NGT-004 is reproduced in all three views. The previous manual action.focus() after reorder was removed from the test; before the new application change, `bun run test:e2e e2e/backup-list.spec.ts --grep 'focus through reordering'` failed **3 tests** at toBeFocused (red.log). An initial harness edit left that old manual focus call in place and passed; test-setup-attempt.log is retained but is NOT counted as red/green evidence.

A shared PreserveListFocusDirective is applied only to the Home and Restore sections. It captures the actual focused descendant in ngDoCheck before the view update and uses Angular afterEveryRender to restore that same node only if it survives, remains inside the section, and document focus has fallen to body. It skips removed, disabled or inert targets and does not override a newer focused control. focus({preventScroll:true}) avoids requesting scrolling. No global listener, timer, framework patch or new config/dependency. The directive replaces duplicated focus handling across home list/details and restore rather than adding separate implementations. Stable ID tracking from NGT-004 is retained.

## Browser verification (検証済み)

- `bun run build:prod`: exit 0, build.log.
- `bun run test:e2e e2e/backup-list.spec.ts e2e/home-search.spec.ts`: **9 passed**, exit 0, green-e2e.log.
- Final screenshot run: `bun run test:e2e e2e/backup-list.spec.ts --grep 'focus through reordering'`: **3 passed**, exit 0, screenshots-e2e.log. These repeat three of the nine cases, not three additional unique tests.

Real Chromium used the production UI with the existing mocked HTTP/WebSocket fixture. For home list, home details and restore:

1. Focus Photos (Start control or restore card), insert a preceding job, then reorder the live list.
2. Assert the same job DOM marker and actual toBeFocused without manual refocus after reorder.
3. Delete a preceding job and rename Photos with replacement DTOs; retain identity/focus.
4. Filter and clear via the search input; search keeps its focus.
5. Explicitly blur the action, then reorder; do not refocus it.
6. Remove the focused job; do not transfer focus to another job (activeElement is body).

Screenshots are local ignored evidence: tmp/ngt079-20261114/list-reordered.png, details-reordered.png, restore-reordered.png. The Restore screenshot was visually inspected. The authoritative focus evidence is Chromium's toBeFocused and DOM identity assertions; screenshot styling alone is not used to infer focus.

未検証: real-server job updates for this change, other browser engines, arbitrary dynamic lists outside these two screens, all combinations of overlays and disabled controls, scroll-position measurements. No claim of a new server-dependent issue. This fulfills the requested real-screen check with a real browser; API behavior is fixture-controlled.

## Other checks and publication

- `VITEST_MAX_WORKERS=1 bun run test:ci --include '**/home/*.spec.ts' --include '**/restore/restore*.spec.ts'`: **4 files / 28 passed**, unit.log.
- tsc --noEmit for projects/ngclient/tsconfig.app.json, projects/ngclient/tsconfig.spec.json and e2e/tsconfig.json: all exit 0 (three tsc logs).
- Prettier --check on all six changed files: exit 0, prettier.log. Screenshot insertion initially left extra whitespace in the test file; formatting was corrected after tests with no semantic change. No dedicated lint target was run.
- `jj git push --remote origin -b codex/stable-backup-list-tracking`: moved origin from e07fbeaf to 69f42c12.

No PR or Issue comment. Other implementation bookmarks unchanged. Test preview/browser processes exited. No real server/container or Vitest package edits were used in this follow-up. Evidence remains under tmp/ngt079-20261114; triage updated separately.
