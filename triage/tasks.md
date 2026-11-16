# 現在のタスク台帳

更新・GitHub照合: 2026-11-16。main `ae54d73bf1e5e98fb65dd8060c006f1defc90d01`（0.0.250）。[今回の更新記録](evidence/2026-11-16-maintenance/verification.md)。各タスクの追試は[検証索引](verification.md)を参照。

## 現在地と次の判断

- **検証済み（GitHub API）**: open PRは0件。#727〜#738は全件マージ済み。当方11本のブックマークをローカル・originから削除した。
- 準備済み実装は19ブランチ（すべて未PR）。最新mainへrebase済み。triageと画像保存専用3本は実装数に含めない。現在SHAは今回の更新記録を正本とし、過去のSHAでの試験結果をrebase後の追試と混同しない。
- 次は未PR19件の不足検証・本体依存・Issueを閉じる範囲を確認する。PUSHEDを「公開可能・全検証済み」と扱わない。実装・試験・公開は個別の依頼時に行う。
- 新規実装は再現するバグを優先。NGT-052〜055は要求/APIの調査から。NGT-071は準備済み差分を避ける範囲で再監査。NGT-080はNGT-092と同じCommandlineを触るため、移行範囲を決める前に差分照合が必要。
- NGT-081/082の#735待ちは解消。NGT-005はmainに入った#728/#736と準備済みNGT-088/050のツリー契約を踏まえて進める。独立ベースでも同じファイルへの変更を無条件に同時公開しない。

## 運用

- IDは固定・再利用しない。次の新規IDは**NGT-104**。完了/廃止は[completed.md](completed.md)に残す。
- READY=既知の外部ブロッカーなし、INVESTIGATE=範囲・要件の調査、PUSHED=push報告あり/未PR（検証の充足は別）、PR_OPEN=レビュー待ち、BLOCKED=依存待ち、WAITING=返信待ち、DEFERRED=方針保留。
- 開始時にACTIVE・担当・日付・ブックマーク、終了時に証拠・残件を更新する。GitHubがIssue/PR状態の正本。依存マージだけでDONEにしない。
- 実装は最新mainから別ブランチ。既存ブランチを無断で書き換えない。stack後段は前段マージ後に公開。PR・公開コメントは依頼がある場合のみ。Issue全体を満たす場合だけFixes/Closes、部分対応はRefsと残件。
- 公開Signal/Router/DestroyRef等を必要な範囲で使い、DTO・認証・生成OpenAPI・保存値・disabled・native submit・キーボード契約を守る。単一Playwright設定を維持。新機能導入自体を目的にせず、導入時に対象Angular版の公式仕様を確認する。
- 赤→緑、関連spec・型・ビルド、必要な実サーバー確認を証拠付きで区別する。未実施と記録なしを分ける。推論は推測と明記し、原文引用中の検証表現を追試扱いしない。

## 公開済みPR

現在openのPRは0件。#727〜#738はマージ済み。完了範囲は[completed.md](completed.md)、残存ブランチの新SHAは[今回の更新記録](evidence/2026-11-16-maintenance/verification.md)を参照。

## 未PR・調査・回答待ち

NGT-103: 別タブ遷移E2Eの一時失敗を調査中（INVESTIGATE / Codex / 2026-11-16）。#727・#733はソース差分なしのコミット再作成・pushでCI再実行し両件successを確認、両PRともマージ済み。traceでは遷移要求200後にpageイベントが来ない。ローカルでは未再現で、根本原因を未特定のため修正PRは未作成。[証拠と残件](evidence/2026-11-16-ci-navigation/verification.md)。実装ブランチ数に含めない。

