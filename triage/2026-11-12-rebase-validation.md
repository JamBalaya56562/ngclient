# rebase後の全ブランチ検証（2026-11-12）

基準main: 8edaeee84c0c0f4a48e75ae917195cb1047b15a5。以下は今回実行して確認した結果（検証済み）。

各ブランチで bun run test:ci と bun run build:prod を順次実行した。差分にE2Eがある場合は、同じ本番成果物に対して bun run test:e2e <変更したspec> も実行した。APIはモックであり、今回の実サーバー検証は行っていない。

| ブックマーク | SHA | 単体テスト | 本番ビルド | 変更E2E |
| --- | --- | --- | --- | --- |
| codex/add-backup-router-links | 31af720d00e408375c87d087a4a7d3e26970f2c9 | Tests  2109 passed (2109) | Application bundle generation complete. [71.518 seconds] - 2026-11-12T09:49:39.117Z | 7 passed (43.3s) |
| codex/backup-route-input-binding | f6569d1dd375df78d60b4bd6bb8f910d2afa3b99 | Tests  2113 passed (2113) | Application bundle generation complete. [50.555 seconds] - 2026-11-12T09:54:18.053Z | 1 passed (11.9s) |
| codex/command-result-route-input-binding | ae6b107c1bad3ed8561f6a7cbf3d395b005b9f99 | Tests  2114 passed (2114) | Application bundle generation complete. [62.617 seconds] - 2026-11-12T09:57:13.744Z | 3 passed (23.1s) |
| codex/console-connection-router-links | f32488f65898b63523cef2871aa4b3b4c44270c6 | Tests  2123 passed (2123) | Application bundle generation complete. [33.933 seconds] - 2026-11-12T09:59:57.210Z | 5 passed (18.6s) |
| codex/job-log-route-input-binding | 225507c68a40211b735648cd404364894b512b1c | Tests  2113 passed (2113) | Application bundle generation complete. [24.957 seconds] - 2026-11-12T10:01:59.666Z | 1 passed (6.4s) |
| codex/migrate-database-path-signal-forms | 37e0cc7023889ceec46c13b531fa2711ac4c02e5 | Tests  2109 passed (2109) | Application bundle generation complete. [24.821 seconds] - 2026-11-12T10:03:43.366Z | 差分なし |
| codex/migrate-export-signal-forms | beb9b8d832578f32af92eaa9de6cb996e390d721 | Tests  2111 passed (2111) | Application bundle generation complete. [24.756 seconds] - 2026-11-12T10:05:14.978Z | 5 passed (16.0s) |
| codex/migrate-home-search-signal-forms | 6cb1bc0efc459caf42b4117eac15f3bb83bf3ad3 | Tests  2111 passed (2111) | Application bundle generation complete. [60.628 seconds] - 2026-11-12T10:09:05.989Z | 3 passed (14.4s) |
| codex/migrate-import-selection-signal-forms | b6507b739b32a09758f658fbb865cff729c559c2 | Tests  2109 passed (2109) | Application bundle generation complete. [33.787 seconds] - 2026-11-12T10:11:46.643Z | 4 passed (18.5s) |
| codex/migrate-initial-passphrase-signal-forms | 17a6f4dd76e9388343e75244a714ec0087373724 | Tests  2111 passed (2111) | Application bundle generation complete. [30.155 seconds] - 2026-11-12T10:13:44.338Z | 2 passed (11.0s) |
| codex/migrate-remote-registration-signal-forms | 45b1f854abcc77d8afb678d38d22a48f35df925b | Tests  2111 passed (2111) | Application bundle generation complete. [28.058 seconds] - 2026-11-12T10:15:53.542Z | 差分なし |
| codex/migrate-restore-search-signal-forms | 711e4fa11a4a29428fd0e55158917d413cf1a140 | Tests  2108 passed (2108) | Application bundle generation complete. [54.137 seconds] - 2026-11-12T10:18:21.872Z | 2 passed (9.8s) |
| codex/migrate-restore-url-signal-forms | 7fbe2d20bb7b99d061be7edf8dbe7e74f9946eb3 | Tests  2113 passed (2113) | Application bundle generation complete. [32.999 seconds] - 2026-11-12T10:20:34.704Z | 1 passed (7.0s) |
| codex/migrate-throttle-signal-forms | e95931c9d54cd349f5c917b10eb7ca17ad7b1e1b | Tests  2110 passed (2110) | Application bundle generation complete. [57.315 seconds] - 2026-11-12T10:22:55.584Z | 差分なし |
| codex/migrate-version-labels-signal-forms | d30f9e7c3245d38f6926d88c7c876a49f0285883 | Tests  2109 passed (2109) (VITEST_MAX_WORKERS=1) | Application bundle generation complete. [77.430 seconds] - 2026-11-12T10:31:59.306Z | 1 passed (13.0s) |
| codex/public-signal-helpers | b67862c67d11b0f843f017e7c4b0808ef7118813 | Tests  2115 passed (2115) (VITEST_MAX_WORKERS=1) | Application bundle generation complete. [93.903 seconds] - 2026-11-12T10:39:23.058Z | 差分なし |
| codex/service-hub-timer-lifecycle | 15b674b89ee2367a21c532a3b8d74aa8ed7c42c4 | Tests  2114 passed (2114) (VITEST_MAX_WORKERS=1) | Application bundle generation complete. [92.646 seconds] - 2026-11-12T10:45:16.688Z | 差分なし |
| codex/show-file-tree-link-target | 0e6c7a221b57c4792ab8c5472bab8ccec95e95be | Tests  2110 passed (2110) (VITEST_MAX_WORKERS=1) | Application bundle generation complete. [41.369 seconds] - 2026-11-12T10:49:57.700Z | 差分なし |
| codex/sidebar-router-links | c45051e4676cf3dd3500d9009ece598c1ba38be8 | Tests  2107 passed (2107) (VITEST_MAX_WORKERS=1) | Application bundle generation complete. [88.100 seconds] - 2026-11-12T10:55:16.410Z | 24 passed (2.7m) |
| fix/folder-filter-separators | 2232cf5f0703728f979672b0ff48812aa6a428b9 | Tests  2113 passed (2113) (VITEST_MAX_WORKERS=1) | Application bundle generation complete. [125.842 seconds] - 2026-11-12T11:06:47.855Z | 差分なし |
| triage | c8bf87d15f7ed612a5029d89cd09c32530d8cd62 | Tests  2107 passed (2107) (VITEST_MAX_WORKERS=1) | Application bundle generation complete. [47.379 seconds] - 2026-11-12T11:17:19.674Z | 差分なし |

