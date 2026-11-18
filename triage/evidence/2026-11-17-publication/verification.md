# 残存ブランチの全テスト・公開判定 (2026-11-17)

## 検証済み

- ngclient main: `81694ce023ffc16e76bef3a0472fea8ffe6c54d8`。残存実装11本は全てこのmainから独立している。
- 全11本で `bun run test:ci` と `bun run build:prod` が終了コード0。app/specの `tsc --noEmit -p projects/ngclient/tsconfig.{app,spec}.json` は同一SHAでの保守作業結果を再利用した（maintenanceのvalidation.json）。
- 公開対象4本の本番UIで、関連Playwrightを合計24件実行し全成功。各コマンドのspec一覧・SHAはbrowser-results.jsonl。
- `feat/file-tree-partial-exclusion` のTS/HTMLだけmainの改行形式に統一しoriginへpush。全単体テストの対象は元SHA `8fb2fde2a84cc134d8bfa320b8dc0e1c7eef47e0`、公開headは `e4d73be2e504746c3797ec80c7511f860339945a`。LFへ揃えたSHA-256が変更前後で同一であり、実装内容は不変。公開headで本番ビルド・ブラウザーテスト成功。GitHubのTS差分は1772追加/1738削除から35追加/1削除へ縮小。
- 一時的なPlaywrightの空きポート変更は復元した。恒久的な設定ファイルは追加していない。Vitestのworker timeoutは変更していない。

| ブランチ | 全単体テスト時のSHA | 全単体テスト | 本番ビルド |
| --- | --- | --- | --- |
| feat/compact-progress | `7706fb3802d9d97a92887686be2da6a4b525b442` | 2470 passed | pass |
| feat/export-global-options | `c9ef0c632d02d0aeda7f907275a7086ac9ad116f` | 2462 passed | pass |
| feat/file-tree-partial-exclusion | `8fb2fde2a84cc134d8bfa320b8dc0e1c7eef47e0` | 2464 passed | pass |
| feat/last-run-failed-indicator | `8fc77558945b6de7ea2ee771e33991090e76787d` | 2474 passed | pass |
| feat/log-compare-previous-version | `947ea31ffca525c2fafb837240e2bedf7c2710d5` | 2472 passed | pass |
| feat/restore-resume-drafts | `9a598c53767d78d4ca54f2e717c39745cfd92ad7` | 2467 passed | pass |
| feat/server-stored-theme | `d827c4653faa2957ec375dd1832e2758069543e1` | 2467 passed | pass |
| feat/show-db-encryption-preload-paths | `624f0a31c6a0c81796eb5951c980e19d93a1b490` | 2463 passed | pass |
| feat/show-resolved-source-shortcut | `321dd8cee474d192ca3238aa0eb53c3a577db17b` | 2461 passed | pass |
| feat/skip-next-scheduled-run | `626c51025224bb8095773452515796f9c5ca6cf0` | 2465 passed | pass |
| feat/ssl-certificate-upload | `ebf1e65269ee7b05d0f2b6e2fe1371dd698e3a40` | 2469 passed | pass |

単体テストには `Could not parse CSS stylesheet`、PlaywrightにはNO_COLOR/FORCE_COLORの警告出力がある。終了コードは全件0。警告が存在しないとは主張しない。フルE2Eを全11本で実行したわけではない。

## 実サーバー

`node tmp/publication-20261117/certificate-live.mjs`: 隔離した2.4.1.101 CanaryでPFXの誤パスワードHTTP400・入力保持・正しいパスワードでHTTP200・フォーム初期化を確認。隔離サーバー再起動後、HTTPSの証明書SHA-1指紋がアップロードした証明書と一致（certificate-live.json）。証明書ストアへは登録していない。

`node tmp/publication-20261117/compare-live.mjs`: 隔離サーバーで内容の違う2世代を作成。実ログの最新Backup行からbase=1/target=0のcompareを開く。最古Backup行では前版なしを表示。実fileset時刻・ログBeginTime/EndTimeはcompare-live.json。コマンドの実行結果そのものは今回未検証。

`node tmp/publication-20261117/source-live.mjs`: systeminfoが返す実際のHOMEパスをSource Dataの画面に表示し、GET backupのSourcesは%HOME%のままと確認。HOMEのバックアップは実行しない（source-live.json）。実サーバーはいずれも配布Canary 2.4.1.101。DLLに埋め込まれたソースSHAは未検証。

初回の検証スクリプトには、不要なCDPレスポンス本文取得と、List操作のログまで数える誤りがあった。前者は本文取得を除き、後者はBackup行を選ぶように直して成功。ngclientの不具合とは判定していない。

実サーバーは独立したserver-datafolderとテスト用ファイルを使用。検証終了時に作成ジョブ0件、ブラウザー・proxy・サーバーを停止。生成PFXとテストデータはGit管理外のtmp内にのみ残る。実行スクリプト・全ログ・PNGも同フォルダー内。

## 新規公開

- [#751](https://github.com/duplicati/ngclient/pull/751) Mark backed-up folders that have excluded subpaths — `feat/file-tree-partial-exclusion` / `e4d73be2e504746c3797ec80c7511f860339945a`
- [#752](https://github.com/duplicati/ngclient/pull/752) Show the folder a shortcut source path points to — `feat/show-resolved-source-shortcut` / `321dd8cee474d192ca3238aa0eb53c3a577db17b`
- [#753](https://github.com/duplicati/ngclient/pull/753) Compare a backup run with the previous version from the log — `feat/log-compare-previous-version` / `947ea31ffca525c2fafb837240e2bedf7c2710d5`
- [#754](https://github.com/duplicati/ngclient/pull/754) Add HTTPS certificate upload to the settings page — `feat/ssl-certificate-upload` / `ebf1e65269ee7b05d0f2b6e2fe1371dd698e3a40`
- [#755](https://github.com/duplicati/ngclient/pull/755) Show when the last run of a backup failed on the home page — `feat/last-run-failed-indicator` / `8fc77558945b6de7ea2ee771e33991090e76787d`

前回失敗表示は警告状態を含まないためPart of duplicati/duplicati#2764。他4件は関連IssueにFixesを指定。既存open #744は重複作成しない。

## 9件に届かない理由

既存実装11本 = 新規公開5 + 本体依存待ち5 + 既存PR #744の1。スタック後段や未実装API依存を公開して数を補わない。

本体master `4153951a6e49d0092d99c4b3bd6675a1805bfd80` をGitHub API・ソースで確認。各依存の元コミットはmasterとdiverged/behind 1、対応するAPIや応答項目・Compact進捗処理も最新masterにない（dependency-evidence.json / server-dependencies.json）。ngclientブランチ同士のstackはない。

- NGT-085 global options export: include-global-options未実装。
- NGT-086 skip next run: skip-next-run API extension未実装。
- NGT-098 compact progress: m_progressRangeを使う本体進捗処理未実装。
- NGT-100 resume direct restores: v1:backups:temporary未実装。
- NGT-101 DB/preload paths: PreloadSettingsPaths未実装。

## 次の作業

新規5件と#744のレビュー・CIを確認。本体依存5件は本体の先行変更がマージされてから再判定。Issue投稿者の再確認待ち等はtasks.mdの状態を維持。

## 公開後CI

検証済み（GitHub API）: #751〜#755は全てopenでhead・Fixes/Part of・footerが下書きと一致。mergeable=true。CIは公開時点でUnit Tests/Production Buildの全10runがqueued（ci-at-publication.json）。ローカル成功とCI成功は区別する。

