# Prepared PR — wait for duplicati/duplicati#7907 to merge

Branch: `feat/export-global-options`
Source: [3ad275090282438962be8f90069324b25dea8a94](https://github.com/JamBalaya56562/ngclient/commit/3ad275090282438962be8f90069324b25dea8a94)
Server contract checked: `a652e9f71c2e0f5ee3f31dcd9e02ec8934654071`.

Recheck origin SHA, server merge and latest main before publishing. The following is the PR body.

---

## Summary

Move the global-options decision to configuration import, matching the reviewed server design. Exports always keep `GlobalSettings` separate from the backup's own settings; remove the obsolete export checkbox/query and explain the separate global options/password export.

On supporting servers, import defaults to Ignore and offers Merge into this backup. The server handles merging and preserves the backup's own option precedence. Apply to server settings is available only with Save now and requires explicit confirmation because it affects all backups. Turning Save now off resets Apply to Ignore. Approval sends a single captured request; cancellation sends none.

Servers without `v1:backup:export-global-settings` keep the existing UI/request. File/passphrase/metadata handling and encrypted exports remain unchanged. Add only `global_options` to the OpenAPI input DTO, checked against a fresh generator output.

Depends on duplicati/duplicati#7907. Fixes duplicati/duplicati#2310.

## Testing

- Seven new regression failures before the implementation; 42 related tests pass afterward.
- On main `aaccdfa0351ca507894fb2381dc7224fef5f5f4c`, the full unit suite passes: 204 files / 2,614 tests.
- App/spec/E2E TypeScript, changed-file Prettier and production build pass.
- Import-file-read and export-encryption Playwright cases: 12 pass, including keyboard selection, ignore/merge/apply request policies, capability fallback and apply confirmation/cancellation.
- Browser checks use the production build and mocked API, not a live Duplicati server. New live-server integration remains unverified.
- Local checks use a temporary untracked maxWorkers=2 Vitest runner config with normal timeouts. Playwright's single root config temporarily uses port 3100 on Windows, then is restored byte-for-byte. No root runner/config change is committed.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
