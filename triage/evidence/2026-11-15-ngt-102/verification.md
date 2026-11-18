# NGT-102 Suppress時のSync種別保持（2026-11-15）

検証済み: [PR #738](https://github.com/duplicati/ngclient/pull/738)、`codex/preserve-job-type-on-warning-suppression` / `c78e32be2f4615c80164d6ddaff688a4f9237b32`。親main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。担当Codex、開始・完了日2026-11-15、状態PR_OPEN。originへpush済み。GitHubのPR headも同じSHAで、mergeable=true。

## 範囲

検証済み: `general-log.component.ts`の`toggleWarningSuppression`が、取得した`OperationType`と`Enabled`をPUTのBackupへコピーする2行を追加。種類・有効/無効状態を明示して保存する。`Enabled`はfalseもそのまま送る。バックアップ編集全体やサーバー側には変更を加えていない。

ドキュメント根拠: [duplicati/duplicati#7850](https://github.com/duplicati/duplicati/issues/7850)はSyncの警告SuppressでBackupへ変わる報告。利用者の指定どおり、PR本文は**Part of duplicati/duplicati#7850**で開始し、Fixes/Closesは付けない。[公開した本文](pr-body.md)はGitHubから読み直して確認した。本体側`fix/keep-operation-type-on-save`の省略値保持は別の変更。このPR単独でIssueを閉じない。

## 赤→緑

検証済み: 先に8件の回帰テストを追加し、修正前は`8 failed | 14 passed (22)`（[red.log](red.log)）。Sync/Backup × Enabled true/false × Suppress/Un-suppressで、実際のPUT本文に元の2値が入ることをassert。既存設定とScheduleも保持することを確認する。

検証済み: 2行の修正後、GeneralLogの表示・ページ送りを含む2 specで`31 passed (31)`（[green-final.log](green-final.log)）。赤の実行はcomponent.specのみ、緑はpagination.specも含む。compileエラーだけの赤ではなくPUT引数の不一致によるassert失敗だった。

## 隔離した実サーバー

検証済み: Windows / 配布版Duplicati `2.4.1.101-Canary-20261107+424b1360b0d0767b3a67a874b4d99c92f17a877f`、本体側の修正なし。本番UIと透過HTTP/WebSocketプロキシを使い、APIレスポンスはモックしていない。専用server-datafolder、空きloopbackポート、自作source/remoteと検証ジョブだけを操作した。

検証済み: 対照用SyncジョブへOperationTypeを省いたPUTを送ると、保存後のGETはBackupを返した（[events.json](events.json)のold-server-omission-control）。この対照ジョブは実行しない。

検証済み: 別のSyncジョブに検証用の未対応オプション`--ngt102-warning-probe`を設定し、実際のSyncを実行して`UnsupportedOption`警告を作った。これは報告されたSMBの`.`/`..`警告自体の再現ではない。ローカル→ローカルの通常ファイルを使用した。

| 実画面の操作 | PUT本文 | 保存後GET |
|---|---|---|
| Suppress | OperationType=Sync, Enabled=false | Sync / false、suppress-warnings=UnsupportedOption |
| Un-suppress | OperationType=Sync, Enabled=false | Sync / false、suppress-warningsは削除 |

検証済み: [wire.json](wire.json)は実画面が送ったPUT本文と保存後の値。[Suppress.png](Suppress.png)、[Un-suppress.png](Un-suppress.png)は操作後の画面。続いてジョブを有効化し、元ファイルを書き換えて同じSyncジョブを再実行した。宛先report.txtが新しい内容と一致し、種類はSyncのまま。backup用のdblock/dindex/dlistファイルは作られなかった。pageErrors=[]、検証用ジョブ削除後remainingJobs=0（events.jsonのcompleted/cleanup）。

## コマンド・結果

node/bunはmise管理の実体をglobで解決し直接呼び出した。

```text
node node_modules/@angular/cli/bin/ng.js test ngclient --watch=false --include '**/general-log.component.spec.ts'
修正前: 8 failed | 14 passed (22) [red.log]

node node_modules/@angular/cli/bin/ng.js test ngclient --watch=false --include '**/general-log/*.spec.ts'
修正後: Test Files 2 passed (2); Tests 31 passed (31) [green-final.log]

node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
両方 exit 0

node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/backup/log/general-log/general-log.component.ts projects/ngclient/src/app/backup/log/general-log/general-log.component.spec.ts
All matched files use Prettier code style! / exit 0

bun run build:prod
Application bundle generation complete. [71.639 seconds] / exit 0 [build.log]

node tmp/ngt102-warning-job-type-20261115/live.mjs
old-server-omission-control: Sync -> Backup
Suppress / Un-suppress: Sync / Enabled:false
completed: rerunOperationType=Sync, plainFileMatches=true, pageErrors=[]
cleanup: remainingJobs=0
```

検証済み: ローカルのテスト・ビルドログにwarning/errorメッセージは0件（テストケース名のwarningは除く）。package.jsonにlintスクリプトはないためlint未実施。Vitest定数は変更していない。

検証済み: 2つの専用サーバーDBで`SELECT COUNT(*) AS jobs FROM Backup`は0。当該datafolderを使うDuplicati.Server.exeもCIM検索で0。ブラウザーとプロキシも終了。検証データと途中の生ログはngclient/tmpに保持した。

検証スクリプトの初回は、警告欄が自動展開されているところを再クリックして閉じたため停止した。必要な場合だけ開くよう修正し、同じ本番UIで最後まで成功した。これは今回の製品修正とは別の検証手順の誤り。

再実行時: live.mjsはGit管理外のserver-executable.txtとtmp/editor627-20261114/proxy.mjsを参照する。同じ中継スクリプトを[proxy.mjs](proxy.mjs)に保存した。別環境では参照先を合わせる必要がある。

未検証: Stable 2.4.1.0の実行、本体の修正版、SMBの報告環境と`.`/`..`の警告自体、Linux/macOS。Canaryで問題の省略時動作と修正後の保存・再実行を確認した範囲で報告する。

検証済み（GitHub API、PR作成後）: Unit Testsはcompleted/success、Production Buildはin_progress。[取得結果](ci-state.json)。ローカル本番ビルドの成功とは区別し、CIの本番ビルド完走はこの記録時点で未確認。
