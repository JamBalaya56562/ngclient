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

## Weekly Monday start date (2026-10-24)

- Before: main f7c2e0ee2e687d5278eb615e60b1ef577bdccb7f; production artifact from run 39981424728.
- After: 51f033f7d406b4c5933bccdb1b4c62d2c7728190; production artifact from run 39981652763.
- Headless Chromium, 1280 x 800, en-US, Asia/Tokyo, light theme, service workers blocked. Date is fixed at 2026-10-12 10:00 JST (Monday); timers keep running.
- Open the schedule editor of the same synthetic backup, select Weekly monday 13:00, then select Custom to expose the computed start date without changing it. No save or backup execution is performed. Before shows 2026-10-19; after shows 2026-10-12. Both retain 13:00 and Monday-only weekly recurrence.
- API responses are mocked, including an empty fallback response for /api/v2/connection-strings; no live Duplicati server is used. No page errors were observed. Unmodified full-page screenshots.

## Stored server-log initial load (2026-10-24)

- Before: main 4c2cb9a067d41e86359e7dcbcb10d8768342dbb5 (0.0.244), production artifact from run 40035546912.
- After: 06476a7f5b9258824c3b32a8f8386e35e7d2a3bb, production artifact from run 40035749431.
- Open /about/logs/stored with the same synthetic log API response containing one event. Before: two initial GET /api/v1/logdata/log requests and two identical rendered rows. After: one request and one row. No Load more or other action is clicked.
- Headless Chromium, 1280 x 800, en-US, UTC, light theme, service workers blocked. All API responses mocked; no live Duplicati server used. No unexpected requests or page errors in either capture. Unmodified full-page screenshots.
