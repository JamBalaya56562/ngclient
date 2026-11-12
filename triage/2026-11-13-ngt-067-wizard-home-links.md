# NGT-067: ウィザードのホーム移動リンク（2026-11-13）

検証済み: jj git fetch --all-remotesはNothing changed。基準mainは8edaeee84c0c0f4a48e75ae917195cb1047b15a5。ghでopen PR #695〜#704を取得し、既存ブックマークと対象ファイルの差分を照合、重複なし。ホーム#697とコマンドID用NGT-059は待ち、独立した2画面のBack/Exitを選んだ。本体変更・既存PRへの依存なし。

## 実装

設定ファイルからの復元画面のBack、ファイル削除ウィザードのselect-files段階のExitをa shButton + RouterLinkへ変更。行き先は既存と同じ / 。どちらにも元からdisabled条件や状態変更処理はない。Restore/Continueはbuttonのまま。インポート、一時ジョブ作成、purgeのTypeScriptコード・API・スタイルは変更なし。Continueの属性はPrettierによる改行のみ。

## 単体テスト（検証済み）

実テンプレートに対する2ケースを追加。RestoreFromConfigではhref・入力保持・isRestoring時のRestore disabled・import/create未呼出しを確認。PurgeSelectFilesでは空の版一覧でExitを確認し、空選択時のContinue disabledと選択モデル更新後のenabledを確認。注入サービスはmock。

miseのbun.exe実体を直接実行。PowerShellで $env:VITEST_MAX_WORKERS = '1' を設定。

    bun run test:ci --include '**/restore-from-config*.spec.ts' --include '**/select-files.navigation.spec.ts'
    # 修正前
    Test Files 2 failed | 1 passed (3)
    Tests 2 failed | 13 passed (15)

新規2件がBUTTONではなくAを期待する箇所で失敗した。

    bun run test:ci --include '**/restore-from-config*.spec.ts' --include '**/purge-files/**/*.spec.ts'
    # 修正後は関連範囲を拡大
    Test Files 5 passed (5)
    Tests 35 passed (35)

## 型・書式・ビルド・E2E（検証済み）

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    exit 0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/restore/restore-from-config/restore-from-config.component.html projects/ngclient/src/app/restore/restore-from-config/restore-from-config.component.spec.ts projects/ngclient/src/app/backup/purge-files/select-files/select-files.component.html projects/ngclient/src/app/backup/purge-files/select-files/select-files.navigation.spec.ts e2e/wizard-home-links.spec.ts
    All matched files use Prettier code style!
    bun run build:prod
    Application bundle generation complete. [27.087 seconds]
    exit 0
    bun run test:e2e e2e/wizard-home-links.spec.ts
    2 passed (15.2s)

本番成果物・Chromium・APIモック。Ctrlクリックでホームのリンク先documentを別タブに開いても元のウィザードURLを維持。Enterでは実際のAngularホームへ移動してMy backupsを表示。インポートPOST・一時バックアップ作成POST・purge POST・DELETE要求はいずれも0件。purgeの版一覧取得はモックの空一覧で、読み取りPOSTは許可した。

別タブのdocumentは静的HTMLで応答し、タブ生成・URLだけを検査した。別タブでの認証全体は検証していない。設定復元はファイル未選択、ファイル削除は空の版一覧の状態でのE2E。処理中リクエストのキャンセル仕様は変更しない。

## push・証拠

- ブックマーク: codex/wizard-home-navigation-links
- コミット: [eb00a65e54d306858fdfd564d83ae3b4be119745](https://github.com/JamBalaya56562/ngclient/commit/eb00a65e54d306858fdfd564d83ae3b4be119745)
- 親: 8edaeee84c0c0f4a48e75ae917195cb1047b15a5
- jj git push --remote origin -b codex/wizard-home-navigation-links成功。PR・Issueコメントは投稿していない。

Git管理外のtmp/ngt-067にbefore.log、after.log、build.log、e2e.log、commit.txtを保存。設定・依存・node_modules/runner変更なし。

未検証: 実サーバー、全unit/E2E suite、Firefox/WebKit、処理中のページ離脱後のリクエスト寿命。残るホームカード・Router使用箇所はNGT-068へ分離。ホーム#697・コマンドID用NGT-059は引き続きマージ待ち。次の新規IDはNGT-069。