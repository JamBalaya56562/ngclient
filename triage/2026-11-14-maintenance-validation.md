# 2026-11-14 ブランチ整理・rebase・検証・PR公開

**検証済み**: `jj git fetch --all-remotes` と `gh pr list --repo duplicati/ngclient --state all --limit 100 --json number,title,state,mergedAt,headRefName,headRefOid,url` で #706〜#715 のMERGEDと手元のhead SHAを照合。最新mainは `f217ce91146c6be358f054f32f030e2503ad3005`。forkのmainも更新した。

各headがmainの祖先であることを `jj log -r "(<10 heads>) ~ ancestors(main@upstream)" --no-graph` の空の結果で確認し、以下10ブックマークをローカルとoriginから個別指定で削除した。mainに統合済みのコミットは履歴として保持し、履歴の書き換え・GCはしていない。

| 削除したブックマーク | 統合済みSHA |
| --- | --- |
| `codex/add-backup-router-links` | `f5c6ae40979bb8f0825ec896c3a3c4ac4e051f1e` |
| `codex/backup-route-input-binding` | `4911ce74817cd7fdddfe8c18deba0319344351ce` |
| `codex/command-result-route-input-binding` | `f0e4fdd1252204004073d0fbe8f87263e0e5a5d4` |
| `codex/console-connection-router-links` | `f41f38f6bf9c53bb62f245484b0b2f3dda672969` |
| `codex/job-log-route-input-binding` | `5919d1ef0fd6794e095e5c94eb448bc63279e35c` |
| `codex/logs-router-subscription-lifecycle` | `35451abd91616422751991fea37394bf9dcd6c3e` |
| `codex/public-signal-helpers` | `4fa7bae34c23627873a383c88b0c541752d9e404` |
| `codex/restore-progress-route-input` | `f0ac09cdd316bf52daebe5ee32ece57a8a00013e` |
| `codex/service-hub-timer-lifecycle` | `161891f16302841fbfac667f623b3d78fccbe0ea` |
| `codex/sidebar-router-links` | `c9241c82c6a795de8e45d52f5981437a886ede38` |

**検証済み**: 残存16実装ブランチとtriageを `jj rebase -b <bookmark> -d main` でrebase。競合なし。triageの32コミットは調査文書の履歴で、mainとの差分はtriage内のMarkdownのみ。過去PRの画像参照用 `codex/pr-review-screenshots` は `193398fbffcbda23945e031e16f49ece9de733a4` のまま保持。別セッションのclaude-fixesワークスペースは変更していない。

## 検証とpush

Aboutブランチでは全単体テスト、他の15本では変更したspecと変更ソースの所属フォルダーの関連specを実行した。16本すべてで `bun run build:prod` が成功。変更されたE2E specは各ブランチの本番ビルドに対して実行した。検証したSHAを照合して `jj git push --remote origin -b <各16ブックマーク>` でpushした。

`VITEST_MAX_WORKERS=1` で順番に検証。Vitestの起動待ちだけを一時的に300秒へ延長し、終了時に元のファイルへ戻した。元ファイルのSHA256: `1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD`。既存jsdomのCSS解析メッセージと環境のNO_COLOR/FORCE_COLORメッセージはテストの失敗とは区別する。

実サーバーでの再検証とGitHub CIの完了は**未検証**。E2EはAPIをモックしたブラウザーテスト。生ログ・コマンド・結果JSONはGit管理外の `tmp/maintenance-20261114/` に保存。

| ブックマーク | 検証したSHA | 単体テスト | 本番ビルド | 変更E2E |
| --- | --- | --- | --- | --- |
| `codex/about-navigation-links` | `4de6534c1957edf56a15bd987d6ea766e4bd68ed` | Tests  2265 passed (2265) | 成功 | 3 passed (25.0s) |
| `codex/commandline-home-link` | `84c9fbdfaad83cd062bbb1c42b8c7ff7d8b96ea9` | Tests  9 passed (9) | 成功 | 1 passed (9.8s) |
| `codex/delete-backup-navigation-links` | `a91c7a5f7b3dec54bb355f21e367c8fbe7076c07` | Tests  10 passed (10) | 成功 | 4 passed (26.5s) |
| `codex/import-home-navigation-link` | `a515af180b623dbdea741581589968990fd375de` | Tests  19 passed (19) | 成功 | 4 passed (1.0m) |
| `codex/logout-navigation-link` | `cecb62f86ed866be9d72f755d98d6d72ebe910c6` | Tests  3 passed (3) | 成功 | 2 passed (35.1s) |
| `codex/longpoll-service-lifecycle` | `583783ae87a346843543577fd4ce5c0e852c400b` | Tests  276 passed (276) | 成功 | 対象specの変更なし |
| `codex/restore-options-back-link` | `8d98b545e9df70a4be719fd70432d1726232c723` | Tests  56 passed (56) | 成功 | 4 passed (1.2m) |
| `codex/show-file-tree-link-target` | `ed5b8705b9280f91831910fbb24db1351a3dc879` | Tests  186 passed (186) | 成功 | 対象specの変更なし |
| `codex/status-snapshot-lifecycle` | `683e0307b24da1fc5c2bcb8100e6ad0203073b00` | Tests  30 passed (30) | 成功 | 2 passed (49.4s) |
| `codex/status-task-action-lifecycle` | `b9114743f72b19ebed9b6e74f4643cce0c721485` | Tests  34 passed (34) | 成功 | 3 passed (26.6s) |
| `codex/statusbar-progress-lifecycle` | `d1edf99297872f0c3ad12dc9826f7d111037b566` | Tests  83 passed (83) | 成功 | 2 passed (17.6s) |
| `codex/task-waiter-service-lifecycle` | `f6df160719b8288f317c76039e0ebd686d0f930e` | Tests  278 passed (278) | 成功 | 対象specの変更なし |
| `codex/update-check-lifecycle` | `a2f284535a10b8c622652ad6aa37b6f3a82a85d8` | Tests  7 passed (7) | 成功 | 2 passed (21.6s) |
| `codex/wizard-home-navigation-links` | `9caad3a1ae757cd881e53bb6fc956be43532d1bc` | Tests  15 passed (15) | 成功 | 2 passed (21.8s) |
| `fix/browse-approve-host-key` | `65cfb854b21aa370dd9af59022a657fe13ee71f9` | Tests  24 passed (24) | 成功 | 対象specの変更なし |
| `fix/folder-filter-separators` | `c74aaad29011e553ea2e3d66b7791c7c5d89c688` | Tests  6 passed (6) | 成功 | 対象specの変更なし |

