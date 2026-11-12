# NGT-068: 設定インポートのホーム移動リンク（2026-11-13）

## 対象と依存確認

検証済み: `jj git fetch --all-remotes` は `Nothing changed.`。基準mainは `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`。ghのopen PR一覧は #695〜#704。既存26実装ブックマークのmainとの差分を照合し、今回の3ファイルに重複なし。画像保管用codex/pr-review-screenshotsと記録用triageは実装比較から除外した。本体変更への依存なし。

ドキュメント根拠（ソース）: ホーム画面は#697と同じテンプレートを編集するため対象外。コマンドID移行はNGT-059の型変更を待つ。削除・purge・版ラベルのCancelにはdisabled条件があるため今回変更しない。ログ画面等の準備済み対象も変更しない。

## 変更

`backup/import/import.component.html` のBackを `button shButton + RouterLink` から `a shButton + RouterLink` へ変更。行き先は既存と同じ `/`。TypeScript、保存処理、入力フォーム、API、スタイル、依存関係・設定ファイルは変更なし。既存のImportボタンのdisabled条件も変更なし。

## 単体テスト（検証済み）

実テンプレートを描画する既存specへ2ケース追加。href、通常クリックのRouter移動、Ctrlクリックをブラウザーに委ねること、importとdraft追加が呼ばれないことを確認。サービスはモック。

PowerShellでnode・bunのmise実体ディレクトリをPATHに追加し、`VITEST_MAX_WORKERS=1`。以下のbun/nodeはmise実体を直接実行。

    bun run test:ci --include '**/backup/import/import.component.spec.ts'
    # 変更前: Test Files 1 failed (1)
    # Tests 2 failed | 17 passed (19)
    # 失敗: exposes a home link without submitting or creating a draft
    #       leaves modified home-link clicks to the browser without submitting
    # どちらも header a が null で失敗

    bun run test:ci --include '**/backup/import/*.spec.ts'
    # 変更後: Test Files 1 passed (1)
    # Tests 19 passed (19)

Vitestの起動タイムアウト定数やnode_modulesは変更していない。確認時のrunner SHA256は1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD。

## 型チェック・ビルド・ブラウザー（検証済み）

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    # 最初は追加テストのreadonly modifiers配列でTS2345。型を修正後 exit=0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/backup/import/import.component.html projects/ngclient/src/app/backup/import/import.component.spec.ts e2e/import-file-read.spec.ts
    # All matched files use Prettier code style!
    bun run build:prod
    # Application bundle generation complete. [37.665 seconds]
    # exit=0、buildログにWARNING/ERRORなし
    bun run test:e2e e2e/import-file-read.spec.ts
    # 4 passed (8.2s)

本番成果物・Chromium・APIモックで検証。追加ケースはファイル選択済みでCtrlクリックと中クリックがホームURLの別タブを開き、元画面は/backup/importのまま・選択ファイルはconfig.jsonのまま・Importはenabledのままであることを検査。Enterでは実際のAngularホームへ移動しMy backupsを表示。Back操作によるimport POSTは0件。既存3ケース（ファイル削除、読込失敗からの復旧、古い読込の無効化）も成功。

別タブdocumentは静的HTML応答で、リンク先URL・タブ生成のみを検証。別タブの認証フロー全体は未検証。最初のサンドボックス内E2EはBunのnode alias警告を出し、プレビューが応答しなかったため今回のプロセスのみ停止。同一コマンドを承認済み実行環境で再実行して上記成功。最終E2Eの警告はNO_COLORとFORCE_COLORの競合通知のみ。lintスクリプト/targetはpackage.json・angular.jsonにないためlint実行とは主張しない。

## コミット・引き継ぎ

- ブックマーク: `codex/import-home-navigation-link`
- コミット: [557e2bc1a3a3cc8e02c6371c888c1c83ff2a6698](https://github.com/JamBalaya56562/ngclient/commit/557e2bc1a3a3cc8e02c6371c888c1c83ff2a6698)
- 親: `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`
- `jj git push --remote origin -b codex/import-home-navigation-link` 成功。PR・Issueコメントは投稿しない。
- Git管理外 `tmp/ngt-068/`: before.log / after.log / types.log / types-e2e-final.log / prettier.log / build.log / e2e.log（中断分）/ e2e-final.log / existing-before.tsv / commit.txt。

未検証: 実サーバー、全unit/E2E suite、Firefox/WebKit、インポート処理中のページ離脱後のリクエスト寿命。処理中の離脱仕様は変更しない。残る監査はNGT-069へ分離し、次の新規IDはNGT-070。