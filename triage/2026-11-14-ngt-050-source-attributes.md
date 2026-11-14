# NGT-050 / #637: 属性除外の表示と詳細オプションへの導線

2026-11-14。実装push済み、**PRは未作成**。公開は[PR #727](https://github.com/duplicati/ngclient/pull/727)のマージ待ち。

## 判断と依存

**ドキュメント根拠**: [報告者の返信](https://github.com/duplicati/ngclient/issues/637#issuecomment-6876252546)は、旧チェックボックス自体より正確な除外フィードバックを重視し、既存設定への導線を受け入れている。利用者の指示でその方針を実装した。新たなIssueコメントは投稿していない。

**検証済み**: #727はopen/未マージ。現在の本番UIと隔離実サーバーで、設定がないジョブのSource DataからOptionsへ進むと`Add advanced option`がdisabledになった (`dependency.log`, `run-8TZC9C/add-option.html`)。そのため利用者の指示どおりPRを公開しない。#727の変更4ファイルと今回の変更8ファイルは重ならず、コード自体はスタックしていない。マージ後に最新mainへrebaseし、新規追加のマウス・キーボード操作を通してから公開する。

- ブックマーク: `codex/source-attribute-exclusion-feedback`
- 完全SHA: `68c088a6e6bb2c1d2e07a03a338ead45b348950e`。親main: `8f401edd337bf53a963fc4e80a47d3db4d52fc3d` (0.0.250)。origin push済み。
- 画像専用: `codex/pr-637-screenshots` / `0d0792d9458de96be24e9d7f943ec7d6037a2d33`。実装数には含めない。既存画像保存ブランチは変更しない。
- [Fixes #637付きの本文下書き](pr-drafts/ngclient-source-attribute-exclusion-feedback.md)。GitHubへは未投稿。

## 一覧APIと実装範囲

**検証済み**: `POST /api/v1/filesystem?showHidden=true&onlyFolders=false`により、Windowsのテスト用Hidden/Systemファイル・両属性のファイル・Hiddenフォルダーが正しい`hidden`/`systemFile`で返った。`probe.mjs` → `probe.log`, `run-cpzE5e/probe.json`。この情報だけで#637のHidden/System表示が可能で、本体/API/生成クライアントの変更は不要。

**ドキュメント根拠**: `../duplicati/Duplicati/WebserverCore/Endpoints/V1/Filesystem.cs`はファイル属性から3つのbooleanを作る。`SourceFileEntryFilterAsync`はroot entryを属性判定より前に通す。rootの例外も実サーバーで再確認した。

- 詳細オプションを設定の正本とし、Source Dataには現在値、既存Optionsへの移動ボタン、説明を追加。別のチェックボックスや複製した設定モデルは作らない。
- ツリーのローカル一覧で、Hidden/System/Temporaryおよび属性で除外された親配下の理由を可視化・読み上げ。パスフィルター評価とは別に保持する。
- 明示的ソースは属性で除外しない。除外された行を選ぶと実際の明示的ソースへ追加する。Windowsの大文字小文字と特殊フォルダーの解決にも対応。
- 設定を読むだけでは他の属性やパスを変更しない。ジョブの設定がなければ共有状態のapplication optionsを参照し、明示的な空値はモデル上の上書きとして扱う。
- 他の属性やリモートソースの判定に必要な情報は一覧にないため、プレビュー対象外と明記。バックアップ全体の全除外要因を予測する機能とはしない。

## 実行したコマンドと結果（検証済み）

証拠フォルダー: `C:\Users\Jam\Documents\ngclient\tmp\source-attributes-20261114`。mise管理の実体を直接実行。Node v26.13.1 / Bun 1.4.4。

| コマンド                                                                                                                                                                      | 結果・ログ                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `bun run test:ci --include '**/file-tree.attributes.spec.ts' --include '**/source-data.component.spec.ts'`                                                                    | 修正前3 failed / 7 passed (`red.log`)。除外理由・設定表示の欠如を検出                                               |
| `node node_modules/@angular/cli/bin/ng.js test ngclient --watch=false --include '**/file-tree/**/*.spec.ts' --include '**/source-data/**/*.spec.ts'` (`VITEST_MAX_WORKERS=1`) | 最終333 passed / 22 files (`tests-release.log`)                                                                     |
| `node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json` / `tsconfig.spec.json`                                                                 | 成功 (`types-app-final.log`, `types-spec-final.log`)                                                                |
| `prettier --check <変更8ファイル>`                                                                                                                                            | 成功 (`prettier-final.log`)                                                                                         |
| `bun run build:prod`                                                                                                                                                          | 成功、ビルド警告なし (`build-release.log`)                                                                          |
| `bun run test:e2e e2e/attribute-exclusions.spec.ts`                                                                                                                           | 本番配信の既存回帰2 passed (`e2e.log`)。APIモックあり                                                               |
| `node tmp/source-attributes-20261114/live.mjs`                                                                                                                                | 本番UI・実APIの6条件成功 (`live-verified.log`, `run-Qmc2o7`)。APIモックなし                                         |
| `NGT637_DEPENDENCY=1 node .../live.mjs`                                                                                                                                       | 既存Add操作のdisabledを確認 (`dependency.log`, `run-8TZC9C`)                                                        |
| `node tmp/source-attributes-20261114/verify.mjs`                                                                                                                              | 前後・依存確認サーバーのSQLite Backup件数0、6ケースと警告/エラー0を再確認 (`verification.log`, `verification.json`) |

途中でワーカー起動の60秒タイムアウトが発生し、node_modules内のSTART_TIMEOUT/WORKER_START_TIMEOUTだけを一時延長した。最終チェック後にバイト一致で元へ復元 (`cleanup.txt`)。追加したテストのmock型不足・展開状態を修正済み。既存のjsdom CSS解析メッセージとNO_COLOR/FORCE_COLOR警告は残る。

## 隔離実サーバー

公式Windows実行ファイルのProductVersion: `2.4.1.101-Canary-20261107+424b1360b0d0767b3a67a874b4d99c92f17a877f`。新規datafolder、ランダムな認証情報、空きloopbackポート、ローカルのテスト用データだけを使用。利用者のジョブは操作していない。

| 条件                                                | 一覧で確認した保存ファイル数 |
| --------------------------------------------------- | ---------------------------- |
| 属性オプションなし                                  | 7                            |
| Hidden                                              | 3                            |
| System                                              | 5                            |
| Hidden + System（ReadOnly保持）                     | 2                            |
| Hidden + System、Hiddenファイルを明示的ソースに追加 | 3                            |
| Hidden + System、ソースフォルダー自体がHidden       | 2                            |

数字は各フォルダーの一覧を照合した実ファイル数。filesetsのFileCountはフォルダーも含むため別の数字。通常フォルダー配下と除外フォルダー配下も一覧で検査し、余分な保存項目がないことを確認した。各ケースの`*-results.json`に実APIの一覧、DOMの除外理由、バックアップ結果を保存。全6件の結果にErrors/Warningsなし、pageErrorsなし。

Systemを既存エディターで外し、ページ再読込なしでSource Dataに戻ると除外表示が変わることを確認。戻して保存し、再読込後にReadOnlyと元のSourcesが保持されることも確認した。

新旧画像はmainのUI (`run-tBGG2y`) と修正後 (`run-Qmc2o7`) の同じ7ファイル構成で撮影。修正後は除外理由を打ち消し線の外で表示し、目視確認済み。SHA固定のURLを下書きに記載。

**未検証**: Linux/macOS実機、リモートプロバイダー、実ファイルのTemporary属性、全属性・全除外要因の予測。設定済み属性の編集は検証済みだが、未マージ#727後の新規追加フローは本ブランチでは未検証。

**別の観測・本件では未修正**: 検証用に`--exclude-files-attributes`へ空文字を送ると、本体は無効なフラグ値の警告を出した。最終の「未設定」ケースはそのキーを送らず確認した。今回の変更は空値の保存仕様を変えない。

検証用ジョブは削除済み、専用サーバープロセス0件。証拠とテスト用ボリュームはGit管理外で保持する。
