# NGT-047 / #328 — exact destination preservation regression

PR: https://github.com/duplicati/ngclient/pull/778 (Closes #328)
Bookmark: codex/live-destination-url-preservation
Source: 2f67628310cdb4fbfed666d064f79c4dbc06670d
Parent main: 5c520f1311b7805bd26cf2e4ff420127e46b1d72

## Decision and dependency checks

検証済み: #328 is open and reports load → form initialization → serialization rewriting the destination despite no active edit. Its existing comment references the merged #618 editor fix. GitHub metadata confirms #618 merged at 70e526a2125ab611f86d916b0e6d9df0d57d043c; backend #7832, #7860 and #7898 are also merged. `jj` confirms #7898 merge c6b9461991b941d96526d88dd520e3f0ef965257 is an ancestor of backend master f21a2245713cffb4dd020d8573c77e63592cfb66 and of the tested binary's product revision 4fc5c6a4d3b843fdbb898e829313536985da7634.

The only existing open ngclient PR was #777 (fixture ports/CI budget). This branch adds a separate spec and documentation, touching neither its fixture/configuration nor other prepared feature branches. The existing live editor persistence spec uses a simple local URL and checks all editor pages; these new cases specifically protect lexical URL/secret/unknown-option preservation. No application fix was needed from the observed current behavior.

## Negative control and successful verification

検証済み negative control: use the previous immutable server under tmp/ngt047-20261118/server, which lacks #7898. With PLAYWRIGHT_MODE=live and DOTNET_ROOT pointing at mise .NET 11, run:

```text
node node_modules/@playwright/test/cli.js test destination-url-preservation.spec.ts --grep interleaved --reporter=list --output tmp/issue328-20261119/red-results
```

1 failed (red.log). An unchanged browserless GET→PUT changed:

```text
expected: s3://bucket/a%2Fb?AUTH-PASSWORD=one&keep=middle&auth-password=two&flag
actual:   s3://bucket/a%2Fb?AUTH-PASSWORD=one&auth-password=two&keep=middle&flag
```

検証済み: immutable copied newer server passes all nine cases (green.log), and a final repeat with JSON diagnostics passes all nine in 59.1s (final-live.log / live-summary.json). The version/runtime response in every case is Debug 1.0.0.0, CLR 11.0.0. Cases: file, SSH, WebDAV, S3, pCloud, unknown backend, FTP encoding, repeated interleaved protected keys, and a URL rejected by the editor mapper.

Each case checks one browserless API save and three UI saves (mouse, hard-reload+Enter, and General-description-only). Thus the successful run checks 9 API saves and 27 UI saves. The raw SQLite URL equals the supplied synthetic URL byte-for-byte, not just the masked GET answer. The UI's submitted masked URL equals its pre-save GET value. Five advanced settings retain exact values, including whitespace/empty/unknown options; no-encryption is checked for true semantics separately because the backend changes casing. Opening/navigation sends no automatic PUT; no start/test requests or page errors occur. All fixture jobs are deleted in finally without remote deletion. No external providers or user jobs are used.

Commands (direct mise executables, see validate.ps1.txt):

```text
node node_modules/typescript/bin/tsc -p e2e/tsconfig.json
# exit 0, types-final.log
bun run test:ci --include=**/destination-edit-session.spec.ts --include=**/single-destination.render.spec.ts
# 2 files, 20 passed, related-tests.log
bun run build:prod
# exit 0, build.log
node node_modules/prettier/bin/prettier.cjs --check README.md e2e/live/destination-url-preservation.spec.ts
# passed, format.log
PLAYWRIGHT_MODE=live DUPLICATI_SERVER_PATH=<isolated copied server> node node_modules/@playwright/test/cli.js test destination-url-preservation.spec.ts --reporter=list,json --output tmp/issue328-20261119/final-results
# 9 passed, JSON reporter path set by PLAYWRIGHT_JSON_OUTPUT_FILE
```

## Provenance and limits

検証済み: copies were made from Executables/Duplicati.Server/bin/Debug/net10.0. Duplicati.Server.dll, Duplicati.WebserverCore.dll and Duplicati.Library.Utility.dll source/copy hashes matched; the copied files' hashes still matched after both green runs (server-manifest.json). Product version is 1.0.0+4fc5c6a4d3b843fdbb898e829313536985da7634. Runtime roll-forward used child-shell DOTNET_ROOT/DOTNET_ROOT_X64 pointing to mise SDK 11.0.100/runtime 11.0.0 and DOTNET_ROLL_FORWARD=LatestMajor. These are net10-targeted assemblies running under .NET 11, not a net11-targeted rebuild. Exact clean-tree correspondence of the original backend build is 未検証; the product revision, copied hashes and real regression outcomes are recorded separately.

未検証: connectivity for every backend, all possible malformed URLs, release inclusion, full Angular unit suite and full combined live suite. Existing unit CSS-parser and runner color diagnostics remain; no Vitest timeout/dependency patch was needed. No screenshot is needed to review a test-only change with unchanged UI. Passing regression cases support closure of this editor-persistence issue rather than claiming every provider has been exhaustively validated.

The fixture shut down its isolated server; process filtering found zero task servers. Temporary binary copies, databases, credentials and traces stay outside version control. No Issue comment was posted. Source and triage are pushed separately; prior bookmarks/workspace are preserved.
