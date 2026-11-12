# NGT-002: ServiceHubの非同期タイマー管理 — 2026-11-12

## 選定と範囲

最新upstream/main `d788d0c592306dffe8105ae5f4c357156f94a38c`から独立して実装。`jj git fetch --all-remotes`はNothing changed。ghでopen PR #684〜694を取得し、全既存ブックマークのmainからの変更ファイルを照合した。**検証済み（差分照合）**: ServiceHubを編集する既存ブックマークなし。NGT-001にも依存しない。本体API依存なし。

対象は`projects/ngclient/src/app/core/components/service-hub/service-hub.component.ts`のみ。関連specを追加した。既存resource/HTTP購読や書き込みのキャンセルは変更していない。Swagger/OpenAPI・生成クライアントにも変更なし。

## 赤→緑で確認したこと

**検証済み（修正前）**: componentの本物のconstructor/effectを動かし、templateと注入先サービスだけを置き換えたspecで6件失敗。intervalだけをfake timer化した。

```text
bun run test:ci --include '**/service-hub.component.spec.ts'
Test Files 1 failed (1)
Tests 6 failed (6)
```

- notification / alertとも3→2→1→0→消去という既存の時刻を経てもタイマーが1本残る。
- resetPreviewMessage、通知一覧が空になる場合、component破棄後にもタイマーが残る。
- 新しいプレビューを表示すると、旧タイマーと合わせて2本になる。

**実装**: Angularの公開DestroyRef.onDestroyでcomponent破棄時に停止。開始・停止処理を共通化し、置き換え時は前のintervalを停止してから新規開始。表示終了・dismiss時もclearIntervalする。通知を選ぶ条件、panelのtoggle、1秒間隔、countDown=0になった次のtickで閉じる既存のタイミングは維持。2本のtimerで次のプレビューが早く減る副作用は防ぐ。

**ドキュメント根拠**: [DestroyRef](https://angular.dev/api/core/DestroyRef)は注入したcomponentの破棄時に登録callbackを実行する公開API。

## 限界と残り

今回の成果は、監査で実際に再現したServiceHubのtimer残存と重複への対応。非同期読み取り全体のresource化、全サービスの購読・timerの監査、古いHTTP応答の上書き防止まで完了したとはしない。残りは別タスクNGT-056で対象と契約を確定する。

**未検証**: 実ブラウザー/実サーバーE2E、全unit suite、性能比較。DOMを含むServiceHub統合E2Eではなくcomponent状態とtimer lifecycleのテスト。既存の通知選択条件の妥当性も今回の修正範囲外。

生ログ（Git管理外）: `tmp/async-before.log`、`tmp/async-after.log`、`tmp/async-tsc-app.log`、`tmp/async-tsc-spec.log`、`tmp/async-build.log`。

## 最終検証コマンド

```text
bun run test:ci --include '**/service-hub.component.spec.ts' --include '**/notifications*.spec.ts'
Test Files 4 passed (4)
Tests 32 passed (32)

node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
exit 0
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
exit 0

node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/core/components/service-hub/service-hub.component.ts projects/ngclient/src/app/core/components/service-hub/service-hub.component.spec.ts
All matched files use Prettier code style!
```

上記はmise管理下の実体を直接呼んで実行。最終版ではalertパネルを開く操作の維持も1件追加したため、修正前6件に対しServiceHub specは7件。通知state/transport/dismissの既存25件と合わせ32件。専用lint script/targetは既存構成にないため、lint成功とは主張しない。

## push結果とビルド

- ブックマーク: `codex/service-hub-timer-lifecycle`
- 完全なSHA: `5236e61670feb5727ca8838df0d866b935156adf`
- 親: `d788d0c592306dffe8105ae5f4c357156f94a38c`
- `jj git push --remote origin -b codex/service-hub-timer-lifecycle`成功。PRは作成していない。

```text
bun run build:prod
Application bundle generation complete. [53.492 seconds]
exit 0
```

**検証済み**: ビルドログにwarning一致なし。差分はServiceHub componentと追加specの2ファイル。既存の実装ブランチは変更していない。
