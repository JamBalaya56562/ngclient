# NGT-086 次回予定のスキップ（2026-11-15）

検証済み: ngclient `feat/skip-next-scheduled-run` / `28be8c2be254e859f2fcadc0639afafa24980555`、親main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。今回の検証で追加修正は不要。originと同じSHAであることを確認し、pushはNothing changed。PR・Issueコメントは未投稿。

## 実装・以前の記録

ドキュメント根拠: [duplicati/duplicati#2701](https://github.com/duplicati/duplicati/issues/2701)は、スケジュールされた回を次の機会まで見送る操作の要望。本体 `feat/skip-next-scheduled-run` / `04f2dd08a5ead15d147d4d6d2856f52db725f486` が先行する。ngclientは`v1:backup:skip-next-run`を検出し、予定付きで無効化されていないジョブのメニューに操作を追加する。

ドキュメント根拠: 移管時のngclientの赤はTS2339のcompileのみ、緑38件・開発ビルド成功。再レビューはngclientの赤を再実行していない。サーバーの旧時刻pushとqueued実行による書き戻しの指摘は本体04f2dd08aで修正され、再レビュー承認。原記録は`journal.selected.jsonl`のreview2 `a857e376a2e5e0219`を参照。今回の追試と区別する。

## 環境・実行方法

検証済み: 独立したdatafolder・空きloopbackポート・テスト用source/remoteだけを使用。本番UIを透過HTTP/WebSocketプロキシで配信し、APIをモックしていない。Node26.13.1 / Bun1.4.4 / .NET SDK11.0.100はmise配下の実体をglobで解決。

- Canary: `2.4.1.101-Canary-20261107+424b1360b0d0767b3a67a874b4d99c92f17a877f`。
- 対応本体: 上記04f2dd08aを独立jj workspaceからビルド。systeminfo Version=`1.0.0.0`のDebug版であり、配布版と混同しない。元の本体ブランチは変更しない。

検証済み: 1分間隔のRepeatはHTTP400（Schedule repetition time must be more than 5 minutes）で拒否された。検証用には正規APIで受理された`301s`を使用した。SQLiteを書き換えたり時刻を偽装したりしない。

## 確認結果

検証済み: Canaryは予定付き・予定なし・無効化済みともメニュー非表示、skip要求0、ブラウザーエラー0、検証ジョブ削除後0件。

検証済み: 対応本体は予定なし・無効化済みでメニュー非表示。予定付きジョブではUIから1回操作し、再読込なしでホームの次回予定が更新された。元の予定`2026-11-15T05:13:00Z`→`2026-11-15T05:18:01Z`、API保存値と一致。再起動後も保持。元の予定の5秒後にMetadata={}、remoteFiles=0で、実行されていないことを確認。

検証済み: 次の枠の`2026-11-15T05:18:01Z`に実際に自動起動し、`05:18:02Z`に終了。list-filesetsはVersion0 / Time=`2026-11-15T05:18:01Z`の1件を返した（[events.json](events.json)の`following-slot-metadata`、`following-slot-ran`）。この実行では時計を偽装していない。

検証済み: 別の自作ジョブを一時停止中に実行待ちへ入れ、本体APIでskip。タスクID4がキューに残ることを確認した。再開してそのタスクが完了した後もSchedule.Time=`2026-11-17T05:18:02Z`で、スキップが巻き戻らなかった（同ファイルの`queued-run-retained`、`queued-run-finished-without-undoing-skip`）。

**制約（検証済み）: すでにキューに入った回は取り消さない。** この操作は次の予定枠を進めるもので、キュー済み・実行中タスクのキャンセル機能ではない。公開時の本文でも明記する。Issue #2701の全体をcloseできるかは、この範囲を踏まえて判断する。まだPRは出さない。

検証済み: [wire.json](wire.json)は実HTTP応答とWebSocketのstatus/backuplist。UI経由skipは1リクエスト、UI稼働中のブラウザーエラーは0件。前後画像: [before.png](before.png)、[after.png](after.png)。未対応サーバーのメニュー: [canary-NGT-086-scheduled-menu.png](canary-NGT-086-scheduled-menu.png)。

検証済み: 両サーバーとも最後にremainingJobs=0。実行したすべての専用サーバーDBで`SELECT COUNT(*) AS jobs FROM Backup`は0件。CIMで当該datafolderを使うDuplicati.Server.exeも0件。検証用workspaceの登録を解除し、source/buildと生データはGit管理外tmpに保持した。元の本体ブランチは04f2dd08aのまま、変更なし。

## コマンドと出力

以下のnode/bun/dotnetはmise配下で解決した実体への略記。

```text
node node_modules/@angular/cli/bin/ng.js test ngclient --watch=false --include '**/backups.skip-next-run.spec.ts' --include '**/sysinfo.state.spec.ts' --include '**/home/**/*.spec.ts'
Test Files 3 passed (3); Tests 42 passed (42) [unit-final.log]

node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
両方 exit 0

node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/core/states/backups.skip-next-run.spec.ts projects/ngclient/src/app/core/states/backups.state.ts projects/ngclient/src/app/core/states/sysinfo.state.ts projects/ngclient/src/app/core/states/sysinfo.state.spec.ts projects/ngclient/src/app/home/home.component.ts projects/ngclient/src/app/home/home.component.html
All matched files use Prettier code style! / exit 0

bun run build:prod
Application bundle generation complete. [43.703 seconds] / exit 0 [build.log]

# 本体の検証専用workspaceをビルド
 dotnet build Executables/Duplicati.Server/Duplicati.Server.csproj -c Debug -m:1 -v:minimal
6 個の警告 / 0 エラー / exit 0 [server-build.log]

node tmp/ngt086-skip-20261115/live.mjs
# Canary: 環境変数なし
# 対応本体: NGT086_SERVER=ビルドしたDuplicati.Server.exe、NGT086_DOTNET_ROOT=dotnet.exeの親、NGT086_SUPPORTED=true
```

検証済み: 初回のVitestはワーカー起動の60秒タイムアウトでテスト0件。本体ビルド終了後の再実行で42件が成功。タイムアウト定数は変更していない。ngclient本番ビルドのwarning/errorは0件。本体の警告6件は無変更のControllerRpcServer.csのCS8604。

検証済み: `swagger.json`はPrettier警告あり。mainの同ファイルでも生成されたtags配列などに全体の整形差分があり（main2414 diff行、当該ブランチ2425 diff行）、生成元と同じ書式を維持した。手書き6ファイルの整形は成功。package.jsonにlintスクリプトがないためlintは未実施。

検証コードの失敗と製品の不具合を区別する: 1分間隔のスケジュールはサーバーが正しく拒否した。表示時刻の通常空白と狭い非改行空白の比較失敗、メタデータのBasic ISO形式をDate.parseへ直接渡した比較失敗はスクリプトを修正し、同じUIのまま再実行した。最終events.jsonは最後まで成功した実行だけを保存している。途中の生ログはngclient/tmp/ngt086-skip-20261115に保持。

未検証: Linux/macOS、夏時間の境界、繰り返しのない不正なSchedule、複数の同時スキップ。

再実行時の補足: `live.mjs`は既存のGit管理外`tmp/editor627-20261114/proxy.mjs`を参照している。同じ透過プロキシの原文を[proxy.mjs](proxy.mjs)として保存した。別環境ではその参照先とserver executableの場所を合わせる。Git管理外のダウンロード済み本体と検証ビルドを使った実行であり、他PCでの再実行は未検証。
