# 残存6実装の全体テスト・本番ビルドと公開判定（2026-11-18）

## 検証済み: 実行範囲

main `e632fdd59a5bef4c6791612918de0c53c93ced9c` 上の残存実装6本を順番に検証。
各ブランチでmiseの実体を直接実行した。除外・skip・テスト本体変更なし。

```text
bun install --frozen-lockfile
bun run test:ci
bun run build:prod
```

| ブランチ | 完全なSHA | 全単体テスト | 本番ビルド |
| --- | --- | --- | --- |
| `feat/compact-progress` | `05dd9fe8820057c418f70768d9e7e17b1974a49a` | 2536 passed | exit 0 |
| `feat/export-global-options` | `c8dcdf753de2161675a9657a3ee90ca7b36d47c5` | 2528 passed | exit 0 |
| `feat/restore-resume-drafts` | `62be94e7d434f665d334f9946f7c2a03af21cfe2` | 2533 passed | exit 0 |
| `feat/show-db-encryption-preload-paths` | `a39cfa68539718007b2b38f33f9f779dd189af73` | 2529 passed | exit 0 |
| `feat/skip-next-scheduled-run` | `8de66197aec5965c865b511ab954642ed10aa5ce` | 2531 passed | exit 0 |
| `codex/update-playwright-popup-fix` | `1a5488aa7e54d4ed02ae69a0fe923737aad77bc6` | 2526 passed | exit 0 |

画像固定参照3本とtriageは製品変更を含まないため、別の製品テスト対象とはしていない。
全体テストは `test:ci` の全単体テストを指す。今回全6本のE2E・実サーバー検証を再実行したわけではない（未検証）。
`Could not parse CSS stylesheet` はテストログに出ている。警告なしとは主張しない。

## 検証済み: 初回worker失敗と片付け

Compact進捗の初回全体テストは2,425件成功したが、6件のworker起動・応答エラーによりexit 1。
ログに `Failed to start forks worker` / `Timeout waiting for worker to respond` がある。
これは全件成功とは扱わず、初回ログと終了コードを `results-first-attempt.json` に保存した。

利用者指定のローカル回避手順に従い、`node_modules/vitest/dist/chunks/index.DpLw24bj.js` の
`START_TIMEOUT = 6e4` と `WORKER_START_TIMEOUT = 9e4` を一時的に `3e5` へ延長。
残り5本とCompact進捗の除外なし再実行が成功した。通常の待機時間で全6本が成功したとの主張はしない。
Compact進捗の本番ビルドは最初の実行で成功しており、同じSHAなので再実行していない。
終了後、Vitestの元ファイルをバイト単位で復元しSHA-256一致を確認。変更をコミットしていない。

## 検証済み: 本体依存と公開判定

GitHub API `gh api repos/duplicati/duplicati/commits/master --jq '.sha'` は
`e8756fab2b708af7a9b287d41916799a6da451ad`。
本体ローカルmasterも同じSHA。`jj --ignore-working-copy log` の `contained_in("::master")` は
依存5コミット全て `no`。完全SHAは `backend-ancestry.txt`。
本体は読み取りのみ、fetch・rebase・push・実装変更をしていない。

| ngclientの候補 | 必要な本体ブランチ | 判定 |
| --- | --- | --- |
| NGT-085 / export-global-options | feat/export-global-options | 未統合、PRなし、公開保留 |
| NGT-086 / skip-next-scheduled-run | feat/skip-next-scheduled-run | 未統合、PRなし、公開保留 |
| NGT-098 / compact-progress | feat/compact-progress | 未統合、PRなし、公開保留 |
| NGT-100 / restore-resume-drafts | feat/list-temporary-backups | 未統合、PRなし、公開保留 |
| NGT-101 / show-db-encryption-preload-paths | feat/systeminfo-preload-paths | 未統合、PRなし、公開保留 |

`gh pr list --repo duplicati/duplicati --state all --search 'head:<branch>' --json ...` を各5本で実行。
全てexit 0で空配列（backend-pr-search.json）。途中の一時的な接続失敗を成功扱いせず、5件とも再取得した。
GitHubから3つの未pushローカルSHAのcompare APIが404になるため、その404を未マージの根拠にはしていない。
他2本はGitHub compareでもdiverged。上記の最新master一致とローカル祖先判定を5本共通の根拠とする。

ドキュメント根拠: 本体triageの `triage/PENDING-BRANCHES.md` に5本ともPR枠待ち、ngclientより先に提出とある。
次回実行スキップと一時復元一覧には、最新masterとの競合が残るとの記録もある（今回追試・修正はしていない）。
未統合の契約はexportの `include-global-options`、`v1:backup:skip-next-run`、
`v1:backups:temporary`、Compact進捗報告、systeminfoのDB暗号化/preload項目。

ngclientの既存open PRは#757だけ。head `1a5488aa7e54d4ed02ae69a0fe923737aad77bc6` の
production-build / unit-tests / browser-tests はGitHub CIで全てSUCCESS（pr757-ci.json）。
今回、新規PRは0件。未PR5本は本体待ちで、公開可能な1本は既存#757のため重複作成しない。
Issue close用Fixesは、依存の解消後にPR内容がIssue全体を満たすか確認して付ける。

## 証拠の場所

生ログ・一時的な元ファイル・実行スクリプトはGit管理外 `tmp/validation-publication-20261118/`。
実行スクリプト: `tmp/validate-all-20261118.ps1`、`tmp/retry-compact-20261118.ps1`。
製品ブランチ6本はoriginとSHA一致を確認。製品コードの追加修正はなし。