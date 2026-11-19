# Current behavior / code / API investigation — 2026-11-19

This is the substantive follow-up to the earlier state-only refresh. No product fix or new PR is included. Current candidate decisions are in ../../tasks.md.

## Tested sources and isolation

検証済み: frontend is clean upstream main **5c520f1311b7805bd26cf2e4ff420127e46b1d72**, freshly built with `bun run build:prod` (build.log). Source-branch bookmarks were not edited. The root Playwright configuration was temporarily pointed at the ignored probe directory and restored byte-for-byte in finally; `jj status` afterward reported no changes before creating this triage record. No second config is added.

The live fixture launched its own server-datafolder, loopback listener and random credentials. Only synthetic fixture jobs were created; the UI probe did not delete a job or start a backup. API cleanup deletes only these synthetic jobs with remote/local-file deletion disabled. No existing user job or external remote service is used.

The immutable copied server from ../2026-11-19-issue328-live-regression is **Debug product 1.0.0+4fc5c6a4d3b843fdbb898e829313536985da7634**, net10-targeted assemblies explicitly rolled forward to **CLR 11.0.0**, not a net11-targeted rebuild or official release. See server-manifest.json. Its product revision includes current backend upstream master **f21a2245713cffb4dd020d8573c77e63592cfb66**, plus the unmerged skip-next-run work (#7911); server-source-delta.txt records those source differences. It is not described as an exact master-only build. Exact original clean-build correspondence remains 未検証.

## Confirmed frontend bugs

### NGT-117 — cold Delete backup route lacks identity/data

検証済み (observed.json, cold-delete.png, warm-delete.png): after authenticating, hard-navigation to `/backup/{id}/delete` shows `Delete backup:` without the fixture job name. It still shows that heading after three seconds, and the Delete backup button is enabled. The monitored HTTP requests in this interval contain only `POST /api/v1/filesystem/validate`, no backup detail/list GET. This does not exclude WebSocket activity.

A Home visit followed by its actual More actions → Delete dialog button reaches the same route with `Delete backup: Cold deletion audit`. No deletion is confirmed. The behavior repeated across successful UI probes, with no page errors.

ドキュメント根拠（現行ソース）: delete-backup.component.ts:29 reads `BackupsState.getBackupById`; that getter only searches the shared list (backups.state.ts:182–183). It is not a fetch-by-ID resource. 推測: depending on that warmed list explains the cold/warm difference; the fix should establish an ID-scoped load and disable deletion until identity/data are available. Future regression cases need direct navigation/reload, error/not-found, route switches, Sync remote-delete suppression and shared-DB safety. Avoid editing BackupsState if a component-local resource can solve it, because pending NGT-086 changes that state file.

### NGT-116 — Angular diagnostic URL leaks into Changelog

検証済み: `/api/v1/changelog` has no diagnostic URL, while `.markdown-output` adds this trailing text:

```text
(see https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss)
```

observed.json records raw/rendered tails and `rawHasDiagnostic=false`, `renderedHasDiagnostic=true`; changelog.png captures the UI. Source lines 30–37 create a SafeValue, call toString(), strip only a prefix and then parse Markdown (source-evidence.txt). 推測: the stringify step introduces the diagnostic suffix; confirm with a red→green regression when implementing. Proposed scope: parse the original Markdown string, preserve Angular HTML sanitization, and test normal headings/links, no diagnostic text, malicious HTML and from-update routing. Do not treat this as a proven exploitable XSS vulnerability.

### NGT-121 / part of #409 — unnamed global throttle button

検証済み: on the actual production Home screen, the global speedometer button has `aria-label=null`, `title=null` and an accessible snapshot of exactly `- button`. No tooltip appeared within the 400ms hover observation. Clicking opens `Throttle network speed`; Cancel closes it without changing settings. The source has only the icon inside the desktop button and no tooltip binding (status-bar.component.html:36–38).

The actual job's Start/Edit/More actions controls, by contrast, have those three accessible names. A narrow label/tooltip/localization fix can be implemented independently in status-bar.component.ts/html, with role/name, hover, keyboard focus and dialog-cancel checks. It must be Refs #409, not a claim to close that broad Issue. Real screen-reader audio and every mobile/keyboard combination are 未検証; the browser accessibility-tree observation is the evidence.

## Remaining open Issues: what is actually missing

### #497 — Signal Forms inventory, not a raw match count

検証済み static scan (forms-inventory.json and source-audit.mjs.txt): **28 templates contain ngModel**, **26** are reachable from main.ts by this script's relative-import/templateUrl graph. It visits 224 TS files and 95 templates. This is a conservative text/graph inventory, not an Angular compiler/runtime execution proof and not 26 unconverted forms.

The two not reached are the old `backup/schedule` and `source-data/filter` templates; do not migrate those merely to reduce a count. Core size/timespan/file-drop implement ControlValueAccessor, so their internal bindings are a separate category. Options/Schedule/Source templates contain mixtures of already migrated fields and normal UI choices. Treating each template as a whole unconverted form would duplicate earlier work.

Concrete independent business-form candidates:

1. Existing **NGT-119**: Start-all afterAction, currently a signal plus ngModel/setAfterAction. Keep selected backup Set as normal state. Existing tests cover None/defaults/supported actions/cancel/submit.
2. New **NGT-122**: SSL certificate PFX password. Keep File selection as normal state; preserve canUpload, disabled/upload snapshot, failure retaining input, success clearing it and payload conversion. These are source-derived implementation requirements, not freshly executed SSL tests.
3. Next, investigate the MCP token creation form: `form = signal(emptyMcpTokenForm())`, updates replace fields, derived formError and DTO conversion already exist. Split this from agent-instruction display and other ordinary UI state. Settings is larger and should be divided by save contract/panel rather than migrated wholesale.

prepared-file-diffs.txt confirms proposed NGT-116, component-local NGT-117, NGT-121, NGT-119 and NGT-122 scopes avoid the files modified by the two open PRs and five prepared feature branches. Editing shared state/generated APIs outside those scopes would require another overlap check.

### #273 — existing coverage and bounded remaining work

検証済み: `PLAYWRIGHT_MODE=live node node_modules/@playwright/test/cli.js test --list` enumerates **22 tests in 8 files** on current main (live-list.log), without running all 22. These include real backup/restore/direct encrypted restore, selected-version deletion, broken-file handling, auth recovery, cross-OS restore, schedule and editor persistence. A source search found API job cleanup, not a Home→Delete backup UI execution case (live-delete-search.txt).

Default Playwright mode excludes `**/live/**`; existing workflows do not select live mode or supply a server executable. Thus the justified remaining work is NGT-118's actual UI job deletion and NGT-081's agreed continuous-live execution setup, not unlimited test additions. #777 changes fixture/CI setup; required backend fixes for #778's live contracts must be included when pinning a server version. Official-release inclusion and the final maintainer-approved closure criterion are 未検証.

### #460 — cannot assume a frontend selector is sufficient

検証済み live API experiment (secondary-contract.json / probe.log): create one disposable job with different fake secrets on primary and secondary. `POST /backup/{id}/copytotemp` succeeds, but PUT of that temporary backup with the secondary masked URL returns **HTTP 500**, reporting that the temporary GUID cannot be parsed as a number. The source job's exported original URL remains unchanged. No list, restore or backup operation was requested.

Initial PUT with the unchanged name returned 409 due to the persistent job's name; renaming the disposable temporary copy exposed the 500. Both preliminary responses are preserved. The experiment therefore did **not** reach a comparison of which secret would be used after a successful swap: that credential behavior is explicitly 未検証. Do not claim the UI currently sends a wrong password; this was an unimplemented design experiment.

ドキュメント根拠（現行ソース）: current list-filesets selects a BackupId, copytotemp only accepts the original ID, and Runner.ApplyOptions uses backup.TargetURL. The UI has no secondary selection. A server-side selected UrlKey→independent temporary restore context is a proposal worth discussing, with correct secret resolution and actual secondary version enumeration. Other existing APIs/approaches might be possible; impossibility is not proven. NGT-100 already edits restore.component and restore-flow state, so future frontend implementation needs overlap coordination.

### #462 — per-destination delete contract is absent from the current job endpoint

ドキュメント根拠（現行ソース）: BackupPutDelete.MapDelete exposes delete-remote-files/delete-local-db/force, no selected destination keys. Runner applies AdditionalTargetURLs to remote-sync options only for BackupOrSync and takes its ordinary URL from backup.TargetURL (source-evidence.txt). This supports an API design discussion, not silently promising that extra checkboxes will safely work.

未検証: actual deletion effects on two populated destinations. A future design/test must cover selected-only deletion, preservation of unselected destinations and shared DB, and job/config retention on partial failure. Do not close the Issue using the existing shared local-DB guard.

### #126 — the requested shared validation contract is still absent

検証済み live response: among the **216 received option definitions examined**, none contains `Validations`. Recorded argument keys include Aliases, LongDescription, Name, ShortDescription, Type, ValidValues, DefaultValue, Typename, Deprecated and DeprecationMessage. Current backend ICommandLineArgument and generated frontend type also have no proposed Validations field.

The concrete next step is an agreed backend schema/examples for Min/Max/Pattern and errors, then generated OpenAPI types and frontend consumption. Existing enum choices or local type validation do not implement the requested shared metadata contract. No comprehensive provider-specific validation survey was performed.

### #409 — distinguish existing improvements from a closure claim

Home actions have real accessible names; current code includes notification error/warning variants, log/compare actions and progress/current-filename computation. Related progress/action tests passed (below), but these do not prove the full original UX wish list satisfied. In particular current file text is gated by BackendFileSize in its template: the CurrentFilename-present/BackendFileSize-zero case remains 未検証 in a running real backup. Actual notification colors/balloon behavior, all progress phases, and subjective menu/whitespace preferences also remain unverified this turn. NGT-121 is a narrow concrete leftover, not Closes #409.

### #328

Already covered by open #778 with Closes #328 after #618 and backend #7832/#7860/#7898. This audit adds no duplicate implementation. Its earlier real-server 9-case/27-save evidence and limits remain in the dedicated record; it is not counted as a newly re-executed test here.

## Commands and outcomes

```text
bun run build:prod
# passed, current main production bundle (build.log)
./tmp/substantive-triage-20261119/run.ps1 -SkipBuild
# final observational probe: 2 passed (14.2s), probe.log
# One probe records reproduced UI faults; the other EXPECTS the observed HTTP 500.
# These are investigation probes, not proof that the faults have been fixed.
bun run test:ci --include=**/status-bar.file-status.spec.ts --include=**/status-bar.state.spec.ts --include=**/start-all-dialog.spec.ts --include=**/backup-actions-dialog.spec.ts
# 4 files, 60 passed (unit.log)
node tmp/substantive-triage-20261119/source-audit.mjs
# inventory output in forms-inventory.json
```

The initial UI probe timed out because its script looked for the old action name Delete backup instead of the current dialog button Delete. That selector error was corrected; it is not a product bug. Initial diagnostics only recognized the old g.co URL; the final detector includes the actual angular.dev URL. Existing jsdom CSS and runner color warnings remain. No dependency timeout patch was needed.

## Recommended sequence / limits

Fix **NGT-117 → NGT-116 → NGT-121**, each independently on main with a failing regression first. Then add NGT-118's UI deletion regression and proceed with NGT-119/122's bounded migrations. Discuss #460/#462/#126 contracts with the backend session before broad frontend work. #273 and #409 should have finite, explicit closure criteria.

This task changes only triage records. Product source, existing implementation bookmarks and other workspaces stay unchanged; no PR/Issue comment is posted. No full unit suite or all 22 live cases were executed, and no server-source fix was attempted. Temporary copies/DBs/traces/credentials stay ignored; only selected diagnostics, scripts and safe synthetic screenshots are archived. Runtime provenance and source snapshots are explicit above. Server process cleanup and configuration restoration are checked before finishing.
