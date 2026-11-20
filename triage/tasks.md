# 現在のタスク台帳

状態照合: **2026-11-19**。[状態照合](evidence/2026-11-19-triage-refresh/verification.md)・[現行コード/実画面の調査](evidence/2026-11-19-current-behavior-audit/verification.md)。GitHubをIssue/PR状態の正本、このファイルを着手判断の正本とする。過去の試験結果は実行したSHAに限り、状態照合を動作の追試と扱わない。

## 現在地

- 検証済み: upstream/fork mainは `aaccdfa0351ca507894fb2381dc7224fef5f5f4c`。本体 upstream masterは `ebf0a72e8a78eb9ab8c981f579856657bfac9894`。両リポジトリでfetch済み。
- open Issueは6件（#126/#273/#409/#460/#462/#497、今回再取得）。PR #777〜783はすべてMERGED。#758〜776はすべてマージ済み。以前の#761/#766の先行マージ待ちは解消済み。
- 実装ブランチは**4本＝公開1本（#788）＋本体待ち3本**。local/originのSHA一致を確認。画像・証拠の固定参照4本と別workspace `claude-fixes` は維持。
- 利用者の追加指示によりNGT-117/116/121、NGT-119/122、NGT-118のUI削除E2Eを実装し、独立したPR #779〜783で公開。[修正と検証](evidence/2026-11-19-fix-batch/verification.md)。本体#460/#462/#126の対応は別セッション。

## 今回マージ済みのPR

