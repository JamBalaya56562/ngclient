# 現在のタスク台帳

状態照合: **2026-11-19**。[状態照合](evidence/2026-11-19-triage-refresh/verification.md)・[現行コード/実画面の調査](evidence/2026-11-19-current-behavior-audit/verification.md)。GitHubをIssue/PR状態の正本、このファイルを着手判断の正本とする。過去の試験結果は実行したSHAに限り、状態照合を動作の追試と扱わない。

## 現在地

- 検証済み: upstream/fork mainは `aaccdfa0351ca507894fb2381dc7224fef5f5f4c`。本体 upstream masterは `ebf0a72e8a78eb9ab8c981f579856657bfac9894`。両リポジトリでfetch済み。
- open Issueは6件（#126/#273/#409/#460/#462/#497、今回再取得）。PR #777〜783はすべてMERGED。#758〜776はすべてマージ済み。以前の#761/#766の先行マージ待ちは解消済み。
- 本体マージ待ちの実装済みngclientブランチは0本（2026-11-21照合）。[マージ済みの本体連携](#本体連携が完了した実装)と[本体側の対応が必要な課題](#本体側の対応とngclientの再開条件)を参照。
- 利用者の追加指示によりNGT-117/116/121、NGT-119/122、NGT-118のUI削除E2Eを実装し、独立したPR #779〜783で公開。[修正と検証](evidence/2026-11-19-fix-batch/verification.md)。[#460・#462・#126の本体作業](#本体側の対応とngclientの再開条件)は別セッション。

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
| [#460](https://github.com/duplicati/ngclient/issues/460) secondary宛先から復元 | NGT-053 / 本体マージ済み | [再開条件](#本体側の対応とngclientの再開条件) |
| [#462](https://github.com/duplicati/ngclient/issues/462) secondary宛先の削除   | NGT-054 / 本体マージ済み | [再開条件](#本体側の対応とngclientの再開条件) |
| [#126](https://github.com/duplicati/ngclient/issues/126) 検証schema            | NGT-055 / 本体契約の対応が先 | [再開条件](#本体側の対応とngclientの再開条件) |

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
| 後続 | NGT-081 / #273 | READY | Vitest と Playwright は導入済み。固定版 Duplicati の配布物を SHA-256 で検証し、手動 CI で既存の実サーバーE2E（バックアップ作成・実行・復元・ジョブ削除）を隔離実行する。失敗時は診断を保存し、成功を確認したら PR に `Closes #273`。追加のE2Eは個別に扱う。 |

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

## 本体連携が完了した実装

**検証済み（2026-11-21）**。upstream `main` の祖先に下記4件のマージコミットがあり、対応ブランチはローカル・`origin` とも整理済み。実装済みのngclientブランチで本体マージ待ちは0本。

| ID / 本体Issue | ngclientのマージ済みPR | 範囲 |
| --- | --- | --- |
| NGT-085 / duplicati#2310 | [#803](https://github.com/duplicati/ngclient/pull/803) / `69b0f1d06797` | グローバル設定のインポート。本体 [#7907](https://github.com/duplicati/duplicati/pull/7907) に対応。 |
| NGT-086 / duplicati#2701 | [#788](https://github.com/duplicati/ngclient/pull/788) / `e3990eec3078` | 次のスケジュール実行をスキップ。本体 [#7911](https://github.com/duplicati/duplicati/pull/7911) に対応。 |
| NGT-125 / duplicati#3188 | [#805](https://github.com/duplicati/ngclient/pull/805) / `ac79f1e3b2b4` | Aboutから実行した更新確認の結果を表示。 |
| NGT-126 / duplicati#6221 | [#804](https://github.com/duplicati/ngclient/pull/804) / `9d2534b831a8` | 復元結果をブラウザーでダウンロード。 |

[過去の更新・検証記録](evidence/2026-11-19-global-import-and-maintenance/verification.md)は当時のSHAでの記録。今回はマージとブランチ状態を照合した。

## 本体側の対応とngclientの再開条件

検証済み（2026-11-21）。本体PR #7929・#7928のマージを確認。両実装コミットは本体の `master@upstream` に含まれる。#126は本体側の設計・対応が先。

| ID / Issue | 本体の状態とAPI契約 | ngclient側の作業 |
| --- | --- | --- |
| NGT-053 / [#460](https://github.com/duplicati/ngclient/issues/460) | [本体 #7929](https://github.com/duplicati/duplicati/pull/7929) マージ済み（`49723ef8f238`）。`copytotemp?destination=<UrlKey>` が副宛先を参照する一時ジョブを作る。 | [#839](https://github.com/duplicati/ngclient/pull/839) 公開済み（`42f921e35cd8`）。隔離実サーバーで主2世代・副1世代、副の1世代のみ表示、復元内容一致を確認。Chromium 1件、全体2,692件、本番ビルド成功。 |
| NGT-054 / [#462](https://github.com/duplicati/ngclient/issues/462) | [本体 #7928](https://github.com/duplicati/duplicati/pull/7928) マージ済み（`53074e541edd`）。`DELETE /api/v1/backup/{id}` の `remote-destinations` で `primary` または副宛先の `UrlKey` を指定できる。 | 削除対象を画面で明示し、非選択の宛先が保持されることを隔離サーバーで確認する。 |
| NGT-055 / [#126](https://github.com/duplicati/ngclient/issues/126) | Min・Max・Patternなどの共有検証スキーマを設計する。以前のsysteminfo調査では216個の定義に `Validations` がなかった。 | スキーマ合意と本体対応後、OpenAPI生成型とUIへ反映し、既存の型検証との互換性を確認する。 |

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