最初のadd-backup-router-linksの全単体テストでは、週次プリセットの1テストが5000msでタイムアウトした（2108成功/1失敗）。同じ全テストの再実行は2109件成功し、コード修正は行わなかった。Playwrightの初回呼び出しではWindowsのパス区切りによりNo tests foundとなったため、検証用スクリプトの引数をスラッシュに修正した。製品コードは変更していない。

コマンドと出力の原本はローカル tmp/maintenance-20261112/*-test.log、*-build.log、*-e2e.log と validation-results.json に保存。Git管理外のため永続的な配布物ではない。

画像保管用codex/pr-review-screenshotsは固定SHAリンク保護のためrebase・今回の検証から除外。

世代ラベルの並列実行では、初回は3件、再試行は別の4件が5000msでタイムアウトした。VITEST_MAX_WORKERS=1で全2109テスト成功し、その後の残り6ブランチもworker数1で実行した。テストのタイムアウト値やnode_modulesのコードは変更していない。

PowerShellでの再現コマンド: $env:VITEST_MAX_WORKERS = '1'; & <mise管理のbun.exe> run test:ci

triageの初回はworker起動の固定60秒タイムアウトでno tests / 1 error（60.56秒）。再試行では全テスト成功。START_TIMEOUT / WORKER_START_TIMEOUTとnode_modulesの内容は変更しなかった。

## origin同期と公開（検証済み）

20実装ブランチとtriageをoriginへpushし、全21件のローカル・origin SHA一致を確認した。全20実装ブランチの先端は検証開始時から不変。PR作成前にupstream/mainが同じSHAでopen PRが0件であることを再確認した。

次の10件は全てmainを直接の親とし、相互にも他の準備済みブランチにも変更ファイルの重複がない。全体移行の完了ではないためRefs #497とし、Fixesは付けていない。
- [codex/migrate-database-path-signal-forms](https://github.com/duplicati/ngclient/pull/695)
- [codex/migrate-export-signal-forms](https://github.com/duplicati/ngclient/pull/696)
- [codex/migrate-home-search-signal-forms](https://github.com/duplicati/ngclient/pull/697)
- [codex/migrate-import-selection-signal-forms](https://github.com/duplicati/ngclient/pull/698)
- [codex/migrate-initial-passphrase-signal-forms](https://github.com/duplicati/ngclient/pull/699)
- [codex/migrate-remote-registration-signal-forms](https://github.com/duplicati/ngclient/pull/700)
- [codex/migrate-restore-search-signal-forms](https://github.com/duplicati/ngclient/pull/701)
- [codex/migrate-restore-url-signal-forms](https://github.com/duplicati/ngclient/pull/702)
- [codex/migrate-throttle-signal-forms](https://github.com/duplicati/ngclient/pull/703)
- [codex/migrate-version-labels-signal-forms](https://github.com/duplicati/ngclient/pull/704)

triageの検証後の変更はMarkdownの記録のみ。画像保存用ブランチは固定SHAのまま保持した。