### 実行コマンド

**検証済み（rebase後の修正）**: `codex/show-file-tree-link-target` は最初の関連specのコンパイルで `TS2300: Duplicate identifier symlinkTarget` によりexit 1。mainにも同じ型・Swaggerプロパティが存在し、rebaseで異なる位置に二重定義されていた。`jj restore --from main swagger.json projects/ngclient/src/app/core/openapi/types.gen.ts` と `jj squash --into codex/show-file-tree-link-target` でmainの生成済みAPI定義を採用し、UIとspecの3ファイルだけの差分に整理。上表は修正後の検証済みSHAと結果。修正前の出力は `tmp/maintenance-20261114/codex-show-file-tree-link-target-before-fix-test.log`、旧結果は `validation-results-before-fix.json` に保存。

- `codex/about-navigation-links`: `VITEST_MAX_WORKERS=1 bun run test:ci`
- `codex/commandline-home-link`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/commandline/**/*.spec.ts --include projects/ngclient/src/app/backup/commandline/commandline.navigation.spec.ts`
- `codex/delete-backup-navigation-links`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/delete-backup/**/*.spec.ts --include projects/ngclient/src/app/backup/delete-backup/delete-backup.component.spec.ts`
- `codex/import-home-navigation-link`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/import/**/*.spec.ts --include projects/ngclient/src/app/backup/import/import.component.spec.ts`
- `codex/logout-navigation-link`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/logout/**/*.spec.ts --include projects/ngclient/src/app/logout/logout.component.spec.ts`
- `codex/longpoll-service-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/core/services/**/*.spec.ts --include projects/ngclient/src/app/core/services/server-status-longpoll.service.spec.ts`
- `codex/restore-options-back-link`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/restore-flow/options/**/*.spec.ts --include projects/ngclient/src/app/restore-flow/options/options.navigation.spec.ts`
- `codex/show-file-tree-link-target`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/core/components/file-tree/**/*.spec.ts --include projects/ngclient/src/app/core/components/file-tree/file-tree.keyboard.spec.ts`
- `codex/status-snapshot-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/status/**/*.spec.ts --include projects/ngclient/src/app/status/status.state.spec.ts`
- `codex/status-task-action-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/status/**/*.spec.ts --include projects/ngclient/src/app/status/status.actions.spec.ts`
- `codex/statusbar-progress-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/core/components/status-bar/**/*.spec.ts --include projects/ngclient/src/app/core/components/status-bar/status-bar.polling.spec.ts`
- `codex/task-waiter-service-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/core/services/**/*.spec.ts --include projects/ngclient/src/app/core/services/server-state.service.spec.ts`
- `codex/update-check-lifecycle`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/about/general/**/*.spec.ts --include projects/ngclient/src/app/about/general/general.component.spec.ts`
- `codex/wizard-home-navigation-links`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/purge-files/select-files/**/*.spec.ts --include projects/ngclient/src/app/backup/purge-files/select-files/select-files.navigation.spec.ts --include projects/ngclient/src/app/restore/restore-from-config/**/*.spec.ts --include projects/ngclient/src/app/restore/restore-from-config/restore-from-config.component.spec.ts`
- `fix/browse-approve-host-key`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/destination/single-destination/**/*.spec.ts --include projects/ngclient/src/app/backup/destination/single-destination/single-destination.component.spec.ts`
- `fix/folder-filter-separators`: `VITEST_MAX_WORKERS=1 bun run test:ci --include projects/ngclient/src/app/backup/source-data/filter/**/*.spec.ts --include projects/ngclient/src/app/backup/source-data/filter/filter.component.spec.ts`

## 新規PR

**検証済み**: 作成前のopen PRは0件。以下10本はmainを直接の親に持ち、本体変更・先行PRに依存しない。既存の同じheadのPRを照合して作成。Issue全体を解決する範囲ではないため、誤ったFixesは付けていない。

- [#716](https://github.com/duplicati/ngclient/pull/716) `codex/about-navigation-links`
- [#717](https://github.com/duplicati/ngclient/pull/717) `codex/restore-options-back-link`
- [#718](https://github.com/duplicati/ngclient/pull/718) `codex/delete-backup-navigation-links`
- [#719](https://github.com/duplicati/ngclient/pull/719) `codex/wizard-home-navigation-links`
- [#720](https://github.com/duplicati/ngclient/pull/720) `codex/import-home-navigation-link`
- [#721](https://github.com/duplicati/ngclient/pull/721) `codex/commandline-home-link`
- [#722](https://github.com/duplicati/ngclient/pull/722) `codex/logout-navigation-link`
- [#723](https://github.com/duplicati/ngclient/pull/723) `codex/longpoll-service-lifecycle`
- [#724](https://github.com/duplicati/ngclient/pull/724) `codex/task-waiter-service-lifecycle`
- [#725](https://github.com/duplicati/ngclient/pull/725) `codex/update-check-lifecycle`
