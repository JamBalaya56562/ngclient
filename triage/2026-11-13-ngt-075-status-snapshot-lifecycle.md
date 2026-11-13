# NGT-075: Status snapshot取得セッションの寿命（2026-11-13）

## 選定と依存

検証済み: `jj git fetch --all-remotes` は `Nothing changed.`。基準mainは `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`。ghでopen PR #695〜#705を確認。既存35実装ブックマークと今回のstatus.state.ts/spec.ts・e2e/status-snapshot-lifecycle.spec.tsのmainとの差分を照合し変更ファイル重複なし。記録用triageと画像保管用codex/pr-review-screenshotsは比較から除外。最新mainから独立ブランチを作成。本体・準備済みブランチへの依存なし。NGT-074の操作要求には触れない。

## 再現と修正

検証済み（単体テスト）: 離脱前のPromise応答が再表示後に届くと新しいsnapshotと取得間隔を古い値へ戻す。旧Promiseの成功/失敗によるfinalizeが、新しい読取が保留中でも余分な取得ループを作る。離脱・通信方式切替・injector破棄後にもObservable購読が残る。追加7ケースのうち、この6ケースが修正前に失敗した。

実装: 取得ごとのSubscriptionを先に登録し、現在の取得だけがsnapshotを反映・次回timerを予約できるようにする。stopPollingは所有権を先に外し、timerと購読を解除する。離脱・RESTからWebSocketへの変更・injector破棄で同じ後始末を行う。DestroyRefでactiveなviewを片付け、破棄済みサービスの再activateは無視する。同期完了するObservableでもガードが残らない。

ドキュメント根拠（差分）: 最後に保持したsnapshot cache、history/rate計算、サーバーIntervalMs、エラー時の次回retry、API・生成クライアント・依存パッケージ・設定を変更しない。追加のWebSocketサーバー購読管理やStatus操作ボタンの変更は含めない。

## Promise APIの制限

ドキュメント根拠: 生成APIはHttpClient.requestをfirstValueFromするasync関数でPromiseを返す。購読解除はUIへの応答と次回予約を無効化するが、開始済みHTTP通信そのものをabortしない。

検証済み: 単体テストの実Promiseと本番UIの保留HTTP応答を使い、離脱前の要求を再表示後に成功/失敗させても新しい表示・取得ループを変えないことを確認。通信abortと購読解除を混同しない。

## 単体テスト（検証済み）

PowerShellでmiseのnode・bun実体ディレクトリをPATHへ追加し、VITEST_MAX_WORKERS=1。以下のbun/nodeはmise実体を直接呼んだ。SubjectとPromiseの両方を使い、fake timer・応答内容・要求回数・observed・再activateで検査。

    bun run test:ci --include '**/status.state.spec.ts'
    # 初回はworker起動の60秒タイムアウトでno tests（before.log）。赤の証拠に含めない。
    # 起動待ち延長後の修正前: Test Files 1 failed (1)
    # Tests 6 failed | 22 passed (28)（before-valid.log）

追加ケース: 離脱時の購読解除、旧Promiseによるsnapshot巻き戻り、旧Promise成功時の余分なloop、旧Promise失敗時の余分なloop、通信方式変更時のREST購読解除、injector破棄と再activate抑止、通常のエラーretry。

    bun run test:ci --include '**/status.state.spec.ts' --include '**/status.throttle.spec.ts'
    # 修正後: Test Files 2 passed (2), Tests 30 passed (30)

既存の同期応答・サーバー指定間隔・legacy fallback・状態計算等も成功。worker起動待ちは依頼済みの手順に従い、実行ごとにnode_modules/vitest/dist/chunks/index.DpLw24bj.jsのSTART_TIMEOUT/WORKER_START_TIMEOUTだけを300秒へ一時延長。各実行のfinallyで元のバイト列へ戻し、SHA256一致を確認。テスト自体のタイムアウトは変えていない。

復元SHA256: 1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD。node_modules・設定のコミットなし。

## 型チェック・ビルド

検証済み:

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    # exit=0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/status/status.state.ts projects/ngclient/src/app/status/status.state.spec.ts e2e/status-snapshot-lifecycle.spec.ts
    # All matched files use Prettier code style!

    bun run build:prod
    # Application bundle generation complete. [113.359 seconds]
    # exit=0、buildログにwarning/errorなし

lint script/targetはpackage.json・angular.jsonにないためlint成功とは主張しない。

## ブラウザー

検証済み:

    bun run test:e2e e2e/status-snapshot-lifecycle.spec.ts
    # 2 passed (19.1s)

E2Eの警告はNO_COLORとFORCE_COLORの競合通知のみ。

本番成果物・Chromium・APIモック。WebSocket非対応でv2:systemstatus対応とするsysteminfoと長ポーリングを模擬し、実HTTPのsnapshotポーリング経路へ入る。ログインUIを使い、Status→ホーム→Statusで要求を2つ保留する。

1. 新しい要求でCurrent visitを表示した後、旧要求をStale visitとして成功させても表示が戻らない。
2. 新しい要求を保留したまま旧要求を500にし、時計を5秒進めてもsnapshot GETが2件のまま。新しい要求の成功後はCurrent visitを表示。

実サーバー・利用者のジョブは操作しない。エラー通知経路は変更しない。実際のWebSocketサーバーとの通信方式切替、他タブ、全unit/E2E suite、Firefox/WebKit、snapshot APIのサーバー側処理の中断は未検証。

## push・残件

- ブックマーク: `codex/status-snapshot-lifecycle`
- コミット: [105514af0982f6c4e2a26f8b9c6f2ab9aee812a2](https://github.com/JamBalaya56562/ngclient/commit/105514af0982f6c4e2a26f8b9c6f2ab9aee812a2)
- 親: `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`
- `jj git push --remote origin -b codex/status-snapshot-lifecycle` 成功。PR・Issueコメントなし。

Git管理外tmp/ngt-075にbefore.log、before-valid.log、after.log、types.log、prettier.log、build.log、e2e.log、existing-before.tsv、commit.txtを保存。

NGT-071のマージ待ちは維持。次の独立候補はNGT-076としてStatusBar進捗読取の寿命を監査する。StatusPageStateの追加の通信方式/サーバー購読所有権を触る場合は本ブランチと重なるため先行マージを待つ。どちらも未検証の不具合と断定しない。次の未使用IDはNGT-077。