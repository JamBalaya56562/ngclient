# NGT-061: コマンド実行結果のルート入力 — 2026-11-12

## 範囲と依存

基準main: `d788d0c592306dffe8105ae5f4c357156f94a38c`。`jj git fetch --all-remotes`はNothing changed。ghでopen PR #684〜694を取得し、全既存ブックマークのmainとの差分ファイルを照合。

**検証済み（差分照合）**: CommandlineResultComponent、その既存spec、新規route-input spec、commandline-polling E2Eに既存ブックマークの編集なし。NGT-059/060のルート入力移行、準備済みSignal Forms、本体変更には依存しない。最新mainから独立して実装。

`runId`を`input.required<string>()`へ、queryの`state`を`stateId = input<string | undefined>(undefined, { alias: 'state' })`へ変更する。ActivatedRouteのparams/queryParamsをtoSignalで購読していた処理と、不要なcomputedを削除。既存app.config.tsのwithComponentInputBindingを利用する。

ポーリング、offset、ログ連結、終了/404/Abort処理、オートスクロール、BackのrouterLink/queryParams、template/style/APIクライアントは変更しない。既存の単体specではActivatedRouteのmockに代わり、componentRef.setInputで同じ値を設定する。

**ドキュメント根拠**: [withComponentInputBinding](https://angular.dev/api/router/withComponentInputBinding)はルート情報をinputへ渡す公式API。今回のstateはquery parameterであり、NavigationExtras.stateやwindow.history.stateではない。対象ルートは`backup/:id/commandline/:runId`。

## 契約テスト（変更前後）

今回はバグ修正の赤→緑ではなく、同じ契約を変更前後で確認するリファクタリング。

```text
bun run test:ci --include '**/commandline-result-route-input.spec.ts' --include '**/commandline-result.component.spec.ts'
# 変更前の再試行
Test Files 2 passed (2)
Tests 19 passed (19)
# 変更後
Test Files 2 passed (2)
Tests 19 passed (19)
```

**検証済み**: path/queryの初回値、component再利用時の更新、state削除時のundefined、queryよりpath runIdを優先、Backの遷移先（stateあり/なし）、guardによる遷移拒否。既存のページ送り・終了・Abort・エラー・オートスクロールも同じspecで成功。

RouterTestingHarnessは本番と同じwithComponentInputBindingを有効化。templateはBackのbindingとlogOutputだけを残したstub、API応答はmock。Back先のURLは確認したが、実際に保存したコマンド設定の復元全体は今回未検証。

## Vitest起動タイムアウトの切り分けと復元

初回の変更前実行は`Timeout waiting for worker to respond`で失敗し、`no tests`だった。アプリの赤テストとは数えない。取り決めに従い、インストール済み`node_modules/vitest/dist/chunks/index.DpLw24bj.js`のSTART_TIMEOUT / WORKER_START_TIMEOUTを一時的に300秒へ延長して再試行した。

変更前再試行・変更後テストとも、try/finallyで元のbytesを戻した。**検証済み**: 元のbackup、変更後実行用backup、最終ファイルのSHA256が全て一致。

```text
Vitest original/after/current hashes equal: True
const START_TIMEOUT = 6e4;
const WORKER_START_TIMEOUT = 9e4;
```

node_modulesやテストrunner設定はコミットしない。ログは`tmp/command-result-before.log`（起動失敗）、`tmp/command-result-before-retry.log`（変更前成功）、`tmp/command-result-unit.log`（変更後成功）。

## 限界と残り

**未検証**: 実サーバー、実際のコマンド設定保存/復元全体、全unit/E2E suite、Firefox/WebKit、対象外のroute data構成。既存のquery変更時のpolling/log状態を保つことを確認し、異なるrunへの遷移時にoffset/logをどうリセットするか等の仕様変更は行わない。

About tabs・ホームカード・他のroute入力まで評価完了したとはしない。残りはNGT-062へ分ける。ホーム/復元の準備済み移行と重なる実装は先行マージを待つ。

実行はmise管理下の実体を直接使用。tmpのログはGit管理外で永続保存を保証しない。

## 型チェック・本番ビルド・E2E

```text
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
exit 0
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
exit 0
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module preserve --moduleResolution bundler --types node --skipLibCheck e2e/commandline-polling.spec.ts
exit 0
bun run build:prod
Application bundle generation complete. [74.840 seconds]
exit 0
node node_modules/@playwright/test/cli.js test e2e/commandline-polling.spec.ts
3 passed (48.1s)
```

**検証済み（Chromium・本番ビルド・APIモック）**: stateの追加・削除と同名runId queryの追加でも、既存のrun-testに対するpollが続き、offsetは0→1→2と進む。first/second/thirdの各ログは1回ずつ表示され、親DOMも維持。終了後5秒進めても要求は3回のまま。既存の低速応答中の単一要求、Abort成功後の遅い応答による状態/ログの上書き防止も成功。

```text
node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/backup/commandline-result/commandline-result.component.ts projects/ngclient/src/app/backup/commandline-result/commandline-result.component.spec.ts projects/ngclient/src/app/backup/commandline-result/commandline-result-route-input.spec.ts e2e/commandline-polling.spec.ts
All matched files use Prettier code style!
```

ビルドログにwarning一致なし。E2EのNO_COLOR/FORCE_COLOR環境警告は残るため全ログ無警告とはしない。専用lint targetは既存構成にないためlint成功とは主張しない。ログは`tmp/command-result-tsc-{app,spec,e2e}.log`、`tmp/command-result-build.log`、`tmp/command-result-e2e.log`。

## push結果

- ブックマーク: `codex/command-result-route-input-binding`
- 完全なSHA: `49cb9924221f39d46720eeaa7ab2278ee25192a8`
- 親: `d788d0c592306dffe8105ae5f4c357156f94a38c`
- `jj git push --remote origin -b codex/command-result-route-input-binding`成功。PRは作成していない。

差分は実行結果componentのts、既存spec、新規Router spec、既存polling E2Eの4ファイル。既存の実装ブランチは変更していない。Vitestの元の定数とファイルhash一致を確認済み。
