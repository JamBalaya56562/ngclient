# Add an optional sign-out after a period of inactivity

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

- `ng test ngclient --watch=false --include=…/idle-logout.state.spec.ts --include=…/idle-logout-settings.spec.ts --include=…/app-auth.state.spec.ts`: all 38 tests pass.
  - The state spec uses the real `AppAuthState` with fake timers.
  - It asserts the outbound `postApiV1AuthRefreshLogout` call and the navigation to `/login`.
- I checked that the spec catches regressions by breaking the code on purpose:
  - With the sign-out call removed, 9 tests fail.
  - With the shared activity read removed and the relay guard bypassed, 2 tests fail (the other-tab test and the relay test).
- End to end, I ran a local Duplicati server, `ng serve` with a proxy, and Playwright with `page.clock`:
  - After selecting 5 minutes, the setting is stored.
  - Being idle for 4 minutes does not sign out, and activity restarts the idle time.
  - Being idle for 5 minutes or more sends one `POST /api/v1/auth/refresh/logout` and lands on `/login`.
- `ng build ngclient --configuration development` succeeds.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
