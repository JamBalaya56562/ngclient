# Five independent issue regression PRs — 2026-11-18/19 JST

All five branches start directly from upstream main 6cfac9f58d13b31f141404665d9488f8e0d45bbe. Their local/origin SHA equality and corresponding PR heads/Closes statements were checked. No pending implementation branch was stacked. No production code or permanent Playwright configuration change was made.

| Issue / task | PR | Bookmark / full SHA | Current verification |
| --- | --- | --- | --- |
| #401 / NGT-044 | https://github.com/duplicati/ngclient/pull/772 | codex/live-windows-destination-path / b88e10d4258786a9e637e8a6cf2e8fb7852972f1 | 1 real Windows case passed: sequential C → C: → C:\ → C:\Backup, render/blur, submitted/stored URL and reloaded field. No start/test/createfolder request. |
| #627 / NGT-049 | https://github.com/duplicati/ngclient/pull/773 | codex/live-editor-page-save / ad443c258d72266e9abf2580eb32b6cd352b8e38 | Existing live test extended, not duplicated: all five pages save in place and reload, with description/destination/sources/options preserved; keyboard Save also exercised. |
| #217 / NGT-043 | https://github.com/duplicati/ngclient/pull/774 | codex/live-broken-files-purge / b4477291eae08bb8f931e1b9e979858c907941b3 | 1 real case passed: two generations, quarantine newer-only dblock, list affected path/version; relevant catalog/remote hashes unchanged until confirmation/cancel; one confirmed purge; old generation recovered byte-for-byte after live source was changed. |
| #449 / NGT-045 | https://github.com/duplicati/ngclient/pull/775 | codex/live-cross-os-restore / 2884ec2c6052bd3ccc72cb638533b888905888d9 | Same real test passed Linux → Windows and Windows → Linux. Folder/file accessibility classification, nested real API listing, original foreign restore path and selected payload-only recovery verified. Golden archives are six synthetic files, <10 KB total, with SHA256 verification. |
| #492 / NGT-042 | https://github.com/duplicati/ngclient/pull/776 | codex/live-schedule-timezone-roundtrip / 21f6be9f47e7b24f76071cc02125b431163e8e0a | 6 real cases passed: real automatic setup backup produces nonzero LastRun, then DST date/UTC-control UI round trips preserve submitted/stored instant, real LastRun/LastBackupStarted and Home/API proposal agreement. |

All PR descriptions contain the corresponding Closes #number and the requested Claude Code footer. Issue closure is proposed by merge, not performed directly. No additional Issue comments were posted.

## Commands/results

For each branch: direct mise Node/Bun executables resolved by glob; node node_modules/typescript/bin/tsc -p e2e/tsconfig.json, Prettier, and bun run build:prod passed. Commands are implemented in ignored tmp/five-close-20261118/validate.ps1. Initial focused commands:

- ./tmp/five-close-20261118/validate.ps1 -Spec e2e/live/windows-destination-path.spec.ts -Label issue401
- same helper with editor-persistence.spec.ts / issue627
- same helper with broken-files.spec.ts / issue217
- same helper with cross-os-restore.spec.ts / issue449
- same helper with schedule-timezone.spec.ts / issue492

Final focused live invocations use PLAYWRIGHT_MODE=live, DUPLICATI_SERVER_PATH=<isolated copied Debug executable>, node node_modules/@playwright/test/cli.js test <spec> --reporter=list --output <case directory>. Final live.log files are authoritative. Windows executions: 1 + 1 + 1 + 1 + 6 = 10 cases passed; Linux reverse-direction execution: 1 passed. Related mocked/unit tests were inspected for overlap, not redundantly added or rerun in this test-only task. The complete frontend unit suite and combined all-branch live suite were not run.

Helper-only corrections during development: server control can return an empty body; nullable required SearchEntries.Paths must be supplied as null. Corrected helpers were rerun successfully. These were not claimed as production bug fixes or red→green product regressions. The extra E2E changes do not affect production-bundle contents; each branch's build was run once.

## Provenance and scope

検証済み: Windows and Linux servers report Debug and CLR 11.0.0. Copied DLL product version 1.0.0+7111ac741f315e038bbccb5e33fdce29eade8a86 and SHA256 manifest are attached. They target net10.0 and are run with .NET 11 roll-forward, not rebuilt targeting net11. Exact clean-source correspondence and packaged-release execution of these new specs are 未検証.

Windows uses Chromium 159.0.8154.6. Linux uses Chromium 153.0.8010.12 from the existing Playwright v1.63 container, with the current project Playwright runner and Node26.13.1/.NET11.0.0 added in a local verification image. Root playwright.config.ts was temporarily pointed at the installed Linux browser and restored byte-for-byte in finally; that override/Dockerfile is not committed. Linux SQLite could not write on the Docker Desktop Windows bind mount; fixture DB/backend copy/restore output were moved to container /tmp, then only artifacts copied out. Linux success is recorded in issue449/linux.log and windows-to-linux.json. No container remains running.

検証済み: Duplicati #7776 is merged, merge SHA 366b43a92bd2ddc388a0c0c8012a32f045e38ae3. Both real cross-OS API/UI tests passed; no backend workaround was added. Synthetic archive producer details and original paths are documented in e2e/fixtures/cross-os/README.md. Old mocked cross-OS tests already cover separator contracts; the new test adds actual database recreation/listing/restore from genuine foreign archives.

#217 covers missing data volume damage and the server's list/purge contract. Download-detected checksum corruption and all other corruption types remain outside the claim. #492 covers ordinary all-week daily schedules, browser NY/Tokyo and explicit server NY/UTC settings, DST-boundary date serialization and real LastRun preservation. Its six automatic setup runs happen at current server time; these new tests do not advance the server through DST. Earlier six actual DST-crossing runs are linked from PR #776 / Issue #492, at the earlier main SHA; do not call them fresh tests of current main. Excluded weekdays and ambiguous/nonexistent local hours remain untested.

#627 Closes proposal is based on the maintainer's existing-edit alternative (direct navigation + explicit in-place Save), with new jobs retaining guidance. No claim that tab appearance or a coach-mark tour has been implemented. This scope is explicit in PR #773 for maintainer judgment.

## NGT-120 — observed live fixture forbidden-port allocation

検証済み: first #401 attempt stopped before login because the existing proxy.listen(0) received port 6697 and Chromium returned net::ERR_UNSAFE_PORT. See issue401/unsafe-port.log. A fresh allocation passed without changing product or fixture. This is a pre-existing harness allocation defect; it is not the Windows input bug and is not silently counted as a green attempt. Needs a focused safe-port allocation change/test, coordinated with open #771's fixture edits; do not add duplicate configs or bypass browser protection for ordinary tests. No extra PR for it was created in this five-PR request.

All test servers used isolated datafolders/random ports/passwords and synthetic files. User jobs and real remote destinations were not touched. Native task server count and named Linux test-container count were zero at completion. Four pinned image/evidence refs and other workspaces were not changed.
