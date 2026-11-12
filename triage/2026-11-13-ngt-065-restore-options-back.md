# NGT-065: 復元オプションの戻るリンク（2026-11-13）

## 選定と依存（検証済み）

jj git fetch --all-remotesはNothing changed。基準mainは8edaeee84c0c0f4a48e75ae917195cb1047b15a5。ghでopen PR #695〜#704を取得し、既存ブックマークの差分と今回のOptionsComponentおよびrestore-lifecycle E2Eを照合した。対象ファイルの変更重複はなかった。

NGT-065のRouter使用箇所を監査し、OptionsComponentのActivatedRoute/Router注入はGo backの単純な相対ページ遷移にしか使っていないことを確認した。ホームは#697、コマンドID入力はNGT-059のBackupState型修正待ちなので選ばなかった。本体変更・準備済みブランチへの依存はない。

## 実装

フォーム内のGo backをbutton+goBack()からa shButton [routerLink]="['../select-files']"へ変更。戻るためだけのメソッドとRouter/ActivatedRoute注入を削除した。Submitはフォーム送信ボタンのまま。復元要求、確認ダイアログ、詳細オプション、スタイル、APIクライアントは変更していない。

これはページ移動なのでnative linkとして扱い、href・Ctrlクリック・EnterをブラウザーとAngular Routerに任せる。通常クリックの移動先は従来と同じ。

## 単体テスト（検証済み）

実際のOptionsComponentテンプレートを使用。RouterTestingHarnessと実際のフォーム/RouterLink/ShipButtonを使い、無関係な子コントロールをCUSTOM_ELEMENTS_SCHEMAで分離した。注入サービスはmock。テンプレートをテスト内に複製したり、Node型をtest設定へ追加したりしない。

修正前（miseのbun.exe実体を直接実行、PowerShellで $env:VITEST_MAX_WORKERS = '1'）:

    bun run test:ci --include '**/options.navigation.spec.ts'
    Test Files 1 failed (1)
    Tests 3 failed | 2 passed (5)

通常/draft/directの3ケースでBUTTONではなくAとhrefが必要という期待が失敗した。guard拒否時の編集値維持とSubmitの独立は修正前から成功。

修正後:

    bun run test:ci --include '**/restore-flow/options/*.spec.ts'
    Test Files 6 passed (6)
    Tests 56 passed (56)

新規5件と既存51件。/restore/42、/restore-draft/draft-42、/restore-from-filesの各optionsから同じ親のselect-filesへ遷移し、Go backがsubmitを呼ばないこと、guard拒否時にURLと編集値が残ること、Submitが別のフォーム操作として残ることを確認。

最初のテスト準備ではnode:fsでテンプレートを読む方式がTS2591になったが、Nodeの型追加はせず実テンプレートのshallow renderingへ直した。この準備時の型エラーはアプリの赤テストには数えない。

## 型・書式・ビルド・ブラウザー（検証済み）

    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
    exit 0
    node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json
    exit 0
    node node_modules/prettier/bin/prettier.cjs --check projects/ngclient/src/app/restore-flow/options/options.component.ts projects/ngclient/src/app/restore-flow/options/options.component.html projects/ngclient/src/app/restore-flow/options/options.navigation.spec.ts e2e/restore-lifecycle.spec.ts
    All matched files use Prettier code style!
    bun run build:prod
    Application bundle generation complete. [43.968 seconds]
    exit 0
    bun run test:e2e e2e/restore-lifecycle.spec.ts
    4 passed (29.9s)

本番成果物・Chromiumで、既存の復元ライフサイクル3件と新規Backケース1件が成功。新規ケースではoptionsに進んでhrefを確認し、Ctrlクリックで別タブを開いても元の画面はoptionsのまま、Enterでは元のタブがselect-filesへ戻り、いずれもrestore POSTが0回であることを確認した。

APIはモック。別タブはリンク先URLへのdocumentを静的HTMLで応答し、タブ生成とURLだけを検証した。別タブでの認証・復元フロー全体を検証したものではない。元のタブでのEnter遷移は実際のAngularファイル選択画面を表示する。

## pushと証拠

- ブックマーク: codex/restore-options-back-link
- コミット: [daba6e30554643cb0be4143d248e4cf6bda8ca3e](https://github.com/JamBalaya56562/ngclient/commit/daba6e30554643cb0be4143d248e4cf6bda8ca3e)
- 親: 8edaeee84c0c0f4a48e75ae917195cb1047b15a5
- jj git push --remote origin -b codex/restore-options-back-link成功。PR・Issueコメントは投稿していない。

Git管理外のtmp/ngt-065にbefore.log、after.log、build.log、e2e.log、commit.txt、test-harness-node-types.logを保存。設定ファイル・依存パッケージ・node_modulesの変更なし。

未検証: 実サーバー、全unit/E2E suite、Firefox/WebKit。draft/directの相対URLはRouter単体テストで確認し、ブラウザーE2Eは保存済みbackupのフローで確認した。ホームカード・残るRouter使用箇所はNGT-066へ分ける。次の新規IDはNGT-067。