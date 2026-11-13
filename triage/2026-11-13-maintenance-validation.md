# 2026-11-13 main更新・ブランチ整理・検証・PR公開

## 基準と整理

**検証済み**: upstream/main・ローカルmain・origin/mainを `4da4c83a6aa0879413f3d2e765cf84b95a417ad8` に更新。`jj git fetch --all-remotes` と `gh pr list --repo duplicati/ngclient --state all --limit 100 --json ...` で #695〜#705 の11件のMERGEDとhead SHAを照合した。

11本のマージ済みブックマークをローカルとoriginから個別指定で削除した。各headはmainの祖先に含まれることを `jj log -r "(<11 heads>) ~ ancestors(main)" --no-graph` の空の結果で確認済み。統合済みコミット自体はmainの履歴として保持し、main履歴の書き換え・GCは行っていない。

| 削除したブックマーク | 統合済みhead |
| --- | --- |
| `codex/migrate-database-path-signal-forms` | `37e0cc7023889ceec46c13b531fa2711ac4c02e5` |
| `codex/migrate-export-signal-forms` | `beb9b8d832578f32af92eaa9de6cb996e390d721` |
| `codex/migrate-home-search-signal-forms` | `6cb1bc0efc459caf42b4117eac15f3bb83bf3ad3` |
| `codex/migrate-import-selection-signal-forms` | `b6507b739b32a09758f658fbb865cff729c559c2` |
| `codex/migrate-initial-passphrase-signal-forms` | `17a6f4dd76e9388343e75244a714ec0087373724` |
| `codex/migrate-remote-registration-signal-forms` | `45b1f854abcc77d8afb678d38d22a48f35df925b` |
| `codex/migrate-restore-search-signal-forms` | `711e4fa11a4a29428fd0e55158917d413cf1a140` |
| `codex/migrate-restore-url-signal-forms` | `7fbe2d20bb7b99d061be7edf8dbe7e74f9946eb3` |
| `codex/migrate-throttle-signal-forms` | `e95931c9d54cd349f5c917b10eb7ca17ad7b1e1b` |
| `codex/migrate-version-labels-signal-forms` | `d30f9e7c3245d38f6926d88c7c876a49f0285883` |
| `fix/passphrase-only-backup-encryption` | `7ce756725520ed7533d1c87b24d734484c46cb26` |

残存26実装ブランチとtriageを `jj rebase -b <bookmark> -d main` で更新。競合なし。スクリーンショット参照用 `codex/pr-review-screenshots` は過去PRの画像URLを維持するため、`193398fbffcbda23945e031e16f49ece9de733a4` のまま保管した。別セッションのclaude-fixesワークスペースは変更しない。

## 検証

**検証済み**: Aboutブランチで全単体テスト165ファイル・2149件が成功。共通Signalヘルパーでも全単体テストを実行し、他の各ブランチでは変更したspecと変更ソースの所属フォルダーの関連specを実行した。26本すべてで `bun run build:prod` が成功。変更されたE2E specは各ブランチの本番ビルドに対し実行した。

テストは `VITEST_MAX_WORKERS=1` で順番に実行。Vitestの起動待ちだけを一時的に300秒へ延長し、終了時に元のファイルへ戻した。復元後のSHA256は `1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD`。jsdomのCSS解析メッセージは前回の全体テストのログにも存在する。

初回Add Backupの全体テストは、基準となる全体テスト成功後に関連specへ切り替えるため中断した。中断した実行は成功・失敗件数に含めていない。

実サーバーの再検証は**未検証**。E2EはAPIをモックしたブラウザーテスト。詳細ログ・実行コマンド・中断ログはGit管理外の `tmp/maintenance-20261113/` に保存。

