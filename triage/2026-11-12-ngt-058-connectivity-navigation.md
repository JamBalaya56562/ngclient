# NGT-058: 接続ステータスのナビゲーション — 2026-11-12

## 範囲・重複・依存

最新取得時main: `d788d0c592306dffe8105ae5f4c357156f94a38c`。`jj git fetch --all-remotes`はNothing changed。ghでopen PR #684〜694を取得し、全既存ブックマークのmainとの差分ファイルを照合。

**検証済み（差分照合）**: RemoteConnectivityStatusとstatus-bar.component.html、新規E2Eを変更する既存ブックマークなし。NGT-001/002/003/057や本体変更には依存しない。最新mainから独立して実装。

対象は接続ステータスの「Click to register」「Connecting」の2つの遷移。`div appKeyboardAction role=link`を`a routerLink`へ変更し、`/connect/logon`への遷移と表示条件を維持する。色・下線は元の表示に合わせる。再接続、claim、キャンセル、コンソールを開く命令の処理は変更しない。API/生成クライアント、RemoteControlState、共有のKeyboardActionDirective、他の準備済みナビゲーション変更には触れない。

## モバイルの入れ子を避ける

**検証済み（ソース・component spec）**: モバイルのMoreメニューボタンは、状態ドットを表示するために同じ接続ステータス部品を内包していた。単純なanchorへの置換ではbutton内にanchorが入る。

**ドキュメント根拠**: [HTML Standard: button](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element)はinteractive contentやtabindexを持つ子孫を禁止する。

表示専用の`indicatorOnly` inputを追加し、Moreボタン内だけはaria-hiddenなspanの状態ドットにする。状態の色・点滅を維持し、操作は開いたメニュー内に残す。Moreボタンには`type=button`と翻訳対象の`aria-label=More options`を付ける。

従来のボタン内の状態表示に、独立したキー操作や遷移は残さない。モバイルの操作経路はMoreボタンでメニューを開き、項目から接続する。デスクトップと開いたメニューには通常リンクを表示する。

## 修正前→修正後のcomponent検証

実際のtemplate・RouterLink・KeyboardActionDirectiveを使い、RemoteControlStateだけをmock化した。

```text
bun run test:ci --include '**/remote-connectivity-status.spec.ts'
Tests 3 failed | 5 passed (8)
AssertionError: expected undefined to be '/connect/logon'
```

**検証済み（修正前）**: unknown/inactive/registeringの3件でanchorのhrefがないことにより失敗。再接続・claim/cancel・consoleの命令5件は成功。

```text
bun run test:ci --include '**/remote-connectivity-status.spec.ts' --include '**/remote-control.state.spec.ts' --include '**/keyboard-action.directive.spec.ts'
Test Files 3 passed (3)
Tests 24 passed (24)
```

**検証済み（修正後）**: リンク3状態、命令5ケースに加え、indicatorOnlyの全8状態で入れ子のinteractive要素がないことと色/点滅を確認。既存RemoteControlState・キーボードdirectiveの関連specも成功。

## 型・本番ビルド

```text
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
exit 0
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
exit 0
bun run build:prod
Application bundle generation complete. [27.245 seconds]
exit 0
```

mise管理下のjj/gh/node/bun実体を直接呼んで実行。ログは`tmp/connectivity-before.log`、`tmp/connectivity-unit.log`、`tmp/connectivity-tsc-{app,spec}.log`、`tmp/connectivity-build.log`（Git管理外）。

## 限界と残り

今回でtabs、ホームのカード、route input binding等の評価まで完了したとはしない。残りはNGT-059へ分ける。特にホーム/復元の準備済み移行と同じファイルを無断で書き換えない。

**未検証**: 実サーバー接続、外部consoleの認証・登録・claim、新しいタブのアプリ認証全体、Firefox/WebKit、全unit/E2E suite。別タブのE2Eでは遷移先documentをstatic HTMLに置き換え、ブラウザーのリンク処理とURLだけを確認する。tmpの永続保存は保証しない。

## 最終E2Eと補足

登録中の初回テストはHTTPのstatus応答を差し替えたが、実際のサービスはWebSocket使用中には`refreshRemoteControlStatus`でHTTP取得しないため、登録中にならず1件失敗した（9件成功）。アプリの問題と断定せず、テストを実際の購読経路に合わせた。

既存ブックマークに共有fixtureの編集がないことを追加照合し、既存のsendNotifications等と同じ形の`sendRemoteControlStatus` helperを`e2e/fixtures/authenticated.ts`に追加した。HTTP用データとWebSocketのsubscriptionデータを更新し、実際のremotecontrolメッセージを送る。デフォルトのfixture動作は変更しない。

```text
node node_modules/@playwright/test/cli.js test e2e/remote-connectivity-navigation.spec.ts e2e/authenticated-page.spec.ts e2e/theme-toggle.spec.ts
10 passed (23.1s)

node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target ES2022 --module preserve --moduleResolution bundler --types node --skipLibCheck e2e/remote-connectivity-navigation.spec.ts
exit 0
```

**検証済み（Chromium・本番ビルド・APIモック）**: href、下線なしの表示、Tab/Enterとfocus outline、通常クリック、SPAでdocumentを維持した遷移、戻る/進む、登録中のWebSocket更新、ControlOrMeta/中央クリックの別タブ、モバイルMoreボタンのSpace操作でmenuを開くこと・menu項目からの遷移。既存の認証後表示・テーマ切り替えも含め10件全成功。

```text
node node_modules/prettier/bin/prettier.cjs --check <変更した7ファイル>
All matched files use Prettier code style!
```

対象7ファイルはRemoteConnectivityStatusのts/html/scss/spec、status-bar.component.html、E2E fixture、追加E2E。ビルドログにwarning一致なし。E2EにはNO_COLOR/FORCE_COLOR環境警告があり、全ログ無警告とはしない。専用lint targetは既存構成にないためlint成功とは主張しない。

**検証済み（目視）**: desktop-link.pngとmobile-menu.pngでリンクとモバイルmenuを確認。レイアウト全体の変更前後のpixel一致を検証したものではない。証拠: `tmp/connectivity-evidence/{desktop-link.png,mobile-menu.png}`、`tmp/connectivity-e2e-initial.log`、`tmp/connectivity-e2e-final.log`、`tmp/connectivity-tsc-e2e.log`。

## push結果

- ブックマーク: `codex/console-connection-router-links`
- 完全なSHA: `c16296903666bfb9e219f2d20e193fd841a7d3d9`
- 親: `d788d0c592306dffe8105ae5f4c357156f94a38c`
- `jj git push --remote origin -b codex/console-connection-router-links`成功。PRは作成していない。

