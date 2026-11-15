# NGT-103 — 別タブ操作のCI一時失敗

実施日: 2026-11-16 JST。main: `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

## 観測（検証済み）

- #727: [run 43580609812](https://github.com/duplicati/ngclient/actions/runs/43580609812)、browser-tests job 132430627871。`server supports remote configuration import › opens file import in a separate tab with middle`だけが失敗、179 passed / 1 failed。Unit Testsとproduction-buildジョブは成功。
- #733: [run 43580685008](https://github.com/duplicati/ngclient/actions/runs/43580685008)、browser-tests job 132440394191。`opens About page in a separate tab with ControlOrMeta`だけが失敗、177 passed / 1 failed。Unit Testsとproduction-buildジョブは成功。
- いずれも`browserContext.waitForEvent: Test timeout of 30000ms exceeded`。クリック完了の直後、context.routeのHTML応答が成功しているが、その後BrowserContextのpageイベントが記録されずタイムアウトする。入力前のイベント購読は既に存在する。
- #727 trace: click call@844終了11798.287、Route.fulfill call@846終了11801.139。新タブの遷移要求`/backup/import`はHTTP 200 / 11.98ms。#733: click call@165終了4762.381、Route.fulfill call@167終了4766.443。`/about/server-settings`はHTTP 200 / 13.07ms。単位はtraceのmonotonic ms、両run間で比較しない。
- 他のopen PRでは同じテストが成功している。失敗した2件の製品差分はそれぞれ詳細オプションとWebSocket寿命管理で、上記ナビゲーションのソース変更ではない。

## ローカル検証

Node.js v26.13.1 / Bun 1.4.4 / Playwright 1.63.0、Windows、Chromium、workers=1、retries=0。

```text
node node_modules/@playwright/test/cli.js test e2e/about-navigation.spec.ts e2e/add-backup-navigation.spec.ts -g "separate tab" --repeat-each=10
40 passed (2.5m)
```

この最初の40回は前作業の#738のdistを使用していたため、mainでの追試とは区別する。#738はGeneralLogのPUTへの2フィールド追加のみ。

```text
bun run build:prod
Application bundle generation complete. [57.768 seconds]
Output location: C:\Users\Jam\Documents\ngclient\dist\ngclient

node node_modules/@playwright/test/cli.js test e2e/about-navigation.spec.ts e2e/add-backup-navigation.spec.ts --repeat-each=10
100 passed (5.4m)
```

mainの空の子リビジョンでビルドし、製品コードの変更なしを`jj status`で確認。ブラウザーテストは隔離したAPIモックを使用。実サーバーの検証ではない。sandbox内の最初の試行はpreview起動で止まり、有効なテスト結果に数えていない。該当プロセスだけを停止し、sandbox外で再実行した。

## CI再実行

```text
jj metaedit --force-rewrite codex/advanced-options-actions codex/websocket-connection-lifecycle
jj diff --from 4d50af9684de8c8d5b2f61a3097e06551ecbcba0 --to codex/advanced-options-actions --summary
jj diff --from 1393c45e3e3f59ab7a67787ac0f4163aaac2c723 --to codex/websocket-connection-lifecycle --summary
# 両diffとも出力なし
jj git push --remote origin -b codex/advanced-options-actions -b codex/websocket-connection-lifecycle
```

- #727: `4d50af9684de8c8d5b2f61a3097e06551ecbcba0` → `018692b3aab5f2c5a88a387b78f73c6963d81147`。Production Build [43735256382](https://github.com/duplicati/ngclient/actions/runs/43735256382)、Unit Tests [43735257120](https://github.com/duplicati/ngclient/actions/runs/43735257120)。
- #733: `1393c45e3e3f59ab7a67787ac0f4163aaac2c723` → `780c2e31a2baaef344966bd15b231fc1b691ef67`。Production Build [43735257089](https://github.com/duplicati/ngclient/actions/runs/43735257089)、Unit Tests [43735257755](https://github.com/duplicati/ngclient/actions/runs/43735257755)。
- 親・ソース・メッセージは維持。mainが同じため無意味なrebaseではなくメタデータだけを更新した。PR本文のVerified commitリンクも更新。
- 再実行の結果: GitHub APIと`gh run view <run> --repo duplicati/ngclient --json status,conclusion,jobs`でランナー待ち（queued）を確認。完了/成功は未検証。[取得結果](retry-state.json)。

## 結論と残件

- **推測**: Playwright/Chromiumの新規ページ初期化・通知の一時的な失敗が疑わしい。HTTP要求が送られ応答しており、単純なクリック取り逃がしでは説明できない。
- **未検証**: Linux CIでの確実な再現手順、pageイベントが届かない内部原因。ローカル成功だけで製品に不具合がないとは断定しない。
- 根拠のある修正を作れていないため、テストの削除・skip・retry追加・待ち時間延長・再クリックは入れず、修正PRも未作成。再発時はLinux上でbrowserのDEBUG=pw:browserログとCDP Target/Frameイベントを採取し、ルーティングした新タブのcommit/初期化で止まるか確認する。
- 空の調査ブックマーク`codex/stabilize-new-tab-navigation-tests`はローカルから削除し、その空コミットもabandon。originには作成していない。
- Git管理外の原本: `C:\Users\Jam\Documents\ngclient\tmp\ngt103-navigation-flaky-20261116\`。`pr727-ci.log`、`pr733-ci.log`、各PRの`test-results/*/trace.zip`・`test-failed-1.png`・`error-context.md`、`baseline-elevated.log`、`main-build.log`、`main-navigation.log`。artifact取得は直接指定したmiseのgithub-cli実体で`gh run download <run> --repo duplicati/ngclient --name playwright-diagnostics --dir <dir>`。
