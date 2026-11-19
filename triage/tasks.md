# 現在のタスク台帳

状態照合: **2026-11-19**。[状態照合](evidence/2026-11-19-triage-refresh/verification.md)・[現行コード/実画面の調査](evidence/2026-11-19-current-behavior-audit/verification.md)。GitHubをIssue/PR状態の正本、このファイルを着手判断の正本とする。過去の試験結果は実行したSHAに限り、状態照合を動作の追試と扱わない。

## 現在地

- 検証済み: upstream/fork mainは `5c520f1311b7805bd26cf2e4ff420127e46b1d72`。本体 upstream masterは `f21a2245713cffb4dd020d8573c77e63592cfb66`。両リポジトリでfetch済み。
- ngclientのopen Issueは**7件**、open PRは**7件（#777〜783）**。#758〜776はすべてマージ済み。以前の#761/#766の先行マージ待ちは解消済み。
- 実装ブランチは**13本＝公開中7本＋本体マージ待ち6本**。local/originのSHA一致を確認。画像・証拠の固定参照4本と別workspace `claude-fixes` は維持。
- 利用者の追加指示によりNGT-117/116/121、NGT-119/122、NGT-118のUI削除E2Eを実装し、独立したPR #779〜783で公開。[修正と検証](evidence/2026-11-19-fix-batch/verification.md)。本体#460/#462/#126の対応は別セッション。

## 公開中のPR