| ブックマーク | 検証したSHA | 単体テスト | 本番ビルド | 変更E2E |
| --- | --- | --- | --- | --- |
| `codex/about-navigation-links` | `3acd07435d862fbbcb90c5a3e2efa44b103e6d0f` | Tests  2149 passed (2149) | 成功 | 3 passed (26.6s) |
| `codex/add-backup-router-links` | `f5c6ae40979bb8f0825ec896c3a3c4ac4e051f1e` | Tests  2 passed (2) | 成功 | 7 passed (29.0s) |
| `codex/backup-route-input-binding` | `4911ce74817cd7fdddfe8c18deba0319344351ce` | Tests  777 passed (777) | 成功 | 1 passed (10.1s) |
| `codex/command-result-route-input-binding` | `f0e4fdd1252204004073d0fbe8f87263e0e5a5d4` | Tests  19 passed (19) | 成功 | 3 passed (10.6s) |
| `codex/commandline-home-link` | `fe3fd46c94d7c960d616a77a2021fbca0c19b302` | Tests  9 passed (9) | 成功 | 1 passed (8.5s) |
| `codex/console-connection-router-links` | `f41f38f6bf9c53bb62f245484b0b2f3dda672969` | Tests  73 passed (73) | 成功 | 5 passed (13.7s) |
| `codex/delete-backup-navigation-links` | `a925193f2de8dbac63a16afb6704c406000c0a5b` | Tests  10 passed (10) | 成功 | 4 passed (21.1s) |
| `codex/import-home-navigation-link` | `651dc52831f5740b1575995340490ef157ea101e` | Tests  19 passed (19) | 成功 | 4 passed (54.5s) |
| `codex/job-log-route-input-binding` | `5919d1ef0fd6794e095e5c94eb448bc63279e35c` | Tests  49 passed (49) | 成功 | 1 passed (25.1s) |
| `codex/logout-navigation-link` | `dd552ba53df66e2938f3945707ce2d115c9103b8` | Tests  3 passed (3) | 成功 | 2 passed (17.9s) |
| `codex/logs-router-subscription-lifecycle` | `35451abd91616422751991fea37394bf9dcd6c3e` | Tests  26 passed (26) | 成功 | 1 passed (16.8s) |
| `codex/longpoll-service-lifecycle` | `18aca0b279fcc73eb43ca71eb1ea6c3227673184` | Tests  276 passed (276) | 成功 | 対象のspec変更なし |
| `codex/public-signal-helpers` | `4fa7bae34c23627873a383c88b0c541752d9e404` | Tests  2152 passed (2152) | 成功 | 対象のspec変更なし |
| `codex/restore-options-back-link` | `2d81cb5695d7f4075b463a997dd1314f1ea0bef5` | Tests  56 passed (56) | 成功 | 4 passed (35.9s) |
| `codex/restore-progress-route-input` | `f0ac09cdd316bf52daebe5ee32ece57a8a00013e` | Tests  34 passed (34) | 成功 | 対象のspec変更なし |
| `codex/service-hub-timer-lifecycle` | `161891f16302841fbfac667f623b3d78fccbe0ea` | Tests  7 passed (7) | 成功 | 対象のspec変更なし |
| `codex/show-file-tree-link-target` | `9c364ba730139adb4c01b783e853fe3ff800fe3b` | Tests  186 passed (186) | 成功 | 対象のspec変更なし |
| `codex/sidebar-router-links` | `c9241c82c6a795de8e45d52f5981437a886ede38` | Tests  11 passed (11) | 成功 | 24 passed (1.7m) |
| `codex/status-snapshot-lifecycle` | `7345b1bc575201b4b2e24aac3a82972bcc372c04` | Tests  30 passed (30) | 成功 | 2 passed (10.0s) |
| `codex/status-task-action-lifecycle` | `198d244cfd5c94685aecb6a26c1742973210ed74` | Tests  34 passed (34) | 成功 | 3 passed (21.7s) |
| `codex/statusbar-progress-lifecycle` | `f6c03bc1706f3c85433c2198b538e21f3095c2fc` | Tests  67 passed (67) | 成功 | 2 passed (9.5s) |
| `codex/task-waiter-service-lifecycle` | `308644352ab72d48db051342f68808140920e769` | Tests  278 passed (278) | 成功 | 対象のspec変更なし |
| `codex/update-check-lifecycle` | `499f59df9833d3845d9de4393fa5ee2fc2a068b9` | Tests  7 passed (7) | 成功 | 2 passed (10.4s) |
| `codex/wizard-home-navigation-links` | `bee9835f9136ef094b26e2fa252af4fa6243a085` | Tests  15 passed (15) | 成功 | 2 passed (11.7s) |
| `fix/browse-approve-host-key` | `3a634879b2a233dfb7af6164561e17cfbf99e66c` | Tests  24 passed (24) | 成功 | 対象のspec変更なし |
| `fix/folder-filter-separators` | `fcbf3d91a2052ad96ee9d4e298aad821264595dd` | Tests  6 passed (6) | 成功 | 対象のspec変更なし |

### 実行した単体テストのコマンド

