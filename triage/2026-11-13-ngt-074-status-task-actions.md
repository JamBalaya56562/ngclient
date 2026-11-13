# NGT-074: Status停止・中断要求の状態と破棄（2026-11-13）

## 選定・依存

検証済み: `jj git fetch --all-remotes` は `Nothing changed.`。基準mainは `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`。ghでopen PR #695〜#705を確認。#705の編集範囲はバックアップ暗号化・DTO変換でStatusとは重ならない。既存34実装ブックマークと今回のStatus ts/html・操作spec・E2Eのmainとの差分を照合し、変更ファイル重複なし。triageと画像保管用codex/pr-review-screenshotsを実装比較から除外。最新mainから独立ブランチを作成し、本体・準備済みブランチへの依存なし。

## 再現と実装

検証済み（操作単体テスト）: stop/abortを連続で呼ぶと同じタスクへ複数要求を送り、画面破棄後もObservable購読が残り、失敗は未処理のRxJSエラーになる。追加11ケースのうち該当8ケースが修正前に失敗した。

実装: 画面内のpendingをタスクID・操作ごとにSetで管理し、同一task/actionの保留中要求を重複送信しない。Stopの応答待ちでもAbortは押せる。Abort保留中は同じタスクのStop/Abortを無効化する。進捗が次のタスクへ進んだ場合は新しいタスクを操作でき、古い応答のfinalizeは古いIDだけを削除する。

DestroyRef/takeUntilDestroyedで画面の購読を終了し、finalizeでpendingを解放。破棄後に古いインスタンスから呼ばれても要求しない。エラー通知は既存interceptorへ任せ、subscribeのerrorハンドラーで二次的な未処理例外を防ぎ再試行可能にする。要求が完了した後は再び操作可能で、停止要求済み状態をサーバー応答の前提なしに永続化しない。

ドキュメント根拠（差分）: タスクIDの取得元、Stop/AbortのURL・POST、確認ダイアログの有無、進捗・ログ・グラフ・throttle・更新間隔は変更なし。StatusPageStateや共通StatusBarの制御には触れない。新しい文言・生成API・依存パッケージ・設定の追加なし。

## APIと寿命の制限

ドキュメント根拠: 生成Angular APIはHttpClient.requestをfirstValueFromするasync関数で、Promiseを返す。takeUntilDestroyedはUI購読を外すが開始済み通信をabortしない。画面を離れても送信済みのStop/Abort操作を取り消すものではない。pending管理は画面インスタンス内であり、別画面・別タブ全体の重複を防ぐ仕組みではない。

検証済み: 本番UIで古い画面のHTTP応答を保留したまま離脱・再表示し、新しい要求の待機状態が古い応答で解除されないことを確認。生成クライアントは変更していない。

## 単体テスト（検証済み）

PowerShellでmiseのnode・bun実体ディレクトリをPATHへ追加し、VITEST_MAX_WORKERS=1。以下のbun/nodeはmise実体を直接呼んだ。

操作specはStatusComponentを空テンプレートで作り、進捗・API・画面状態はモックする。既存logs-stored.component.spec.tsと同じ外部パッケージmockでShipTableをスタブ化し、対象外のライブ・ログ表の初期化を避ける。実テンプレート・実ライブラリーは後述の本番E2Eで検証する。

初回のShipTableContent初期化エラー、Angularテスト環境が非対応の相対vi.mock、モックのactivateView不足による読込/初期化エラーはテスト構成を直した。これらを赤の証拠にせず、構成修正後のbefore-final.logを採用。

    bun run test:ci --include '**/status.actions.spec.ts'
    # 修正前: Test Files 1 failed (1)
    # Tests 8 failed | 3 passed (11)、テスト構成起因のErrorsなし

11ケース: タスクなし、Stop/Abort別の重複抑止、Stop→Abort切替、タスクID変更、Stop/Abort別の破棄、Stop/Abort別のエラー再試行、Stop/Abort別の同期完了。エラー検査ではRxJS config.onUnhandledErrorを一時的に監視しfinallyで戻す。

    bun run test:ci --include '**/status.actions.spec.ts' --include '**/status.state.spec.ts' --include '**/status.throttle.spec.ts'
    # 修正後: Test Files 3 passed (3), Tests 34 passed (34)

既存StatusPageStateとthrottleのテストも成功。Vitestタイムアウト定数・node_modulesは変更なし。runner SHA256は1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD。

## 型チェック・ビルド（検証済み）

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    # exit=0、最終E2E編集後も再実行
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/status/status.component.ts projects/ngclient/src/app/status/status.component.html projects/ngclient/src/app/status/status.actions.spec.ts e2e/status-task-actions.spec.ts
    # All matched files use Prettier code style!
    bun run build:prod
    # Application bundle generation complete. [40.535 seconds]
    # exit=0、buildログにwarning/errorなし

lint script/targetはpackage.json・angular.jsonにないためlint成功とは主張しない。

## ブラウザー（検証済み）

    bun run test:e2e e2e/status-task-actions.spec.ts
    # 3 passed (19.0s)

本番成果物・Chromium・APIモック。完全なStatusテンプレートとShipTable等の実ライブラリーを使用し、実ログインUIから開始。Stop/Abort・進捗・タスク状態・ログ一覧・設定は隔離したモック応答で、利用者のタスクは操作していない。

- Stopを保留して重複clickを防ぎ、Abortへ切替可能。Abort保留中は両操作を無効化し、各POSTは1件。応答後は再操作可能。
- タスク73のStop保留中に74へ変更し、74を操作可能。73の遅い応答で74の待機を解除しない。
- Stopの500失敗後に再試行可能。再試行を保留したままホームへ離脱・Statusへ再表示し、新しい要求を開始。離脱前の応答で新しい要求の待機を解除しない。

E2Eの警告はNO_COLORとFORCE_COLORの競合通知のみ。APIモックはlegacy progress経路で、v2 systemstatus snapshot配信経路はこのE2Eでは未検証。HTTPエラー通知UIそのものの検査は行わず、interceptorへの通知経路を差分上維持し、未処理ブラウザーエラーなし・再試行成功を確認した。

## push・残件

- ブックマーク: `codex/status-task-action-lifecycle`
- コミット: [bb665f7753b557fb692157760ad9cd0fa7fb507f](https://github.com/JamBalaya56562/ngclient/commit/bb665f7753b557fb692157760ad9cd0fa7fb507f)
- 親: `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`
- `jj git push --remote origin -b codex/status-task-action-lifecycle` 成功。PR・Issueコメントなし。

Git管理外tmp/ngt-074にbefore.log、before-valid.log、before-red.log（テスト構成エラーを含む）、before-final.log（有効な赤）、after.log、types.log、types-e2e-final.log、prettier.log、prettier-final.log、build.log、e2e.log、existing-before.tsv、commit.txtを保存。

未検証: 実サーバーでの実タスク停止/中断、全unit/E2E suite、Firefox/WebKit、複数タブや画面全体の要求調停。NGT-071の先行マージ待ちは維持する。

残る監査はNGT-075へ分離。StatusPageStateのv2 snapshot読取とdeactivate/再表示時の応答世代は未検証の候補であり、今回の不具合修正と混同しない。生成APIのPromiseとObservableの差、既存ブランチの編集範囲を確認してから進める。次の未使用IDはNGT-076。