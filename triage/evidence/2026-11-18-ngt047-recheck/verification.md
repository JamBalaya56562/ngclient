# NGT-047 / #328 — post-#7832 verification, 2026-11-18

## Scope and result

検証済み: ngclient main `0bcf31797dd07fe356899ce236447038c178627e`. Ordinary browserless API round trips passed for file, SSH, WebDAV, S3, pCloud, unsupported backend, encoded FTP and a Windows path containing @. Query duplicates, flags, empty values, encoded delimiters and explicit edits were checked against the stored SQLite TargetURL, not only the masked GET response.

検証済み: six UI cases (file/SSH/WebDAV/S3/pCloud/unsupported) each completed mouse Save, hard reload + Enter Save, and General-description-only Save. All 18 writes preserved outgoing and stored URLs and five advanced options (retry-delay, unknown option including spaces, empty option, attribute exclusions, dry-run). No page errors or backup/destination-test requests were observed. Existing no-encryption serialization changes `true` to `True`; tests separately assert the same boolean meaning. This is not counted as byte-preservation of that bootstrap flag.

検証済み: old official 2.4.1.101 Canary control failed the SSH no-op GET→PUT: port 022 became 22, encoded slash decoded, duplicate values combined and flags/empty fields lost. The post-fix Debug server passed that case. See baseline-api-ssh.log and events.jsonl.

## Server provenance and .NET 11

検証済み: systeminfo reported `1.0.0.0 - debug`, CLRVersion `11.0.0`; every final case asserts CLR 11. The copied server assemblies target net10.0 and were run with mise .NET 11.0.100 SDK / runtime 11.0.0 using child-only DOTNET_ROOT and DOTNET_ROLL_FORWARD=LatestMajor. They were not rebuilt targeting net11.

検証済み: assembly product version reports `7111ac741f315e038bbccb5e33fdce29eade8a86`; jj ancestry includes #7832 merge `83560c6bdc3c432d9a28ee0697a8db2e9d8cf899`. Hashes before/copy/after matched for three DLLs (server-manifest.json). Backend master at investigation was `e8756fab2b708af7a9b287d41916799a6da451ad`; do not describe this binary as an exact build of that master. Exact clean source-tree correspondence is 未検証. Official Canary control uses its own bundled runtime.

## Remaining backend edge case — no client fix

検証済み: browserless GET then unchanged PUT, using only isolated synthetic configuration:

```text
Initial stored:
s3://bucket/a%2Fb?AUTH-PASSWORD=one&keep=middle&auth-password=two&flag
GET:
s3://bucket/a%2Fb?AUTH-PASSWORD=***************&keep=middle&auth-password=***************&flag
Stored after PUT of GET body:
s3://bucket/a%2Fb?AUTH-PASSWORD=one&auth-password=two&keep=middle&flag
```

Values remain, but protected-key occurrences are grouped at the first occurrence. This reproduced twice under CLR 11. Provider/semantic impact is 未検証; do not claim credential loss. ドキュメント根拠: QuerystringMasking.UnmaskUrl collects previous matching-key parameters at the first masked occurrence using replacedKeys/GetPreviousParameters. 推測: that grouping explains the observed order change. Backend-session review is appropriate before declaring all #328 cases fixed; no browser workaround was added.

Reproduce: create a fixture backup with the initial TargetURL through POST /api/v1/backups, GET /api/v1/backup/{id}, PUT the unmodified response to the same endpoint, and compare TargetURL in the isolated server SQLite Backup row. The attached probe implements this and explicit edits.

## Commands and outputs

Direct mise binaries are resolved by glob in attached scripts. From ngclient main:

```powershell
& ./tmp/ngt047-20261118/run.ps1 -Baseline -Grep 'API ssh'
# 1 failed: baseline rewrite reproduced
& ./tmp/ngt047-20261118/run.ps1
# 14 passed, 1 failed (1.6m): only API interleaved-secrets failed
& ./tmp/ngt047-20261118/validate.ps1
# related tests: 2 files, 19 passed
# tsc --noEmit -p projects/ngclient/tsconfig.app.json: exit 0
# tsc --noEmit -p projects/ngclient/tsconfig.spec.json: exit 0
# bun run build:prod: exit 0, Application bundle generation complete
```

Scripts are archived with .txt suffix to avoid discovery. They reuse e2e/live/fixture.ts and the single root Playwright configuration, temporarily changing its live test directory and restoring exact bytes in finally. Test binaries, traces and screenshot remain in ignored tmp/ngt047-20261118. events.jsonl includes preliminary diagnostic runs as well as the final run; fixed-debug-net11.log is the authoritative final outcome. Initial UI comparisons failed only due to no-encryption case normalization; the final probe checks its semantics separately without weakening advanced-option equality.

検証済み: relevant unit tests, both type checks and production build pass. Existing jsdom CSS diagnostics occurred in unit output; no product source changes were made. Lint was not requested or run for this no-code investigation. No ngclient implementation commit or PR is warranted by the observed client results. Existing PRs #763/#764 touch Destination presentation/next-step logic but were not modified.

## Isolation and limitations

Each case uses the existing fixture's isolated server-datafolder, local synthetic source and dynamically allocated port. No real user jobs or remote services are accessed, no backup runs are started. The fixture stops its servers. Debug binaries are copied into ignored tmp to prevent concurrent backend builds changing the tested DLLs. Other bookmarks remain untouched. No PR or Issue comment was posted. Release inclusion of #7832 and provider-specific remote connectivity are 未検証.
