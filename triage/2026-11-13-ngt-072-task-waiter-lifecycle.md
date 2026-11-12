# NGT-072: タスク完了購読・待機の破棄ライフサイクル（2026-11-13）

## 選定・依存

検証済み: `jj git fetch --all-remotes` は `Nothing changed.`。基準mainは `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`。ghでopen PR #695〜#704を確認。既存30実装ブックマークと今回のserver-state.service.ts/spec.tsのmainとの差分を照合し、変更ファイルの重複なし。記録用triageと画像保管用codex/pr-review-screenshotsを実装比較から除外。最新mainから独立ブランチを作成。本体変更・準備済みブランチへの依存なし。NGT-002/056/063には触れない。

## 再現と実装

検証済み（サービス単体テスト）: injector破棄後にもtaskCompletedの購読、保留中のタスクread、通常1秒/エラー3秒の次回readタイマー、タスク待機Subscriberが残る。破棄後に購読すると新しいreadを開始したり既存キャッシュを通知する。追加6ケースがすべて修正前に失敗した。

実装: AngularのtakeUntilDestroyedでローカルのtaskCompleted購読を解除。DestroyRef.onDestroyで既存stopPollingを呼び、待機一覧を先に切り離して全待機を結果なしでcompleteする。これによりcompleteコールバックからの再入で別タスクのreadが始まることも防ぐ。waitForTaskToCompleteのObservable内でdestroyedを確認し、破棄後の購読はキャッシュ通知やreadをせず完了する。Observableを破棄前に作り、破棄後にsubscribeした場合も含む。

ドキュメント根拠（差分）: 通常の完了/失敗結果、キャッシュ、共有待機、read間隔、API形式、接続方式切替は変更なし。共有WebSocketのサーバー購読をunsubscribeしたり共有transportを止めたりせず、ServerState自身のローカル購読とタスクread/timerだけを終了する。UI・生成API・依存パッケージ・設定ファイルの変更なし。

ドキュメント根拠（呼出し側）: restore-progress.component.tsはwaitForTaskToCompleteをtakeUntilDestroyedしてnextで結果を設定。select-files.component.tsのrepair待機もnextで結果を処理する。破棄時に成功/失敗のTaskDtoを生成しない。通常の画面遷移でrootサービスが破棄されるとは主張しない。この再現はAngular injectorの破棄契約を対象にし、実画面での不具合再現は未検証。

## テスト（検証済み）

PowerShellでmiseのnode・bun実体ディレクトリをPATHへ追加し、VITEST_MAX_WORKERS=1。以下のbun/nodeはmise実体を直接呼んだ。HTTP相当のreadとWebSocket eventはSubjectでモックし、observed・subscription.closed・next/complete・fake timerを検査。

    bun run test:ci --include '**/server-state.service.spec.ts'
    # 修正前: Test Files 1 failed (1)
    # Tests 6 failed | 23 passed (29)

追加ケース:
- releases task completion events and websocket waiters when its injector is destroyed
- cancels the in-flight task read and completes all waiters without starting another task on destroy
- cancels the pending response timer when its injector is destroyed
- cancels the pending error timer when its injector is destroyed
- does not emit cached task results after its injector is destroyed
- completes a wait subscribed after destruction without starting a task read

    bun run test:ci --include '**/server-state.service.spec.ts' --include '**/server-status-longpoll.service.spec.ts' --include '**/server-status-websocket.service.spec.ts' --include '**/restore-progress.component.spec.ts' --include '**/select-files.component.spec.ts'
    # 修正後: Test Files 5 passed (5)
    # Tests 98 passed (98)

ServerStateの既存23ケースも通り、通常の完了/失敗・共有待機・キャンセル・キャッシュ・ポーリング/エラー再試行・同期完了を確認。長ポーリング/WebSocketと呼出し側の既存specも成功。これらはこの独立ブランチのmain由来コードであり、NGT-056等の未マージ差分を混ぜていない。Vitestタイムアウト定数・node_modules変更なし。runner SHA256は1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD。

## 型チェック・ビルド

検証済み:

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    # exit=0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/core/services/server-state.service.ts projects/ngclient/src/app/core/services/server-state.service.spec.ts
    # All matched files use Prettier code style!

    bun run build:prod
    # Application bundle generation complete. [62.558 seconds]
    # exit=0、buildログにwarning/errorなし

lint script/targetはpackage.json・angular.jsonにないためlint成功とは主張しない。

## push・残件

- ブックマーク: `codex/task-waiter-service-lifecycle`
- コミット: [be11e6fcfa8a3ee2a57659e4cb75e69f71e64f9c](https://github.com/JamBalaya56562/ngclient/commit/be11e6fcfa8a3ee2a57659e4cb75e69f71e64f9c)
- 親: `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`
- `jj git push --remote origin -b codex/task-waiter-service-lifecycle` 成功。PR・Issueコメントなし。

Git管理外tmp/ngt-072にbefore.log、after.log、types.log、prettier.log、build.log、existing-before.tsv、commit.txtを保存。

未検証: 実サーバー、実HTTPの切断、ブラウザーE2E、全unit suite、アプリ全体の破棄順序。復元画面specは呼出し側の既存テストであり、実サーバーを使う統合テストではない。

非同期監査全体は完了としない。NGT-073へ画面固有のread・遅延処理の監査を分離し、既存NGT-002/056/063/072を繰り返さない。NGT-071の先行マージ待ちは維持する。次の未使用IDはNGT-074。