# NGT-051 / #311: 個別ファイルの復元表示を実サーバーで確認

2026-11-14。Issue: [#311](https://github.com/duplicati/ngclient/issues/311)。検証UIはupstream/main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`（0.0.250）の本番ビルド。

## 結論と残件

**検証済み**: 個別ファイルをソースにすると、現行UIでもフルパスのファイルが平坦に並ぶ。V2一覧APIのrootにも同じファイルが返っており、UIがAPIにある親フォルダーを捨てたり、ファイルをフォルダーと誤認しているわけではなかった。3ケースでrootのパス・種類がAPIとDOMで一致し、選択したファイルの復元内容も一致した。

**ドキュメント根拠**: メンテナの[説明](https://github.com/duplicati/ngclient/issues/311#issuecomment-3025286269)では、個別ファイルを指定した場合に親フォルダーの情報を持たないため、この表示は意図的な設計。旧UIは仮想フォルダーを挿入し、ngclientにも表示層で追加することは可能だが、保存されていないフォルダーを復元できると誤認させる懸念が示されている。

**判断**: #311の表示上の要望は現在も未実装で、Issueは解決済みとしない。一方、今回の範囲にAPI/DOM不一致や選択復元の不具合は見つからず、意図的な仕様をバグとして変える修正は行わなかった。新しい実装ブランチ・PR・Issueコメントは作成していない。調査記録のみtriageへpushする。

## 実サーバーと隔離範囲

- 公式Windows実行ファイル: `2.4.1.101-Canary-20261107+424b1360b0d0767b3a67a874b4d99c92f17a877f`。systeminfoのVersionは`2.4.1.101`、OSTypeは`Windows`。
- 新規server-datafolder、ランダムな認証情報、空きloopbackポートで起動。スクリプトがその都度ポートを確保し、固定値を前提にしない。
- UIは当該mainのdistを透明HTTP/WebSocket proxyで配信。APIモックは使用しない。利用者のサーバーやジョブは使わない。
- 個別指定12ファイル、フォルダーと個別指定の混在7ファイル、フォルダー指定の対照12ファイルを用意。バックアップ完了後に元ファイルを変更し、復元はバックアップ時の内容であることを検査。

## APIと画面の照合（検証済み）

UIが呼ぶ `POST /api/v2/backup/list-folder` の `Paths:null, PageSize:0, Page:0, ReturnExtended:true` をAPIからも呼び、選択版のroot応答とDOMのaria-level=1を比較した。

| ソース指定                     | バックアップしたファイル | APIのroot               | UIのroot                                              | 画面操作による復元                          |
| ------------------------------ | ------------------------ | ----------------------- | ----------------------------------------------------- | ------------------------------------------- |
| 個別ファイルのみ               | 12                       | ファイル12、フォルダー0 | 同じパス・種類の12項目                                | sub1file.txt、000004.txtの2件のみ、内容一致 |
| フォルダー1つ＋個別ファイル5つ | 7                        | フォルダー1、ファイル5  | 同じパス・種類の6項目。フォルダーを展開すると子も表示 | inside.txt、profile0.txtの2件のみ、内容一致 |
| フォルダー指定（対照）         | 12                       | フォルダー1             | 同じフォルダーからbackup source/tree等を展開可能      | sub1file.txt、000004.txtの2件のみ、内容一致 |

すべてのバックアップ対象ファイルが展開後のUIに現れることも確認。各ケースの未選択ファイルは復元先に作られず、復元した6件のSHA256はバックアップ時の期待値と一致し、変更後の元ファイルとは異なる。pageerrorは0件。

追加の読み取りプローブでは、個別ソースの親パスをPathsに指定すると、sub1は1件、sub2は1件、treeは10件、混在ケースのprofile/Defaultは5件を返した。いずれもSuccess=true。これは仮想グループの表示を検討する材料にはなるが、全OS・全パス形式で本体変更が不要だと確認したものではない。V1 APIの補助応答も保存したが、今回の実画面はV2であり、V1 UIの動作を検証済みとはしない。

## 実行コマンドと結果

下記のbun/node/jjはmise管理の実体を直接使用。Node/Bunの実体ディレクトリーをPATHへ追加した。

```text
jj git fetch --all-remotes
# Nothing changed.

bun run build:prod
# exit 0 / Application bundle generation complete. [41.043 seconds]

node tmp/ngt051-311-20261114/live.mjs
# exit 0 / completed: cases=3, pageErrors=[] / cleanup: remainingJobs=0

node tmp/ngt051-311-20261114/analyze.mjs
# exit 0 / 3ケースのrootPathsAndTypesMatch=true / remainingJobs=0

VITEST_MAX_WORKERS=1 bun run test:ci --include '**/file-tree.restore-paths.spec.ts' --include '**/file-tree-listing.service.spec.ts' --include '**/file-tree.listing.spec.ts' --include '**/restore-flow.submission.spec.ts'
# Test Files 4 passed (4), Tests 38 passed (38), exit 0
```

最終ログは`live-verified.log`。最初の2回は検証スクリプトのlocatorに問題があり、アプリの不具合とは判定していない。展開後もcollapsedだけを探すlocatorを固定IDへ変更し、ファイル名の照合からサイズ・更新日時の補助テキストを除外して再実行。最終3ケースはすべて成功。これをアプリ修正の赤→緑とは扱わない。

## 証拠と片付け

Git管理外の`tmp/ngt051-311-20261114/`:

- `summary.json` / `analysis.log`: APIとDOMの一致、復元ファイル名、親パスプローブ、DBの残存ジョブ0件。
- `build.log` / `unit.log` / `live-verified.log`: 本番ビルド・38 spec・実サーバー3ケースの結果。
- `live.mjs` / `analyze.mjs`: 隔離起動、バックアップ・API・画面復元、照合処理。proxyには既存のローカル検証用`tmp/editor627-20261114/proxy.mjs`を利用。
- `run-hzouKh/*-results.json`: 各ケースの完全な応答とDOM行、復元SHA256。
- `run-hzouKh/browser-api.json`: 画面が送った一覧・復元要求と応答。
- `run-hzouKh/individual-initial.png` / `mixed-initial.png` / `folder-control-initial.png`: 比較用の実画面。各`*-selected.png`と`*-initial.html`も保存。

APIで作成した元ジョブと復元中に作成されたジョブを削除し、非同期削除タスクの完了を待った。停止後の隔離サーバーDBのBackup行数は0。プロセス検索でもこの検証のDuplicati.Server.exeは0件。復元結果・検証用バックアップ・サーバーログは証拠としてtmpに保持する。tmpはGit管理外で将来の存在は保証されない。

## 次に実装するなら

以下は**提案・未実装**。仕様を確認してから別ブランチで扱う。

1. 仮想フォルダーを表示上のグループと明示し、実際にバックアップしたフォルダーのメタデータと混同させない。
2. グループ選択で何を送るかを決める。実在しない親をそのまま復元対象にせず、バックアップ済み子項目の選択に展開する案を含めて検討する。
3. 個別ファイルと実フォルダーが混ざる場合、版切替・検索・フィルター・多段選択、ドライブ/UNC/POSIXの境界を確認する。
4. #728の同じfile-treeへの変更と重複を避け、既存の表示・選択契約を固定してから実装する。今回の結果だけでFixes #311を付けない。

未検証: Linux/macOS、UNC・複数ドライブ、古い報告版2.1.0.120、最新masterビルドの本体、暗号化/リモート宛先、全件の一括復元、V1 UI、仮想グループの新しい表示仕様。今回はWindowsの同一ドライブ・非暗号化ローカル宛先での比較と選択復元に限る。
