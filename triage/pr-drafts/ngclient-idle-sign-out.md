Fixes duplicati/duplicati#3369

## Summary

The interface keeps refreshing its session while the tab is open, so an unattended browser stays signed in for as long as the tab is open. This PR adds the opt-in background timer described in the issue thread.

- **New setting:** "Sign out when idle" in Settings. The choices are never (the default) or 5, 15, 30, 60, 120 or 240 minutes. It is stored per browser in local storage, so nothing changes for existing users.
- **`IdleLogoutState`:**
  - Records pointer, key, wheel, touch and scroll activity on the document.
  - Checks every 15 seconds, and again when the tab becomes visible, because timers do not run while the machine sleeps.
  - Once the configured time has passed without activity, it signs out through the existing `logout()`, which calls `POST /api/v1/auth/refresh/logout` and navigates to `/login`.
- **Several tabs:** The last activity time is shared through local storage, so a tab left in the background does not sign out a session that is being used in another tab. This matters for "Keep me logged in", where tabs share the refresh nonce.
- **Relay and proxy sessions:** These are not signed in with the passphrase, so they are left alone. This works the same way as `signOutAfterPassphraseChange()`, through a new `AppAuthState.signOutAfterIdle()`.
- **Where it runs:** Watching starts in `LayoutComponent` and stops when the layout is destroyed.

No server change is needed.

## Testing

- Node.js 26 / Bun 1.4.4, on the rebased branch.
- `VITEST_MAX_WORKERS=1 bun run test:ci`: **2399 passed** (full unit suite).
- `tsc --noEmit` for app and spec configurations: passed.
- `bun run build:prod`: passed.

- `node node_modules/@playwright/test/cli.js test e2e/authenticated-page.spec.ts e2e/authenticated-login.spec.ts e2e/logout-flow.spec.ts e2e/theme-toggle.spec.ts`: **10 passed**, against the production build with mocked APIs. E2E type checking also passed.
- Local browser checks used an available port because Windows reserves port 3000; the repository configuration was restored unchanged.

The existing jsdom stylesheet parsing messages were present in the passing unit run.

Based independently on main [ae54d73bf1e5e98fb65dd8060c006f1defc90d01](https://github.com/duplicati/ngclient/commit/ae54d73bf1e5e98fb65dd8060c006f1defc90d01); no predecessor PR is required.
Verified commit: [97ae286bfa432bb2001b0d66ca3a4e86375fad65](https://github.com/JamBalaya56562/ngclient/commit/97ae286bfa432bb2001b0d66ca3a4e86375fad65).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
