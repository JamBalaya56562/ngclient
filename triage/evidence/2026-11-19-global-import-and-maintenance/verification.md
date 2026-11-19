# Global settings import update and merged-branch maintenance (2026-11-19)

## 検証済み: 本体#7907のレビュー反映

kenkendkのレビュー: global設定をjob設定に混ぜてexportすると、importでglobal設定がjob固有設定へ変わる。別のGlobalSettingsとして常にexportし、import時にignore/merge/applyを選ぶ方針。

確認した本体head: a652e9f71c2e0f5ee3f31dcd9e02ec8934654071。PR #7907は未マージ。ngclient PRはまだ公開しない。

- エクスポート時の旧include-global-options選択とqueryを削除。capabilityがあるサーバーでは、global設定が別枠で出力されることと、password出力対象にglobal側も含まれることを説明。
- ImportにIgnore（既定）/Merge into this backup/Apply to server settingsを追加。merge処理はサーバーへ任せ、UIでは値をフラット化しない。既存file/passphrase/metadata値を保持。
- applyはSave nowが有効な場合だけ選べ、すべてのジョブへ影響することを確認ダイアログで示す。取消は要求0回、承認後のsnapshotを1回だけ送る。Save nowを外すとignoreへ戻す。
- v1:backup:export-global-settings非対応の旧サーバーは選択UI非表示・global_optionsフィールドなし。暗号化ファイルを含め、設定を含むファイルの場合に適用する説明とする。
- swaggerのImportBackupInputDtoにglobal_optionsだけ追加。bun run gen:openapi --output tmp/export-global-rework-20261119/generatedを実行し、その生成DTOブロックを反映。他の生成差分は混ぜない。

## 検証済み: 修正前後

新規回帰テストは修正前7件失敗・1件成功。テスト草稿の型エラーは先に修正し、型エラーを赤の証拠とはしていない。最終関連specは42件成功。標準selectを公式FormFieldへ接続し、実ブラウザーでラベル・キーボード操作・policy・確認取消を検証。

```text
node node_modules/@angular/cli/bin/ng.js test ngclient --watch=false --runner-config=tmp/full-validation-20261119/vitest.config.mts --include='**/import*.spec.ts' --include='**/export.component.spec.ts'
Test Files 3 passed; Tests 42 passed
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
all exit 0
bun run build:prod
exit 0
node node_modules/@playwright/test/cli.js test e2e/import-file-read.spec.ts e2e/export-encryption.spec.ts --reporter=list
12 passed
```

最初の検証後のSHA4008f478c55bcd33e7b43086531f5ac574719197をoriginへpush。その後のmain更新で下表のSHAへrebaseし全体を再検証。さらに新main上のexportブランチでbuildと同じ12 E2Eを再実行した。Playwrightはrootの単一設定を3100へ一時変更し、finallyでバイト単位に戻した。追加設定をrootへ置かない。画像はこの新main上のmock API・本番ビルドの確認。[選択UI](import-global-options.png)・[適用の確認](apply-confirmation.png)。実サーバー接続は今回未検証。

草稿ではShipSelectの動的optionsでNG0600が出たため、そのラッパーを使わない標準selectにした。ShipFormFieldはselectを投影しないため、この画面のlabel/controlを通常divで配置して既存色に合わせた。共有ライブラリの全体修正を行ったとは主張しない。

## 検証済み: マージ後の整理とrebase

ngclient PR #784/#785/#786はいずれもmerged=true、各headは最新main aaccdfa0351ca507894fb2381dc7224fef5f5f4cの祖先。対応3ブックマークをlocal/originから削除し、fork mainを更新。マージ祖先そのものはmain履歴として保持する。

残存4本とtriageを同mainへrebase。競合はSkip APIの生成型import/export一覧と、更新チェック画面のSCSS。前者はtemporary-list APIとSkip APIの両方の型を保持、後者はpreload表示と更新結果の両スタイルを保持して解消。製品ブランチはoriginへpush済み。画像固定参照4本・他workspaceを保持。

コマンド: jj git fetch --all-remotes、jj bookmark set main -r main@upstream、jj bookmark delete、jj git push --remote origin、jj rebase -r 'bookmarks(glob:"feat/\*")' -d main、jj rebase -s 'roots(main..triage)' -d main、jj squash（競合解消）。conflicts()は0件。

## 検証済み: rebase後の全体テスト・本番ビルド

各ブランチでbun install --frozen-lockfile、bun run test:ci --runner-config=tmp/post-export-maintenance-20261119/vitest.config.mts、bun run build:prodを順に実行。runnerの唯一の調整はmaxWorkers:2。依存の改変、worker開始待ちや各テストの制限時間変更、skip/除外なし。

| ブランチ                        | 完全なSHA                                  | 全体単体テスト | 本番ビルド |
| ------------------------------- | ------------------------------------------ | -------------- | ---------- |
| `feat/skip-next-scheduled-run`  | `21c309af628669c801fceadb3b8e9671bf84a9cf` | 2613 passed    | exit 0     |
| `feat/export-global-options`    | `3ad275090282438962be8f90069324b25dea8a94` | 2614 passed    | exit 0     |
| `feat/show-update-check-result` | `15acd674a16b91d38491648837574eff3c38f4f1` | 2613 passed    | exit 0     |
| `feat/restore-download`         | `cd72dfa35231134663b6f8e4b59d14cc6bc47b79` | 2606 passed    | exit 0     |

## 公開・保留と引き継ぎ

検証済み: 本体#7911はマージ済み。head f38eabca182e8b8601c45c8271f05f1b3cd4534bはmaster ebf0a72e8a78eb9ab8c981f579856657bfac9894の祖先。ngclient側はPR #788として公開、Fixes duplicati/duplicati#2701。既にqueueされたrunは取消さない制限を本文に記載。今回Skipの実サーバーUIは未検証。

#7907は未マージなので対応UIは保留。次回公開候補の本文をpr-drafts/ngclient-import-global-settings.mdへ保存。

NGT-125/126は本体PRが未提出（headでPR検索・open PR一覧を照合）。本体PRマージ後に最新mainへrebaseして指定テストを再実行し、可能なら実サーバーUIも確認する。現在のngclient実サーバー確認は両方未検証。以前の全体成功と混同しない。

- NGT-125: general.component.spec + e2e/update-check.spec、Fixes duplicati/duplicati#3188。
- NGT-126: restore-flow/notificationsの単体、restore-lifecycle/notifications/restore-destination-url/restore-saved-destinationsのE2E、Fixes duplicati/duplicati#6221。
- E2Eの通常3000はWindows予約範囲なので3100へ一時変更し原状復帰。

現在openの他者PR #787はPostgresのremote-source対応であり、#788またはglobal-settings importの機能重複ではない（タイトル・本文の確認範囲）。本体コード修正・公開コメントは行っていない。

CI照合: PR #788のUnit Tests / Production BuildはGitHub側でqueued。ローカル成功とCI完了を同一視しない（skip-ci-snapshot.json）。
