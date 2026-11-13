# NGT-076: StatusBar進捗取得の重複・応答寿命（2026-11-13）

## 選定・依存

検証済み: `jj git fetch --all-remotes` は `Nothing changed.`。基準mainは `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`。ghでopen PR #695〜#705を確認。既存36実装ブックマークと今回のStatusBarState・専用polling spec・E2Eのmainとの差分を照合し重複なし。記録用triageと画像保管用codex/pr-review-screenshotsを比較から除外。最新mainから独立ブランチを作成。本体・準備済みブランチへの依存なし。NGT-074/075のStatus画面やsnapshotの差分は含めない。

## 再現と修正

検証済み（単体テスト）: 進捗APIまたは後続のタスク情報APIが遅い間に次の取得が重複する。タスク変更後、旧タスク情報のPromiseが現在の表示を戻し、旧進捗のPromiseが不要なタスク情報取得を始める。古いエラー/完了は新しい読み込み状態へ影響する。停止・破棄・WebSocket進捗への切替後にも保留中の購読が残り、startを繰り返すとtimerを置き換える。追加10ケースの該当8件が修正前に失敗した。

実装: 進捗取得と後続のタスク情報取得を、ひとつの所有Subscriptionとして管理。現在の取得が終わるまで重複しない。タスクID変更、stop、WebSocket進捗への切替、DestroyRefによる破棄でtimer/購読を解放する。開始時のタスクID・進捗方式・所有者が現在と一致することを、後続APIの開始前と最終応答/エラーで確認する。古いfinalizeが新しいisFetchingを下げないようにする。startは既存timer/破棄済みなら何もしない。

ドキュメント根拠（差分）: 1秒の周期、API・payload、進捗率/速度/ファイル文言/残量計算、pause/resumeとダイアログは変更なし。現在のエラーに対する既存の404判定と通常の再試行分岐は維持。WebSocket配信の表示計算と共有サービスのサーバー購読解除は変更しない。

## Promise APIの制限

ドキュメント根拠: 生成APIはHttpClient.requestをfirstValueFromするasync関数でPromiseを返す。購読解除はUIへの通知を終了するが、開始済みHTTP通信をabortしない。生成クライアントの変更は含めない。

検証済み: 遅いPromiseと本番UIで旧HTTP応答を返し、新しいタスクの表示を戻さず、旧進捗からタスク情報のGETを始めないことを確認した。通信中断と購読解除を混同しない。

## 単体テスト（検証済み）

PowerShellでmiseのnode・bun実体ディレクトリをPATHへ追加し、VITEST_MAX_WORKERS=1。以下のbun/nodeはmise実体を直接呼んだ。進捗・タスク情報をそれぞれSubject/Promiseで遅延させ、fake timer・要求回数・isFetching・表示TaskID・observedで検査。

    bun run test:ci --include '**/status-bar.polling.spec.ts'
    # 修正前: Test Files 1 failed (1), Tests 8 failed | 2 passed (10)

10ケース: 二段階APIの重複抑止、旧タスク情報Promise、新しいタスクで旧進捗Promiseが不要なlookupを始めないこと、stop、injector破棄と再開抑止、WebSocket進捗へ切替、現在の404/503エラー別の互換挙動、旧Promiseエラーによる現在の取得への干渉、start繰返し。

    bun run test:ci --include '**/status-bar*.spec.ts'
    # 修正後: Test Files 3 passed (3), Tests 51 passed (51)

既存のestimated totals・各phase・ファイル/空ファイル進捗表示41ケースも成功。404/503は直接statusを持つエラーをモックした互換テストであり、実サーバーのエラー変換全体を検証したとは主張しない。

beforeのworker起動が60秒上限に近かったため、afterのみ依頼済み手順でnode_modules/vitest/dist/chunks/index.DpLw24bj.jsのSTART_TIMEOUT/WORKER_START_TIMEOUTを300秒へ一時延長。finallyで元のバイト列へ戻しSHA256一致を確認。テスト自体のタイムアウトは変更していない。

復元SHA256: 1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD。node_modules・依存・設定のコミットなし。

## 型チェック・ビルド（検証済み）

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    # exit=0、最後のselector調整後も再実行
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/core/components/status-bar/status-bar.state.ts projects/ngclient/src/app/core/components/status-bar/status-bar.polling.spec.ts e2e/progress-polling-lifecycle.spec.ts
    # All matched files use Prettier code style!
    bun run build:prod
    # Application bundle generation complete. [144.812 seconds]
    # exit=0、buildログにwarning/errorなし

lint script/targetはpackage.json・angular.jsonにないためlint成功とは主張しない。

## 本番UI（検証済み）

    bun run test:e2e e2e/progress-polling-lifecycle.spec.ts
    # 2 passed (43.3s)

本番成果物・Chromium・APIモック。WebSocketのlegacy serverstateと、RESTの進捗取得という組み合わせで検証。

1. 進捗73の応答を保留して5秒経過、GETは1件。進捗を返した後もタスク情報73を保留して4秒経過、進捗GETはまだ1件。タスク74へ変更して新しい進捗とタスク情報を返し、処理中ファイルcurrent-74.txtを表示。旧タスク情報73をCompletedとして遅延させても、処理中の74を維持。
2. 進捗73を保留したまま74へ変更。古い進捗73を返してもタスク情報73へのGETは0件。74の進捗/情報を返すと処理中ファイル74を表示。

処理中ファイルの .file-row:not(.recent) を明示的に選び、履歴に残った名前で成功と誤判定しない。利用者のサーバー・ジョブは操作せず、関連APIはモック。E2Eの警告はNO_COLORとFORCE_COLORの競合通知のみ。

未検証: 実サーバー、全unit/E2E suite、Firefox/WebKit、WebSocket配信そのものの旧task cacheの鮮度、実404のエラー変換、ログアウト/再接続全体の寿命。現在の修正はREST進捗・後続タスク情報の取得所有権に限定する。

## push・残件

- ブックマーク: `codex/statusbar-progress-lifecycle`
- コミット: [50701228035d79bc8d9824e24e7a07218c83d562](https://github.com/JamBalaya56562/ngclient/commit/50701228035d79bc8d9824e24e7a07218c83d562)
- 親: `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`
- `jj git push --remote origin -b codex/statusbar-progress-lifecycle` 成功。PR・Issueコメントなし。

Git管理外tmp/ngt-076にbookmarks-before.tsv、existing-before.tsv、before.log、after.log、types.log、types-e2e-final.log、prettier.log、prettier-final.log、build.log、e2e.log、commit.txtを保存。

NGT-071の先行マージ待ちは維持。次の独立候補NGT-077はServerStatusWebSocketServiceの接続・再接続timer・非同期認証処理の寿命監査。着手時に既存差分と現行呼出しを検証し、未検証を不具合と断定しない。StatusBarStateの追加変更はこのブランチの先行マージを待つ。次の未使用IDはNGT-078。