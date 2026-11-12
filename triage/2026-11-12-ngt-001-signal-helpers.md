# NGT-001: Signal helpers — 2026-11-12

状態: PUSHED、PR未作成。

- ブックマーク: `codex/public-signal-helpers`
- コミット: `e0d6a56d34fd5a0214abaf5948c8ba878e8f163f`
- 親（取得時のupstream/main）: `d788d0c592306dffe8105ae5f4c357156f94a38c`

## 実装と範囲

**検証済み（差分・テスト）**: localStorageSignalは公開signalに基づく既存createSignalを利用し、保存後に公開setを呼ぶ。revertableSignalは公開linkedSignalを利用し、更新前の値を捕捉したrollback callbackを返す。settings内のdebounceSignalをテスト可能なcore/functionsへ移し、公開signalのset/updateに委譲した。対象の低水準Signalノード参照を除去した。

既存の同期保存、custom equality、保存失敗時の値、重複更新のrollback、外部sourceへの追従、最後のdebounce更新だけがcommitされる動作を維持。タイマーのdestroy時破棄や新しいflush機能は追加していない（NGT-002の監査とは別）。

**検証済み（今回の照合）**: 全既存ブックマークとmainとの差分のファイル一覧を調べ、対象helpers/settings.component.tsの編集はなかった。open PR #684〜694とも対象変更の重複なし。独立mainベースで本体API依存なし。Swagger/OpenAPI・生成クライアント・通信処理は差分に含まれない。

## コマンドと観測

mise管理下のnode/bun/jj実体を直接使用。以下は実行引数の表記。

```text
bun run test:ci --include '**/localstorage-signal.spec.ts' --include '**/revertable-signal.spec.ts' --include '**/debounce-signal.spec.ts'
Test Files 3 passed (3)
Tests 20 passed (20)
```

これは公開API置換前の契約テスト。debounceは元の関数本体を変更せずcore/functionsへ抽出した時点で実行。バグ修正ではなく挙動維持のリファクタリングなので、意図的な赤テストはない。

```text
bun run test:ci --include '**/localstorage-signal.spec.ts' --include '**/localstorage.token.spec.ts' --include '**/revertable-signal.spec.ts' --include '**/debounce-signal.spec.ts' --include '**/connection-strings.state.spec.ts'
Test Files 5 passed (5)
Tests 49 passed (49)

node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
exit 0
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
exit 0

bun run build:prod
Application bundle generation complete. [48.553 seconds]
exit 0

node node_modules/prettier/bin/prettier.cjs --check <変更した7ファイル>
All matched files use Prettier code style!
```

**検証済み**: ビルドログにwarningの一致なし。専用lintスクリプト/targetはpackage.json・angular.json・workflowsで見つからず、lint実行成功とは主張しない。アプリ・specの型チェックとPrettierで確認した。

生ログ（Git管理外）: `tmp/signal-baseline.log`、`tmp/signal-after.log`、`tmp/signal-tsc-app.log`、`tmp/signal-tsc-spec.log`、`tmp/signal-build.log`。これらの永続性は保証しない。

**ドキュメント根拠**: [signal](https://angular.dev/api/core/signal)、[linkedSignal](https://angular.dev/api/core/linkedSignal)の公開APIを参照。

**未検証**: 実ブラウザー・実サーバーE2E、全unit suite、性能比較。通信に変更がないことは差分確認であり、全API接続を実行したという意味ではない。公開前には最新mainとの統合・open PR状況を再確認する。
