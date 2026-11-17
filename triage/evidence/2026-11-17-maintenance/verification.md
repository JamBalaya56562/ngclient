# main更新・ブランチ整理 — 2026-11-17

検証済み: 最新main `81694ce023ffc16e76bef3a0472fea8ffe6c54d8` をforkへ反映。GitHubでマージ済み10件を確認しlocal/originの参照を削除。[一覧](merged.json)。mainの祖先となったマージ履歴は保持し、再実装・不要になった独立コミットだけをabandonした。

作業中の更新も追従: 当初020a3901→run-after追加6560c698→#747取込81694ce0。最新mainまでrebaseし直した。[現在SHA](rebased.json) のtriageはこの記録追加前のhead。最終triageはその子孫としてpushする。

共通fixtureのNGT-113: main020a3901でサイドバー2件がLOCALSTORAGEのprovider不足で失敗し、IdleLogoutStateのmockで2件成功・型・本番ビルド成功。ユーザー承認後に#750を作成したが、#747の9b448518で同じmockがmainへ入り、#750の残差が重複provider1行になった。close・local/origin削除。[記録](superseded.json)。リモート更新はjjのleaseチェックが検出し、取得して照合後に処理した。上書きしていない。

競合の統合: 部分除外と属性除外の両表示、ログのdownload importと版一覧型、テーマ初期化とidle logout監視、run-afterとskip-next-runの両API判定を保持。#747で不要になった当方の再実装版は削除。

検証範囲: [validation.json](validation.json) の最新11 headでapp/specのtsc --noEmit成功。一部は公式 --incremental / --tsBuildInfoFile を使用しキャッシュはGit管理外。競合解消4本は下記関連specと本番ビルド成功。全ブランチ全テスト/全ビルドの再実行ではない。原本ログ・各コマンドは C:/Users/Jam/Documents/ngclient/tmp/maintenance-20261117/。020a3901での元検証と途中の6560c698での結果を最終headの試験と混同しない。

| ブランチ | 関連テスト | 本番ビルド |
| --- | --- | --- |
| `feat/file-tree-partial-exclusion` | Tests  212 passed (212) | 成功 |
| `feat/log-compare-previous-version` | Tests  50 passed (50) | 成功 |
| `feat/server-stored-theme` | Tests  20 passed (20) | 成功 |
| `feat/skip-next-scheduled-run` | Tests  63 passed (63) | 成功 |

途中のVitestはテスト実行前にworker起動60秒待ちでタイムアウトし、no testsとなった。指定手順に従いnode_modulesのSTART_TIMEOUT/WORKER_START_TIMEOUTだけ一時延長し、終了時に元のbytesへ戻す。ケースのtimeout/retryやプロジェクト設定を緩和しない。

画像URL保護のためcodex/pr-311-screenshots / codex/pr-637-screenshots / codex/pr-review-screenshotsの3参照は不変。別workspace claude-fixesの未ブックマーク作業も操作しない。

最終照合はlocal/origin一致、最新mainの祖先関係、競合なし、削除参照の不在、画像SHA不変を確認する。原本はローカル verified-refs.json。

検証済み: Vitest起動待ち設定を元bytesへ復元し、SHA-256 1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD の一致を確認。ケースtimeout・retry・プロジェクト設定は変更なし。
