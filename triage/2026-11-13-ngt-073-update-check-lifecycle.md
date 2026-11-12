# NGT-073: About更新確認の非同期処理・破棄（2026-11-13）

## 選定と依存

検証済み: `jj git fetch --all-remotes` は `Nothing changed.`。基準mainは `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`。ghでopen PR #695〜#704を取得。既存31実装ブックマークと今回のGeneral ts/html/spec・e2e/update-check.spec.tsのmainとの差分を照合し重複なし。記録用triageと画像保管用codex/pr-review-screenshotsは実装比較から除外。最新mainから独立したブランチを作成。本体変更・準備済みブランチへの依存なし。

## 再現と修正

検証済み（コンポーネント単体テスト）: 要求中/サーバーChecking中のボタンが無効にならず、破棄後もObservable購読が残り、失敗はRxJSの未処理エラーに届く。追加した該当4ケースが修正前に失敗した。

実装: 保留中の確認要求とサーバーChecking中の操作を無効化し、メソッドにもガードを追加。DestroyRef/takeUntilDestroyedで画面の購読を終了し、finalizeで確認中状態を解放。破棄済みコンポーネントでの再呼出しは無視する。HTTPエラーは既存interceptorの通知経路へ任せ、subscribeのerrorハンドラーで二次的な未処理例外を防ぐ。正常終了/失敗後にはWaiting状態なら再試行できる。

ドキュメント根拠（差分）: 更新インストール・キャンセル・バージョン情報・API・生成クライアント・依存パッケージ・設定の変更なし。インストール非対応説明段落はPrettierによる改行のみ。

## APIの重要な制限

ドキュメント根拠: 生成Angularクライアント core/openapi/client/client.gen.ts のrequestはasync関数で、HttpClient.requestをfirstValueFromしてPromiseとして返す。GeneralのdeferがそのPromiseをObservable化するため、takeUntilDestroyedはUIの購読を外すが、開始済みの通信自体をabortしない。

検証済み: 実際のPromise形の遅延応答を使う単体テストと、遅いHTTP応答を返す本番UIのE2Eで、離脱前の応答が再表示した画面の確認中状態を解除しないことを確認した。生成クライアントの再設計はこの件に含めない。サーバー側で開始済みの更新確認を停止・取り消すことも主張しない。

## 単体テスト（検証済み）

PowerShellでmiseのnode・bun実体ディレクトリをPATHへ追加し、VITEST_MAX_WORKERS=1。以下のbun/nodeはmise実体を直接呼んだ。実テンプレートを描画し、サービスはモック。最初のspec作成時は不完全なServerStatusDtoの型エラーがあったが、実際のモックをPartialとして修正。型エラーを赤の証拠には含めない。

    bun run test:ci --include '**/about/general/general.component.spec.ts'
    # 修正前: Test Files 1 failed (1)
    # Tests 4 failed | 2 passed (6)（before-valid.log）
    # pending check disabled / server Checking disabled / destroyed subscription /
    # error does not reach config.onUnhandledError の4件が失敗

    bun run test:ci --include '**/about/general/general.component.spec.ts' --include '**/update-install.service.spec.ts'
    # 最終: Test Files 2 passed (2), Tests 17 passed (17)

コンポーネント7件は、版表示とacknowledgements読取の解放、重複抑止、サーバーChecking、破棄、同期完了、エラー後の再試行、Promiseの古い応答の分離を検査。エラーケースはRxJS config.onUnhandledErrorを一時的に監視し、finallyで元へ戻す。既存インストールサービス10件も成功。Vitestタイムアウト定数・node_modulesの変更なし。runner SHA256は1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD。

## 型チェック・ビルド（検証済み）

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    # exit=0、Promiseテスト追加後も再実行 exit=0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    # exit=0、E2E修正後も再実行 exit=0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/about/general/general.component.ts projects/ngclient/src/app/about/general/general.component.html projects/ngclient/src/app/about/general/general.component.spec.ts e2e/update-check.spec.ts
    # All matched files use Prettier code style!
    bun run build:prod
    # Application bundle generation complete. [28.842 seconds]
    # exit=0、buildログにwarning/errorなし

本番ビルド後に変更したのはテストだけで、アプリの実装は変更していない。lint script/targetはpackage.json・angular.jsonにないためlint成功とは主張しない。

## ブラウザー

検証済み:

    bun run test:e2e e2e/update-check.spec.ts
    # 最終: 2 passed (13.2s)

最終E2Eの警告はNO_COLORとFORCE_COLORの競合通知のみ。

本番成果物・Chromium・APIモック。1ケース目は要求を保留してボタンdisabledと強制click時の要求1件を確認し、500のエラーをAlerts履歴で確認して再試行、成功後にサーバーCheckingを反映して追加要求を防ぐ。2ケース目は保留した要求を残してホームへ移動・Generalへ再表示して新しい要求を開始し、古い要求を成功させても新画面のボタンがdisabledのまま、新しい要求の成功でenabledになることを確認する。

初回のE2Eは2件失敗した。エラープレビューの自動表示を仮定したケースと、Promise APIの通信が離脱でabortされると仮定したケース。クライアントとServiceHubのソースを確認し、Alerts履歴でのエラー表示と、通信中断ではなく古い応答の分離を検査するようテストを修正。アプリ・生成API・ServiceHubには追加変更していない。

未検証: 実サーバー、サーバーの更新確認完了・更新インストール、全unit/E2E suite、Firefox/WebKit。空の通知一覧時のServiceHubエラープレビューは今回直していない。履歴への記録を確認する範囲に限定。

## pushと残件

- ブックマーク: `codex/update-check-lifecycle`
- コミット: [5440dfd2a700d5894015a8117a478c7e9ee72c94](https://github.com/JamBalaya56562/ngclient/commit/5440dfd2a700d5894015a8117a478c7e9ee72c94)
- 親: `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`
- `jj git push --remote origin -b codex/update-check-lifecycle` 成功。PR・Issueコメントなし。

Git管理外tmp/ngt-073にbefore.log（初回型エラー）、before-valid.log、after.log、after-final.log、types.log、types-final.log、prettier.log、prettier-final.log、build.log、e2e.log（初回失敗）、e2e-final.log、existing-before.tsv、commit.txtを保存。

残る画面固有の非同期処理の監査はNGT-074へ分離する。準備済みNGT-002/056/063/072/073を繰り返さず、生成APIのPromiseとObservableの違いを検証してから変更を判断する。NGT-071は先行マージ待ちを維持。次の未使用IDはNGT-075。