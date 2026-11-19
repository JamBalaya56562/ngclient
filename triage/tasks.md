# 現在のタスク台帳

状態照合: **2026-11-19**。[状態照合](evidence/2026-11-19-triage-refresh/verification.md)・[現行コード/実画面の調査](evidence/2026-11-19-current-behavior-audit/verification.md)。GitHubをIssue/PR状態の正本、このファイルを着手判断の正本とする。過去の試験結果は実行したSHAに限り、状態照合を動作の追試と扱わない。

## 現在地

- 検証済み: upstream/fork mainは `5c520f1311b7805bd26cf2e4ff420127e46b1d72`。本体 upstream masterは `f21a2245713cffb4dd020d8573c77e63592cfb66`。両リポジトリでfetch済み。
- ngclientのopen Issueは**7件**、open PRは**2件（#777・#778）**。#758〜776はすべてマージ済み。以前の#761/#766の先行マージ待ちは解消済み。
- 実装ブランチは**7本＝公開中2本＋本体マージ待ち5本**。local/originのSHA一致を確認。画像・証拠の固定参照4本と別workspace `claude-fixes` は維持。
- 今回は状態照合に加えて現行mainの本番ビルド・隔離実サーバー調査・関連単体60件を実行。NGT-116/117を再現し、新規NGT-121を確認した。製品コードの修正・PR/コメント投稿は行わない。

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
| [#273](https://github.com/duplicati/ngclient/issues/273) テスト整備            | NGT-081 / NGT-118                    | mainでlive 22ケース/8ファイルを列挙。作成・実行・復元・直接復元・世代削除・認証復帰等は既存。ジョブ自体のUI削除は未収録でNGT-118へ。通常CIはliveを除外。最小限のUI削除と継続live CIの範囲を揃え、既存成果を示してclose判断する。                                                                       |
| [#497](https://github.com/duplicati/ngclient/issues/497) Signal Forms          | NGT-007 / NGT-119 / NGT-122          | ngModelがある28テンプレートを棚卸し（静的importグラフで26が到達）。旧Schedule/Filter2件、CVA内部、部分移行画面、通常UI状態を分離。28個の未移行フォームという意味ではない。独立した小範囲はStart-all（119）とSSL証明書のpassword（122）。次にMCP作成フォーム、設定画面はパネル単位で設計。              |
| [#409](https://github.com/duplicati/ngclient/issues/409) UI改善一覧            | NGT-052 / INVESTIGATE                | 現行HomeのStart/Edit/More actionsは名前あり。global速度制限ボタンだけアクセシビリティ名なし・hover説明なしを実画面で確認（NGT-121）。進捗/現在ファイルのロジックと単体は既存だが実行中の全表示・通知の実色・主観的な配色/余白は未再検証。一部改善で全closeにしない。                                   |
| [#460](https://github.com/duplicati/ngclient/issues/460) secondary宛先から復元 | NGT-053 / INVESTIGATE / 本体契約相談 | copytotempは成功するが、そのGUIDへ宛先を変えてPUTするとHTTP 500（整数変換）。元ジョブは不変。単純なtemp URL差替え案は使えなかった。選んだUrlKey・秘密値・独立DB・secondaryの版差を扱う本体API/代替手順の設計が先。別方式まで不可能とは未検証。NGT-100とRestore画面の編集が重なるため実装前に差分調整。 |
| [#462](https://github.com/duplicati/ngclient/issues/462) secondary宛先の削除   | NGT-054 / INVESTIGATE / 本体契約相談 | 現行DELETEはdelete-remote-files/delete-local-db/forceのboolだけで宛先キーを選べない。Runnerのadditional設定展開はBackupOrSyncのみ。宛先単位の削除、非選択宛先/共有DB保持、部分失敗時のジョブ保持を本体と設計する。実削除の対象範囲は今回未検証。                                                       |
| [#126](https://github.com/duplicati/ngclient/issues/126) 検証schema            | NGT-055 / INVESTIGATE / 本体契約相談 | 実systeminfoで調べた216個の定義にValidationsは0件。現行ICommandLineArgumentにも項目なし。Min/Max/Pattern等の共有schemaを合意して本体→生成型→UIの順に実装する。既存enum/flagsや型検証だけで全closeにはしない。                                                                                          |

open一覧・既存コメントは今回再取得した。返信・公開コメントは投稿していない。動作の確認範囲は各検証記録を参照。

## 次の調査・実装順

現行mainで再現できた不具合から直す。優先順は **NGT-117 → NGT-116 → NGT-121**。その後、NGT-118のUI削除E2EとNGT-119/122の小さなフォーム移行へ進む。

| 優先     | ID             | 状態             | 範囲・完了条件                                                                                                                                                                                                                                                                                             |
| -------- | -------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 修正1    | NGT-117        | READY / 再現済み | 削除URLのcold loadでは3秒後も名前が空でDeleteボタンは有効。GET backupは出ず、Home経由なら正しい名前。共有一覧キャッシュへの依存を外してIDから読込み、未取得/取得失敗中は削除を無効化。直接URL・reload・ルート切替・Sync・共有DBを回帰検証。                                                                |
| 修正2    | NGT-116        | READY / 再現済み | 実APIにないAngularセキュリティ診断URLがChangelog末尾へ混入。SafeValue.toString()後にMarkdown化している。生のMarkdownを処理しAngularのHTMLサニタイズを保持する方針。診断文言非表示・見出し/リンク・from-update切替・悪意HTMLの回帰検証。                                                                    |
| 後続1    | NGT-118 / #273 | READY            | Homeの現行操作ダイアログからUI削除する実サーバーE2E。取消で変更なし→確認後にジョブと選んだローカルDBだけ削除→宛先ファイルのハッシュ保持。非共有の通常ジョブを使う。既存backup-restore.spec.tsを重複編集せずfixtureを再利用。                                                                               |
| 後続2    | NGT-119 / #497 | READY            | home/start-all-dialogのafter-actionだけをSignal Formsへ。残存ngModelを今回ソース確認済み。None/null、未対応値のNone戻し、候補/選択順、disabled、Cancel、送信値を保持。Shutdown等はモック検証。Set/checkboxを機械的にフォーム化しない。                                                                     |
| 評価     | NGT-005        | READY            | Aria/CDK適合評価。ツリーのARIA・選択・キーボード契約を照合し、導入で解決できる観測課題を確認。一括置換を目的にしない。先行PRはマージ済み。                                                                                                                                                                 |
| 範囲調整 | NGT-081 / #273 | INVESTIGATE      | live CIのサーバー固定版/SHA・取得検証・隔離・終了処理・失敗artifact・実行契機を決める。現行workflowにlive実行設定がないことを今回確認。#777とfixture/workflowが重なるため先行merge推奨（機能上の必須依存とは未確定）。#778を含む全liveに必要な本体修正の公式配布への収録も確認してからサーバーを固定する。 |

追加の独立候補（今回登録、未実装）:

| 優先  | ID                   | 状態             | 範囲・完了条件                                                                                                                                                                                                                                                              |
| ----- | -------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 修正3 | NGT-121 / #409の一部 | READY / 再現済み | global速度制限ボタンが実画面のARIAツリーで名前のないbutton。aria-label/翻訳とtooltipを追加し、キーボードfocus・role/name・hover・ダイアログ取消を検証。#409全体はRefsに留める。既存open PR/本体待ち5本と同じファイルを編集しない範囲。                                      |
| 後続3 | NGT-122 / #497の一部 | READY            | settings/ssl-certificateのPFX password入力をSignal Formsへ。File選択は通常状態として残し、canUpload・入力保持・失敗/成功・送信時snapshot・disabledを既存specで守る。差分照合では公開中2本・本体待ち5本と対象ファイル重複なし。MCP tokenフォームやSettings全体へ拡大しない。 |

READYは既知の外部ブロッカーなしであり、実装済み/動作検証済みの意味ではない。着手前にopen PRと準備済み差分を再確認する。

## その他の調査・保留

| ID             | 状態        | 次の判断                                                                                                                                                                                                                                |
| -------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NGT-007 / #497 | INVESTIGATE | forms-inventory.jsonに28テンプレートの行番号と静的到達性。CVAのsize/timespan/file-drop内部は別扱い、既にFormFieldを使うOptions/Schedule等を丸ごと未移行と扱わない。MCPのsignalオブジェクト、Settingsの保存/disabled/API契約を次に分割。 |
| NGT-111        | INVESTIGATE | Nightly更新チャンネル。配布状況とサーバーの扱いの確認が先。今回は配布未調査。                                                                                                                                                           |
| NGT-112        | INVESTIGATE | 設定なしのコマンド画面。#761/#766先行待ちは解消済み。利用要件/API契約と現行Commandline差分の照合が先。                                                                                                                                  |
| NGT-008        | DEFERRED    | SSR・画像最適化等。導入根拠となる性能/UX課題は未観測。                                                                                                                                                                                  |

## 実装済み・本体PRマージ待ち5本

検証済み: 5件ともOPEN・merged=false。各headは本体upstream masterの祖先ではない。新規ngclient PRはまだ出さない。本体merge後にAPI契約/実動作、重複、テスト・ビルド、本文のSHAとwhole-Issue範囲を再確認する。

| ID / 本体Issue           | ngclientブランチ / 現在head                                                          | 本体PR / 現在head                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| NGT-085 / duplicati#2310 | `feat/export-global-options` / `cf7e746577e57a198dbce308d1ea0787909603e6`            | [#7907](https://github.com/duplicati/duplicati/pull/7907) / `1015f8d7d90fe18f55dbb0e15fc49f8a92cfdba7` |
| NGT-086 / duplicati#2701 | `feat/skip-next-scheduled-run` / `ee552d1d96d7cf0eb2ca21c9d2eba97011bbe945`          | [#7911](https://github.com/duplicati/duplicati/pull/7911) / `4fc5c6a4d3b843fdbb898e829313536985da7634` |
| NGT-098 / duplicati#3397 | `feat/compact-progress` / `cfc57e5a48279cbf3cbc2d663dd3f0d97812cf4b`                 | [#7912](https://github.com/duplicati/duplicati/pull/7912) / `56376b7b5e6878e460f1974adda1d86e6d08ccba` |
| NGT-100 / duplicati#5239 | `feat/restore-resume-drafts` / `8f154b8085838c7361d8730b2d1d28ad097c8811`            | [#7914](https://github.com/duplicati/duplicati/pull/7914) / `406d079d929165fc71fc5cbf488b017c8229f508` |
| NGT-101 / duplicati#6611 | `feat/show-db-encryption-preload-paths` / `e63fe51df1118b48cc35884efed767f056448fcd` | [#7915](https://github.com/duplicati/duplicati/pull/7915) / `aadc206da7ee6496650dc391e1e2281bac667229` |

NGT-086は#768の現行ダイアログへ統合済み。関連2ファイル10テスト・型・本番ビルドの過去記録はあるが、新ダイアログ経由の実サーバー操作は未検証。現在headの新規追試と取り違えない。

## 完了・履歴の入口

- #758〜776の完了状態と固定IDは[completed.md](completed.md)へ。候補表にマージ済みPRの待ち事項を残さない。
- NGT-115の本体[#7886](https://github.com/duplicati/duplicati/pull/7886)はMERGED。旧UIテーマ保持をngclientで重ねて実装しない。
- 本体[#7896](https://github.com/duplicati/duplicati/pull/7896)もMERGED。#766との組み合わせの動作は今回は未検証。
- 過去の検証・移管18件・公開PRの試験と制限は[検証索引](verification.md)から辿る。一次証拠は保持する。

## 運用

- IDは固定・再利用しない。次の新規IDは**NGT-123**。
- 状態: READY / INVESTIGATE / PR_OPEN / BLOCKED / WAITING / DEFERRED。着手時はACTIVE・担当・日付・ブックマークを記録。
- 最新mainから独立して実装し、triageを実装の親にしない。stack後段は前段merge後に公開。画像固定参照4本と別workspaceを維持。
- 主張は検証済み／ドキュメント根拠／推測に分け、未確認は未検証と明記。過去の試験を現在SHAで再実行したと書かない。
- PR/公開コメントは依頼時のみ。whole-Issueを満たす場合だけFixes/Closes、部分対応はRefsと残件。単一Playwright設定を維持。
- 現在地を置き換え、経過を末尾に積み重ねない。完了はcompleted.md、詳細はevidenceへ移す。
