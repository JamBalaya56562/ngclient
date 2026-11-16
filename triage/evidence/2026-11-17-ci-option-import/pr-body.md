## Summary

Close the Backup retention popover when focus moves to a control outside the select. It can otherwise remain open over the advanced-option controls, as seen in the browser jobs for #739, #746, #747 and #748. Preserve internal focus and pointer selection, including the temporary blur with no new focus target that occurs when clicking a non-focusable option.

Scope import-configuration loading assertions to the import screen. In #741's browser job, the loading message and the HTTP error notification both had `role="status"`, causing the page-wide locator to fail. Keep a real background WebSocket notification visible in the regression test so it cannot depend on notification dismissal timing.

The keyboard option test also changes retention to seven versions and checks the value after saving and reloading. This is independent of #739's restore-group request-count fix; no commits or changed files from the ten open PRs are included.

## Testing

- Before: the external-focus and concurrent-notification browser regressions both failed on the main production application. The new retention unit test failed (`1 failed, 5 passed`).
- After: complete unit suite — **2,375 passed across 184 files**.
- Production Chromium: both related specs repeated five times — **40 passed**, including option addition, retention selection/save/reload, import retry, empty results, cancellation and import settings.
- App, spec and E2E TypeScript checks; Prettier on all changed files — passed.
- Temporary integration with #741's application changes: production build and all eight related Chromium cases passed. The temporary merge was abandoned; this PR remains directly based on main.
- Production build before and after — passed, without build warnings. Existing jsdom CSS-parser messages remain in the unit-test logs.

The exact rapid-Tab timing from CI was not reproduced locally: the original checks passed 40 times, and the throttled keyboard case passed another five times. The added external-focus regression deterministically reproduced the stale popover itself. No sleeps, retry increases, timeout increases or additional Playwright configuration are introduced.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
