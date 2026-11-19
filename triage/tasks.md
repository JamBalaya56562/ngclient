# 現在のタスク台帳

状態照合: **2026-11-19**。[今回の一次記録](evidence/2026-11-19-triage-refresh/verification.md)。GitHubをIssue/PR状態の正本、このファイルを着手判断の正本とする。過去の試験結果は実行したSHAに限り、状態照合を動作の追試と扱わない。

## 現在地

- 検証済み: upstream/fork mainは `5c520f1311b7805bd26cf2e4ff420127e46b1d72`。本体 upstream masterは `f21a2245713cffb4dd020d8573c77e63592cfb66`。両リポジトリでfetch済み。
- ngclientのopen Issueは**7件**、open PRは**2件（#777・#778）**。#758〜776はすべてマージ済み。以前の#761/#766の先行マージ待ちは解消済み。
- 実装ブランチは**7本＝公開中2本＋本体マージ待ち5本**。local/originのSHA一致を確認。画像・証拠の固定参照4本と別workspace `claude-fixes` は維持。
- 今回は台帳・索引・検証記録だけ更新する。実装ブランチの変更、rebase、PR/コメント投稿、動作テスト・ビルドは行わない。

## 公開中のPR

| ID / Issue     | PR・ブランチ・現在head                                                                                                                          | 状態と範囲                                                                                                                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NGT-120        | [#777](https://github.com/duplicati/ngclient/pull/777) / `codex/live-browser-safe-ports` / `79dbfd8be5a2f0fdccc642e4db1687a533f988fc`           | PR_OPEN。live proxyの禁止ポート回避とbrowser CIのjob枠15分化。最新headのUnit Tests/Production BuildはSUCCESS。[検証](evidence/2026-11-19-maintenance/verification.md)。                                                                                        |
| NGT-047 / #328 | [#778](https://github.com/duplicati/ngclient/pull/778) / `codex/live-destination-url-preservation` / `2f67628310cdb4fbfed666d064f79c4dbc06670d` | PR_OPEN / Closes #328。本体#7832/#7860/#7898はマージ済み。実サーバー9種のAPI保存・UI27回保存、関連単体20件・型・整形・本番ビルド成功。最終照合でUnit Tests/Production BuildともSUCCESS。[検証](evidence/2026-11-19-issue328-live-regression/verification.md)。 |

#777と#778はmainから独立、互いのファイル重複なし。#778のliveテストには本体のURL-masking修正が必要。古いサーバーでの成功・全provider接続は保証しない。

## open Issue 7件の道筋

| Issue                                                                          | ID / 現在の判断       | 次の一手・close条件                                                                                                                                                                          |
| ------------------------------------------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#328](https://github.com/duplicati/ngclient/issues/328) editorへの耐性        | NGT-047 / PR_OPEN     | #778のレビュー・CI・merge待ち。Closesを付与済み。重ねて実装しない。                                                                                                                          |
| [#273](https://github.com/duplicati/ngclient/issues/273) テスト整備            | NGT-081 / NGT-118     | Vitest、バックアップ作成・実行・復元のlive E2Eは既存。UIからジョブを削除するE2Eとlive CIの範囲を詰める。要望は最小限のE2Eなので件数増加を目的にしない。API後片付けをUI削除の網羅と扱わない。 |
| [#497](https://github.com/duplicati/ngclient/issues/497) Signal Forms          | NGT-007 / NGT-119     | NGT-119が独立候補。実使用フォーム/CVA内部/通常UI状態/未使用旧画面を区別し、ngModelの一律ゼロをclose条件にしない。                                                                            |
| [#409](https://github.com/duplicati/ngclient/issues/409) UI改善一覧            | NGT-052 / INVESTIGATE | 通知、ログ導線、進捗、tooltip、現在ファイル、配色/余白を項目別に判定。比較画面#766・メニュー#768はマージ済み。現行UIでの残件の切分けが先。一部改善で全closeにしない。                        |
| [#460](https://github.com/duplicati/ngclient/issues/460) secondary宛先から復元 | NGT-053 / INVESTIGATE | 一次DBとsecondary内容が一致しないというコメントを考慮し、対象宛先/DB/版のAPI契約を確認。UIだけで完結するかは未検証。                                                                         |
| [#462](https://github.com/duplicati/ngclient/issues/462) secondary宛先の削除   | NGT-054 / INVESTIGATE | 宛先ごとの削除指定、選ばなかった宛先と共有DBの保持を確認。#759の共有DBガードは全対応ではない。                                                                                               |
| [#126](https://github.com/duplicati/ngclient/issues/126) 検証schema            | NGT-055 / INVESTIGATE | Min/Max/Pattern等のAPI契約と具体例が先。既存enum/flagsやクライアント検証とは別。対応する本体schema/PRの有無は今回未監査。                                                                    |

open一覧・既存コメントは今回再取得した。返信・公開コメントは投稿していない。動作の確認範囲は各検証記録を参照。

## 次の調査・実装順

バグの再現・切分けを優先する。まずNGT-116/117を現行mainで調べ、未再現ならREADY候補へ進む。

| 優先     | ID             | 状態        | 範囲・完了条件                                                                                                                                                                                                                                                                                             |
| -------- | -------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 調査1    | NGT-116        | INVESTIGATE | Changelog見出し末尾のSafeValue診断URLを過去の本番UIで観測。#758はマージ済みで先行待ちなし。純粋mainの再現と原因切分けが先。今回は再現試験していない。                                                                                                                                                      |
| 調査2    | NGT-117        | INVESTIGATE | 削除URLのcold startで名前/DBPathが空になる現象を過去に観測。#759はマージ済みで先行待ちなし。Home経由と直接URLの取得/表示を比較。今回は再現試験していない。                                                                                                                                                 |
| 実装1    | NGT-118 / #273 | READY       | Homeの現行操作ダイアログからUI削除する実サーバーE2E。取消で変更なし→確認後にジョブと選んだローカルDBだけ削除→宛先ファイルのハッシュ保持。非共有の通常ジョブを使う。既存backup-restore.spec.tsを重複編集せずfixtureを再利用。                                                                               |
| 実装2    | NGT-119 / #497 | READY       | home/start-all-dialogのafter-actionだけをSignal Formsへ。残存ngModelを今回ソース確認済み。None/null、未対応値のNone戻し、候補/選択順、disabled、Cancel、送信値を保持。Shutdown等はモック検証。Set/checkboxを機械的にフォーム化しない。                                                                     |
| 評価     | NGT-005        | READY       | Aria/CDK適合評価。ツリーのARIA・選択・キーボード契約を照合し、導入で解決できる観測課題を確認。一括置換を目的にしない。先行PRはマージ済み。                                                                                                                                                                 |
| 範囲調整 | NGT-081 / #273 | INVESTIGATE | live CIのサーバー固定版/SHA・取得検証・隔離・終了処理・失敗artifact・実行契機を決める。現行workflowにlive実行設定がないことを今回確認。#777とfixture/workflowが重なるため先行merge推奨（機能上の必須依存とは未確定）。#778を含む全liveに必要な本体修正の公式配布への収録も確認してからサーバーを固定する。 |

READYは既知の外部ブロッカーなしであり、実装済み/動作検証済みの意味ではない。着手前にopen PRと準備済み差分を再確認する。

## その他の調査・保留

| ID             | 状態        | 次の判断                                                                                                                                            |
| -------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| NGT-007 / #497 | INVESTIGATE | 実使用フォームを棚卸し。過去のHTML一致数を未移行フォーム数と扱わない。テーマ#767・Commandline#761/#766はマージ済み。今回確認した独立候補はNGT-119。 |
| NGT-111        | INVESTIGATE | Nightly更新チャンネル。配布状況とサーバーの扱いの確認が先。今回は配布未調査。                                                                       |
| NGT-112        | INVESTIGATE | 設定なしのコマンド画面。#761/#766先行待ちは解消済み。利用要件/API契約と現行Commandline差分の照合が先。                                              |
| NGT-008        | DEFERRED    | SSR・画像最適化等。導入根拠となる性能/UX課題は未観測。                                                                                              |

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

- IDは固定・再利用しない。次の新規IDは**NGT-121**。
- 状態: READY / INVESTIGATE / PR_OPEN / BLOCKED / WAITING / DEFERRED。着手時はACTIVE・担当・日付・ブックマークを記録。
- 最新mainから独立して実装し、triageを実装の親にしない。stack後段は前段merge後に公開。画像固定参照4本と別workspaceを維持。
- 主張は検証済み／ドキュメント根拠／推測に分け、未確認は未検証と明記。過去の試験を現在SHAで再実行したと書かない。
- PR/公開コメントは依頼時のみ。whole-Issueを満たす場合だけFixes/Closes、部分対応はRefsと残件。単一Playwright設定を維持。
- 現在地を置き換え、経過を末尾に積み重ねない。完了はcompleted.md、詳細はevidenceへ移す。
