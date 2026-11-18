# CI investigation — 2026-11-17

Raw command output, browser wrapper and failure diagnostics are stored locally under `C:/Users/Jam/Documents/ngclient/tmp/ci-investigation-20261117/`. Filenames below refer to that directory, not to tracked files beside this document. Commands use the mise-managed Node/Bun/jj executables directly.

## Baseline and scope

- Upstream main: `ae54d73bf1e5e98fb65dd8060c006f1defc90d01`.
- `jj git fetch --all-remotes`: Nothing changed.
- Open PRs #739–#748: all unit jobs and actual production-build jobs passed. Browser jobs failed for #739, #741, #746, #747 and #748.
- Checked all ten open PR file lists: none modifies the five files in this change. #739 is a separate restore-list request-count test fix.
- No other preparation branch was rewritten.

| PR | Failed browser job | Failure |
| --- | --- | --- |
| #739 | [CI log](https://github.com/duplicati/ngclient/actions/runs/43865050733/job/133301274054) | Retention overlay intercepts attribute-select click |
| #741 | [CI log](https://github.com/duplicati/ngclient/actions/runs/43865206411/job/133305011749) | Two matching status elements in import retry |
| #746 | [CI log](https://github.com/duplicati/ngclient/actions/runs/43865360548/job/133294186621) | Retention overlay intercepts attribute-select click |
| #747 | [CI log](https://github.com/duplicati/ngclient/actions/runs/43865374207/job/133303432930) | Retention overlay intercepts attribute-select click |
| #748 | [CI log](https://github.com/duplicati/ngclient/actions/runs/43865385792/job/133300991974) | Retention overlay intercepts attribute-select click |

## Evidence before the fix

1. Original browser specs on the unmodified main production application: 40 passed (`before-browser.log`). CPU-throttled keyboard scenario: another 5 passed (`keyboard-throttled-before-browser.log`). The exact original fast-Tab timing failure was not reproduced locally.
2. Real production UI: focus the retention input, wait for `aria-expanded=true`, then focus Add advanced option. The retention select remained expanded. The focused regression failed with expected `false`, received `true`.
3. With a real notification delivered through the authenticated fixture's WebSocket, import loading and notification both expose `role=status`. The old global locator failed with a strict-mode violation resolving two elements.
4. Command: `browser.ps1 -Label focus-regression-before -Repeat 1 -Grep 'with keyboard|failure is retryable'`: **2 failed**, one for each condition above. Traces/screenshots copied to `red-diagnostics/`.
5. Command: `bun run test:ci --include=projects/ngclient/src/app/backup/options/options.component.spec.ts`: **1 failed, 5 passed**, assertion `expected true to be false` (`before-unit-regression.log`). No unhandled errors in this final red unit run. Earlier experimental runs with an incomplete jsdom popover stub are not regression evidence.
6. Command: `bun run build:prod`: succeeded before the fix (`before-build.log`); no build warnings.

## Change and safeguards

- Close only the backup-retention select when focus moves to an identifiable node outside it.
- Preserve focus inside the select. Preserve a null focus target: clicking a non-focusable menu option can temporarily blur the input before the click finishes. Closing on this event was caught by the added selection/save/reload test and corrected before publishing.
- Scope the import-loading status locator to `app-import-destination-select-config`; retain a background notification in the test so the collision is covered.
- Production browser test now selects a seven-version retention policy, moves focus out, adds attribute exclusions, saves and reloads, and checks that the retention value is still seven.
- No fixed sleeps, retry count increases, timeout increases, dependency changes or additional Playwright config.

## Validation and logs

- Related unit specs: options, options-list and import select-config: **40 passed** (`after-unit.log`, before the final additional pointer-focus safeguard).
- `tsc --noEmit -p projects/ngclient/tsconfig.app.json`, spec config, and E2E config: passed; final validation recorded separately.
- `bun run build:prod`: final build passed (`final-build.log`).
- Final focused production-browser regressions: **2 passed** (`final-selection-browser.log`), including selection/save/reload and background notification.
- Final repeated browser regressions: **40 passed** (8 cases × 5, `final-repeat-browser.log`).
- Final full unit suite: **184 files, 2,375 tests passed** (`final-full-unit.log`).
- Final app/spec/E2E `tsc --noEmit` checks and Prettier check of all five changed files: passed (`final-tsconfig*.log`, `final-prettier.log`).
- Existing jsdom `Could not parse CSS stylesheet` messages remain in unit-test logs; these are present before the fix as well. Production builds have no warning/error messages.
- Published implementation: `codex/stabilize-option-import-browser-tests`, `e5a360af0eadd80078373f15031df050a8c355e2`, directly based on the main SHA above.

Final commands and output summaries (executed sequentially):

```text
bun run test:ci
  Test Files 184 passed (184); Tests 2375 passed (2375)
node node_modules/@playwright/test/cli.js test e2e/attribute-exclusions.spec.ts e2e/import-config-list.spec.ts --repeat-each=5
  40 passed
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
  all three exit 0, no diagnostics
node node_modules/prettier/bin/prettier.cjs --check <the five PR files>
  All matched files use Prettier code style!
bun run build:prod
  Application bundle generation complete; exit 0, no build warnings
jj git push --remote origin -b codex/stabilize-option-import-browser-tests
  bookmark add to e5a360af0ead; exit 0
```

The local browser wrapper changes only the port and preview binary invocation in the single root `playwright.config.ts` temporarily, restores its original bytes in `finally`, and writes all logs here. No VCS snapshot is taken while this temporary configuration is active.

## Limits

Additional validation: a temporary merge with #741 (`e80484104552ed9857712a68bc15aa472e25cced`) built successfully and passed all **8 related Chromium cases** (`integration-741-build.log`, `integration-741-browser.log`). Temporary merge `bbe4b339fba6bb3b24b1fb3ef6fe5a84e97afa06` was abandoned afterward. Existing #741's bookmark was not modified. A final `jj git fetch --all-remotes` still reported nothing changed.

- Verified: stale retention state on an external focus change, old locator collision, and fixed production UI behavior.
- Inference: the precise scheduling window that let the CI's rapid Tab loop leave the retention menu open. Ordinary and CPU-throttled local runs did not reproduce that exact timing.
- The production-browser fixture exercises real UI code with controlled HTTP/WebSocket responses; it is not an isolated Duplicati server test.

## Publication and cleanup

- NGT-106: [PR #749](https://github.com/duplicati/ngclient/pull/749), one commit, five files, origin head confirmed as `e5a360af0eadd80078373f15031df050a8c355e2`.
- PR #749 CI at publication: Production Build [43901932764](https://github.com/duplicati/ngclient/actions/runs/43901932764) and Unit Tests [43901932607](https://github.com/duplicati/ngclient/actions/runs/43901932607) queued. Their completion is not verified here.
- Existing PR/feature branches were not amended or pushed. The temporary integration was abandoned. The root Playwright configuration was restored; it is not in the PR diff. No worker-timeout patches were made.
- No issue-close keyword is used: this corrects CI failures and a focus bug rather than claiming to complete an unrelated issue.
