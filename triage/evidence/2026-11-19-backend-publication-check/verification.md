# Backend-dependent ngclient publication check — 2026-11-19

検証済み: `jj git fetch --all-remotes` in both repositories returned no change. ngclient upstream main is 5c520f1311b7805bd26cf2e4ff420127e46b1d72; Duplicati upstream master is f21a2245713cffb4dd020d8573c77e63592cfb66.

Both GitHub connector get_pr_info and independent public REST `GET /repos/duplicati/duplicati/pulls/{number}` report all five required PRs open, merged=false, merged_at=null (status.json). `jj -R ../duplicati log -r '<head SHA> & ancestors(master@upstream)' --no-graph -T commit_id` is empty for each (ancestry.txt).

| ngclient bookmark | Backend PR | Current outcome |
| --- | --- | --- |
| feat/export-global-options | duplicati/duplicati#7907 | merge pending |
| feat/skip-next-scheduled-run | duplicati/duplicati#7911 | merge pending |
| feat/compact-progress | duplicati/duplicati#7912 | merge pending |
| feat/restore-resume-drafts | duplicati/duplicati#7914 | merge pending |
| feat/show-db-encryption-preload-paths | duplicati/duplicati#7915 | merge pending |

No ngclient feature became publishable from these dependencies in this check. No new PR was created, and no feature branch was modified. Existing ngclient #777/#778 are already open and unrelated. Triage's obsolete "no PR / publication slots pending" wording was replaced with the actual PR links and merge-pending status.

未検証: new feature execution, tests and builds were not re-run because no dependency was merged and no feature code changed. Earlier test results remain tied to their original source/server versions. Re-check dependency merge state before publication, then verify actual API/feature behavior and run the branch tests/build.
