# 2026-11-19 branch maintenance and PR #777 CI

## Branch maintenance

検証済み: GitHub PR metadata reports merged=true for #771–776. `jj log -r '<bookmark> ~ ancestors(main)'` was empty for each, proving their heads are already in main. All six implementation bookmarks were deleted locally and from origin. The merged commits remain in main's history.

`jj git fetch --all-remotes` updated upstream main to `5c520f1311b7805bd26cf2e4ff420127e46b1d72`; fork main was pushed to that same SHA. Five backend-waiting feature branches were rebased with `jj rebase -b <bookmark> -d main`, without conflicts, and pushed individually to origin. Their direct-parent IDs are recorded in heads.txt. No backend dependency status or feature behavior was re-tested in this maintenance task.

#777 remains open. The maintainer had merged current main into its remote head `e697d4cbbb6897aae747a00b8ff8107bf51e9c52`. Rebase produced fixture conflicts; restoring that remote fixture tree resolved them. `jj diff --from e697d4cbbb6897aae747a00b8ff8107bf51e9c52 --to <rebased-source> --stat` showed 0 files changed before the CI budget edit. The redundant merge revision was abandoned. The final source is `79dbfd8be5a2f0fdccc642e4db1687a533f988fc`, one commit directly on latest main.

Triage content/evidence is carried forward as a snapshot directly on latest main, avoiding the four immutable screenshot/evidence bookmarks that share older triage ancestry. Those refs and the separate claude-fixes workspace are preserved. No new PR or Issue comment was created.

## CI cause and repair

検証済み: https://github.com/duplicati/ngclient/actions/runs/44388973149/job/135104284688

`GET /repos/duplicati/ngclient/check-runs/135104284688/annotations` explicitly reports: `The job has exceeded the maximum execution time of 10m0s` (ci-annotations.json). Job status is cancelled; the unit workflow and production-build job succeeded. The browser job started at 20:24:48Z; dependency installation started 20:25:10Z and was still finishing at 20:32:14Z. Tests started 20:32:23Z; tests 1–205 succeeded before cancellation at 20:35:01Z. This is a job-budget failure, not an observed assertion failure. The two remaining tests were unverified on that CI run.

Increase only `browser-tests.timeout-minutes` from 10 to 15 in the existing production-build workflow. Individual test timeouts, retries, browser restrictions and test selection are unchanged. A new GitHub run is required to verify the revised budget on the runner; local success alone does not prove its final CI outcome.

## Local verification after rebase/repair

Direct mise executables were resolved by glob, using Node 26 and Bun 1.4.4.

- `node node_modules/typescript/bin/tsc -p e2e/tsconfig.json`: exit 0 (types.log).
- `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/production-build.yml e2e/live/fixture.ts e2e/live/fixture-ports.spec.ts`: passed (format.log).
- `bun run build:prod`: passed (build.log).
- `node node_modules/@playwright/test/cli.js test --reporter=list --output tmp/maintenance-20261119/e2e-results`: 207 passed, 8.5m (e2e-port-override.log).
- `PLAYWRIGHT_MODE=live node node_modules/@playwright/test/cli.js test fixture-ports.spec.ts --reporter=list --output tmp/maintenance-20261119/port-results`: 5 passed, 4.9s (ports.log). These are actual HTTP/Chromium tests and do not start Duplicati.

検証済み local environment caveat: the first standard-E2E attempt timed out waiting for the preview server (e2e.log). `netsh interface ipv4 show excludedportrange protocol=tcp` includes 2969–3068, and a real Node bind to 3000 returned EACCES. Sirv selected another port, while Playwright still waited at 3000. Standard verification temporarily replaced port 3000 with 53001 in the existing root config; it was restored in a finally block and its file hash matched the original byte-for-byte. No port override/new config file is committed. This Windows exclusion is separate from the CI timeout.

未検証: full Angular unit suite and the full combined real-server suite were not re-run for this workflow-budget change. Earlier live verification remains tied to the historical source SHA in its original record. The five waiting feature branches have rebase/conflict/parent/ref verification, not fresh behavior/build results in this task.

## Final verification and cleanup

検証済み: revised-source CI succeeded: Unit Tests run 44418598578 and Production Build run 44418598535, including browser-tests job 135205613021 with **207 passed (2.8m)** (ci-success.log). https://github.com/duplicati/ngclient/actions/runs/44418598535

All eight maintained local/origin refs (main, triage, six implementation branches) matched; each implementation and triage has current main as direct parent. No conflicted ancestors remain. Four fixed evidence refs retained their original SHAs and claude-fixes stayed d07fd97c. Obsolete exclusive ancestry was checked against every local/remote bookmark and workspace before abandoning 90 unreferenced old revisions (two candidates were already hidden). Current triage files and all evidence are retained; integrated commits remain in main history. The working copy was returned to an empty child of main.