| ID      | 範囲                                  | 状態        | 依存・次の行動                                                                                                                                                                                                                                                      |
| ------- | ------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NGT-005 | Aria/CDKの適合評価                    | BLOCKED     | 先行#728/#736と準備済みNGT-088/050のARIA・選択契約を照合して評価。一括Aria/CDK置換はしない。                                                                                                                                                                        |
| NGT-007 | Signal Forms全体 / #497               | INVESTIGATE | Signal Formsの残存実使用フォームを棚卸し。NGT-080参照。共有CVA・未使用コードを区別し、DTO/検証/キャンセル/送信の同等性を確認するまで#497をcloseしない。                                                                                                             |
| NGT-008 | SSR・画像最適化等                     | DEFERRED    | 導入根拠となる課題が未観測 性能・UX課題が観測された場合のみ再評価 2026-11-12                                                                                                                                                                                        |
| NGT-040 | #215 世代削除                         | WAITING     | Issue open。[実サーバー検証・close提案済み](https://github.com/duplicati/ngclient/issues/215#issuecomment-6779794381)。メンテナ判断待ち                                                                                                                             |
| NGT-041 | #283 再接続                           | WAITING     | Issue open。[WS/long polling復帰の公開確認済み](https://github.com/duplicati/ngclient/issues/283#issuecomment-6779880314)。報告者確認待ち。追加の寿命管理PR #733 と元症状のclose判断を分ける                                                                        |
| NGT-042 | #492 時差・DST                        | WAITING     | Issue open。[日次全曜日・DST前後6起動の公開確認済み](https://github.com/duplicati/ngclient/issues/492#issuecomment-6779919691)。報告者確認待ち。除外曜日や曖昧時刻は未検証                                                                                          |
| NGT-043 | #217 破損ファイル削除                 | WAITING     | Issue open。[データvolume欠損・旧世代復元とclose提案済み](https://github.com/duplicati/ngclient/issues/217#issuecomment-6780101822)。他の破損種類は未検証                                                                                                           |
| NGT-044 | #401 Windows宛先パス                  | WAITING     | Issue open。[実Windowsで入力・保存・再読込の公開確認済み](https://github.com/duplicati/ngclient/issues/401#issuecomment-6780391498)。報告者確認待ち                                                                                                                 |
| NGT-045 | #449 cross-OS復元                     | WAITING     | 本体#7776後のDebugで両方向の一覧・UI復元・内容一致を検証済み（追加ngclient修正なし）。[公開報告・再確認依頼済み](https://github.com/duplicati/ngclient/issues/449#issuecomment-6867298500)。Issueはopenで返信待ち。配布版への収録、fresh直接API復元等は別確認       |
| NGT-047 | #328 URL再構築                        | BLOCKED     | 本体[PR #7832](https://github.com/duplicati/duplicati/pull/7832)（fix/keep-target-url-when-masking）がopen。マージ後にブラウザーなしGET→PUTとUI保存を再確認。#618のUI対策を繰り返さず、Issue全体を先にcloseしない                                                   |
| NGT-049 | #627 editor tabs/save                 | WAITING     | main UIで5ページの直接移動・保存・再読込を確認。[コメント投稿・訂正済み](https://github.com/duplicati/ngclient/issues/627#issuecomment-6867035192)。Save changesは公式2.4.1.101 Canaryに収録確認、実画面検証はmain UI。タブ外観・ツアーの残要望と報告者の再確認待ち |
| NGT-050 | #637 hidden/system設定                | PUSHED | codex/source-attribute-exclusion-feedback（現在SHAは更新記録）。#727はマージ済み。実サーバー6条件・関連333件の過去記録は[検証索引](verification.md)。新旧画像・[本文](pr-drafts/ngclient-source-attribute-exclusion-feedback.md)あり。マージ後に新規属性追加フローを再確認。         |
| NGT-052 | #409 suggestions                      | INVESTIGATE | #409の要望を分割し、帯域制限ボタンの名前/説明、警告・ログ・進捗・現在ファイルの残件を確認。既存の一部アイコン対応を全解決と扱わない。                                                                                                                               |
| NGT-053 | #460 secondary restore                | INVESTIGATE | secondary宛先の対象を既存APIで指定できるか確認。不足なら本体契約が先。削除では選ばなかった宛先へ影響しないことを確認。                                                                                                                                              |
| NGT-054 | #462 secondary delete                 | INVESTIGATE | secondary宛先の対象を既存APIで指定できるか確認。不足なら本体契約が先。削除では選ばなかった宛先へ影響しないことを確認。                                                                                                                                              |
| NGT-055 | #126 validation schema                | INVESTIGATE | #126の検証schema API契約・適用範囲・後方互換性を先に確認。既存クライアント検証と分ける。                                                                                                                                                                            |
| NGT-071 | 先行マージ後のナビゲーション再監査    | READY       | ホーム#697・接続画面#700・ルートID #711はマージ済み。マージ済みNGT-064〜070と重ならない範囲を現行mainで再監査する。disabled/状態変更付き操作は維持                                                                                                                  |
| NGT-080 | #497 CommandlineのSignal Forms移行    | INVESTIGATE | NGT-092のCommandline差分を先に照合。既存の引数・URL state・保存/送信・disabled・再試行を保つ移行範囲を確定する。重複を避けられない部分は先行マージ待ち。                                                                                                            |
| NGT-081 | 実サーバーE2Eの継続実行               | READY | NGT-006 / #735 はマージ済み。単一設定とlive fixtureを再利用し、実行契機・固定サーバー版・隔離・片付け・失敗証拠を既存CIへ組み込む。CIでの実行可否は未検証                                                                                                             |
| NGT-082 | 画面からの新規作成を含む実サーバーE2E | READY | #735 はマージ済み。現在のAPIによるジョブ準備と区別し、ウィザード入力→保存→実行→復元→削除の最小実フローを追加。内容一致と削除範囲を確認し#273の完了基準を合意する                                                                                                      |

## Duplicati側から移管した18件

元の実装・レビュー記録を保存した状態。今回の整理で再検証していない。全件の完全SHA・赤の種類・未実施・agentIdは[移管索引](2026-11-15-duplicati-ngclient-records.md)、原文はevidence内。13本のPR本文は原文保存、対になる5本は要作成。

