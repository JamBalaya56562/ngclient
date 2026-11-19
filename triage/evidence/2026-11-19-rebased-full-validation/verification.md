# Rebased branch full validation and publication — 2026-11-19

## 検証済み: 対象と結果

main ea43cf64bdb61b01efad47b4f808334131cd18d4から独立した実装7本を順番に検証。各SHAとoriginを照合。製品コード変更なし、ブランチのSHAはrebase後から不変。

コマンド（miseの実体を直接実行）:

```text
jj new <bookmark>
bun install --frozen-lockfile
bun run test:ci
bun run build:prod
```

| ブランチ                                | 完全なSHA                                  | 全体単体テスト | 本番ビルド |
| --------------------------------------- | ------------------------------------------ | -------------- | ---------- |
| `feat/compact-progress`                 | `60000bb92ebb748f2cffc329e021b2e74c165e83` | 2596 passed    | exit 0     |
| `feat/export-global-options`            | `7d6bd94a1527980a07f81093672b73ce9d144583` | 2588 passed    | exit 0     |
| `feat/restore-resume-drafts`            | `d472e5925d2a98bd5ffb389784b8afb84a275643` | 2593 passed    | exit 0     |
| `feat/show-db-encryption-preload-paths` | `746b10dd6d3839e26be06613bf8d9069bffe5ae3` | 2589 passed    | exit 0     |
| `feat/skip-next-scheduled-run`          | `642251f992cf8c5a8c9b06a5bfa5b69f32412aec` | 2593 passed    | exit 0     |
| `feat/show-update-check-result`         | `2dfc4aa78075f7440f887125e405f0de774b18cd` | 2593 passed    | exit 0     |
| `feat/restore-download`                 | `6ba1135e3a9482045b225557bd1c432c0a90d9e2` | 2586 passed    | exit 0     |

## 検証済み: 最初の失敗と再実行条件

Compactの初回は195ファイル・2483件成功、7件のworker開始待ちエラーでexit 1。VitestのSTART_TIMEOUT=6e4 / WORKER_START_TIMEOUT=9e4を一時3e5に延長し、残りの初回検証を実行した。テストの実行制限や内容は変更していない。

Downloadの初回は3件が5000msを超過（general-log.pagination / file-tree.keyboard / file-tree.range-selection）、2583件成功・3件失敗。この3件のソースはDownloadブランチの変更対象ではない。

依存ファイルを元に戻しSHA256一致を確認した後、Git管理外のrunner設定 maxWorkers:2 を使い、DownloadとCompactの全体を再実行した。通常のworker開始待ち・テスト5000ms制限のまま成功。除外・skip追加・テストtimeout延長はない。

```text
bun run test:ci --runner-config=tmp/full-validation-20261119/vitest.config.mts
```

この条件で成功したことは検証済み。通常の高並列設定で常に成功すること、並列負荷だけが失敗原因だったことは未検証。製品不具合またはテスト自体の修正を推測で追加していない。両試行のログ・results-first-attempt.jsonを保持。既存のjsdom CSS解析メッセージは出る。本番ビルドは7本すべてexit 0。

## 検証済み: 本体依存・公開判定

本体をjj git fetch --all-remotesで取得し、upstream master b07ae7af808bffca0787a7c89285d63f6ed000a8に、#7912の56376b7b、#7914の406d079d、#7915のaadc206dがすべて祖先として含まれることを確認。GitHubの各PRもmerged=true。今回の公開は3件。既存open ngclient PRは開始時0件で、独立した各ブランチをそのまま公開。

- Compact進捗: PR #786、Fixes duplicati/duplicati#3397。本体PRでIssueは既にclosed、このPRはngclient側表示を完成する。
- 復元ドラフト: PR #784、Fixes duplicati/duplicati#5239。本体PRで既にclosed、ngclientの再開入口を追加。
- 暗号化/preload: PR #785、Fixes duplicati/duplicati#6611。本体PRで既にclosed。合意済みの暗号化状態とpath表示の範囲に限定し、設定項目ごとの由来追跡は対象外。

保留4本:

- export-global-options: 本体#7907はOPEN・未マージ。仕様がGlobalSettings別出力とimport時ignore/merge/applyへ変更され、旧include-global-optionsを送る準備済みUIは適応が必要。本体仕様が固まってから対応。全体テスト成功をAPI互換性の証明とはしない。
- skip-next-scheduled-run: 本体#7911はOPEN・未マージ。
- show-update-check-result: head feat/report-update-check-errorsの本体PR検索は0件、未提出。
- restore-download: 同名headの本体PR検索は0件、未提出。

今回の確認は単体テスト・コンパイル・本番ビルドとGitHub/API仕様の照合。実サーバーUIやライブE2Eを今回新たに実行したとは主張しない。過去の検証は各当時のSHAとサーバーに限る。

## 片付け

Vitest原本はバイト単位で復元済み（cleanup.txt）。一時runner設定とスクリプトはtmp内、製品ブランチやroot設定へ追加していない。証拠のrunner設定は実行対象ではなく当時の条件の記録。PR本文末尾は指定のClaude Code表記。画像固定参照と他workspaceを保持。全実装のlocal/origin一致を確認済み。

CI照合（今回head）: #784と#785はUnit Tests / Production BuildともSUCCESS。#786はUnit Tests SUCCESS、Production Build実行中（run 44499674298）。CI全完了とはまだ扱わない。ci-snapshot.json参照。