| ID / Issue     | PR・ブランチ・現在head                                                                                                                          | 状態と範囲                                                                                                                                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NGT-120        | [#777](https://github.com/duplicati/ngclient/pull/777) / `codex/live-browser-safe-ports` / `79dbfd8be5a2f0fdccc642e4db1687a533f988fc`           | MERGED。live proxyの禁止ポート回避とbrowser CIのjob枠15分化。最新headのUnit Tests/Production BuildはSUCCESS。[検証](evidence/2026-11-19-maintenance/verification.md)。                                                                                        |
| NGT-047 / #328 | [#778](https://github.com/duplicati/ngclient/pull/778) / `codex/live-destination-url-preservation` / `2f67628310cdb4fbfed666d064f79c4dbc06670d` | MERGED / Closes #328。本体#7832/#7860/#7898はマージ済み。実サーバー9種のAPI保存・UI27回保存、関連単体20件・型・整形・本番ビルド成功。最終照合でUnit Tests/Production BuildともSUCCESS。[検証](evidence/2026-11-19-issue328-live-regression/verification.md)。 |

#777と#778はmainから独立、互いのファイル重複なし。#778のliveテストには本体のURL-masking修正が必要。古いサーバーでの成功・全provider接続は保証しない。

## open Issue 6件の道筋

| Issue                                                                          | ID / 現在の判断                      | 次の一手・close条件                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [#273](https://github.com/duplicati/ngclient/issues/273) テスト整備            | NGT-081 / NGT-118                    | mainでlive 22ケース/8ファイルを列挙。作成・実行・復元・直接復元・世代削除・認証復帰等は既存。ジョブ自体のUI削除は#779へ追加済み（NGT-118）。通常CIはliveを除外。最小限のUI削除と継続live CIの範囲を揃え、既存成果を示してclose判断する。                                                               |
| [#497](https://github.com/duplicati/ngclient/issues/497) Signal Forms          | NGT-007 / NGT-119 / NGT-122          | [NGT-007の残りの実装順と検証手順](#ngt-007-signal-forms) |
| [#409](https://github.com/duplicati/ngclient/issues/409) UI改善一覧            | NGT-052 / INVESTIGATE                | 現行HomeのStart/Edit/More actionsは名前あり。global速度制限の名前/説明は#781で修正（NGT-121、マージ済み）。共有Tooltipの急速な再表示の問題はNGT-123へ分離。進捗/現在ファイルのロジックと単体は既存だが実行中の全表示・通知の実色・主観的な配色/余白は未再検証。一部改善で全closeにしない。             |
| [#460](https://github.com/duplicati/ngclient/issues/460) secondary宛先から復元 | NGT-053 / INVESTIGATE / 本体契約相談 | copytotempは成功するが、そのGUIDへ宛先を変えてPUTするとHTTP 500（整数変換）。元ジョブは不変。単純なtemp URL差替え案は使えなかった。選んだUrlKey・秘密値・独立DB・secondaryの版差を扱う本体API/代替手順の設計が先。別方式まで不可能とは未検証。NGT-100とRestore画面の編集が重なるため実装前に差分調整。 |
| [#462](https://github.com/duplicati/ngclient/issues/462) secondary宛先の削除   | NGT-054 / INVESTIGATE / 本体契約相談 | 現行DELETEはdelete-remote-files/delete-local-db/forceのboolだけで宛先キーを選べない。Runnerのadditional設定展開はBackupOrSyncのみ。宛先単位の削除、非選択宛先/共有DB保持、部分失敗時のジョブ保持を本体と設計する。実削除の対象範囲は今回未検証。                                                       |
| [#126](https://github.com/duplicati/ngclient/issues/126) 検証schema            | NGT-055 / INVESTIGATE / 本体契約相談 | 実systeminfoで調べた216個の定義にValidationsは0件。現行ICommandLineArgumentにも項目なし。Min/Max/Pattern等の共有schemaを合意して本体→生成型→UIの順に実装する。既存enum/flagsや型検証だけで全closeにはしない。                                                                                          |

Issue一覧・既存コメントは前回調査時に取得した。返信・公開コメントは投稿していない。動作の確認範囲は各検証記録を参照。

## 次の調査・実装順

NGT-117/116/121/118/119/122は実装済みで重ねて着手しない。NGT-123の共有Tooltip再表示問題とNGT-081のlive CIは別に進める。Signal Formsの作業は[NGT-007の実装順](#ngt-007-signal-forms)を参照する。

| 優先     | ID             | 状態                | 範囲・完了条件                                                                                                                                                                                                                                                                                             |
| -------- | -------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 修正1    | NGT-117        | MERGED / #779       | ID単位の詳細ロード、読込み/失敗中の削除抑止、Retry、古いroute確認抑止。単体15件（新規3件赤→緑）、既存E2E5件、実削除E2E2件・型・本番ビルド成功。                                                                                                                                                            |
| 修正2    | NGT-116        | MERGED / #780       | 生MarkdownをparseしAngularのHTMLサニタイズを維持。新規1件赤→単体7件緑、通知からのE2E1件・実サーバー1件、本番ビルド成功。                                                                                                                                                                                   |
| 後続1    | NGT-118 / #273 | MERGED / #779へ同梱 | 実サーバーで作成/実行後のジョブをcold routeからUI削除。取消で不変、DB保持/削除2ケース、宛先SHA256保持。ngclientだけで完結し本体待ちなし。                                                                                                                                                                  |
| 後続2    | NGT-119 / #497 | MERGED / #782       | after-actionを公式form/FormFieldへ移行。既存8件維持、実UI選択/取消確認、本番ビルド成功。selected Setは通常状態のまま。                                                                                                                                                                                     |
| 評価     | NGT-005        | READY               | Aria/CDK適合評価。ツリーのARIA・選択・キーボード契約を照合し、導入で解決できる観測課題を確認。一括置換を目的にしない。先行PRはマージ済み。                                                                                                                                                                 |
| 範囲調整 | NGT-081 / #273 | INVESTIGATE         | live CIのサーバー固定版/SHA・取得検証・隔離・終了処理・失敗artifact・実行契機を決める。現行workflowにlive実行設定がないことを今回確認。#777とfixture/workflowが重なるため先行merge推奨（機能上の必須依存とは未確定）。#778を含む全liveに必要な本体修正の公式配布への収録も確認してからサーバーを固定する。 |

追加の独立候補（今回登録、未実装）:

| 優先  | ID                   | 状態          | 範囲・完了条件                                                                                                                                                                                       |
| ----- | -------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 修正3 | NGT-121 / #409の一部 | MERGED / #781 | aria-labelとShipTooltip、Tab/Enter/Cancel。新規E2E赤→緑、関連単体33件、実サーバー確認。CIで共有Tooltipの再表示条件を踏んだためテストsetupを分離し30回成功。共有ライブラリの再表示問題自体はNGT-123。 |
| 後続3 | NGT-122 / #497の一部 | MERGED / #783 | PFX passwordだけSignal Forms化。既存15件維持、実APIで拒否後の入力保持を確認。本番ビルド/型成功。ファイル選択は通常状態。                                                                             |

READYは既知の外部ブロッカーなしであり、実装済み/動作検証済みの意味ではない。着手前にopen PRと準備済み差分を再確認する。

## 今回マージ済みの5本（下表のSHAはマージ前の検証対象）

| PR                                                     | ID           | ブランチ / 現在SHA                                                                |
| ------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------- |
| [#779](https://github.com/duplicati/ngclient/pull/779) | NGT-117・118 | codex/load-delete-backup-by-id / 6d96a5dcb6291c77977537f94bb007abd2a4b585         |
| [#780](https://github.com/duplicati/ngclient/pull/780) | NGT-116      | codex/changelog-plain-markdown / 2d0ea42e14f1e6d9c7286324a3ce3f92162318e8         |
| [#781](https://github.com/duplicati/ngclient/pull/781) | NGT-121      | codex/name-throttle-control / ce3c547c7082b775eca5c9ea55c93b28334ed732            |
| [#782](https://github.com/duplicati/ngclient/pull/782) | NGT-119      | codex/start-all-signal-form / fbc7c971127d2d94b23423c5645ebbe421366197            |
| [#783](https://github.com/duplicati/ngclient/pull/783) | NGT-122      | codex/certificate-password-signal-form / 3ad12474c0f4d750caff77ec5e64ee81636de828 |

新たな確認事項（今回の合意済み3不具合とは別、未修正）:

- **NGT-123 / INVESTIGATE**: ShipTooltipのmouseleave後の短いcleanup区間で再hoverするとpopoverが閉じたまま残る。#781の最初のCIと、実サーバー上の60ms/100ms clockプローブで確認。既存ライブラリの問題で、今回のaria-label修正が原因ではない。共有ライブラリの修正/版更新/限定パッチの範囲を決めてから別対応。#781の検証は初期画面の独立シナリオにし、通常のtooltip/keyboardテスト自体は維持。
- 削除checkboxの既存アクセシビリティ名はNGT-005の監査対象。今回の実削除E2Eは既存テストと同じ節見出しでスコープした。名前の修正を同じPRに混ぜていない。

## その他の調査・保留

| ID             | 状態        | 次の判断                                                                                                                                                                                                                                |
| -------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NGT-007 / #497 | READY | [残りの実装順・準備済みブランチ・完了条件](#ngt-007-signal-forms) |
| NGT-111        | INVESTIGATE | Nightly更新チャンネル。配布状況とサーバーの扱いの確認が先。今回は配布未調査。                                                                                                                                                           |
| NGT-112        | INVESTIGATE | 設定なしのコマンド画面。#761/#766先行待ちは解消済み。利用要件/API契約と現行Commandline差分の照合が先。                                                                                                                                  |
| NGT-008        | DEFERRED    | SSR・画像最適化等。導入根拠となる性能/UX課題は未観測。                                                                                                                                                                                  |

## 実装済み4本：公開1本・本体待ち3本

検証済み: #784〜786はマージ・ブランチ削除済み。本体#7911もマージ済みでSkip UIは#788公開。本体#7907はレビューに合わせたimport時選択へ更新済み・未マージのためngclient PR保留。NGT-125/126は本体PR未提出。今回の[更新・全体検証](evidence/2026-11-19-global-import-and-maintenance/verification.md)参照。

| ID / 本体Issue                                                                            | ngclientブランチ / 現在head                                                  | 本体PR / 現在head                                                                                      |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| NGT-085 / duplicati#2310                                                                  | `feat/export-global-options` / `3ad275090282438962be8f90069324b25dea8a94`    | [#7907](https://github.com/duplicati/duplicati/pull/7907) / `a652e9f71c2e0f5ee3f31dcd9e02ec8934654071` |
| NGT-086 / duplicati#2701 / PR_OPEN [#788](https://github.com/duplicati/ngclient/pull/788) | `feat/skip-next-scheduled-run` / `21c309af628669c801fceadb3b8e9671bf84a9cf`  | [#7911](https://github.com/duplicati/duplicati/pull/7911) / `f38eabca182e8b8601c45c8271f05f1b3cd4534b` |
| NGT-125 / duplicati#3188                                                                  | `feat/show-update-check-result` / `15acd674a16b91d38491648837574eff3c38f4f1` | PR未提出 / `feat/report-update-check-errors` / `28d5b2d579efa76aa3e49e199cff28a38a233802`              |
| NGT-126 / duplicati#6221                                                                  | `feat/restore-download` / `cd72dfa35231134663b6f8e4b59d14cc6bc47b79`         | PR未提出 / `feat/restore-download` / `3f2e90abaa59028d8e07ca92862b700d082a58e0`                        |

NGT-125（2026-11-19）: Aboutの「Check for updates」を押した後、本体が返す`UpdateCheckFinished`が変わったら、失敗の理由か「最新版」を表示する。古い本体は終了時刻を返さないので何も出さない。検証済み: general.component.spec 14件緑（表示を消すと3件赤）、e2e/update-check.spec 3件緑（表示を消すと新テストが赤、ポート3000がWindows予約範囲のため3100の一時設定で実行）。本体側は統合テストと単体テストが緑、実サーバーのngaxで「Update checks are disabled」の表示を確認。ngclientを実サーバーにつないだ確認は未検証。

NGT-126（2026-11-19）: 復元オプションに「Download in the browser」を足し、選ぶと`download: true`・パスなしで復元を要求する。本体が拡張`v1:backup:restore-download`を報告するときだけ出す。完了時の通知（action `restore:download:{id}`）にDownloadボタンを出し、`restore-download`の単一操作トークンで`/api/v1/restore-download/{id}`を開く。検証済み: e2e restore-lifecycle・notifications・restore-destination-url・restore-saved-destinations 16件緑（要求のフラグと通知のボタンを外すと新テスト2件赤、選択肢を外すと復元のテストが赤。3100の一時設定で実行）、restore-flow・notificationsの単体spec 191件緑（options.navigation.specのSysinfoStateモックに`hasRestoreDownload`を追加）。本体側は結合テスト4件緑、実サーバーのngaxでzipの取得まで確認。ngclientを実サーバーにつないだ確認は未検証。

NGT-086は#768の現行ダイアログへ統合済み。関連2ファイル10テスト・型・本番ビルドの過去記録はあるが、新ダイアログ経由の実サーバー操作は未検証。現在headの新規追試と取り違えない。

## NGT-007 Signal Forms

**検証済み（2026-11-20の棚卸し）**。upstream `main` は `df293df38ed6e01a6d7f33463756ea9f6175f264`。`jj file search -r main@upstream -p 'ngModel|formControlName|\[formControl\]' 'glob:projects/ngclient/src/app/**/*.html'` と、未マージのブックマークの差分・GitHubの公開PRを照合した。復元オプションだけで `formControlName` が33か所ある。これはバインディングの数で、移行件数とは別。

- **OPEN**。[#818〜#827の公開PR](https://github.com/duplicati/ngclient/pulls?q=is%3Apr+is%3Aopen+%23497)。Filen認証コード、許可ホスト名、宛先の詳細オプション、宛先パス参照、FolderTree、FileTree、Duplicati Storage ID、Password、ソースパス一括編集、キュー完了スクリプト。動的な宛先の入力型でmainに残る該当箇所は、公開中の変更と照合して重複着手を避ける。
- **PUSHED**。下記6本は `origin` に用意済み。公開前に最新mainとの差分とCI対象SHAを確認する。

| ブランチ（`codex/` 以下） | 対象 |
| --- | --- |
| `signal-form-bulk-backup-filters` | バックアップフィルターの一括編集 |
| `signal-form-purge-manual-path` | ファイル削除のパス手入力 |
| `signal-form-run-after-always` | 先行ジョブが失敗・停止しても実行するチェック |
| `signal-form-advanced-options-text` | バックアップ詳細オプションのテキスト編集 |
| `signal-form-compare-version-pickers` | 版比較のFrom/To選択 |
| `signal-form-restore-version-picker` | 復元する世代の選択 |

### 残りの実装順

**推測（作業量）**。下表の10領域で、関連する操作をまとめて10〜15 PR程度。依存しない項目は同じ回に複数本準備できる。

| 順 | 領域 | 実装と確認 |
| --- | --- | --- |
| 1 | MCPトークン | 作成フォームの権限・有効期限をまとめる。エージェント切替は選択後の状態初期化も確認。作成リクエストと権限別の入力表示を照合する。 |
| 2 | サーバー設定 | 保存処理ごとに分ける。テーマ・言語、タイムゾーン、アイドルログアウト・起動待機時間、電源・利用統計を候補にし、既定値・設定済み値・保存失敗と再読込を確認する。 |
| 3 | ファイル削除の世代選択 | 世代を変更したときにパス選択・検索を解除し、選んだ世代のツリーをロードすることを確認する。準備済みの手入力移行とは変更箇所を分ける。 |
| 4 | バックアップ保持ポリシー | 各ポリシーの選択と条件付き入力を確認する。既存設定を読み込み、保存するDTOが一致することを確かめる。 |
| 5 | 詳細オプションの個別編集 | オプション名・値の編集を扱う。一括テキスト移行とは変更箇所を分け、型変換、未知のキー、既存値の保持を確認する。 |
| 6 | フィルターの種類・式とソースのサイズ条件 | 現行NewFilterComponentで種類を選んで式を編集し、親から値が戻っても種類が変わらないことを確認する。サイズ条件は別ブランチにし、値・単位・解除を確認する。 |
| 7 | スケジュール | プリセット、日付ピッカー、先行ジョブ選択を確認する。日付のローカル解釈、プリセット変更時の既定値、保存・再読込後の先行ジョブを維持する。 |
| 8 | 副宛先の同期条件 | 同期モード、間隔、件数をまとめる。副宛先を追加・削除しても値が別の行へ移らず、保存・再読込後も保持されることを確認する。 |
| 9 | 復元のファイル選択フォーム | 手入力・ツリー選択・パスフレーズの状態と画面遷移を確認する。世代選択の準備済み変更とは別に扱う。 |
| 10 | 復元オプション | 復元先、既存ファイルの扱い、権限・メタデータ、出力形式とバックエンド固有の分岐を棚卸しする。変更前のリクエストをテストで固定し、条件付き表示・既定値・戻る操作・実行時のDTOを照合する。同じフォームモデルに依存する変更はレビュー可能な単位に分け、先行がマージされてから後続を出す。 |

### 実装・検証・完了の手順

1. `jj git fetch --all-remotes` 後、最新の `main@upstream`、公開PR、準備済みブランチを照合する。各作業は最新mainから独立して始める。既にマージされた結果がある場合は、表より現行コードを優先する。
2. 既存の信号と `form()`、`[formField]` を使い、保存・解除・読み直しの経路を保つ。ShipSelectでネイティブ入力へ直接接続したときの `NG0600` は版比較のテストで観測済み。既存の `NullableTextControl` を使える箇所は再利用し、候補のクリック選択と値の再描画をブラウザーで確認する。
3. 各ブランチで対象specと `bun run build:prod` を実行する。選択欄・条件付き表示・入力確定の変更は既存Playwrightも使う。設定の保存と復元は、モックで確認したリクエストと実サーバーで確認した結果を区別して記録する。検証したSHAとコマンド・結果を記録してからpushする。
4. 部分移行はPR本文で `Refs #497` とする。完了判定前に、`ngModel` とReactive Formsの再棚卸しを行い、現行画面の入力、既存のSignal Formsに接続された共通コントロールの内部、旧画面、UIだけの選択状態を確認する。内部の互換モデルの扱いや残す項目に判断が必要なら先に記録し、合意した範囲の移行が完了するPRで `Fixes #497` を使う。

## 完了・履歴の入口

- #758〜776の完了状態と固定IDは[completed.md](completed.md)へ。候補表にマージ済みPRの待ち事項を残さない。
- NGT-115の本体[#7886](https://github.com/duplicati/duplicati/pull/7886)はMERGED。旧UIテーマ保持をngclientで重ねて実装しない。
- 本体[#7896](https://github.com/duplicati/duplicati/pull/7896)もMERGED。#766との組み合わせの動作は今回は未検証。
- 過去の検証・移管18件・公開PRの試験と制限は[検証索引](verification.md)から辿る。一次証拠は保持する。

## 運用

- IDは固定・再利用しない。次の新規IDは**NGT-127**。
- 状態: READY / INVESTIGATE / PR_OPEN / MERGED / BLOCKED / WAITING / DEFERRED。着手時はACTIVE・担当・日付・ブックマークを記録。
- 最新mainから独立して実装し、triageを実装の親にしない。stack後段は前段merge後に公開。画像固定参照4本と別workspaceを維持。
- 主張は検証済み／ドキュメント根拠／推測に分け、未確認は未検証と明記。過去の試験を現在SHAで再実行したと書かない。
- PR/公開コメントは依頼時のみ。whole-Issueを満たす場合だけFixes/Closes、部分対応はRefsと残件。単一Playwright設定を維持。
- 現在地を置き換え、経過を末尾に積み重ねない。完了はcompleted.md、詳細はevidenceへ移す。

公開前の指定テスト・Fixes・実サーバー未検証の引継ぎは[今回の記録](evidence/2026-11-19-global-import-and-maintenance/verification.md)参照。NGT-085は旧export時checkboxからimport時ignore/merge/applyへ更新済みで、旧実装を再実装しない。
