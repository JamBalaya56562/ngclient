# NGT-059: バックアップ編集のルートID入力 — 2026-11-12

## 選定と依存

基準main: `d788d0c592306dffe8105ae5f4c357156f94a38c`。`jj git fetch --all-remotes`はNothing changed。ghでopen PR #684〜694を取得し、全既存ブックマークのmainとの差分ファイルを照合した。

**検証済み（差分照合）**: BackupComponent、BackupState、既存のeditor-save spec、新規route-input specに既存ブックマークの編集なし。準備済みSignal FormsやNGT-001/002/003/057/058、本体変更に依存しない。最新mainから独立して実装。

AboutのShipTabsはライブラリがrole/aria-selected/tabindexを管理しているため、buttonを無条件にanchorへ置き換える範囲にはしなかった。そのキーボード契約の実画面監査は今回未実施で、残る候補へ引き継ぐ。

## 変更

- BackupComponentのActivatedRoute.params → toSignalという手動購読を、`routeId = input.required<string>({ alias: 'id' })`へ変更。
- app.config.tsの既存`withComponentInputBinding()`を利用。ルート定義、guard、resolver、保存/読み込みメソッド、templateは変えない。
- 下書き判定とrelative navigationに必要なActivatedRoute/route.urlは維持する。一括して全ActivatedRouteを削除しない。
- BackupStateの`signal<'new' | 'string' | null>`を`signal<string | null>`へ型修正。`'string'`は型上の文字列リテラルであり、既存の実ID（例42/43）に合わない。実行時の初期値や処理は変えない。
- 既存editor-save specのrouter設定にも、本番と同じwithComponentInputBindingを有効化。

**ドキュメント根拠**: [withComponentInputBinding](https://angular.dev/api/router/withComponentInputBinding)はルート状態をcomponent inputへ渡す公式API。path/matrix paramsはquery paramsより優先される。実際のアプリの対象ルートには`id`が定義されており、同名のstatic/resolver dataは追加していない。

## 変更前の契約テスト

バグ修正ではなく動作維持のリファクタリング。意図的な赤テストではなく、同じ契約を変更前後で検証する。

```text
bun run test:ci --include '**/backup-route-input.spec.ts' --include '**/backup.editor-save.spec.ts'
Test Files 2 passed (2)
Tests 14 passed (14)
```

**検証済み（変更前）**: 初回ID、component再利用でのID変更、子ステップ/query/fragment変更で再ロードしないこと、new→既存→new、下書きIDとフラグ、guardによる遷移拒否。新規specは本物のRouterTestingHarness・BackupComponent・本番と同じinput bindingを使い、データ読み込みメソッドだけをspyで置き換える。既存editor-saveも含む。

## 変更後のunit

```text
bun run test:ci --include '**/backup-route-input.spec.ts' --include '**/backup.editor-save.spec.ts' --include '**/backup.state.spec.ts'
Test Files 3 passed (3)
Tests 22 passed (22)
```

**検証済み**: 上記契約と既存BackupState specが成功。ルートテストの読み込みメソッドはspyなので、実際のフォーム反映については本番ビルドのE2Eで別に確認する。

生ログ（Git管理外）: `tmp/route-input-before.log`、`tmp/route-input-unit.log`。

## 限界と次の候補

今回でAbout tabs、ホームカード、他画面の全route inputの監査が完了したとはしない。残りはNGT-060へ分ける。ホーム/復元の準備済み移行と重なる実装は、そのマージ前に行わない。

**未検証**: 実サーバー、全unit/E2E suite、Firefox/WebKit、既知の不具合として報告されていない特殊なroute data構成。今回の変更はAPI schema/生成クライアントや本体の保存処理を変更していない。tmpの永続保存は保証しない。

## 型チェック・本番ビルド・E2E

```text
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
exit 0
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
exit 0
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module preserve --moduleResolution bundler --types node --skipLibCheck e2e/backup-route-input-binding.spec.ts
exit 0
bun run build:prod
Application bundle generation complete. [84.460 seconds]
exit 0
node node_modules/@playwright/test/cli.js test e2e/backup-route-input-binding.spec.ts e2e/editor-save.spec.ts
6 passed (58.2s)
```

**検証済み（Chromium・本番ビルド・APIモック）**: 42の編集途中でDestination→Generalやquery変更をしても未保存の名前が残り、GETは1回。43へ移ると同じeditor DOMを再利用して43を読み込み、戻る/進むで42/43を正しく再読み込みする。観測したGET ID順は`42,43,42,43`、このフローでの書き込み要求は0。既存の明示保存、keyboard save、失敗後retry、入力不正時の遷移、新規バックアップフローも含めE2E6件が成功。

```text
node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/backup/backup.component.ts projects/ngclient/src/app/backup/backup.state.ts projects/ngclient/src/app/backup/backup.editor-save.spec.ts projects/ngclient/src/app/backup/backup-route-input.spec.ts e2e/backup-route-input-binding.spec.ts
All matched files use Prettier code style!
```

ビルドログにwarning一致なし。E2EにはNO_COLOR/FORCE_COLOR環境警告があるため全ログ無警告とはしない。既存構成に専用lint targetがないためlint成功とは主張しない。ログは`tmp/route-input-tsc-{app,spec,e2e}.log`、`tmp/route-input-build.log`、`tmp/route-input-e2e.log`。

## push結果

- ブックマーク: `codex/backup-route-input-binding`
- 完全なSHA: `dbcc44021ba37082c74cfa56575a6d7e6c7ffc1a`
- 親: `d788d0c592306dffe8105ae5f4c357156f94a38c`
- `jj git push --remote origin -b codex/backup-route-input-binding`成功。PRは作成していない。

既存の実装ブランチは変更していない。UI構造やstyleの変更はなく、今回の検証はルート入力・編集状態・リクエストの対応を主眼とする。
