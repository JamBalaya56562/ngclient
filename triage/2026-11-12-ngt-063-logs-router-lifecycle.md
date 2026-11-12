# NGT-063: ログ画面のRouter購読を画面の寿命に合わせる

2026-11-12。NGT-056（非同期処理・購読監査）の個別対応。

## 選定・依存（検証済み）

jj git fetch --all-remotes は Nothing changed。upstream/main は 8edaeee84c0c0f4a48e75ae917195cb1047b15a5。open PR #695〜#704と全既存ブックマークのmainからの変更ファイルを照合し、about/logs/logs.component.ts の変更重複はなかった。ServiceHubのNGT-002や他の準備済みブランチにも依存しない。本体API・Swagger・依存パッケージ・テンプレートは変更しない。

## 再現と修正（検証済み）

実際のLogsComponentのconstructorとAngularのDestroyRefを使い、RouterイベントだけをSubjectで供給した。コンポーネントのテンプレートとLogsLiveStateはテスト用のものに置き換えた。

修正前は破棄後もSubject.observedがtrueであり、後続NavigationEndが破棄済みcomponentのcurrentUrlを書き換えた。再入場で新しいviewを作った後にも旧viewの値が更新された。これは購読残存と状態更新の検証であり、実ブラウザーのヒープ使用量を計測したものではない。

修正はRouterイベントのpipeへtakeUntilDestroyed()を追加するもの。constructorの注入コンテキストでAngularの公開APIを利用し、初期URL、NavigationEndのみを扱う条件、urlAfterRedirects、ログレベルの変更処理は保持する。

## コマンドと結果

mise管理下のbun.exe / node.exeの実体を直接使用。単体テストではPowerShellの $env:VITEST_MAX_WORKERS = '1' を設定した。

修正前:

    bun run test:ci --include '**/about/logs/logs.component.spec.ts'
    Test Files 1 failed (1)
    Tests 3 failed | 2 passed (5)

失敗したケース:
- releases the Router subscription when the view is destroyed
- does not update a destroyed view on later navigation
- only updates the new view after leaving and reopening logs

修正後:

    bun run test:ci --include '**/about/logs/**/*.spec.ts'
    Test Files 3 passed (3)
    Tests 26 passed (26)

新規5件と既存のstored/liveログの21件を含む。初期URL、未完了のNavigationStartを無視する挙動、リダイレクト後のURL、polling有効化と選択ログレベルの転送も確認。

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    exit 0

    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/about/logs/logs.component.ts projects/ngclient/src/app/about/logs/logs.component.spec.ts e2e/server-logs.spec.ts
    All matched files use Prettier code style!

    bun run build:prod
    Application bundle generation complete. [62.426 seconds]
    exit 0

    bun run test:e2e e2e/server-logs.spec.ts
    1 passed (27.8s)

Chromiumと本番成果物を使用。認証済みfixtureでStored/Liveの切り替え、Warningへ変更して同じ値でpoll要求を送ること、ホームへ離れて再入場した後もタブとログレベル表示が追随することを2回の入場で確認。APIはモックで、実サーバー検証ではない。fixtureが未処理のブラウザー例外・未定義API要求を検査する。

生ログはGit管理外の tmp/ngt-063/red.log、green.log、build.log、e2e.log、tsc-e2e.log、commit.txt に保存した。

## 公開状態

- ブックマーク: codex/logs-router-subscription-lifecycle
- コミット: [7b9a139a28c6999f6bdaae3ed5f80d7b49fb9e0a](https://github.com/JamBalaya56562/ngclient/commit/7b9a139a28c6999f6bdaae3ed5f80d7b49fb9e0a)
- 親: 8edaeee84c0c0f4a48e75ae917195cb1047b15a5
- jj git push --remote origin -b codex/logs-router-subscription-lifecycle 成功。PR・Issueコメントは投稿していない。

未検証: 実サーバー、ブラウザーのヒープ計測、全unit suite。NGT-056の全サービス監査や他の非同期読み取りまで完了とはしない。次の新規IDはNGT-064。