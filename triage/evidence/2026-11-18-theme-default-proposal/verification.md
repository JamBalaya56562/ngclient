# NGT-091: ブラウザー設定を優先する既定テーマ案 (2026-11-18)

## 現在の判断

PR [#744](https://github.com/duplicati/ngclient/pull/744) は採用を求める修正ではなく、メンテナのブラウザー単位の方針を尊重した任意の既定値の提案。利用者はPR・Issueのcloseも構わない意向。[同意と提案の返信](https://github.com/duplicati/ngclient/pull/744#issuecomment-6953480165)を投稿済み。Issue #3851の自動close指定は外した。

検証済みhead: `785835b3fcbec6bbc743bef37ed2bb3728f76d72` (`feat/server-stored-theme`、origin push済み)。親: `b856d9ce4dd9881291bb440650a9a2fc76685498`。他の実装ブランチは今回変更していない。

## 検証済みの動作

- 優先順位は明示的なブラウザー設定 → 任意のサーバー既定値 → 各ブラウザーのOS設定。
- 通常の切り替えはブラウザー内だけに保存。既存の個別設定を保持し、サーバー値を個人設定へコピーしない。
- 専用の「Default theme for this server」でだけ共有値を変更。「Use server default」で個別上書きを解除する。
- 既存のGET/PATCH `/api/v1/uisettings/ngclient`で文字列light/dark/systemを保存できた。本体の先行変更は不要。既定値の取得は認証後。
- 保存要求は同時に1本。失敗時は旧値を保持して再試行可能。読み込み失敗時は個別設定を保ち、共有設定の変更は無効にする。

## コマンドと観測

実行時はmise管理のnode/bun/jj実体をglobで解決し、直接呼び出した。

1. `bun run test:ci --include=projects/ngclient/src/app/layout/layout.state.spec.ts`: 元実装で新しい契約の3件が失敗（red.log）。通常切り替えでPATCHを送る、個別設定をサーバー値が上書きする、継承値を個別設定に保存することを検出。
2. `bun run test:ci --include=projects/ngclient/src/app/layout/*.spec.ts`: 修正後 **22 passed / 2 files**（layout-unit.log）。OS変更・リスナー破棄・保存失敗/再試行・二重送信防止も含む。
3. `bun run test:ci --exclude=**/backups.enable-disable.spec.ts --exclude=**/backups.refresh.spec.ts`: **2,478 passed / 192 files**。除外はコマンド限定で、設定やテストファイルの恒久的な除外はしていない。全ログは `tmp/review744-20261118/unit-excluding-main-fixtures.log`。
4. `tsc --noEmit -p projects/ngclient/tsconfig.app.json`、`tsc --noEmit -p e2e/tsconfig.json`: 終了コード0。
5. `bun run build:prod`: 終了コード0、Application bundle generation complete（60.092 seconds）。
6. `node node_modules/@playwright/test/cli.js test e2e/theme-toggle.spec.ts`: **6 passed**（browser.log）。元のサーバー書き込み前提の期待値2件を、書き込まない新契約へ更新した。ローカルの空きポートへの一時変更は復元。
7. `node tmp/review744-20261118/live.mjs`: 配布Canary **2.4.1.101**の隔離サーバーと**独立した3ブラウザーコンテキスト**で成功（live.json）。別コンテキストの共有値変更と再読込の後も個別Lightが残る、新規コンテキストは既定Darkを継承、個別解除で既定値へ戻る、OS既定ではLight/Dark/Lightと各OS設定に従う。pageErrors=[]。既存ジョブは操作せず、終了時ジョブ0、ブラウザー・proxy・サーバー停止。DLLのソースSHAは未検証。
8. `prettier --check`（今回編集した6ファイル）: All matched files use Prettier code style。

本番UIのスクリーンショットを実見し、個別設定とサーバー既定値が別の節に表示されることを確認。画像・隔離データ・手動検証スクリプト・全ログはGit管理外の `tmp/review744-20261118/` に残る。

## 全体テストの制約（検証済み）

無条件の `bun run test:ci` とspec全体の型チェックは、mainで増えた必須DTOフィールド `RunAfterBackupID` / `RunAfterCondition` が2つの既存fixtureにないためTS2739で停止する。同一エラーを**変更していないmain b856d9ce**で `tsc --noEmit -p projects/ngclient/tsconfig.spec.json` を実行して再現（main-spec-baseline.log）。今回のテーマ変更にはこの別件を混ぜていない。除外付き2,478成功をフルスイート成功とは扱わない。

単体テストの既存CSS解析警告、PlaywrightのNO_COLOR/FORCE_COLOR警告は出力される。警告ゼロという主張はしない。

## 未検証・設計上の判断

メンテナがサーバー既定値そのものを採用したいかは未確認。個別上書きを保護できても、共有既定値を置く方針の是非はメンテナへ委ねる。ユーザーアカウントごとのテーマ同期は実装していない。
