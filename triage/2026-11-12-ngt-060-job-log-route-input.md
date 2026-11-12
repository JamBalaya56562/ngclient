# NGT-060: ジョブログのルートID入力 — 2026-11-12

## 選定・依存・変更範囲

最新取得時main: `d788d0c592306dffe8105ae5f4c357156f94a38c`。`jj git fetch --all-remotes`はNothing changed。ghでopen PR #684〜694を取得し、全既存ブックマークのmainとの差分ファイルを照合した。

**検証済み（差分照合）**: ジョブログ親画面`backup/log/log.component.ts`と新規route-input testsに既存ブックマークの編集なし。バックアップ編集画面のNGT-059や、準備済みSignal Forms、他のナビゲーション変更、本体API追加には依存しない。最新mainから独立して実装。

`ActivatedRoute.params.pipe(map(...))`をtoSignalで購読していたbackupIdを、`input.required<string>({ alias: 'id' })`へ整理。既存app.config.tsのwithComponentInputBindingを利用する。不要となったActivatedRoute、toSignal、RxJS mapのimportを削除した。

template、style、ジョブのlookup、Sync判定、activeTab、子コンポーネントの一般/宛先ログ取得・ページングは変更しない。API schemaや生成クライアント、共有E2E fixtureも変更しない。

**ドキュメント根拠**: [withComponentInputBinding](https://angular.dev/api/router/withComponentInputBinding)はルート情報をcomponent inputへ渡す公式API。対象ルート`backup/:id/log`のidを受け取る。既存のルート定義・guard・resolverに変更は加えない。

## 変更前の契約テスト

動作維持のリファクタリングであり、不具合修正の赤テストではない。新しいspecで同じ動作が変更前後に通ることを確かめる。

```text
bun run test:ci --include '**/log-route-input.spec.ts'
Test Files 1 passed (1)
Tests 6 passed (6)
```

本物のRouterTestingHarnessとLogComponentを利用。BackupsStateとtemplateを置き換え、親のルート入力・lookup・Sync判定を独立して確認する。

**検証済み（変更前）**: 初回ID、component再利用で別IDへ移った場合とタブ選択の維持、query/fragmentで別ジョブにならないこと、存在しないジョブがnullになること、同じIDのメタデータ更新への追従、guardの遷移拒否。

## 変更後のunit

```text
bun run test:ci --include '**/log-route-input.spec.ts' --include '**/general-log.component.spec.ts' --include '**/general-log.pagination.spec.ts' --include '**/remote-log.component.spec.ts'
Test Files 4 passed (4)
Tests 44 passed (44)
```

**検証済み**: 新規6件と一般ログ・宛先ログ・ページングの既存specが成功。親unitでは子API呼び出しを行わないため、本番buildのE2Eで実際の画面と要求IDの対応を別に確認する。

## 限界と残り

About tabs、ホームカード、他のroute入力まで評価完了したとはしない。残りはNGT-061へ分ける。ホーム/復元の準備済み移行と重なる実装は先行マージを待つ。

**未検証**: 実サーバー、全unit/E2E suite、Firefox/WebKit、対象外の特殊なroute data構成。今回、ユーザーの実ジョブや外部保存先は操作していない。

ログは`tmp/log-route-before.log`、`tmp/log-route-unit.log`等（Git管理外）。実行にはmise管理下のjj/gh/node/bun実体を直接使用。tmpの永続保存は保証しない。

## 型・本番ビルド・E2E

```text
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
exit 0
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
exit 0
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module preserve --moduleResolution bundler --types node --skipLibCheck e2e/job-log-route-input-binding.spec.ts
exit 0
bun run build:prod
Application bundle generation complete. [135.147 seconds]
exit 0
node node_modules/@playwright/test/cli.js test e2e/job-log-route-input-binding.spec.ts e2e/job-log-pagination.spec.ts e2e/remote-log.spec.ts
3 passed (1.7m)
```

**検証済み（Chromium・本番ビルド・APIモック）**: 通常ジョブ42の一般ログを表示し、宛先タブを選択。Syncジョブ43へ同じ親componentで移動すると宛先タブはなく、43の一般ログだけが表示される。通常ジョブ44では従来どおりタブ選択が維持されて44の宛先ログを表示。queryのid=43に変えてもpathの44を保ち、追加のログ要求は発生しない。その時点の一般ログ要求IDは42/43、宛先ログは42/44。戻る/進むでもジョブ名と表示が一致し、親DOMは再利用される。ジョブ単体endpointへの書き込み要求は0。

既存のログページングではID cursor、失敗時Retry、新しいログへの復帰が通り、宛先ログでは壊れた行を含む表示とcopyが通った。リファクタリング対象外の処理に新しい修正を加えていない。

```text
node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/backup/log/log.component.ts projects/ngclient/src/app/backup/log/log-route-input.spec.ts e2e/job-log-route-input-binding.spec.ts
All matched files use Prettier code style!
```

ビルドログにwarning一致なし。E2EにはNO_COLOR/FORCE_COLOR環境警告があり、全ログ無警告とはしない。既存構成に専用lint targetがないためlint成功とは主張しない。ログ: `tmp/log-route-tsc-{app,spec,e2e}.log`、`tmp/log-route-build.log`、`tmp/log-route-e2e.log`。

## push結果

- ブックマーク: `codex/job-log-route-input-binding`
- 完全なSHA: `9681cc0b900486f6291937ebc0634f005f0a1235`
- 親: `d788d0c592306dffe8105ae5f4c357156f94a38c`
- `jj git push --remote origin -b codex/job-log-route-input-binding`成功。PRは作成していない。

差分はジョブログ親componentのtsと追加したunit/E2Eの3ファイル。既存の実装ブランチは変更していない。
