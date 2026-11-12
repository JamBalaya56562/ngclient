# NGT-057: Add Backupの入口リンク — 2026-11-12

## 選定・依存・変更範囲

基準main: `d788d0c592306dffe8105ae5f4c357156f94a38c`。`jj git fetch --all-remotes`はNothing changed。open PR #684〜694と全ブックマークのmainとの差分ファイルを照合した。

**検証済み（差分照合）**: `add-backup/`と新規`e2e/add-backup-navigation.spec.ts`を編集する既存ブックマークはない。サイドバー変更NGT-003、Signal Forms移行、本体API追加には依存しない。最新mainから独立したブランチで実装。

対象はAdd a new backup画面の3つの入口のみ。`button shButton [routerLink]`を`a shButton [routerLink]`へ変更。遷移先は`/backup/new`、`/backup/import`、`/backup/import-destination`を維持。Ship UIの属性・class、文言、サーバー機能の表示判定は変更しない。ルート定義、guard、APIクライアント、フォームの処理、共通E2E fixtureに変更なし。

**検証済み（ソース）**: `SysinfoState.hasRestoreControlFilesOperation`はsysteminfoのAPIExtensionsに`v1:backup:restorecontrolfiles`がある場合だけtrue。対応するremote importカードの条件を維持する。

## 修正前の証拠

実際のAddBackupComponentのtemplate/Ship UI/RouterLinkを動かし、StatusBarとSysinfoStateだけを置き換えたunit specを先に実行した。

```text
bun run test:ci --include '**/add-backup.component.spec.ts'
Test Files 1 failed (1)
Tests 2 failed (2)
AssertionError: expected [] to deeply equal [ '/backup/new', '/backup/import' ]
```

2件目はcapability有効時に期待する3つのhrefに対しても空配列。templateにanchorがないことによる失敗であり、起動や依存解決の失敗ではない。生ログ: `tmp/add-navigation-before.log`。

## 今回扱わないもの

About等のShip UI tabs、ホームのカードとメニュー、route input binding等の適合評価は別途NGT-058で管理する。今回の入口リンク変更だけでナビゲーション全体の監査完了とはしない。フォーム移行やサイドバー変更と同じファイルへ変更を積み重ねない。

別タブテストの遷移先documentはstatic HTMLで応答する。ブラウザーのリンク処理、URL、元画面が変わらないことの確認であり、新しいタブの認証や実サーバー操作を確認したという意味ではない。

**未検証**: 実サーバー、Firefox/WebKit、全unit/E2E suite、pixel差分の自動判定。証拠tmpはGit管理外で永続性は保証しない。

## 型・unit・ビルド検証

```text
bun run test:ci --include '**/add-backup.component.spec.ts'
Test Files 1 passed (1)
Tests 2 passed (2)

node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
exit 0
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
exit 0

bun run build:prod
Application bundle generation complete. [102.958 seconds]
exit 0

node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/add-backup/add-backup.component.html projects/ngclient/src/app/add-backup/add-backup.component.spec.ts e2e/add-backup-navigation.spec.ts
All matched files use Prettier code style!
```

**検証済み**: ビルドログにwarning一致なし。専用lint targetは既存構成にないためlint成功とは主張しない。ログ: `tmp/add-navigation-unit.log`、`tmp/add-navigation-tsc-{app,spec}.log`、`tmp/add-navigation-build.log`。

## E2Eの途中経過

初回はテスト準備でアイコンを含むsidebarのtextを完全一致検索し、Add backupを見つけられなかったため中断した。準備処理をaccessible nameとbutton/link両対応のlocatorへ修正。これはNGT-003の未マージ変更への依存を作らないため。

次の実行:

```text
node node_modules/@playwright/test/cli.js test e2e/add-backup-navigation.spec.ts e2e/import-file-read.spec.ts e2e/import-preparation.spec.ts
11 passed, 2 failed
```

既存のimport-file-read 3件・import-preparation 3件は全成功。新規specでは通常遷移・キーボード・履歴・新規作成初期化・remote import初期化・別タブが通った。失敗した表示件数2件は、Add Backup内のStatusBarにある接続リンクまで数えたため（2に対し3、3に対し4）。入口カードの領域へcountの対象を限定した。アプリの追加変更は行っていない。途中ログは`tmp/add-navigation-e2e-initial.log`と`tmp/add-navigation-e2e-count-failure.log`。

## 最終E2Eとpush結果

テストのcount対象を修正したあと、新規spec全7件を再実行:

```text
node node_modules/@playwright/test/cli.js test e2e/add-backup-navigation.spec.ts
7 passed (37.0s)
```

**検証済み**: 機能非対応時の2入口、対応時の3入口とhref、Tab/Enterとfocus outline、SPAでdocumentが維持されること、戻る/進む、新規作成/remote importのredirectと初期表示、ControlOrMeta/中央クリックの別タブ表示。既存6件は前の実行で全成功している。最終版で13件をまとめて再実行したという意味ではない。

E2Eは本番ビルドのChromiumとAPIモックを使用。runnerにはNO_COLOR/FORCE_COLORの環境警告があるので、全ログ無警告とはしない。最終ログは`tmp/add-navigation-e2e-final.log`。

**検証済み（目視）**: `tmp/add-navigation-evidence/after.png`で3カードと入口リンクの表示を確認。変更前とのpixel一致判定ではない。

- ブックマーク: `codex/add-backup-router-links`
- 完全なSHA: `e9de175202bf31b034e901c9f3f883eb1ec932cb`
- 親: `d788d0c592306dffe8105ae5f4c357156f94a38c`
- `jj git push --remote origin -b codex/add-backup-router-links`成功。PRは作成していない。

差分はAdd BackupのHTMLと追加したunit/E2Eの3ファイル。既存の実装ブランチは変更していない。
