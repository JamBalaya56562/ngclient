# Allow a server theme default while keeping browser preferences personal

Related to duplicati/duplicati#3851.

Browser theme choices remain personal. This proposal adds an optional server default for browsers that have not made a choice, so a fresh browser or private window can inherit an instance-specific appearance.

## Behavior

- Priority: an explicit browser choice, then the server default, then that browser's operating-system preference.
- The header toggle and existing Light/Dark controls save only in that browser. Existing stored choices are preserved.
- A separate **Default theme for this server** section explicitly saves Light, Dark or Operating system through the existing `PATCH /api/v1/uisettings/ngclient` API. It does not change another browser's personal choice.
- **Use server default** clears the browser override. Loading a server default never writes it into localStorage as a personal choice.
- Defaults are loaded after authentication. An unset/unknown default uses the browser's OS preference, including subsequent OS changes.
- Default updates are single-flight, retain the previous value on failure and allow retry. A failed initial load prevents accidental shared changes.

No server change or new API is needed. There is no synchronization of personal choices between browsers.

## Validation

- Three regression checks fail with the original implementation: ordinary toggles write to the server, a server value overrides an explicit browser value, and an inherited value is saved as a browser choice. All pass after the change.
- `bun run test:ci --include=projects/ngclient/src/app/layout/*.spec.ts`: **22 passed**.
- `bun run test:ci --exclude=**/backups.enable-disable.spec.ts --exclude=**/backups.refresh.spec.ts`: **2,478 passed / 192 files**. The exclusions are command-line options only; no repository test configuration was changed.
- App and E2E TypeScript checks, Prettier and `bun run build:prod`: passed.
- `node node_modules/@playwright/test/cli.js test e2e/theme-toggle.spec.ts`: **6 passed** against the production build. The temporary local port adjustment was restored.
- Isolated Duplicati **2.4.1.101 Canary** with **three independent browser contexts**: a browser's Light override survives another client's shared-default changes and reload; a fresh context inherits Dark without storing a local choice; clearing an override resumes inheritance; selecting Operating system yields Light/Dark independently for each browser. No page errors. The isolated server, proxy and browsers were stopped afterward.

### Existing main test-fixture failure

The unrestricted unit suite and spec type check currently fail to compile because `backups.enable-disable.spec.ts` and `backups.refresh.spec.ts` omit the newly required `RunAfterBackupID` and `RunAfterCondition` fields. I reproduced the same two TS2739 errors on unmodified upstream main `b856d9ce4dd9881291bb440650a9a2fc76685498`. This PR leaves that separate issue unchanged; the 2,478-test result above excludes those two files and is not a full-suite success claim.

Verified head: [`785835b3fcbec6bbc743bef37ed2bb3728f76d72`](https://github.com/JamBalaya56562/ngclient/commit/785835b3fcbec6bbc743bef37ed2bb3728f76d72), independently based on upstream main `b856d9ce4dd9881291bb440650a9a2fc76685498`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
