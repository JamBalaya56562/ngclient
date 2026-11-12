# NGT-070: ログアウト完了画面の移動リンク（2026-11-13）

## 監査と選定

検証済み: `jj git fetch --all-remotes` は `Nothing changed.`。基準mainは `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`。ghでopen PR #695〜#704を取得。既存28実装ブックマークのmainとの差分と今回の3ファイルを照合し重複なし。画像保管用codex/pr-review-screenshotsと記録用triageは実装比較から除外。最新mainから独立ブランチを作成し、本体への依存なし。

ドキュメント根拠（差分・ソース）: welcome/connectのGo backはPR #700（migrate-remote-registration-signal-forms）のconnect.htmlと重なるため対象外。ホームは#697、コマンドIDはNGT-059を待つ。削除中などのdisabledを持つCancelは単純リンク化しない。今回はlogout.component.htmlの補助移動のみ選んだ。

## 実装

ログアウト完了後のGo to login pageを `button shButton + RouterLink` から `a shButton + RouterLink` へ変更。行き先 `/`、class、文言、i18n、isLoggingOutの表示条件を維持。自動ログアウト・トークン削除・ログイン画面への遷移処理は変更なし。TypeScript・API・スタイル・設定・依存パッケージの変更なし。

## 単体テスト（検証済み）

実テンプレートとRouterTestingHarnessを使うlogout.component.spec.tsを追加。AppAuthStateはスタブとし、logoutが一度だけ呼ばれること、処理中は補助操作なし、完了後はhref=/のリンクあり、通常クリックは実Routerで/へ移動、Ctrlクリックはブラウザーへ委ね再度logoutしないことを確認。

PowerShellでmiseのnode・bun実体ディレクトリをPATHへ追加し、`VITEST_MAX_WORKERS=1`。以下のbun/nodeはmise実体を直接呼んだ。

    bun run test:ci --include '**/logout.component.spec.ts'
    # 修正前: Test Files 1 failed (1)
    # Tests 2 failed | 1 passed (3)
    # offers a native link to the existing home target after logout completes
    # leaves modified completion-link clicks to the browser without logging out again
    # 上記2件は a が null で失敗。pending非表示のテストは成功。
    bun run test:ci --include '**/logout.component.spec.ts' --include '**/app-auth.state.spec.ts'
    # 修正後: Test Files 2 passed (2), Tests 15 passed (15)

既存AppAuthStateの12ケースも成功。Vitestのタイムアウト定数やnode_modulesは変更なし。runner SHA256は1530A89D189EBDC57A1577E7FBFCD34EAC55A0165589265B8D776B33F83678BD。

## 型チェック・ビルド・E2E（検証済み）

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    # exit=0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    # exit=0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/logout/logout.component.html projects/ngclient/src/app/logout/logout.component.spec.ts e2e/logout-flow.spec.ts
    # All matched files use Prettier code style!
    bun run build:prod
    # Application bundle generation complete. [44.596 seconds]
    # exit=0、buildログにwarning/errorなし
    bun run test:e2e e2e/logout-flow.spec.ts
    # 2 passed (9.3s)

本番成果物・Chromium・APIモックでRemember Me false/trueの2ケースを検証。実ログイン画面からログインし、対象の/logoutへSPA遷移。logout POSTを保留した間は/logout画面・Logging out...を維持し、補助リンクは非表示。POSTは1件でNonceを保持。sessionStorage/localStorageのnonceは削除済み。応答を返すと実際のAppAuthStateが/loginへ自動移動し、My backupsは表示されず、追加のrefresh/logout要求もない。

ドキュメント根拠: サイドバーのLog outはLayoutComponentからAppAuthState.logoutを直接呼ぶ。今回のE2Eはサイドバー経由と混同せず、LogoutComponentそのものを表示する/logout経路で実行した。

単体テストの完了後UIは認証サービスをスタブ化して意図的に表示させた。実E2Eでは自動リダイレクトを止めて補助リンクを押したり別タブを開いたりはしていない。リンク先/からの認証ガード・プロキシ/relay認証全体の再検証も未実施。変更前と同じ行き先を保つ。

lint script/targetはpackage.json・angular.jsonにないためlint成功とは主張しない。E2Eの警告はNO_COLORとFORCE_COLORの競合通知のみ。

## pushと残件

- ブックマーク: `codex/logout-navigation-link`
- コミット: [27be37a27eddc4a61732c3f0fd14af3652b2a1da](https://github.com/JamBalaya56562/ngclient/commit/27be37a27eddc4a61732c3f0fd14af3652b2a1da)
- 親: `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`
- `jj git push --remote origin -b codex/logout-navigation-link` 成功。PR・Issueコメントなし。
- Git管理外 `tmp/ngt-070/`: before.log、after.log、types.log、prettier.log、build.log、e2e.log、existing-before.tsv、commit.txt。

未検証: 実サーバー、全unit/E2E suite、Firefox/WebKit、別タブでの認証フロー。

既知の残るナビゲーション候補はNGT-071へ集約し、ホーム#697・接続画面#700・コマンドIDの型NGT-059のマージ待ちとしてBLOCKEDにする。disabled付き・状態変更付き操作は維持する。小さなリンク化を無理に継続せず、待機中は非同期監査やバグ調査・E2E整備を優先する。次の未使用IDはNGT-072。