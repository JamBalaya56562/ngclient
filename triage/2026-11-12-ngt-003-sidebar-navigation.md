# NGT-003: サイドバーのナビゲーション — 2026-11-12

## 対象と依存

基準main: `d788d0c592306dffe8105ae5f4c357156f94a38c`。`jj git fetch --all-remotes`はNothing changed。open PR #684〜694と全既存ブックマークのmainとの差分ファイル一覧を照合。

**検証済み（差分照合）**: layout.component.html、新規sidebar E2E、影響するSettings関連E2Eに既存ブックマークの変更なし。NGT-001/002や本体変更に依存しない。

対象はサイドバーの7つの遷移（Home、Add backup、Restore、Destinations、System status、Settings、About Duplicati）。`button routerLink`を`a routerLink`へ変更し、routerLinkActiveに`ariaCurrentWhenActive="page"`を追加。遷移先、active class、Homeのexact判定、Ship UIのaction属性・classは維持する。ログアウト・テーマ切り替えはbuttonのまま。外部リンクも変更しない。

**ドキュメント根拠**: Angular公式の[RouterLinkによる宣言的ナビゲーション](https://angular.dev/guide/routing/navigate-to-routes)を参照。hrefを持つanchorでブラウザー標準のリンク操作を利用する。

## 修正前の回帰テスト

**検証済み（Chromium、本番ビルド、APIモック）**:

```text
bun run build:prod
exit 0
node node_modules/@playwright/test/cli.js test e2e/sidebar-navigation.spec.ts --grep 'exposes sidebar'
1 failed
locator('app-layout [sidenav]').getByRole('link', { name: 'Home', exact: true })
Error: element(s) not found
```

画面の認証・表示後にHomeがlinkとして存在しないことを確認。初回のsandbox内Playwright起動は進まず中断したため、この結果には含めない。上記の赤は通常環境で実際にブラウザーを起動した結果。

証拠（Git管理外）: `tmp/navigation-before.log`、`tmp/navigation-before-build.log`、`tmp/navigation-evidence-before/{test-failed-1.png,error-context.md,trace.zip}`。

## 確認範囲と残り

変更はルート定義・guard・resolver・API通信に触れない。About等のShip UI tabsは役割とキーボード契約を別に確認すべきため置換しない。ホームのカード・メニューやAdd backup内の入口ボタン、route input binding等の残りの評価はNGT-057で管理する。一括置換やRouter resourcesへの移行はしない。

別タブのテストでは遷移先documentのみstatic HTMLで応答し、リンクによるタブ生成とURL、元の画面が変わらないことを確認する。新しいタブでの認証フロー全体や実サーバー動作まで確認したという意味ではない。

**未検証**: 実サーバー接続、Firefox/WebKit、全E2E・全unit suite。単に全ルートを同じ条件で巡回したテストではない。

ログは`tmp/navigation-*.log`に保存（Git管理外）。実際のコマンドではmise管理下のnode/bun/jj/gh実体を直接使用。

## 最終結果とコマンド

ブックマーク: `codex/sidebar-router-links`。完全なSHA: `4b669350249e268a8c922392f82136ebf8f910ea`。親: `d788d0c592306dffe8105ae5f4c357156f94a38c`。originへpush済み、PR未作成。

**検証済み**:

```text
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
exit 0
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
exit 0
bun run test:ci --include '**/layout.state.spec.ts'
Test Files 1 passed (1)
Tests 7 passed (7)
bun run build:prod
Application bundle generation complete. [43.323 seconds]
exit 0
```

```text
node node_modules/@playwright/test/cli.js test e2e/sidebar-navigation.spec.ts e2e/advanced-settings-save.spec.ts e2e/server-timezone.spec.ts e2e/usage-statistics.spec.ts e2e/theme-toggle.spec.ts
24 passed, 2 failed
```

既存4ファイル21件は全成功、新規5件中3件成功。失敗2件は別タブの最初のnavigation requestでテストモックが`request.frame()`を呼んだため。Playwrightのエラーは`Frame for this navigation request is not available, because the request was issued before the frame is created`。モックを対象URLのnavigation requestへ直接応答する形に修正。アプリ変更はそのままで、新規spec全体を再実行:

```text
node node_modules/@playwright/test/cli.js test e2e/sidebar-navigation.spec.ts
5 passed (20.2s)
```

従って確認した最終ケースは既存21件と新規5件。修正後に同じ26件をまとめて再実行したという意味ではない。

新規specは7つのhref・role・aria-current、通常クリック、Tab/Enterとfocus outline、SPAでdocumentを保つこと、戻る/進む、ControlOrMeta/中央クリックで別タブを開くこと、390px幅でのサイドバー操作を確認する。コマンド系のbuttonと外部リンクも残ることを確認。

```text
node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/layout/layout.component.html e2e/sidebar-navigation.spec.ts e2e/advanced-settings-save.spec.ts e2e/server-timezone.spec.ts e2e/usage-statistics.spec.ts
All matched files use Prettier code style!
```

既存3つのSettings関連E2Eの変更は、Settingsのbutton locatorをlink locatorへ変更しただけ。アプリ変更はlayoutのHTMLのみ。ビルドログにwarning一致なし。E2Eには環境変数NO_COLOR/FORCE_COLORの警告があるため、全ログ無警告とはしない。専用lint targetは既存構成になく、lint成功とも主張しない。

**検証済み（目視）**: 変更前の1280px幅の画面と変更後のsidebar screenshotで、配置や見た目に崩れは見られなかった。pixel一致の機械判定ではない。変更後は`tmp/navigation-evidence-after/sidebar.png`。E2EのHTMLレポートにもsidebar添付あり。ログ: `tmp/navigation-unit.log`、`tmp/navigation-build.log`、`tmp/navigation-e2e-initial.log`、`tmp/navigation-e2e-final.log`、`tmp/navigation-tsc-{app,spec}.log`。tmpは永続保存を保証しない。