| ID / Issue     | PR・ブランチ・現在head                                                                                                                          | 状態と範囲                                                                                                                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NGT-120        | [#777](https://github.com/duplicati/ngclient/pull/777) / `codex/live-browser-safe-ports` / `79dbfd8be5a2f0fdccc642e4db1687a533f988fc`           | PR_OPEN。live proxyの禁止ポート回避とbrowser CIのjob枠15分化。最新headのUnit Tests/Production BuildはSUCCESS。[検証](evidence/2026-11-19-maintenance/verification.md)。                                                                                        |
| NGT-047 / #328 | [#778](https://github.com/duplicati/ngclient/pull/778) / `codex/live-destination-url-preservation` / `2f67628310cdb4fbfed666d064f79c4dbc06670d` | PR_OPEN / Closes #328。本体#7832/#7860/#7898はマージ済み。実サーバー9種のAPI保存・UI27回保存、関連単体20件・型・整形・本番ビルド成功。最終照合でUnit Tests/Production BuildともSUCCESS。[検証](evidence/2026-11-19-issue328-live-regression/verification.md)。 |

#777と#778はmainから独立、互いのファイル重複なし。#778のliveテストには本体のURL-masking修正が必要。古いサーバーでの成功・全provider接続は保証しない。

## open Issue 7件の道筋

| Issue                                                                          | ID / 現在の判断                      | 次の一手・close条件                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [#328](https://github.com/duplicati/ngclient/issues/328) editorへの耐性        | NGT-047 / PR_OPEN                    | #778のレビュー・CI・merge待ち。Closesを付与済み。重ねて実装しない。                                                                                                                                                                                                                                    |
| [#273](https://github.com/duplicati/ngclient/issues/273) テスト整備            | NGT-081 / NGT-118                    | mainでlive 22ケース/8ファイルを列挙。作成・実行・復元・直接復元・世代削除・認証復帰等は既存。ジョブ自体のUI削除は#779へ追加済み（NGT-118）。通常CIはliveを除外。最小限のUI削除と継続live CIの範囲を揃え、既存成果を示してclose判断する。                                                               |
| [#497](https://github.com/duplicati/ngclient/issues/497) Signal Forms          | NGT-007 / NGT-119 / NGT-122          | ngModelがある28テンプレートを棚卸し（静的importグラフで26が到達）。旧Schedule/Filter2件、CVA内部、部分移行画面、通常UI状態を分離。28個の未移行フォームという意味ではない。Start-all（119）は#782、SSL証明書password（122）は#783で公開済み。次にMCP作成フォーム、設定画面はパネル単位で設計。          |
| [#409](https://github.com/duplicati/ngclient/issues/409) UI改善一覧            | NGT-052 / INVESTIGATE                | 現行HomeのStart/Edit/More actionsは名前あり。global速度制限の名前/説明は#781で修正（NGT-121、merge待ち）。共有Tooltipの急速な再表示の問題はNGT-123へ分離。進捗/現在ファイルのロジックと単体は既存だが実行中の全表示・通知の実色・主観的な配色/余白は未再検証。一部改善で全closeにしない。              |
| [#460](https://github.com/duplicati/ngclient/issues/460) secondary宛先から復元 | NGT-053 / INVESTIGATE / 本体契約相談 | copytotempは成功するが、そのGUIDへ宛先を変えてPUTするとHTTP 500（整数変換）。元ジョブは不変。単純なtemp URL差替え案は使えなかった。選んだUrlKey・秘密値・独立DB・secondaryの版差を扱う本体API/代替手順の設計が先。別方式まで不可能とは未検証。NGT-100とRestore画面の編集が重なるため実装前に差分調整。 |
| [#462](https://github.com/duplicati/ngclient/issues/462) secondary宛先の削除   | NGT-054 / INVESTIGATE / 本体契約相談 | 現行DELETEはdelete-remote-files/delete-local-db/forceのboolだけで宛先キーを選べない。Runnerのadditional設定展開はBackupOrSyncのみ。宛先単位の削除、非選択宛先/共有DB保持、部分失敗時のジョブ保持を本体と設計する。実削除の対象範囲は今回未検証。                                                       |
| [#126](https://github.com/duplicati/ngclient/issues/126) 検証schema            | NGT-055 / INVESTIGATE / 本体契約相談 | 実systeminfoで調べた216個の定義にValidationsは0件。現行ICommandLineArgumentにも項目なし。Min/Max/Pattern等の共有schemaを合意して本体→生成型→UIの順に実装する。既存enum/flagsや型検証だけで全closeにはしない。                                                                                          |

open一覧・既存コメントは今回再取得した。返信・公開コメントは投稿していない。動作の確認範囲は各検証記録を参照。

## 次の調査・実装順

NGT-117/116/121/118/119/122は実装・PR公開済みで重ねて着手しない。次はNGT-123の共有Tooltip再表示問題の範囲調整、NGT-081のlive CI、NGT-007の残りのフォーム（MCP/設定パネル）を調べる。

| 優先     | ID             | 状態                 | 範囲・完了条件                                                                                                                                                                                                                                                                                             |
| -------- | -------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 修正1    | NGT-117        | PR_OPEN / #779       | ID単位の詳細ロード、読込み/失敗中の削除抑止、Retry、古いroute確認抑止。単体15件（新規3件赤→緑）、既存E2E5件、実削除E2E2件・型・本番ビルド成功。                                                                                                                                                            |
| 修正2    | NGT-116        | PR_OPEN / #780       | 生MarkdownをparseしAngularのHTMLサニタイズを維持。新規1件赤→単体7件緑、通知からのE2E1件・実サーバー1件、本番ビルド成功。                                                                                                                                                                                   |
| 後続1    | NGT-118 / #273 | PR_OPEN / #779へ同梱 | 実サーバーで作成/実行後のジョブをcold routeからUI削除。取消で不変、DB保持/削除2ケース、宛先SHA256保持。ngclientだけで完結し本体待ちなし。                                                                                                                                                                  |
| 後続2    | NGT-119 / #497 | PR_OPEN / #782       | after-actionを公式form/FormFieldへ移行。既存8件維持、実UI選択/取消確認、本番ビルド成功。selected Setは通常状態のまま。                                                                                                                                                                                     |
| 評価     | NGT-005        | READY                | Aria/CDK適合評価。ツリーのARIA・選択・キーボード契約を照合し、導入で解決できる観測課題を確認。一括置換を目的にしない。先行PRはマージ済み。                                                                                                                                                                 |
| 範囲調整 | NGT-081 / #273 | INVESTIGATE          | live CIのサーバー固定版/SHA・取得検証・隔離・終了処理・失敗artifact・実行契機を決める。現行workflowにlive実行設定がないことを今回確認。#777とfixture/workflowが重なるため先行merge推奨（機能上の必須依存とは未確定）。#778を含む全liveに必要な本体修正の公式配布への収録も確認してからサーバーを固定する。 |

追加の独立候補（今回登録、未実装）:

| 優先  | ID                   | 状態           | 範囲・完了条件                                                                                                                                                                                       |
| ----- | -------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 修正3 | NGT-121 / #409の一部 | PR_OPEN / #781 | aria-labelとShipTooltip、Tab/Enter/Cancel。新規E2E赤→緑、関連単体33件、実サーバー確認。CIで共有Tooltipの再表示条件を踏んだためテストsetupを分離し30回成功。共有ライブラリの再表示問題自体はNGT-123。 |
| 後続3 | NGT-122 / #497の一部 | PR_OPEN / #783 | PFX passwordだけSignal Forms化。既存15件維持、実APIで拒否後の入力保持を確認。本番ビルド/型成功。ファイル選択は通常状態。                                                                             |

READYは既知の外部ブロッカーなしであり、実装済み/動作検証済みの意味ではない。着手前にopen PRと準備済み差分を再確認する。

## 今回公開した5本（すべてmain 5c520f1311b7から独立）

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
| NGT-007 / #497 | INVESTIGATE | forms-inventory.jsonに28テンプレートの行番号と静的到達性。CVAのsize/timespan/file-drop内部は別扱い、既にFormFieldを使うOptions/Schedule等を丸ごと未移行と扱わない。MCPのsignalオブジェクト、Settingsの保存/disabled/API契約を次に分割。 |
| NGT-111        | INVESTIGATE | Nightly更新チャンネル。配布状況とサーバーの扱いの確認が先。今回は配布未調査。                                                                                                                                                           |
| NGT-112        | INVESTIGATE | 設定なしのコマンド画面。#761/#766先行待ちは解消済み。利用要件/API契約と現行Commandline差分の照合が先。                                                                                                                                  |
| NGT-008        | DEFERRED    | SSR・画像最適化等。導入根拠となる性能/UX課題は未観測。                                                                                                                                                                                  |

## 実装済み・本体PRマージ待ち6本

検証済み: NGT-125以外の5件はOPEN・merged=false。NGT-125の本体ブランチはpush済みでPR未提出。各headは本体upstream masterの祖先ではない。新規ngclient PRはまだ出さない。本体merge後にAPI契約/実動作、重複、テスト・ビルド、本文のSHAとwhole-Issue範囲を再確認する。

| ID / 本体Issue           | ngclientブランチ / 現在head                                                          | 本体PR / 現在head                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| NGT-085 / duplicati#2310 | `feat/export-global-options` / `cf7e746577e57a198dbce308d1ea0787909603e6`            | [#7907](https://github.com/duplicati/duplicati/pull/7907) / `1015f8d7d90fe18f55dbb0e15fc49f8a92cfdba7` |
| NGT-086 / duplicati#2701 | `feat/skip-next-scheduled-run` / `ee552d1d96d7cf0eb2ca21c9d2eba97011bbe945`          | [#7911](https://github.com/duplicati/duplicati/pull/7911) / `4fc5c6a4d3b843fdbb898e829313536985da7634` |
| NGT-098 / duplicati#3397 | `feat/compact-progress` / `cfc57e5a48279cbf3cbc2d663dd3f0d97812cf4b`                 | [#7912](https://github.com/duplicati/duplicati/pull/7912) / `56376b7b5e6878e460f1974adda1d86e6d08ccba` |
| NGT-100 / duplicati#5239 | `feat/restore-resume-drafts` / `8f154b8085838c7361d8730b2d1d28ad097c8811`            | [#7914](https://github.com/duplicati/duplicati/pull/7914) / `406d079d929165fc71fc5cbf488b017c8229f508` |
| NGT-101 / duplicati#6611 | `feat/show-db-encryption-preload-paths` / `e63fe51df1118b48cc35884efed767f056448fcd` | [#7915](https://github.com/duplicati/duplicati/pull/7915) / `aadc206da7ee6496650dc391e1e2281bac667229` |
| NGT-125 / duplicati#3188 | `feat/show-update-check-result` / `4592244d6b5df32dbdc7c042a02d1d16b5e1a889`         | PR未提出 / `feat/report-update-check-errors` / `28d5b2d579efa76aa3e49e199cff28a38a233802`              |

NGT-125（2026-11-19）: Aboutの「Check for updates」を押した後、本体が返す`UpdateCheckFinished`が変わったら、失敗の理由か「最新版」を表示する。古い本体は終了時刻を返さないので何も出さない。検証済み: general.component.spec 14件緑（表示を消すと3件赤）、e2e/update-check.spec 3件緑（表示を消すと新テストが赤、ポート3000がWindows予約範囲のため3100の一時設定で実行）。本体側は統合テストと単体テストが緑、実サーバーのngaxで「Update checks are disabled」の表示を確認。ngclientを実サーバーにつないだ確認は未検証。

NGT-086は#768の現行ダイアログへ統合済み。関連2ファイル10テスト・型・本番ビルドの過去記録はあるが、新ダイアログ経由の実サーバー操作は未検証。現在headの新規追試と取り違えない。

## 完了・履歴の入口

- #758〜776の完了状態と固定IDは[completed.md](completed.md)へ。候補表にマージ済みPRの待ち事項を残さない。
- NGT-115の本体[#7886](https://github.com/duplicati/duplicati/pull/7886)はMERGED。旧UIテーマ保持をngclientで重ねて実装しない。
- 本体[#7896](https://github.com/duplicati/duplicati/pull/7896)もMERGED。#766との組み合わせの動作は今回は未検証。
- 過去の検証・移管18件・公開PRの試験と制限は[検証索引](verification.md)から辿る。一次証拠は保持する。

## 運用

- IDは固定・再利用しない。次の新規IDは**NGT-124**。
- 状態: READY / INVESTIGATE / PR_OPEN / BLOCKED / WAITING / DEFERRED。着手時はACTIVE・担当・日付・ブックマークを記録。
- 最新mainから独立して実装し、triageを実装の親にしない。stack後段は前段merge後に公開。画像固定参照4本と別workspaceを維持。
- 主張は検証済み／ドキュメント根拠／推測に分け、未確認は未検証と明記。過去の試験を現在SHAで再実行したと書かない。
- PR/公開コメントは依頼時のみ。whole-Issueを満たす場合だけFixes/Closes、部分対応はRefsと残件。単一Playwright設定を維持。
- 現在地を置き換え、経過を末尾に積み重ねない。完了はcompleted.md、詳細はevidenceへ移す。
