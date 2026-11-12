# NGT-062: 復元進捗taskidのRouter入力 — 2026-11-12

## 選定と依存（検証済み）

基準main: 8edaeee84c0c0f4a48e75ae917195cb1047b15a5。jj git fetch --all-remotes は Nothing changed。ghでopen PR #695〜#704を取得し、全既存ブックマークのmainからの変更ファイルを照合。今回の3ファイルと重複する既存ブックマークはなかった。最新mainから独立して実装し、本体変更・準備済みブランチには依存しない。

NGT-062の候補群から、ホームの移行PRと重ならない復元進捗componentのtaskid入力だけを選んだ。About・ホーム・他のroute入力の残りはNGT-064へ分離する。

## 実装

RestoreProgressComponentのActivatedRoute.snapshot.params読み取りを、taskId = input.required<string>({ alias: 'taskid' })へ移した。mainで既に有効なwithComponentInputBindingを利用し、URL側の小文字taskidはそのまま。ngOnInitでNumber(this.taskId())を読み、既存の初回タスク取得を開始する。

初回取得、完了待ち、通知、タスク開始時刻、成功/失敗判定、破棄時のHTTP解除、テンプレートとスタイルは変更していない。既存unit specはActivatedRoute mockの代わりにcomponentRef.setInput('taskid', '42')を設定する。

今回の目的は既存動作を保つリファクタリング。component再利用で別taskidに変わった時に再取得する仕様は追加していない。新inputの値はRouterに追随するが、HTTP開始は従来どおりngOnInitの1回だけ。

## 契約テスト（変更前後、検証済み）

実際のRouter、withComponentInputBinding、RouterTestingHarnessを使う7ケースを追加した。親shellはRouterOutletを持ち、componentのtemplateと注入サービスはテスト用に置き換えた。taskidはテストから手動注入せず、実際のpath/queryからRouterが渡す。

- restore/:id、restore-draft/:id、restore-from-filesの各prefixで初回タスクを数値変換して取得する。
- queryの同名taskidよりpathを優先し、00101は101として送る。
- query・fragment・再利用されるpath変更でHTTPを再開始しない既存契約を維持する。
- guardが拒否した遷移は現在のタスクを変更しない。
- 未完了のタスクは既存の完了待ちへ渡す。

PowerShellで $env:VITEST_MAX_WORKERS = '1' を設定し、miseのbun.exe実体を直接実行。

    bun run test:ci --include '**/restore-progress*.spec.ts'
    # 変更前
    Test Files 2 passed (2)
    Tests 34 passed (34)
    # 変更後
    Test Files 2 passed (2)
    Tests 34 passed (34)

バグ修正の赤→緑ではなく、同じ契約が変更前後で通ることを確認した。34件は新規Router契約7件と既存component spec 27件。

## 型チェック・本番ビルド・E2E（検証済み）

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    exit 0

    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/restore-flow/restore-progress/restore-progress.component.ts projects/ngclient/src/app/restore-flow/restore-progress/restore-progress.component.spec.ts projects/ngclient/src/app/restore-flow/restore-progress/restore-progress-route-input.spec.ts
    All matched files use Prettier code style!

    bun run build:prod
    Application bundle generation complete. [70.840 seconds]
    exit 0

    bun run test:e2e e2e/restore-lifecycle.spec.ts
    3 passed (26.7s)

Chromiumと本番成果物で既存E2Eをそのまま実行した。モックAPI環境でUnix backup on WindowsとWindows backup on Unixの復元要求・返却task IDによる進捗取得・正常完了表示、失敗タスクの失敗表示が成功。新しいE2Eファイルや設定ファイルは追加していない。実サーバーで実ファイルを復元したという主張ではない。

## push

- ブックマーク: codex/restore-progress-route-input
- コミット: [12e49f2142893d85f0d938524dbd238173d417f8](https://github.com/JamBalaya56562/ngclient/commit/12e49f2142893d85f0d938524dbd238173d417f8)
- 親: 8edaeee84c0c0f4a48e75ae917195cb1047b15a5
- jj git push --remote origin -b codex/restore-progress-route-input 成功。PR・Issueコメントは投稿していない。

ローカル証拠（Git管理外）: tmp/ngt-062/before.log、after.log、build.log、e2e.log、commit.txt。node_modulesとrunner設定は変更していない。

## 残り（NGT-064）

AboutのShipTabsは、インストール済みライブラリがrole・aria-selected・tabindexを設定することをコードで確認した。native anchorへ単純置換するとSpaceやフォーカス契約にも関わるため、この実装では変更していない。実画面でのAboutキーボード監査は未検証。ホームは#697の変更と重なるためマージ後に範囲を再評価する。他のroute入力も個別に選び、NGT-059/060/061/062の実装を繰り返さない。

未検証: 実サーバー、全unit/E2E suite、Firefox/WebKit、About・ホームの実画面監査。Aboutの具体的な不具合の有無は未確定。次の新規IDはNGT-065。