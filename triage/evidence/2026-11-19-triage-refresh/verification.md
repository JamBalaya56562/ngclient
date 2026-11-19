# Current triage reconciliation — 2026-11-19

## Observed state

検証済み: `jj git fetch --all-remotes` returned no change in ngclient and Duplicati. ngclient main/upstream/origin are 5c520f1311b7805bd26cf2e4ff420127e46b1d72; Duplicati upstream master is f21a2245713cffb4dd020d8573c77e63592cfb66.

The complete paginated public REST `GET /repos/duplicati/ngclient/issues?state=open&per_page=100&page={page}` yielded seven Issues after excluding pull_request entries: #126, #273, #328, #409, #460, #462 and #497 (open-issues.json). The collection fit in one page. PowerShell's array result must be enumerated item-by-item: treating the returned array as one object produces a false zero-Issue count; that preliminary result was discarded and the snapshot replaced with the corrected seven-item response.

`GET /repos/duplicati/ngclient/pulls?state=open&per_page=100` yielded exactly #777 and #778 (open-prs.json). Closed-PR metadata confirms non-null merged_at for every #758–776 (recent-merged-prs.json). Existing comments on #328/#409/#460 were fetched without posting replies (issue-comments.json).

Current-head workflow lookup:

- #777 / 79dbfd8be5a2f0fdccc642e4db1687a533f988fc: Unit Tests run 44418598578 SUCCESS; Production Build run 44418598535 SUCCESS.
- #778 / 2f67628310cdb4fbfed666d064f79c4dbc06670d: Unit Tests run 44424269070 SUCCESS; Production Build run 44424269079 SUCCESS in the final re-check. Its initial queued snapshot was refreshed before committing.

These are state snapshots, not a request to monitor or retry CI. The JSON results are in ci.json.

## Backend dependency check

検証済み: public PR metadata reports #7907/#7911/#7912/#7914/#7915 OPEN and merged=false (backend-prs.json). For each current head, `jj -R ../duplicati log -r '<head> & ancestors(master@upstream)' --no-graph -T commit_id` is empty (backend-ancestry.txt). Five prepared ngclient implementations therefore remain blocked on backend merges.

Backend #7886 and #7896 are now closed/merged; old OPEN statements were removed. This refresh does not re-test their behavior or establish any additional functional dependency on #766.

## Branch and candidate checks

検証済み: nine maintained refs (main, triage, two open implementations and five backend-waiting implementations) matched local/origin before this documentation update (ref-checks.json). Four immutable image/evidence refs and claude-fixes are listed in bookmarks.txt/workspaces.txt and were not changed. No implementation branch or repository main was moved by this task.

Source audit: `rg -n 'PLAYWRIGHT_MODE|DUPLICATI_SERVER_PATH' .github/workflows e2e/live/fixture.ts` found only the optional local fixture setting, no live CI invocation. `home/start-all-dialog/start-all-dialog.html` still binds afterAction using ngModel. These observations support NGT-081 scope investigation and NGT-119 as an independent migration candidate; they do not prove either candidate implemented.

NGT-116/117 remain unverified suspicions from earlier runtime checks; #758/#759 are merged, so their old merge-wait wording was removed. Their reproduction on pure current main remains the next diagnostic step. The proposed ordering follows the standing preference for reproducible bugs before additional tests, not a new bug claim.

NGT-081 is marked INVESTIGATE rather than unqualified READY: #777 changes the shared fixture/workflow, and a pinned official server needs to satisfy all selected live contracts, including #778's newer URL-masking cases. Actual release inclusion and whether a shared-file edit is avoidable are 未検証, not assumed hard functional blockers.

## Changes and limits

The task ledger now contains only current Issues, open PRs, dependencies and actionable candidates. Merged history was consolidated into completed.md and the verification index; existing evidence files and stable NGT IDs were retained. Next new ID remains NGT-121. No new implementation ID was invented for a documentation refresh.

未検証: no app behavior, real server, unit/E2E test, build, release-channel distribution or full remaining form inventory was re-run. Documentation link/format checks are separate from those tests. No PR, public comment, source-branch rebase or deletion was performed. Only triage is committed/pushed, and the default workspace is returned to main afterward.

Documentation validation: Prettier check passed for the four edited Markdown documents. Local link checker checked 22 Markdown targets with no missing files (link-check.log).
