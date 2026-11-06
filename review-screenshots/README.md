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

## Usage statistics saving state

The same mocked settings request is held pending in both images. Before: no visible save indicator and the selector remains interactive. After: visible spinner and the selector is disabled until completion.

- [Before](usage-statistics-saving-before.png)
- [After](usage-statistics-saving-after.png)

## Long selected source paths (2026-11-02)

- Before: main 59568a2114778760f8b0e54d973a84c5e116ddeb; production artifact from run 41425624625.
- After: codex/wrap-source-paths deb60e28070b40258f85e428c629ba23fcc9deb2; production artifact from run 41425604857.
- Identical synthetic POSIX, Windows and UNC source strings on backup 42. The same existing authenticated API fixture is used for both builds. Navigate to /backup/42/source-data; at mobile width, open the existing Options panel and wait for its slide-in transform to settle.
- Headless Chromium, 1280x850 and 390x850, en-US, UTC, light theme, service workers blocked. Unmodified screenshots. The path list remains scrollable; captures show its top. No unexpected API requests or browser page errors were observed. No live server or real user data was used.
- Images: source-paths-1280-before.png / source-paths-1280-after.png and source-paths-390-before.png / source-paths-390-after.png.

## Job execution log pagination (2026-11-06)

- Before: main 3d8e66730df0133aa14e28c924a2b3d2f4003cda, production artifact from run 42021942035. Its general-log source files are identical to the current main a057c9ae599b17d94c21c4faf6692798b04b0ae5 (jj diff: 0 files changed).
- After: 8a7f50d569561479978ccca23db2fe25a978211d, production artifact from run 42083866493.
- Same 102 synthetic Event log rows with ID gaps in both captures. The initial request returns 100 rows. Before/after images show the bottom of that initial page; only after has page navigation. The third image shows the two remaining rows after requesting offset=1307, with Log 1300 expanded.
- Chromium headless, 1280x850, en-US, UTC, light theme, service workers blocked. API responses are fixtures; no live server or user data. No unexpected API requests or page errors were observed. Unmodified screenshots.
- job-log-pagination-before.png / job-log-pagination-after.png / job-log-pagination-older.png.

## Keyboard focus (2026-11-07)
Main 36903b95 and candidate 68b22810 production artifacts, Chromium 1280x800 en-US/UTC. home-before-* and home-* show the same keyboard sequence ending on the Restores card. Existing home nested-button tab removal is already in main; this comparison illustrates the focus treatment. general-* shows the candidate's first route step focused. Authentication/API data are fixtures. Local capture checks passed in both themes. Main production job succeeded before its overall workflow was cancelled; this is not a claim that the cancelled main workflow passed.

