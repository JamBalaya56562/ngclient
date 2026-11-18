# NGT-085 共通の詳細オプションを含むエクスポート（2026-11-15）

検証済み: ngclient `feat/export-global-options` / `f082e4d89932ad9393faa678953c9fee4fd25a51`、親main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。originへpush。移管時headは`088dba4c01d6127b50ff26a5045190b743a668a2`。PR・Issueコメントは未投稿。

## 判断・依存

検証済み: **本体の`feat/export-global-options` / `0c242a335e6af90788f7c98a11b349d593d14a4b`の先行マージが必要**。GitHubのPR検索（`repo:duplicati/duplicati head:feat/export-global-options`）は0件。ローカル`master@upstream`の祖先にも当該コミットはない。本体ブランチと既存ワークスペースのコードは変更せず、検証専用jj workspaceでビルドした。

検証済み: 配布版`2.4.1.101-Canary-20261107+424b1360b0d0767b3a67a874b4d99c92f17a877f`では、UIが`include-global-options=true`を送っても共通オプションは出力されない（[canary-wire.json](canary-wire.json)、[canary-events.json](canary-events.json)）。対応本体のDebugビルドでは含まれる（[wire.json](wire.json)、[events.json](events.json)）。Debug版systeminfoのVersionは`1.0.0.0`であり、配布版の検証と混同しない。

ドキュメント根拠: [duplicati/duplicati#2310](https://github.com/duplicati/duplicati/issues/2310)は、共通の詳細オプションがファイルエクスポートに含まれない報告。今回のUIはエクスポート時の明示的な選択として実装されている。インポート時に共通設定を別枠として選ぶUIの追加はこのブランチの範囲外。

## 修正前→修正後

検証済み: 新しいチェックボックスをフォーカスしてSpaceを押しても、修正前はuncheckedのまま。[e2e-red.log](e2e-red.log)に`Expected: checked / Received: unchecked`、`1 failed`。実サーバー接続でも同じ失敗を観測した。

ドキュメント根拠: ShipToggleのkeydownは投影されたinputではなくホストをクリックしてpreventDefaultしていた。新規checkboxの`keydown.space`だけをホストへ伝えず、ネイティブのSpace操作を保持する修正に限定した。i18n対応のaria-labelも追加。ほかの既存toggleは変更していない。

検証済み: 新規E2EはSpaceでの切替・accessible name・実際のexportクエリを確認し成功。関連する既存の暗号化・確認ダイアログ・バリデーションの5ケースも含め計6件成功（[e2e-final.log](e2e-final.log)）。

## 実サーバー

検証済み: 専用`--server-datafolder`、空きloopbackポート、自作source/remoteとジョブのみ使用。本番UIを透過HTTP/WebSocketプロキシで配信し、APIモックはない。チェックは実際にSpaceで操作してダウンロードし、JSONまたは暗号化ファイルの再インポート後の値を検査した。

| 条件 | 対応本体の結果 |
|---|---|
| 初期値off | 共通オプションなし |
| on / パスワード除外 | 共通メール先を含み、共通メールパスワードは含まない |
| on / パスワード出力 | 共通メール先と共通メールパスワードを含む（平文確認ダイアログも操作） |
| on / 暗号化 | AESファイルを作成し、正しいパスワードで再インポート。パスワード出力を許可して再エクスポートし、共通設定と秘密値を照合 |
| コマンドライン出力 | 新しいチェックボックスは非表示。共通メール先は従来どおり含む |

検証済み: 全ファイルケースでジョブの`blocksize=50kb`が共通`--blocksize=1mb`より優先され、重複する共通オプションは入らない。エクスポート前後の保存済みジョブ設定は同一。両サーバーの`completed`は`cases=5, pageErrors=[], storedJobUnchanged=true`、`cleanup`は`remainingJobs=0`。

画像: [off](default-form.png)、[on](include-form.png)。最終版UIの画像で確認し、on/offを識別できることを確認した。

検証スクリプトの途中の誤りも区別する: import応答の`Id`を`ID`と誤記した実行と、GET backupの伏字を秘密値と比較した実行は製品の不具合ではない。スクリプトを修正して再実行し、最終の[events.json](events.json)は全5件成功。途中で作られたジョブも専用データフォルダーから削除済み。原ログはGit管理外`tmp/ngt085-export-20261115`に保持。

## コマンドと出力

実体をmise配下のglobで解決。以下のnode/bun/dotnetは実体への略記（Node26.13.1 / Bun1.4.4 / .NET SDK11.0.100）。

```text
node node_modules/@angular/cli/bin/ng.js test ngclient --watch=false --include '**/export.component.spec.ts'
Test Files 1 passed (1); Tests 17 passed (17) [unit-final.log]

node node_modules/@playwright/test/cli.js test e2e/export-encryption.spec.ts -g 'global advanced options'
修正前: 1 failed [e2e-red.log]

node node_modules/@playwright/test/cli.js test e2e/export-encryption.spec.ts
修正後: 6 passed (23.7s) [e2e-final.log]

node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
両方 exit 0

node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/backup/export/export.component.ts projects/ngclient/src/app/backup/export/export.component.spec.ts projects/ngclient/src/app/backup/export/export.component.html e2e/export-encryption.spec.ts
All matched files use Prettier code style! / exit 0

bun run build:prod
Application bundle generation complete. [25.811 seconds] / exit 0 [build-final.log]

# 検証用本体workspaceで実行
 dotnet build Executables/Duplicati.Server/Duplicati.Server.csproj -c Debug -m:1 -v:minimal
6 個の警告 / 0 エラー / exit 0 [server-build.log]

node tmp/ngt085-export-20261115/live.mjs
# Canary: 環境変数指定なし
# 対応本体: NGT085_SERVER=ビルドしたDuplicati.Server.exe、NGT085_DOTNET_ROOT=dotnet.exeの親、NGT085_SUPPORTED=true
両方 completed: cases=5, pageErrors=[], storedJobUnchanged=true; cleanup: remainingJobs=0
```

検証済み: ngclientの最終ビルドログにwarning/errorは0件。Playwrightは既存のNO_COLOR/FORCE_COLOR警告のみ。本体のC#警告6件は無変更の`ControllerRpcServer.cs`のCS8604（本体は修正しない）。package.jsonにlintスクリプトはないためlint未実施。Vitestタイムアウトも変更していない。

検証済み: 実行済み全隔離DBのBackup件数0、当該datafolderをCommandLineに持つDuplicati.Server.exeは0。ブラウザーとプロキシも終了。検証専用source/buildと生データはngclient/tmpに保持し、既存ジョブは使用していない。

未検証: Linux/macOS、複数の他バックエンド、配布済みの対応サーバー（まだ対応本体は準備ブランチ）。古いサーバーに対するUIの機能検出・警告は追加していない。本体先行マージを公開条件とする。
