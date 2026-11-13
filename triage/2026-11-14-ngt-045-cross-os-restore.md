# NGT-045 / #449: cross-OS restore after server #7776

Date: 2026-11-14. Status: verification complete; no client fix required within the tested scope. No PR or Issue comment posted.

## Versions and provenance

- UI: upstream main `f217ce91146c6be358f054f32f030e2503ad3005`. `jj git fetch --all-remotes` returned Nothing changed. Production bundle built from that main (no application changes).
- Server PR duplicati/duplicati#7776: gh reports MERGED, merge `366b43a92bd2ddc388a0c0c8012a32f045e38ae3`.
- Windows and Linux server assemblies copied from an existing Debug build: ProductVersion on Duplicati.Server.dll and Duplicati.Library.Main.dll is `1.0.0+6cae627a9c8f91b62183745781dffd1f72709035`. `jj log -r '6cae627a & descendants(366b43a9)'` returns that commit, confirming it follows the fix. Runtime reports **1.0.0.0 - debug**, not a published Canary version.
- Copied Main DLL matches its source SHA256 `E7F78C314715C7D5C212FD406AB168687E1386AE5D5D421638D57B99AC8EF5D5`. No claim that this build matches every file of a pristine checkout; no source was rebuilt or modified in the sibling repository.
- Linux: Docker Desktop, mcr.microsoft.com/dotnet/aspnet:10.0, running the same portable Debug output. Windows: direct mise dotnet executable. Own loopback ports 8490–8493; fresh data folders/fixtures for each run. No user jobs touched.

## Observed result (検証済み)

`./tmp/restore449-recheck-20261114/live.ps1` exited 0 twice with independent fixture/data directories. The first run is first-success-live.log; the second is live.log, with raw per-direction requests in linux-to-windows-api.json and windows-to-linux-api.json. No API mocking.

Each OS created a real unencrypted backup containing Documents/payload.txt and sibling peer.txt. Same-OS API controls listed both children and classified only Documents as a directory.

| Direction | Cross-OS list-folder | UI | Restored files/content |
| --- | --- | --- | --- |
| Linux to Windows | root -> Documents/ and peer.txt; Documents/ -> payload.txt | folder expands with ArrowRight, file has no aria-expanded | payload.txt only, exactly `linux payload` plus newline |
| Windows to Linux | Windows root -> Documents and peer.txt; Documents -> payload.txt | folder expands with ArrowRight, file has no aria-expanded | payload.txt only, exactly `windows payload` plus newline |

The UI used a temporary direct-restore job, selected Documents, picked a new restore location, submitted, and showed Restore completed. Responses recorded the normal copytotemp operation, followed by restore on its newly returned ID. The restore request retained the source OS path separators and added the expected wildcard. File contents were compared against source strings and the unselected peer file was absent.

Screenshots linux-to-windows.png / windows-to-linux.png show the correct folder/file distinction. The Windows-to-Linux screenshot was visually inspected. The before-fix evidence remains under tmp/restore449/; it is not overwritten.

## Separate direct API probe (limited scope)

検証済み: In the second run, AFTER successful UI restoration through copytotemp, a restore submitted directly against the original listing job completed on both OSes. Each direct-probe destination contains only payload.txt with the source content. Output: direct-same-listing-job-probe Status=Completed, error=null. A separate read of both files confirmed contents.

未検証: A fresh listing job restored directly BEFORE any successful copytotemp restore. The order here differs from the historical failing API probe, so this observation does not establish that the separate only_paths/remote-list issue is fixed in every sequence. It is not a blocker for the verified normal UI flow.

## Tests/build

`VITEST_MAX_WORKERS=1 bun run test:ci --include '**/restore-flow/restore-flow.filesets.spec.ts' --include '**/restore-flow/restore-flow.submission.spec.ts' --include '**/restore-flow/select-files/select-files.component.spec.ts'`: **3 files / 31 tests passed**, exit 0 (unit.log).

The existing main production bundle used by both live runs was built successfully earlier in this session (tmp/editor627-20261114/build.log). A further build is recorded in this task's build.log. No regression test or artificial red/green was introduced because no client defect reproduced.

## Setup limitations and cleanup

Initial Linux startup failed because Debug logging writes beside its assemblies and the copied folder was mounted readonly. Only the disposable COPY under ngclient/tmp was made writable; no original server files changed. Debug Windows power-mode provider warnings mention the WindowsModules DLL absent from that portable build. This does not claim validation of power management, snapshots, permissions, symlinks, MacOS, encrypted backups or all historical backups.

Scripts stop only their own processes/container in finally. Ignored evidence, disposable data, server copy and screenshots remain under tmp/restore449-recheck-20261114. No new implementation bookmark was created; no existing implementation branch was changed. Triage records are pushed separately. Issue closure requires an explicit public-report instruction and/or maintainer agreement; no automatic Fixes claim.

Final verification: `bun run build:prod` exited 0 (build.log); no WARNING/ERROR entries in that build log. Ports 8490–8493 had no listeners and docker ps found no running ngclient-restore449-recheck container after cleanup. No temporary Vitest package edits were made.
