# NGT-069: コマンド画面のホーム移動リンク（2026-11-13）

## 対象と依存確認

検証済み: `jj git fetch --all-remotes` は `Nothing changed.`。基準mainは `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`。ghで取得したopen PRは #695〜#704。既存27実装ブックマークのmainとの差分と今回の3ファイルを照合し、同じファイルの変更なし。画像保管用codex/pr-review-screenshotsと記録用triageは実装比較から除外。最新mainから独立したブランチを作成した。

ドキュメント根拠（差分）: コマンド画面のBackだけを `button shButton + RouterLink` から `a shButton + RouterLink` へ変更。行き先 `/`、smallクラス、i18n、アイコンは維持。TypeScript・API・状態保存・実行処理・ルートID取得・設定・依存パッケージには変更なし。NGT-059の型修正を利用しないため、そのマージへの依存もない。

## 単体テスト（検証済み）

実テンプレートとRouterTestingHarnessを使う `commandline.navigation.spec.ts` を追加。StatusBarだけをスタブにし、backupの読み込み中（NEVER）でもBackを使えることを確認。通常クリックで実際のRouter URLが `/` になり、CtrlクリックではRouter URLと編集モデルを維持。どちらもコマンド実行・状態保存は未呼び出し。

PowerShellでmiseのnode・bun実体ディレクトリをPATHへ追加し、`VITEST_MAX_WORKERS=1`。以下のbun/nodeはmise実体を直接呼んだ。

    bun run test:ci --include '**/commandline.navigation.spec.ts'
    # 修正前: Test Files 1 failed (1), Tests 2 failed (2)
    # offers a native home link while loading without running or saving a command
    # allows browser modified-click navigation without changing the editor
    # どちらも .back a が null で失敗（before-valid.log）
    bun run test:ci --include '**/commandline/*.spec.ts'
    # 修正後: Test Files 2 passed (2), Tests 9 passed (9)

最初のテスト作成時はTestBedのsetとadd/removeの併用エラーがあったためテスト構成を修正した。これを赤の証拠にはせず、その後のリンク不在による失敗を採用。既存7ケースも通り、引数・フィルター・実行確認・成功/失敗・状態復元・コマンド切替を確認した。Vitestのタイムアウト定数やnode_modulesは変更なし。runnerのSHA256は1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD。

## 型チェック・ビルド

検証済み:

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    # exit=0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/backup/commandline/commandline.component.html projects/ngclient/src/app/backup/commandline/commandline.navigation.spec.ts e2e/commandline-navigation.spec.ts
    # All matched files use Prettier code style!
    bun run build:prod
    # Application bundle generation complete. [54.970 seconds]
    # exit=0、ビルドログにwarning/errorなし

lint script/targetはpackage.json・angular.jsonにないため、lint成功とは主張しない。

## ブラウザー

検証済み:

    bun run test:e2e e2e/commandline-navigation.spec.ts e2e/commandline-polling.spec.ts
    # 最終: 3 passed (18.9s)

最終E2Eの警告はNO_COLORとFORCE_COLORの競合通知のみ。

本番成果物・Chromium・APIモック。コマンド編集画面にバックアップを読み込み、引数・宛先URLを編集してから、Ctrlクリックと中クリックがホームURLの別タブを開くことを検証。元のURL・編集値は維持。Enterでは実際のAngularホームへ移動しMy backupsを表示。commandline POSTは0件。

別タブのdocumentは静的HTML応答で、リンク先URL・タブ生成のみを検証。別タブでの認証全体は未検証。初回はGET /api/v2/connection-stringsのモック不足がfixtureのunexpectedRequests検査で失敗し、2件の既存ポーリングテストは成功。読み取り応答をテストに追加し、E2E型チェックとPrettierも再実行。アプリの実装は変更していない。

## コミットと残件

- ブックマーク: `codex/commandline-home-link`
- コミット: [760573a9f2e70135e0e1549a5e5bc51d4f8c4e0a](https://github.com/JamBalaya56562/ngclient/commit/760573a9f2e70135e0e1549a5e5bc51d4f8c4e0a)
- 親: `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`
- `jj git push --remote origin -b codex/commandline-home-link` 成功。PR・Issueコメントなし。
- Git管理外 `tmp/ngt-069/`: before.log（テスト構成エラー）、before-valid.log（有効な赤）、after.log、types.log、types-e2e-final.log、prettier.log、prettier-final.log、build.log、e2e.log（初回fixture不足）、e2e-final.log、existing-before.tsv、commit.txt。

未検証: 実サーバー、全unit/E2E suite、Firefox/WebKit、実行済みコマンドのページ離脱後の寿命。これらの動作は変更しない。

残る監査はNGT-070。ホームは#697と重なるため待つ。コマンドID移行はNGT-059の型修正待ち。delete-versions/broken-files/version-labelsのCancelはdisabled条件があり、単純リンク化しない。ログやウィザードなどNGT-057〜068で準備済みの対象は繰り返さない。logoutの補助移動とwelcome/connectのGo backは、自動リダイレクト・認証/登録状態との関係が未検証のため残件候補とし、無条件にリンク化するとは決めない。独立した有益な対象がなければ監査だけで完了し、別領域のバグ/E2Eを優先する。