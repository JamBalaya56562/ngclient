# Five scoped implementations and PRs — 2026-11-19

The user confirmed scope: three reproduced frontend bugs plus form/E2E work; backend #460/#462/#126 stays with the separate backend session. Five independent branches start directly from main 5c520f1311b7805bd26cf2e4ff420127e46b1d72. No existing backend-waiting branch was edited.

## Implementations and observed validation

| PR / IDs           | Source bookmark / SHA                                                             | Validation                                                                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #779 / NGT-117,118 | codex/load-delete-backup-by-id / 6d96a5dcb6291c77977537f94bb007abd2a4b585         | New cold-load, retry and stale-confirmation cases: 3 failed / 12 passed on old code; 15 passed after. Existing mocked deletion E2E 5 passed. New real-server UI deletion 2 passed.                                        |
| #780 / NGT-116     | codex/changelog-plain-markdown / 2d0ea42e14f1e6d9c7286324a3ce3f92162318e8         | New exact-content case failed before; 7 component cases passed after, including HTML sanitization. Existing notification/update/installed-notes E2E 1 passed; real production UI probe 1 passed.                          |
| #781 / NGT-121     | codex/name-throttle-control / ce3c547c7082b775eca5c9ea55c93b28334ed732            | New name/hover/keyboard case failed before; related unit 33 passed. Three browser cases passed and final independent scenarios passed 10 repetitions (30 passed). Initial real-server probe 1 passed. CI follow-up below. |
| #782 / NGT-119     | codex/start-all-signal-form / fbc7c971127d2d94b23423c5645ebbe421366197            | Existing 8 cases passed before/after; real server UI selected Reboot, none/all, disabled-empty and Cancel with zero start/queue-action POSTs. No power action was executed.                                               |
| #783 / NGT-122     | codex/certificate-password-signal-form / 3ad12474c0f4d750caff77ec5e64ee81636de828 | Existing 15 cases passed before/after. Real API rejected synthetic invalid PFX; production form retained file/password and re-enabled retry. No successful TLS configuration change attempted.                            |

検証済み: each branch's production build passed (named build logs), and app/spec/E2E TypeScript returned exit 0 (named final logs). Changed-file Prettier checks passed. Empty type-check logs mean successful exit with no diagnostics. Full local unit suites were not repeated per branch; CI is reported separately in ci-snapshot.json.

The first draft of new deletion tests had an incomplete generated DTO fixture typing error; fixture types were corrected before the meaningful red run. New real E2E initially assumed a named checkbox; existing ShipCheckbox inputs are unnamed, so the test uses section headings as existing tests do. The final red/green counts above are the authoritative outcomes. No timeout patch or retry was added.

## Behavioral details

NGT-117 fetches details by route ID instead of searching Home's cache. Loading/error/mismatched data cannot enable deletion; errors can be retried. DB validation waits for a real path, and route-version checks prevent earlier confirmation callbacks/completion from acting on a later route. Existing Sync remote-option suppression and shared DB checks remain covered.

NGT-118 is included with that fix, rather than published as a stacked PR. Each real-server case creates and runs its own small backup, hard-loads Delete, cancels without a DELETE or data change, then confirms one DELETE. Local DB is actually retained/removed according to the choice; all destination files retain their SHA256 hashes. Only fixture-owned paths are involved and DB containment under the fixture directory is checked first.

NGT-116 parses the original Markdown and leaves Angular's innerHTML sanitization in place. The exact regression prevents SafeValue's diagnostic text being accepted by a heading-prefix assertion. Scripts/event handlers/javascript URLs stay sanitized.

The form migrations use public form/FormField value signals directly, keep file/selection state ordinary, and preserve existing DTO conversion. The Start-all native text field uses a string model with server-supported action lookup at submission, avoiding an unsafe template cast. FormField owns the SSL input's name; id/label remain unchanged.

## #781 CI investigation and separate NGT-123

