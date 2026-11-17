# Update Playwright to fix Chromium new-tab initialization

The browser-test failures in #751 and #752 stop at `context.waitForEvent('page')` after a modifier click, although the destination responds with HTTP 200. The same timeout also occurs in #756.

A plain-link reproduction without ngclient confirms the Chromium headless-shell initialization problem tracked in [microsoft/playwright#42142](https://github.com/microsoft/playwright/issues/42142). The browser creates a target with the expected URL and title, but Playwright does not report its page, even after 30 seconds.

Update the exact Playwright pin from **1.63.0 to 1.65.1**, which bundles Chromium **159.0.8154.6**. That Chromium tag contains [the upstream fix](https://chromium-review.googlesource.com/c/chromium/src/+/8613032): avoid the extra initial `about:blank` navigation and temporary RenderFrameHost when opening a tab. The old bundled Chromium 153 does not contain it.

The change is confined to `package.json` and the regenerated `bun.lock`. The only version changes are `@playwright/test`, `playwright` and `playwright-core`; Bun also deduplicates unchanged Babel peer aliases. Existing click actions, page/title assertions, retries, timeouts, browser installation and the single Playwright config are preserved.

## Validation

- Controlled Linux probe, Node 26.13.1, 2 CPUs / 2 GiB / 4 concurrent contexts, 400 iterations per version: old version has 20 missing page events at 5 seconds (one held beyond 30 seconds) and 10 additional navigation/load timeouts; updated version **400/400 passes**.
- Linux production-build E2E suite, using Bun 1.4.4 and the unchanged `bun run preview` command/config: **193 passed**.
- The original CI production artifacts from #751 and #752, with the unchanged failing specs and API fixture: **20 passed each** on Linux with the updated Playwright. All eight source/config comparisons are byte-identical to those PR heads.
- Windows modifier/middle-click tests, `--repeat-each=5`: **20 passed**.
- E2E TypeScript checking, six build-script contract tests, production build, package formatting and `bun install --frozen-lockfile`: passed.
- Unit tests excluding the two known main fixture failures: **2,465 passed / 192 files**. This is a command-line exclusion for local validation only.

### Separate main baseline issue

Unrestricted unit compilation on base main `b856d9ce4dd9881291bb440650a9a2fc76685498` is blocked by the missing RunAfter fields in two fixtures, addressed separately by #756. This PR preserves that separation and does not claim a full unit-suite pass. The default CI command is unchanged.

Verified commit: [54ceafee09122bddaf6c83490cf344a8204ac88a](https://github.com/JamBalaya56562/ngclient/commit/54ceafee09122bddaf6c83490cf344a8204ac88a), based directly on upstream main.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
