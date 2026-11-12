# NGT-064: Aboutのnativeリンクと選択状態同期（2026-11-12）

## 選定（検証済み）

最新upstream/main 8edaeee84c0c0f4a48e75ae917195cb1047b15a5から独立して実装。jj git fetch --all-remotesはNothing changed。ghでopen PR #695〜#704を取得し、既存ブックマークの差分とAboutの対象ファイルを照合した。重複はなく、準備済みブランチ・本体変更に依存しない。

最初に検討したコマンド設定画面のID入力移行は保留した。型付きinputにするとBackupState.backupIdの型が文字列全般でなくリテラル 'string' に限定されているためTS2345になる。この型修正はcodex/backup-route-input-bindingに含まれ、今回は独立性の条件を満たさない。未公開の候補ブックマークは削除し、実装はpushしていない。調査ログbefore.log/after.logはコマンド画面候補のもの。

## 修正前に確認した問題（検証済み）

単体テストではhrefを持つnative linkが存在せず、Ctrlクリックで現在の画面が遷移した。最初の3テストは2件失敗・1件成功。

修正前の本番成果物で、System infoにactiveクラスがあるのにaria-selected=false、tabindex=-1であることをPlaywrightで確認した。フォーカスを直接与えるとSpace/Enterでは遷移できるが、ArrowRightではフォーカスもURLも変わらなかった。コードではShipTabsのcontentProjectionSignalがclass属性変化を選択状態更新の契機にせず、明示的valueのないルート項目が初期状態のままになることを確認した。

計測値: padding 1px 6px、height 48px、font 500 14px Inter Tight。修正後もpaddingとheightをE2Eで検査する。

## 実装

- 7ページへの項目をRouterLink付きa要素にし、既存のラベル・ルート・i18n属性を保持。
- NavigationEndをtoSignalで読み、URLから現在のAboutページをcomputedで求めてShipTabsのvalueへ渡す。ネストしたlogs/storedとquery/fragmentも同じLogs項目として選択する。
- valueChangeはURLが異なる時だけRouterへ渡す。これによりShipTabsが既に持つSpace/矢印キー処理と、選択ARIA・roving tabindexを利用する。新しいキーバインド処理は作らない。
- クリックとEnterは投影内のwrapperで伝播を止め、RouterLinkとnative browserに任せる。ShipTabsがCtrlクリック等で現在の選択を変えたり、Enterで二重に遷移したりしない構成。
- wrapperはdisplay:contents。リンクの余白と下線を調整し、ShipTabsの既存表示・focus-visibleスタイルを使う。ライブラリ・設定ファイル・依存パッケージは変更しない。

## コマンドと出力

miseのbun.exe/node.exeを直接実行。単体テストはPowerShellで $env:VITEST_MAX_WORKERS = '1' を設定。

    bun run test:ci --include '**/about.navigation.spec.ts'
    # 修正前
    Test Files 1 failed (1)
    Tests 2 failed | 1 passed (3)
    # 修正後（追加の選択同期・重複遷移防止も含む）
    Test Files 1 passed (1)
    Tests 5 passed (5)

    bun run test:ci --include '**/about.navigation.spec.ts' --include '**/about/logs/**/*.spec.ts'
    Test Files 3 passed (3)
    Tests 26 passed (26)

単体のShipTabs・StatusBar・子ページはstub。RouterとAbout templateは実物。7ページのhref/value整合、通常遷移、nested Logs、Ctrlクリック時の現在URL維持、URLと選択値の同期、同じページへの重複ナビゲーション防止を確認。

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    exit 0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/about/about.component.ts projects/ngclient/src/app/about/about.component.html projects/ngclient/src/app/about/about.component.scss projects/ngclient/src/app/about/about.navigation.spec.ts e2e/about-navigation.spec.ts
    All matched files use Prettier code style!

    bun run build:prod
    Application bundle generation complete. [37.372 seconds]
    exit 0
    bun run test:e2e e2e/about-navigation.spec.ts
    3 passed (38.8s)

本番成果物・Chromium・実際のShipTabsで確認。System info/Server settingsの選択ARIA、tabindex、左右矢印、Space/Enter、focus-visibleのoutline、戻る操作が成功。Ctrl/中クリックはBrowserContextのpageイベントで別タブを検出し、href先を開いて元のページと選択が保持されることを確認した。popupイベントを待つ初回テストはタイムアウトしたため、待ち方だけを修正して成功した。

APIはfixtureのモック。別タブの到達先documentも静的HTMLで応答し、リンク先URLとタブ生成を検査している。新しいタブでのアプリ認証全体や実サーバーを検証したものではない。既存キーボード動作の修正前プローブは成功後に削除し、永続テストには修正後の契約を残した。

## pushと証拠

- ブックマーク: codex/about-navigation-links
- コミット: [371a4b61e1ba90f0cdee4362fc9dd802cfd7c8da](https://github.com/JamBalaya56562/ngclient/commit/371a4b61e1ba90f0cdee4362fc9dd802cfd7c8da)
- 親: 8edaeee84c0c0f4a48e75ae917195cb1047b15a5
- jj git push --remote origin -b codex/about-navigation-links 成功。PR・Issueコメントは投稿していない。

Git管理外のtmp/ngt-064にabout-before.log、about-before-build.log、about-before-e2e.log、about-baseline-dom.log、about-keyboard-baseline.log、about-related.log、about-build.log、about-e2e-popup-wait.log、about-e2e.log、commit.txtを保存。node_modulesの変更なし。

未検証: 実サーバー、全unit/E2E suite、Firefox/WebKit、翻訳版の実画面、About全子ページの機能全体。今回の表示計測は既定のChromium viewportとfont設定の範囲。

ホームカード・残るroute入力はNGT-065へ分ける。ホームは#697、コマンド画面IDはNGT-059のBackupState型修正のマージ後に再評価する。次の新規IDはNGT-066。