検証済み: original source eb94ef94999d4f5aa66f9d37e1f23a33ed1ec74b failed only the newly added tooltip case in browser job 135315261094 (run 44451118697). Unit and production-build jobs succeeded. The trace shows the global beforeEach opening the dialog, Cancel, then immediate hover; the named button exists but no visible tooltip is returned. CI artifacts were inspected locally; traces/credentials are not committed.

The new case unintentionally inherited a pre-opened dialog. Each test now opens its dialog only if its own scenario requires it; the name/initial-hover/keyboard scenario starts on fresh Home. All original assertions and default timeouts/retries remain. Final local repetition: 30 passed (throttle-repeat.log). This is the final #781 source above; CI must be checked on that SHA, not the failed old SHA.

A separate clock-controlled real-server probe reproduced the shared library's teardown/re-entry problem: after first showing the tooltip, move away, run 60ms, re-enter and run 100ms. The wrapper still contains the label but `:popover-open` is false (tooltip-reopen-probe.log). This is **not repaired** by changing the test setup or adding aria-label. It is recorded as NGT-123 for a separately scoped library correction/version/patch decision. Do not claim all tooltip reopening is fixed by #781. Physical screen-reader audio was not tested.

## Commands and environment

Direct mise Node/Bun/.NET executables were resolved by glob. Examples:

```text
bun run test:ci --include=**/delete-backup.component.spec.ts
bun run test:ci --include=**/changelog.component.spec.ts
bun run test:ci --include=**/throttle-settings-dialog.component.spec.ts --include=**/status-bar.state.spec.ts
bun run test:ci --include=**/start-all-dialog.spec.ts
bun run test:ci --include=**/ssl-certificate.component.spec.ts
bun run build:prod
node node_modules/typescript/bin/tsc --noEmit -p <app/spec/e2e tsconfig>
./tmp/fix-batch-20261119/delete-browser.ps1
./tmp/fix-batch-20261119/browser.ps1 -Spec throttle-settings.spec.ts -Label throttle-repeat -Repeat 10
./tmp/fix-batch-20261119/browser.ps1 -Spec certificate -Label certificate-live -Probe
```

Scripts and exact output are archived alongside this note. Standard browser checks temporarily use port 53001 because Windows excludes 3000. Live probes temporarily select their ignored test directory using the single root config; finally restores original bytes. No extra Playwright config is committed.

All live runs use the immutable Debug server from the earlier issue328 record, product 1.0.0+4fc5c6a4d3b843fdbb898e829313536985da7634, net10-targeted assemblies rolled forward to CLR 11.0.0. This is not an official-release verification or exact master-only build. No user jobs/external provider/power action is touched. Existing CSS-parser/color diagnostics remain.

## Publication, screenshots and limits

PRs #779–783 are published. The three internal bugs have no whole-Issue closing keyword to invent. #779 is Refs #273, #781 is Refs #409, and #782/#783 are Refs #497 because those broad Issues still have remaining work. Backend contracts #460/#462/#126 are unchanged as agreed. Live CI automation NGT-081 remains a separate scope, not implemented by adding these UI deletion tests.

Before/after images illustrate #779 cold loading and #780 Changelog content. The deletion screenshots use different synthetic jobs: the after case has a completed backup/real DB, whereas the earlier investigation job did not. They are examples of identity loading, not a pixel-perfect comparison of identical metadata. The four PNG paths linked from PR descriptions must be retained during later triage cleanup.

Source/image refs and the separate workspace remain intact. No product code is placed on triage. Final cleanup/ref/CI checks are recorded when completing the task. The newly found NGT-123 and broader #497/#409/#273 work are not claimed complete.

Final CI verification: all five current PR heads passed both Unit Tests and Production Build. For #781 final ce3c547c7082b775eca5c9ea55c93b28334ed732, runs 44452894306 and 44452894282 both completed successfully.
