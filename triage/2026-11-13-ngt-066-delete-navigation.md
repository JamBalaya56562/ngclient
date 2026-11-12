# NGT-066: ジョブ削除画面のnativeナビゲーション（2026-11-13）

## 選定と範囲（検証済み）

jj git fetch --all-remotesはNothing changed。最新upstream/main 8edaeee84c0c0f4a48e75ae917195cb1047b15a5から独立して実装。ghでopen PR #695〜#704を取得し、既存ブックマークの変更ファイルと今回のHTML・既存unit spec・既存E2Eを照合した。重複はなかった。エクスポートフォームの#696や他の準備済みブランチ、本体API変更に依存しない。

NGT-066のRouter使用箇所を評価し、単純にページを移るExport configurationと削除画面のCancelだけをbuttonからaへ変更した。RouterLinkの行き先とShipButtonはそのまま。削除actionと確認ダイアログ内のCancelは状態操作なのでbuttonのまま。TypeScriptの削除処理、Sync判定、local DB/remote filesオプション、確認フロー、APIクライアント、スタイルは変更していない。

## 赤→緑（検証済み）

実際のcomponent/templateを使う既存specへBackup/Syncの2ケースを追加。href、input IDを42→43にした時のexport URL更新、削除API・確認dialogが呼ばれないこと、Delete backupがbuttonのままであることを確認した。

miseのbun.exe実体を直接実行し、PowerShellで $env:VITEST_MAX_WORKERS = '1' を設定。

    bun run test:ci --include '**/delete-backup.component.spec.ts'
    # 修正前
    Test Files 1 failed (1)
    Tests 2 failed | 8 passed (10)
    # 修正後
    Test Files 1 passed (1)
    Tests 10 passed (10)

修正前の2件はBUTTONではなくAを期待する箇所で失敗。既存8件は変更前後とも成功し、Syncではremote削除を送らないこと、キャンセル、重複実行防止、失敗後の再試行も保持した。

## Vitest起動待ちの一時延長と復元

初回はtest実行前にworker起動が60秒でタイムアウトし、no tests / 1 errorだった。アプリの赤テストには数えない。取り決めに従い、インストール済みVitestのSTART_TIMEOUT（6e4）とWORKER_START_TIMEOUT（9e4）を一時的に3e5へ延長して変更前後を検証し、それぞれtry/finallyで元のbytesへ復元した。テスト本体のtimeoutは変更しない。

    Vitest original SHA256 restored:
    1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD

node_modulesの変更やrunner設定はコミットしていない。

## 型・書式・本番ビルド・E2E（検証済み）

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    exit 0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/backup/delete-backup/delete-backup.component.html projects/ngclient/src/app/backup/delete-backup/delete-backup.component.spec.ts e2e/delete-backup.spec.ts
    All matched files use Prettier code style!
    bun run build:prod
    Application bundle generation complete. [70.418 seconds]
    exit 0
    bun run test:e2e e2e/delete-backup.spec.ts
    4 passed (23.7s)

本番成果物・Chromium・APIモック。新規2件ではCtrl/中クリックでexportのhref先を別タブに開き、元の削除画面に留まってdialogもDELETE要求も出ないこと、画面のCancelへfocusしてEnterでホームへ戻ってもDELETEが0回であることを確認した。別タブのdocumentは静的HTMLで応答し、URLとタブ生成を検査した。エクスポート画面の認証やダウンロード全体を検査したものではない。

既存2件ではSyncのlocal DB削除オプションとremote削除省略、通常Backupの確認Cancel→再確認→指定オプション付き削除が成功。確認dialogのCancelはbuttonで閉じる既存動作を保持する。これらの削除もモックAPI上の操作であり、利用者のジョブは操作していない。

## push・証拠

- ブックマーク: codex/delete-backup-navigation-links
- コミット: [5799b62720c1950d74d1e6568fa9fe6f597fa058](https://github.com/JamBalaya56562/ngclient/commit/5799b62720c1950d74d1e6568fa9fe6f597fa058)
- 親: 8edaeee84c0c0f4a48e75ae917195cb1047b15a5
- jj git push --remote origin -b codex/delete-backup-navigation-links成功。PR・Issueコメントは投稿していない。

Git管理外のtmp/ngt-066にbefore-worker-start-failure.log、before.log、after.log、build.log、e2e.log、commit.txt、vitest-original.bin、vitest-restored.txtを保存した。

未検証: 実サーバー、全unit/E2E suite、Firefox/WebKit。ホームカードと残るRouter使用箇所はNGT-067へ分ける。ホーム#697とコマンドID用のNGT-059型修正は引き続きマージ待ち。disabledや状態変更を持つ操作を無条件にリンクへ置換しない。次の新規IDはNGT-068。