# rebase後の全実装ブランチ検証・9件のPR公開（2026-11-14）

## 検証範囲

検証済み: 最新main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`（0.0.250）上の10実装ブランチを順番に検証。公開可能9件と確認し、利用者の追加回答「今回は公開可能な9件」に従って9件を公開した。

- 全10件で関連単体テスト、app/spec/E2Eの型チェック、変更ファイルのPrettier、本番ビルドが成功。詳細オプションとlive E2Eのブランチでは全単体テストを実行。
- 変更E2Eを各ブランチの本番成果物で実行。WebSocketは認証系E2Eも実行。live以外のE2EはAPIモック、liveは隔離した実サーバー。
- 修正が必要な失敗なし。検証したソースSHAはoriginと一致。
- 画像URL保持用codex/pr-review-screenshotsは固定SHAのまま。triageは文書のみでビルド対象外。別ワークスペースclaude-fixesは変更しない。

| ブランチ                               | 検証SHA                                    | 単体テスト               | E2E              | 型・整形・本番ビルド |
| -------------------------------------- | ------------------------------------------ | ------------------------ | ---------------- | -------------------- |
| `codex/advanced-options-actions`       | `4d50af9684de8c8d5b2f61a3097e06551ecbcba0` | Tests 2300 passed (2300) | 4 passed (42.9s) | 成功                 |
| `codex/show-file-tree-link-target`     | `d4f715de88e3fa6c435f852c249e18d52a75e2c6` | Tests 186 passed (186)   | 対象変更なし     | 成功                 |
| `codex/stable-backup-list-tracking`    | `03c222dc86eb038ca0648e8c4d607cd6c2f7d00a` | Tests 48 passed (48)     | 6 passed (53.3s) | 成功                 |
| `codex/status-snapshot-lifecycle`      | `6cafe57c78820bcbc3d0b56ff04e06917725e4eb` | Tests 30 passed (30)     | 2 passed (16.9s) | 成功                 |
| `codex/status-task-action-lifecycle`   | `18803f296cc8b77a79850623659fffc57e012ed4` | Tests 34 passed (34)     | 3 passed (24.2s) | 成功                 |
| `codex/statusbar-progress-lifecycle`   | `9e3e5cce3243b6aefbc0df3370d3811d52dc73f2` | Tests 83 passed (83)     | 2 passed (28.9s) | 成功                 |
| `codex/websocket-connection-lifecycle` | `1393c45e3e3f59ab7a67787ac0f4163aaac2c723` | Tests 291 passed (291)   | 6 passed (47.3s) | 成功                 |
| `fix/browse-approve-host-key`          | `a08f89f2c810aeb0a5d3423c296b50967020e9de` | Tests 24 passed (24)     | 対象変更なし     | 成功                 |
| `fix/folder-filter-separators`         | `edd1c01ec5771c6d525a57589bef20c178fe29b2` | Tests 6 passed (6)       | 対象変更なし     | 成功                 |
| `codex/live-editor-persistence-e2e`    | `74257b98e08f483b4963f9f35331870276a69a57` | Tests 2300 passed (2300) | 6 passed (2.4m)  | 成功                 |

## 実行コマンドと証拠

Node.js v26.13.1 / Bun 1.4.4。mise管理の実体を直接呼び、以下を実行。各ブランチの正確なinclude引数はGit管理外の `tmp/rebased-validation-20261114/*-command.txt` と `results.json` に保存。

```text
VITEST_MAX_WORKERS=1 bun run test:ci [--include <関連spec/フォルダー>]
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
node node_modules/prettier/bin/prettier.cjs --check <mainとの差分ファイル>
bun run build:prod
bun run test:e2e <変更spec>
PLAYWRIGHT_MODE=live DUPLICATI_SERVER_PATH=<隔離サーバー実行ファイル> bun run test:e2e
```

検証済み: 全コマンドexit 0。Vitestのworker起動待ちのみ一時的に300秒へ延長しfinallyで元バイト列へ復元。元SHA256 `1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD`。テスト自体のタイムアウトと依存lockfileは変更していない。既存jsdom CSS解析メッセージとNO_COLOR/FORCE_COLOR通知は失敗とは区別する。lint target/scriptは存在しないため、Prettierをlint成功とは表記しない。

検証済み: liveモードは公式Windows `2.4.1.101-Canary-20261107+424b1360b0d0767b3a67a874b4d99c92f17a877f` を新規データフォルダー・loopbackポートで起動。編集保存、通常バックアップ復元、AES保存済みキー、設定なし直接復元、誤パスフレーズ訂正、空パスフレーズ訂正の6ケースを実行し、テキストとバイナリーの復元内容を比較。利用者のサーバー・ジョブは使用しない。

## 依存・重複・Fixesの判断

検証済み: `jj git fetch --all-remotes` で更新。公開前のopen PRは0件。9件のheadをopen/closed両方で検索し重複なし。各ブランチの `parents(roots(main..bookmark))` は最新main 1件のみ。複数コミットはそれぞれ1つのPR内の実装履歴で、先行PRを必要とするスタックではない。

検証済み: 本体duplicati/duplicati#7775はマージ済み。リンク先表示はmainにある生成型を使用し、古い本体のnull/未定義もテスト。その他8件に新規本体APIの依存はない。

#636、#373、#111、#349は既にclose済み。#637のUI方針とは別の詳細オプション操作修正。#283の全体的な再接続問題と#273のテスト整備全体は今回の局所変更だけでcloseしない。該当するIssue全体を解決するPRがないため誤ったFixesは付けず、関連と範囲を本文に記載した。

旧 `fix/folder-filter-separators` はテスト・ビルド成功でもPRを保留。`rg -n "FilterComponent|<app-filter\b|source-data/filter/filter" projects` と現行FiltersComponentのimportsで、実画面がNewFilterComponentを使い旧FilterComponentを使わないことを確認。NGT-034はDEFERREDのまま。

## 公開PR

- [#727](https://github.com/duplicati/ngclient/pull/727) `codex/advanced-options-actions`
- [#728](https://github.com/duplicati/ngclient/pull/728) `codex/show-file-tree-link-target`
- [#729](https://github.com/duplicati/ngclient/pull/729) `codex/stable-backup-list-tracking`
- [#730](https://github.com/duplicati/ngclient/pull/730) `codex/status-snapshot-lifecycle`
- [#731](https://github.com/duplicati/ngclient/pull/731) `codex/status-task-action-lifecycle`
- [#732](https://github.com/duplicati/ngclient/pull/732) `codex/statusbar-progress-lifecycle`
- [#733](https://github.com/duplicati/ngclient/pull/733) `codex/websocket-connection-lifecycle`
- [#734](https://github.com/duplicati/ngclient/pull/734) `fix/browse-approve-host-key`
- [#735](https://github.com/duplicati/ngclient/pull/735) `codex/live-editor-persistence-e2e`

未検証: 通常E2E suite全体、Firefox/WebKit、Windowsローカル宛先以外の実サーバーliveフロー、GitHub CI完了。過去の実サーバー検証を今回再実行した結果とは混同しない。

検証済み: 通常モードのtest discoveryは178件/58ファイル、startupモードは10件/1ファイル。liveの6件は通常モードから除外。実行後の隔離DBのBackup行数は0、今回の隔離サーバープロセスも0件。作成した9件のPRをGitHub APIで読み返し、head SHAが上表と一致し、base=mainであることを確認した。
