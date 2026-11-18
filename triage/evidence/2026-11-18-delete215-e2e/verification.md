# NGT-040 / #215 — live regression coverage

PR: https://github.com/duplicati/ngclient/pull/770 — Closes #215.
Source: 2a23dab67c24dae600ab2ad8f6bd22cf45958af4, independent parent main 912186a9786504f314d2a8bf126321ac170cb605.

検証済み: e2e/live/delete-versions.spec.ts adds two real-server cases. Existing unit tests cover confirmation/request handling and existing live tests cover ordinary restores; none covered UI version deletion followed by surviving-version restoration and actual compaction. Open PR #766 adds a compare page with no file overlap. No backend implementation dependency was introduced; the APIs already exist.

Each case creates three second-distinct versions. Only the middle contains 34 random 600 KiB payloads. The production UI selects version 1, opens confirmation and cancels without a POST or changed versions/dblocks, then confirms exactly one request. Surviving timestamps equal the original newest/oldest timestamps. Both surviving generations are restored through the real restore API into separate folders; UTF-8 text and binary bytes match the respective originals, and exact file lists exclude the middle-only files. Source contents are changed before restoring. Existing live tests continue to cover restoration through the UI.

Compact off: SuppressCompact=true, CompactResults=null, dblocks 23 → 23.
Compact on: SuppressCompact=false, CompactResults.DeletedFileCount=42 across volume types, dblocks 23 → 2.
Persistent no-auto-compact=true remains unchanged in both cases. Saved result JSONs are attached to the tests and copied here. Jobs/local DBs are cleaned in finally; destination evidence remains fixture-owned. Fixture teardown stops its server/proxy; no matching task server remained afterward.

## Commands/results

Direct mise node/bun/dotnet resolved by glob. No shim/mise exec used.

- node node_modules/typescript/bin/tsc -p e2e/tsconfig.json — exit 0, no diagnostics (after final source edits).
- bun run build:prod — exit 0; see build.log. This test-only change does not alter the production bundle.
- PLAYWRIGHT_MODE=live DUPLICATI_SERVER_PATH=<copied-debug-executable> node node_modules/@playwright/test/cli.js test --reporter=list --output tmp/live-delete215-20261118/results — all 9 live tests passed; see live.log.
- bun run test:ci --include=**/delete-versions.component.spec.ts — 11 passed; see unit.log.
- node node_modules/prettier/bin/prettier.cjs --check e2e/live/delete-versions.spec.ts README.md — passed; see format.log.

The new cases passed on their initial focused execution and again in the complete live suite after adding cleanup/artifact persistence. This is coverage for existing working behavior, not a claimed red→green production bug fix. No unit/full frontend suite beyond the related component was run. Optional live mode is not automatically enabled in current CI; NGT-081 remains separate.

検証済み: systeminfo reports Debug 1.0.0.0, CLR 11.0.0. The copied server DLL product version is 1.0.0+7111ac741f315e038bbccb5e33fdce29eade8a86 (hash manifest attached). These are net10-targeted assemblies run with child-process DOTNET_ROOT pointing to mise SDK11.0.100 and DOTNET_ROLL_FORWARD=LatestMajor. They are not net11-targeted builds. Exact clean source tree correspondence and a packaged release run for these new tests are 未検証. Earlier independent Canary validation remains in the #215 comments.

Local Vitest startup limits were temporarily extended to 300 seconds for the related test command and restored byte-for-byte in finally; original START_TIMEOUT=6e4 and WORKER_START_TIMEOUT=9e4 verified. No config, dependency or application-code changes in the PR. README now accurately states that compaction deletes only disposable fixture data.
