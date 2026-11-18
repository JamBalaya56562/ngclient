# NGT-115: #3851の旧UIテーマ保存の調査と修正

## 検証済み

本体master `e8756fab2b708af7a9b287d41916799a6da451ad` のngaxを実サーバーAPIと接続し検証。
バックエンドは配布Canary 2.4.1.101、フロントエンドはmasterの静的ファイル。
Microsoft Edge 157.0.4341.60 / Windows。独立したserver-datafolderと空きポートを使用し、利用者のジョブは操作していない。

同じ隔離APIへ接続する2つのUI origin（同一127.0.0.1・別ポート）で次を確認した。
認証nonceは検証ハーネスで同期し、別originでのログイン更新とテーマ保存の現象を分離した。
2つの独立バックエンドではなく、フロントエンドのCookie共有を切り分ける構成である。

- ngaxでDarkを保存して通常reload: Darkを維持。
- ngaxのテーマCookie: path `/ngax`、実際の期限は約400日。localStorageにはテーマなし。
- 別portでLightを保存した後、最初のoriginをreload: `styles/default.css` に変化。
- テーマCookie `current-theme` だけ削除してreload: Darkが失われ `styles/default.css`。
- ngclientは同じテーマCookie削除後もDarkを維持し、`v1:persist:duplicati:darkTheme=true`。

ngclientのUIは直前の検証で作成した本番ビルド（#757 head `1a5488aa7e54d4ed02ae69a0fe923737aad77bc6`）。
mainとの差はPlaywright依存だけで、製品コードに差はない。今回ngclientの製品コード修正は不要。

## 修正・検証済み

本体forkの `codex/ngax-persistent-browser-theme`:
[`ff4af1dd9c23379fab103a5508d2ee2aa2813e00`](https://github.com/JamBalaya56562/duplicati/commit/ff4af1dd9c23379fab103a5508d2ee2aa2813e00)
親は上記master。別workspaceを作成し、既存の本体workspaceとブランチは変更していない。
2ファイルのみ: `AppController.js` と既存の `playwright-tests/ngaxPages.spec.ts`。

localStorage `duplicati:ngax:theme` を優先。既存Cookieから移行し、localStorageが使えない場合は従来Cookieにfallback。
ブラウザー・originごとの個別設定であり、サーバーへの個人設定の同期は追加していない。
既存のCookieは他ポートに影響を与えないよう削除せず、localStorageが使える場合は書き換えない。

```text
node tmp/theme-legacy-probe.mjs (THEME_TESTS=1, THEME_GREP='keeps a saved theme|migrates an existing')
2 failed
- ngax keeps a saved theme when the legacy cookie disappears or changes
- ngax migrates an existing theme cookie into browser storage

node tmp/theme-legacy-probe.mjs (THEME_TESTS=1, 修正後・grepなし)
12 passed (既存9件＋新規3件)

node --check Duplicati/Server/webroot/ngax/scripts/controllers/AppController.js
exit 0
```

新規3件はCookie消失/上書き、Cookieからの移行、storageのgetItem/setItemがSecurityErrorの場合のfallback。
E2Eが検証するAPI保存は実サーバーへのPATCHでHTTP成功も確認する。
最終specは既存部分の整形差分を除いて追加だけに限定した（E2E後の整形差分のみ、ロジック変更なし）。

修正後の同じ実画面probe:

```text
ngax-normal-reload: dark; duplicati:ngax:theme=dark
ngax-theme-cookie: null
ngax-after-other-port-saved-light: styles/dark.css
ngax-after-theme-cookie-removed: styles/dark.css
ngclient-after-cookie-removal: dark; stored=true
```

## 証拠・限界

- `main-events.json` / `fixed-events.json`、`red.log` / `green.log`。
- `before.png` / `after.png`: テーマCookie削除後の旧UI。
- 再現スクリプトと隔離データ: Git管理外 `tmp/theme-legacy-probe.mjs`、`tmp/theme-legacy-20261118/`。
- 全サーバー・proxy・ブラウザーは各runのfinallyで停止。Playwright既存設定の一時的なEdge指定もfinallyで復元。
- 本体ビルドは未実施。変更はそのまま配信される静的JavaScriptとE2Eだけで、構文チェックと実サーバーで検証した。
- Firefox・Safari、400日経過の実待機、報告者の不定期リセットとの同一原因は未検証。
- サイトデータ全消去（localStorageも消去）からの保持を保証する修正ではない。
- localStorageが使えない場合のfallbackはCookieの期限・port共有という制約が残る。

検証ハーネス初期版ではReleaseサーバーがインストール外webroot指定を無視し、同梱UIを検証していた。
それを修正し、静的ファイルをproxyから配信して全bodyのバイト一致を確認して赤・緑・両live probeを取り直した。
最新mainのAppController SHA-256: `b1ff1cc2c0c8c76b993e44374d97df68a53d0d0c61217a9ed75e197f53101b28`。
修正後: `bc0f30d6622f26db86a16a849720b6a069b30eb11131283dc12632afd4fc8adf`。
初期の同梱UIのrunは最新masterの検証根拠として使わない。

ドキュメント根拠: [ChromeのCookie有効期限上限](https://developer.chrome.com/blog/cookie-max-age-expires)。
10年指定が約400日へ制限されることは実ブラウザーのCookie情報でも確認したが、400日後の期限切れ自体は実待機していない。

本体originへpush済み。利用者の依頼で本体PR [#7886](https://github.com/duplicati/duplicati/pull/7886)を作成（Fixes #3851、新旧画像と未検証範囲付き）。Issueへリリース済み・解決済みとする追加コメントはしていない。
