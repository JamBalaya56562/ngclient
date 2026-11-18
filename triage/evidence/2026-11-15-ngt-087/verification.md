# NGT-087 進捗件数の桁区切り（2026-11-15）

検証済み: `fix/status-bar-file-count-separators` / `eb506d7c5c715320cb30e236cc84f63bb86df61e`。親main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。今回の追試で追加修正は不要。originと同じSHAで、pushはNothing changed。PR・Issueコメントは未投稿。

## 範囲・移管時の記録

ドキュメント根拠: [duplicati/duplicati#3041](https://github.com/duplicati/duplicati/issues/3041)の項目1（ファイル件数の桁区切り）だけを扱う。項目2の文字切れ、項目3の再読込後の進捗詳細表示は今回の検証対象外・未検証。**Issue全体を閉じるFixes/Closesの根拠にはしない**。公開時の本文にも項目1だけと明記する。

ドキュメント根拠: 移管記録はassertの赤5件・緑23件、レビュー役も赤と緑を再実行済み。今回の追試で赤を再実行したものではない。一次記録は移管索引のimpl `aa2fb0cfe967392e2` / review `a220e3ae160129497`。

## 実サーバー

検証済み: Windows / Duplicati `2.4.1.101-Canary-20261107+424b1360b0d0767b3a67a874b4d99c92f17a877f`（実行EXEのProductVersion）。対応する本体変更の追加ビルドは不要で、配布版で確認した。UIは上記ngclientブランチの本番ビルド。専用server-datafolder・空きloopbackポート、自作source/remoteと検証ジョブだけを使用した。

検証済み: 12,000個の2,048-byteファイル（計24,576,000 bytes、20フォルダー）を作り、実バックアップを開始。透過HTTP/WebSocketプロキシで通信を転送し、APIモックは使っていない。英語とドイツ語の独立ブラウザーコンテキストでそれぞれログインした。ドイツ語側はUIロケール`v1:duplicati:locale=de`を保存して起動した。

| UIロケール | 受信した進捗 | 実画面の件数部分 |
|---|---|---|
| en-US | TotalFileCount=1800、ProcessedFileCount=121、StillCounting=true | `1,800 files found` |
| de | 同じ値 | `1.800 files found` |

検証済み: 表示値は受信したprogressの件数からロケール別の期待値を計算して照合し、画像でも確認した。[events.json](events.json)の`locale-captured`、[wire.json](wire.json)の実progress、[英語画像](en-US.png)、[ドイツ語画像](de.png)が証拠。実画面で確認したのはCounting中の件数であり、残り件数・処理済み件数・secondary宛先の同期件数は以下の単体テストで確認した範囲を守る。

検証済み: タスク2はCompleted / ErrorMessage:null / Exception:null。結果ログのErrors/Warningsは各0件であることをスクリプトでassertした。list-filesetsはVersion0 / Time=`2026-11-15T05:32:48Z` / FileCount=12021 / FileSizes=24576000の1件を返した。UIのpageErrors=[]。

## コマンドと出力

node/bunはmise配下の実体をglobで解決（Node26.13.1 / Bun1.4.4）。

```text
node node_modules/@angular/cli/bin/ng.js test ngclient --watch=false --include '**/status-bar.state.spec.ts'
Test Files 1 passed (1); Tests 23 passed (23) [unit.log]

node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
両方 exit 0

node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/core/components/status-bar/status-bar.state.ts projects/ngclient/src/app/core/components/status-bar/status-bar.state.spec.ts
All matched files use Prettier code style! / exit 0

bun run build:prod
Application bundle generation complete. [59.682 seconds] / exit 0 [build.log]

node tmp/ngt087-counts-20261115/live.mjs
locale-captured: en-US / 1,800; de / 1.800
completed: Completed, ErrorMessage:null, pageErrors=[]
cleanup: remainingJobs=0
```

検証済み: 単体テストには、残り件数168,338、数え上げ1,234,567、secondary宛先の12,000、処理済み1,000/168,338、ドイツ語168.338を含む。ビルドログにwarning/errorは0件。package.jsonにlintスクリプトはないためlint未実施。Vitestの起動タイムアウトは変更していない。

検証済み: 2つの実行用SQLiteの`SELECT COUNT(*) AS jobs FROM Backup`は両方0。CommandLineを今回のdatafolderに絞ったCIM検索でDuplicati.Server.exeは0。ブラウザーとプロキシも終了。テスト用source/remoteと生ログはGit管理外tmpに保持し、既存のユーザージョブを使用していない。

初回の検証は別ブラウザーの認証前提で停止した。各コンテキストで実際にログインする検証スクリプトに修正して再実行し、最終events.jsonは成功した実行。ファイル生成を繰り返さず、初回に作った同じ検証用sourceを`NGT087_SOURCE`で指定して再利用した。

再実行時: `NGT087_SOURCE`未指定なら新しく12,000ファイルを生成する。サーバー実行EXEの場所は既存のGit管理外`tmp/editor627-20261114/server-executable.txt`、プロキシは同ディレクトリのproxy.mjsを参照する。同じ中継スクリプトを[proxy.mjs](proxy.mjs)に保存した。別PCでの実行は未検証。

未検証: 他のロケール、Linux/macOS、実サーバーでのRestore/Sync/secondary宛先の各フェーズ。今回のUI実画面はCounting、ほかの件数は単体テストでの確認。Issue #3041の項目2/3が現行版で解決したとは主張しない。

証拠のサイズを抑えるためwire.jsonは、表示と一致したframeと各phaseの代表を抽出（206件中24件）。全progress原文はGit管理外の実行フォルダーに保持。原文SHA-256: `6720897de0c61e4b239d560f967cf4f2fc721c9733af1e9655d28ed4d16d1e0a`。