- `codex/about-navigation-links`: `VITEST_MAX_WORKERS=1 bun run test:ci`
- `codex/add-backup-router-links`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/add-backup/**/*.spec.ts --include projects/ngclient/src/app/add-backup/add-backup.component.spec.ts`
- `codex/backup-route-input-binding`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/**/*.spec.ts --include projects/ngclient/src/app/backup/backup-route-input.spec.ts --include projects/ngclient/src/app/backup/backup.editor-save.spec.ts`
- `codex/command-result-route-input-binding`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/commandline-result/**/*.spec.ts --include projects/ngclient/src/app/backup/commandline-result/commandline-result-route-input.spec.ts --include projects/ngclient/src/app/backup/commandline-result/commandline-result.component.spec.ts`
- `codex/commandline-home-link`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/commandline/**/*.spec.ts --include projects/ngclient/src/app/backup/commandline/commandline.navigation.spec.ts`
- `codex/console-connection-router-links`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/core/components/status-bar/**/*.spec.ts --include projects/ngclient/src/app/core/components/status-bar/remote-connectivity-status/**/*.spec.ts --include projects/ngclient/src/app/core/components/status-bar/remote-connectivity-status/remote-connectivity-status.spec.ts`
- `codex/delete-backup-navigation-links`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/delete-backup/**/*.spec.ts --include projects/ngclient/src/app/backup/delete-backup/delete-backup.component.spec.ts`
- `codex/import-home-navigation-link`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/import/**/*.spec.ts --include projects/ngclient/src/app/backup/import/import.component.spec.ts`
- `codex/job-log-route-input-binding`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/log/**/*.spec.ts --include projects/ngclient/src/app/backup/log/log-route-input.spec.ts`
- `codex/logout-navigation-link`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/logout/**/*.spec.ts --include projects/ngclient/src/app/logout/logout.component.spec.ts`
- `codex/logs-router-subscription-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/about/logs/**/*.spec.ts --include projects/ngclient/src/app/about/logs/logs.component.spec.ts`
- `codex/longpoll-service-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/core/services/**/*.spec.ts --include projects/ngclient/src/app/core/services/server-status-longpoll.service.spec.ts`
- `codex/public-signal-helpers`: `VITEST_MAX_WORKERS=1 bun run test:ci`
- `codex/restore-options-back-link`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/restore-flow/options/**/*.spec.ts --include projects/ngclient/src/app/restore-flow/options/options.navigation.spec.ts`
- `codex/restore-progress-route-input`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/restore-flow/restore-progress/**/*.spec.ts --include projects/ngclient/src/app/restore-flow/restore-progress/restore-progress-route-input.spec.ts --include projects/ngclient/src/app/restore-flow/restore-progress/restore-progress.component.spec.ts`
- `codex/service-hub-timer-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/core/components/service-hub/**/*.spec.ts --include projects/ngclient/src/app/core/components/service-hub/service-hub.component.spec.ts`
- `codex/show-file-tree-link-target`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/core/components/file-tree/**/*.spec.ts --include projects/ngclient/src/app/core/components/file-tree/file-tree.keyboard.spec.ts --include projects/ngclient/src/app/core/openapi/**/*.spec.ts`
- `codex/sidebar-router-links`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/layout/**/*.spec.ts`
- `codex/status-snapshot-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/status/**/*.spec.ts --include projects/ngclient/src/app/status/status.state.spec.ts`
- `codex/status-task-action-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/status/**/*.spec.ts --include projects/ngclient/src/app/status/status.actions.spec.ts`
- `codex/statusbar-progress-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/core/components/status-bar/**/*.spec.ts --include projects/ngclient/src/app/core/components/status-bar/status-bar.polling.spec.ts`
- `codex/task-waiter-service-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/core/services/**/*.spec.ts --include projects/ngclient/src/app/core/services/server-state.service.spec.ts`
- `codex/update-check-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/about/general/**/*.spec.ts --include projects/ngclient/src/app/about/general/general.component.spec.ts`
- `codex/wizard-home-navigation-links`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/purge-files/select-files/**/*.spec.ts --include projects/ngclient/src/app/backup/purge-files/select-files/select-files.navigation.spec.ts --include projects/ngclient/src/app/restore/restore-from-config/**/*.spec.ts --include projects/ngclient/src/app/restore/restore-from-config/restore-from-config.component.spec.ts`
- `fix/browse-approve-host-key`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/destination/single-destination/**/*.spec.ts --include projects/ngclient/src/app/backup/destination/single-destination/single-destination.component.spec.ts`
- `fix/folder-filter-separators`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/source-data/filter/**/*.spec.ts --include projects/ngclient/src/app/backup/source-data/filter/filter.component.spec.ts`

## 作成したPR

**検証済み**: 作成前のopen PRは0件。以下10本はいずれもmainを直接の親に持つことを確認し、先行PRに依存するスタックは出していない。各headの重複PRを確認して作成した。Issue全体を解決する範囲ではないため、誤ってcloseするFixesは付けていない。

- [#706](https://github.com/duplicati/ngclient/pull/706) `codex/public-signal-helpers`
- [#707](https://github.com/duplicati/ngclient/pull/707) `codex/service-hub-timer-lifecycle`
- [#708](https://github.com/duplicati/ngclient/pull/708) `codex/sidebar-router-links`
- [#709](https://github.com/duplicati/ngclient/pull/709) `codex/add-backup-router-links`
- [#710](https://github.com/duplicati/ngclient/pull/710) `codex/console-connection-router-links`
- [#711](https://github.com/duplicati/ngclient/pull/711) `codex/backup-route-input-binding`
- [#712](https://github.com/duplicati/ngclient/pull/712) `codex/job-log-route-input-binding`
- [#713](https://github.com/duplicati/ngclient/pull/713) `codex/command-result-route-input-binding`
- [#714](https://github.com/duplicati/ngclient/pull/714) `codex/restore-progress-route-input`
- [#715](https://github.com/duplicati/ngclient/pull/715) `codex/logs-router-subscription-lifecycle`

## 最終照合

**検証済み**: 26実装を `jj git push --remote origin -b <各ブックマーク>` でpushし、triageも更新・pushした。main・triage・画像保管用を含む全29ローカル/originブックマークのSHAが一致した。PR #706〜#715の10件は検証済みhead SHA・base main・本文の完全SHAリンクと指定の最終行をghで照合済み。GitHub CIには待機・実行中のチェックがあり、完了は未検証。作業ツリーはcleanで、作業用ワークスペースは整理済み。
