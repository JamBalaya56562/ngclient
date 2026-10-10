# PR review screenshots

Screenshots only; this branch is not intended for merging.

- Baseline: main c8a706e91b0174a6918cca0489fcdb10e8560c01, production artifact from run 38048068216 (ef3f3f0adf169d2b792f93bec44d6022fdc4e85c, tests-only baseline).
- PR 565: c2a95a34b683b5cf6f23e8a43e7f6fe23f832ebb, production artifact from run 38047895213. Mocked backend returns TargetURL file:///backups%3Farchive for backup 1. Navigate to /backup/1/destination and select Manually type path. Baseline input: /backups; fixed input: /backups?archive. No page errors in either capture.
- PR 566: 49c7a71340704af2d4bdef5774b34e4e2bbcd264, production artifact from run 38048047745. Select saved zh-Hant locale, delay its real translation response by 1500 ms, navigate to /login, then capture after the response. Baseline remains English; fixed build uses the repository translation.
- Chromium headless, 1280 x 800 viewport, en-US browser locale, UTC timezone, light color scheme, service workers blocked. Images are unmodified page screenshots with empty password fields and synthetic backup data.
- No live Duplicati server was used.