| ID                                                          | 本体Issue・内容                                 | 状態    | ブランチ                                | 先行・公開前の確認                                  |
| ----------------------------------------------------------- | ----------------------------------------------- | ------- | --------------------------------------- | --------------------------------------------------- |
| [NGT-084](2026-11-15-duplicati-ngclient-records.md#ngt-084) | duplicati/duplicati#1510 Verify完了通知         | PUSHED  | `fix/verify-completion-alert`           | 実サーバー4条件・47テスト/ビルド済。公開指示待ち                             |
| [NGT-085](2026-11-15-duplicati-ngclient-records.md#ngt-085) | duplicati/duplicati#2310 グローバル設定のexport | BLOCKED | `feat/export-global-options`            | 本体feat/export-global-options先行必須。実サーバー/17単体/6E2E/ビルド済 |
| [NGT-086](2026-11-15-duplicati-ngclient-records.md#ngt-086) | duplicati/duplicati#2701 次回予定のskip         | BLOCKED | `feat/skip-next-scheduled-run`          | 本体04f2dd08a先行。42テスト/本番/実サーバー済。queued取消外、本文要作成 |
| [NGT-087](2026-11-15-duplicati-ngclient-records.md#ngt-087) | duplicati/duplicati#3041 進捗件数の桁区切り     | PUSHED  | `fix/status-bar-file-count-separators`  | item1のみ。23テスト/本番/実サーバーen・de済。Issue全体のFixes不可 |
| [NGT-088](2026-11-15-duplicati-ngclient-records.md#ngt-088) | duplicati/duplicati#3191 配下の部分除外表示     | PUSHED  | `feat/file-tree-partial-exclusion`      | #728のaria-description、#736/050のツリー表示        |
| [NGT-089](2026-11-15-duplicati-ngclient-records.md#ngt-089) | duplicati/duplicati#3369 idle sign-out          | PUSHED  | `feat/idle-sign-out`                    | 複数タブ・relay等の既存記録と不足範囲               |
| [NGT-090](2026-11-15-duplicati-ngclient-records.md#ngt-090) | duplicati/duplicati#3519 特殊ソースの実パス表示 | PUSHED  | `feat/show-resolved-source-shortcut`    | NGT-050とSource Dataが重なる                        |
| [NGT-091](2026-11-15-duplicati-ngclient-records.md#ngt-091) | duplicati/duplicati#3851 テーマのサーバー保存   | PUSHED  | `feat/server-stored-theme`              | 不足検証・既存差分と公開範囲                        |
| [NGT-092](2026-11-15-duplicati-ngclient-records.md#ngt-092) | duplicati/duplicati#4678 ログから前版と比較     | PUSHED  | `feat/log-compare-previous-version`     | NGT-080とCommandlineが重なる。実ログ日時の対応      |
| [NGT-093](2026-11-15-duplicati-ngclient-records.md#ngt-093) | duplicati/duplicati#1843 証明書アップロード     | PUSHED  | `feat/ssl-certificate-upload`           | 実証明書のuploadは未実施                            |
| [NGT-094](2026-11-15-duplicati-ngclient-records.md#ngt-094) | duplicati/duplicati#2259 Issue報告リンク        | PUSHED  | `feat/report-issue-link`                | 不足検証・既存差分と公開範囲                        |
| [NGT-095](2026-11-15-duplicati-ngclient-records.md#ngt-095) | duplicati/duplicati#2330 全ジョブ開始           | PUSHED  | `feat/run-all-backups`                  | 不足検証・既存差分と公開範囲                        |
| [NGT-096](2026-11-15-duplicati-ngclient-records.md#ngt-096) | duplicati/duplicati#2764 前回失敗表示           | PUSHED  | `feat/last-run-failed-indicator`        | 警告表示は含まない。Fixes範囲                       |
| [NGT-097](2026-11-15-duplicati-ngclient-records.md#ngt-097) | duplicati/duplicati#3246 ログdownload           | PUSHED  | `feat/log-download`                     | GUIのみ、CLIは残件                                  |
| [NGT-098](2026-11-15-duplicati-ngclient-records.md#ngt-098) | duplicati/duplicati#3397 Compact進捗            | BLOCKED | `feat/compact-progress`                 | 本体 feat/compact-progress が先。本文要作成         |
| [NGT-099](2026-11-15-duplicati-ngclient-records.md#ngt-099) | duplicati/duplicati#3694 復元版の件数           | PUSHED  | `feat/restore-version-file-count`       | 赤の件数は1失敗1合格へ訂正。件数の意味              |
| [NGT-100](2026-11-15-duplicati-ngclient-records.md#ngt-100) | duplicati/duplicati#5239 直接復元の再開         | BLOCKED | `feat/restore-resume-drafts`            | 本体 feat/list-temporary-backups が先。本文要作成   |
| [NGT-101](2026-11-15-duplicati-ngclient-records.md#ngt-101) | duplicati/duplicati#6611 DB暗号化・preload表示  | BLOCKED | `feat/show-db-encryption-preload-paths` | 本体 feat/systeminfo-preload-paths が先。本文要作成 |
