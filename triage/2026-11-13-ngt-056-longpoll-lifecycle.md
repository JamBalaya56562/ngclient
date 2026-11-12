# NGT-056: 長ポーリングの購読・破棄ライフサイクル（2026-11-13）

## 選定と依存

検証済み: `jj git fetch --all-remotes` は `Nothing changed.`。基準mainは `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`。ghでopen PR #695〜#704を確認。既存29実装ブックマークと今回のservice.ts/spec.tsのmainとの差分を照合し変更ファイル重複なし。画像保管用codex/pr-review-screenshotsと記録用triageを実装比較から除外。最新mainから独立ブランチを作成。本体依存なし。ServiceHub NGT-002・ログRouter購読 NGT-063には触れない。

## 再現した契約と修正

検証済み（サービス単体テスト）: startを2回呼ぶとGET相当の購読が2つ開始される。失敗後のstartも既存の5秒retryを残して別の購読を始める。TestBedでinjectorを破棄しても、保留中Subjectの購読が残り、retryのダイアログも閉じられない。追加した4ケースはいずれも修正前に失敗した。

ドキュメント根拠（ソース）: startが停止通知用Subjectを毎回置き換えるため、古い購読が停止通知から外れる。サービスにはinjector破棄時の停止処理がなかった。現在のServerStateServiceはreconnectIfNeeded経由なので、通常画面で重複startが生じていたことは未検証。ユーザー操作での不具合再現とは区別し、開始APIと破棄のライフサイクルを防御的に整理した。

実装: DestroyRefを注入しonDestroyで既存stopを呼ぶ。startは既に開始済み・injector破棄済みなら何もしない。破棄時に保留中購読・retryタイマー・切断ダイアログを後始末し、破棄後のstart/reconnect/reconnectIfNeededで再開させない。

ドキュメント根拠（差分）: APIの形式・通常のreconnect/stop・イベントID・299s/94sのpoll duration・5秒retry間隔・エラー表示は変更なし。変更はservice.tsと既存specだけで、依存パッケージ・設定・UIファイルの追加なし。

## テスト（検証済み）

PowerShellでmiseのnode・bun実体ディレクトリをPATHへ追加し、VITEST_MAX_WORKERS=1。以下のbun/nodeはmise実体を直接呼んだ。serverはSubjectでモックし、購読のobserved状態とfake timerで後始末を確認した。

    bun run test:ci --include '**/server-status-longpoll.service.spec.ts'
    # 修正前: Test Files 1 failed (1)
    # Tests 4 failed | 8 passed (12)
    # starts only one active poll and stop cancels that subscription
    # keeps one retry schedule when start is repeated after a failure
    # unsubscribes an active poll when its injector is destroyed and cannot restart it
    # clears retry and closes its dialog when the injector is destroyed

    bun run test:ci --include '**/server-status-longpoll.service.spec.ts' --include '**/server-state.service.spec.ts' --include '**/server-status-websocket.service.spec.ts'
    # 修正後: Test Files 3 passed (3)
    # Tests 55 passed (55)

追加4ケースに加え、既存のduration、event ID更新、5秒retry、4回失敗・回復、stop、遅い応答、明示reconnectが成功。関連するServerState/WebSocketも成功。Vitestタイムアウト定数やnode_modulesは変更していない。runner SHA256は1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD。

## 型チェックとビルド

検証済み:

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    # exit=0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/core/services/server-status-longpoll.service.ts projects/ngclient/src/app/core/services/server-status-longpoll.service.spec.ts
    # All matched files use Prettier code style!

    bun run build:prod
    # Application bundle generation complete. [67.102 seconds]
    # exit=0、buildログにwarning/errorなし

lint script/targetはpackage.json・angular.jsonにないためlint成功とは主張しない。

## pushと残件

- ブックマーク: `codex/longpoll-service-lifecycle`
- コミット: [5f919c9b697ceb1c7ec3bcd2e09eddf30c75667c](https://github.com/JamBalaya56562/ngclient/commit/5f919c9b697ceb1c7ec3bcd2e09eddf30c75667c)
- 親: `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`
- `jj git push --remote origin -b codex/longpoll-service-lifecycle` 成功。PR・Issueコメントなし。

Git管理外tmp/ngt-056にbefore.log、after.log、types.log、prettier.log、build.log、existing-before.tsv、commit.txtを保存。

未検証: 実サーバー・実HTTP接続の切断、ブラウザーE2E、全unit suite、実画面操作での重複start、アプリ全体の破棄順序。サービスのライフサイクルとRxJS購読解除は上記の単体テストで確認した。

非同期監査全体は完了としない。残件はNGT-072へ分離し、ServerStateのtaskcompleted購読・待機subscriber・timerなど別対象の契約を調べる。これは調査候補であり未検証の不具合と断定しない。NGT-071の先行マージ待ちは維持。次の未使用IDはNGT-073。