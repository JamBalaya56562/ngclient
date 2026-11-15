# NGT-084 Verify完了通知（2026-11-15）

検証済み: `fix/verify-completion-alert` / `879857e496eafadda45a1704a24ab3af1ba5892d`、親main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。originへpush。PR・Issueコメントは投稿していない。

## 実サーバーと修正

検証済み: Windows / Duplicati `2.4.1.101-Canary-20261107+424b1360b0d0767b3a67a874b4d99c92f17a877f`（実行EXEのProductVersion）。UIは当該ブランチの本番ビルド。専用`--server-datafolder`、動的な空きloopbackポート、専用source/remoteを使用。透過HTTP/WebSocketプロキシでAPIを転送し、モックなしで画面の「Verify files」をクリックした。

検証済み: 元の`86510cc5ef09b8c36a38417bab6824310c61eb82`ではタスク3がCompleted / ErrorMessage:nullでWebSocket完了イベントも届くが、成功通知の表示確認は20秒で失敗した（[before-events.json](before-events.json)、[変更前画像](before.png)）。ServiceHubがサーバー通知0件のときに終了し、既存通知がある場合にも新しいalertの代わりにその通知を優先していた。今回のブランチ内で、alertとサーバー通知の変更を別々に判定し、新しいalertを優先して表示するよう修正した。

| 実データの条件 | task ID / 終了 | 画面の結果 |
|---|---|---|
| 正常なバックアップ | 3 / Completed、ErrorMessage:null | 緑の成功通知 |
| 自作dblockの1バイトを変更（サイズ維持） | 4 / Failed、Hash mismatch | 理由付き赤の失敗通知 |
| 自作remoteを一時的に別名へ移動 | 5 / Failed、The folder … does not exist | 理由付き赤の失敗通知 |
| 元のdblock・remoteを復旧 | 6 / Completed、ErrorMessage:null | 既存のサーバーエラー通知があっても新しい緑の成功通知 |

検証済み: [events.json](events.json)に4件の`case-passed`、`completed: cases=4, pageErrors=[]`、`cleanup: remainingJobs=0`。[wire.json](wire.json)はverify応答と実WebSocket完了イベントを保存。成功・失敗の画像: [healthy.png](healthy.png)、[corrupt-volume.png](corrupt-volume.png)、[missing-destination.png](missing-destination.png)、[recovered.png](recovered.png)。画像を目視し緑/赤の通知を確認した。

## コマンドと結果

ツールはmise配下の実体をglobで解決。`node` = Node26.13.1、`bun` =1.4.4。以下の`node`/`bun`はその実体への略記。

```text
node node_modules/@angular/cli/bin/ng.js test ngclient --watch=false --include '**/service-hub.component.spec.ts'
修正前: Tests 3 failed | 7 passed (10)  [red.log]

node node_modules/@angular/cli/bin/ng.js test ngclient --watch=false --include '**/home/**/*.spec.ts' --include '**/server-state.service.spec.ts' --include '**/service-hub.component.spec.ts'
修正後: Test Files 3 passed (3); Tests 47 passed (47) [green.log]

node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
両方 exit 0

node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/home/home.component.ts projects/ngclient/src/app/home/home.component.spec.ts projects/ngclient/src/app/core/components/service-hub/service-hub.component.ts projects/ngclient/src/app/core/components/service-hub/service-hub.component.spec.ts
All matched files use Prettier code style! / exit 0

bun run build:prod
Application bundle generation complete. [63.568 seconds]
Output location: C:\Users\Jam\Documents\ngclient\dist\ngclient / exit 0 [build-fixed.log]

node tmp/ngt084-verify-20261115/live.mjs
case-passed: healthy, corrupt-volume, missing-destination, recovered
completed: cases=4, pageErrors=[]; cleanup: remainingJobs=0
```

検証済み: ビルドログのwarning/error検索は0件。package.jsonにlintスクリプトはないためlintは実行していない。上記tscとPrettierを実施。Vitestの固定タイムアウトは変更していない。

検証済み: 検証後、独立SQLiteの`SELECT COUNT(*) AS remainingJobs FROM Backup`は0。CommandLineをこの実行フォルダーに絞ったCIM検索で残存Duplicati.Server.exeは0。プロキシ・ブラウザーも終了。既存ユーザージョブは使用していない。

未検証: 他OS・他サーバーバージョン、long-poll接続での実画面、Completed-with-errorsの実データ（これはHomeの既存単体テストで検証）。`live.mjs`のプロキシ参照は既存のGit管理外`tmp/editor627-20261114/proxy.mjs`であり、API改変なしの静的配信・HTTP/WebSocket中継。
