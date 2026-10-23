# PR review screenshots

Screenshots only; this branch is not intended for merging.

- Baseline: main c8a706e91b0174a6918cca0489fcdb10e8560c01, production artifact from run 38048068216 (ef3f3f0adf169d2b792f93bec44d6022fdc4e85c, tests-only baseline).
- PR 565: c2a95a34b683b5cf6f23e8a43e7f6fe23f832ebb, production artifact from run 38047895213. Mocked backend returns TargetURL file:///backups%3Farchive for backup 1. Navigate to /backup/1/destination and select Manually type path. Baseline input: /backups; fixed input: /backups?archive. No page errors in either capture.
- PR 566: 49c7a71340704af2d4bdef5774b34e4e2bbcd264, production artifact from run 38048047745. Select saved zh-Hant locale, delay its real translation response by 1500 ms, navigate to /login, then capture after the response. Baseline remains English; fixed build uses the repository translation.
- Chromium headless, 1280 x 800 viewport, en-US browser locale, UTC timezone, light color scheme, service workers blocked. Images are unmodified page screenshots with empty password fields and synthetic backup data.
- No live Duplicati server was used.

## Sync restore and deletion (2026-10-23)

- Before: main cafe3772e8ef2482f99c3a8c83b13369c7a5a1fe; production artifact from run 39929909092.
- Restore after: b430e1d56c9644ca7d6514e3b6510cbe3646e32b; production artifact from run 39930731676.
- Delete after: 368e22c35222c50ba1d80259ed2efac11e335305; production artifact from run 39930745329.
- Same synthetic jobs in each capture: a versioned backup and a completed Sync job (OperationType Sync, BackupListCount 2). Filesystem validation is mocked as successful.
- Restore opens /restore. Deletion opens the Sync job menu on Home and selects Delete; no deletion is performed.
- Headless Chromium, 1280 x 900, en-US, UTC, light theme, service workers blocked. Unmodified full-page screenshots. No unexpected API requests or page errors in any capture; no live Duplicati server used.
