# 現在のタスク台帳

台帳更新: 2026-11-18。最新main `e632fdd59a5bef4c6791612918de0c53c93ced9c`。[今回の8件の実装・検証記録](evidence/2026-11-18-eight-prs/verification.md)を最新の実装記録とする。過去の検証件数は当時のSHAに限る。

## 現在地と次の判断

- 最新mainは `e632fdd59a5bef4c6791612918de0c53c93ced9c`（公開直前fetchで更新なし）。既存PR #757と重複しない8件をmainから独立して実装・公開。8本とも全単体2,526〜2,533件・app/spec/E2E型・本番ビルド成功。[検証記録](evidence/2026-11-18-eight-prs/verification.md)。
- 共有CLI用DBの再利用→保存・再読込→削除保護を隔離Canary2.4.1.101で確認。UIジョブだけ削除され、DBバイト列と宛先ファイル一覧は保持。ウィザード作成を含む6種類の実バックアップ・復元も内容一致。
- 既存の本体依存5本（NGT-085/086/098/100/101）は変更・公開しない。本体master e8756fabで待ちのまま。画像固定参照3本・別workspaceも保持。
- NGT-104の疑いは単体/DOMでは再現せず、回帰テストとして公開。NGT-080は#497、NGT-082は#273の部分対応。全体を完了扱いにしない。NGT-108の宛先使用量、NGT-110の他の保存確認も残る。
- 次はNGT-116（変更履歴の余分な文言）・NGT-117（削除URL直開き）を純粋mainで切り分けるか、NGT-081の実サーバーE2E継続実行を検討。NGT-047は修正後本体で再確認。公開中8本と同じフォーム/保存処理を触る作業は先行マージと差分照合を行う。

## 運用

- IDは固定・再利用しない。次の新規IDは**NGT-118**。完了/廃止は[completed.md](completed.md)に残す。
- READY=既知の外部ブロッカーなし、INVESTIGATE=範囲・要件の調査、PUSHED=push報告あり/未PR（検証の充足は別）、PR_OPEN=レビュー待ち、BLOCKED=依存待ち、WAITING=返信待ち、DEFERRED=方針保留。
- 開始時にACTIVE・担当・日付・ブックマーク、終了時に証拠・残件を更新する。GitHubがIssue/PR状態の正本。依存マージだけでDONEにしない。
- 実装は最新mainから別ブランチ。既存ブランチを無断で書き換えない。stack後段は前段マージ後に公開。PR・公開コメントは依頼がある場合のみ。Issue全体を満たす場合だけFixes/Closes、部分対応はRefsと残件。
- 公開Signal/Router/DestroyRef等を必要な範囲で使い、DTO・認証・生成OpenAPI・保存値・disabled・native submit・キーボード契約を守る。単一Playwright設定を維持。新機能導入自体を目的にせず、導入時に対象Angular版の公式仕様を確認する。
- 赤→緑、関連spec・型・ビルド、必要な実サーバー確認を証拠付きで区別する。未実施と記録なしを分ける。推論は推測と明記し、原文引用中の検証表現を追試扱いしない。

## 公開済みPR

| ID | 範囲 | PR | 状態 |
| --- | --- | --- | --- |
| NGT-103 | Chromium popup initialization / Playwright update | [#757](https://github.com/duplicati/ngclient/pull/757) | PR_OPEN / rebase後CI全成功 |
| NGT-107 | Show the available update changelog from update notifications | [#758](https://github.com/duplicati/ngclient/pull/758) | PR_OPEN / 全体テスト・型・本番ビルド成功 |
| NGT-108 | Keep shared command-line databases when deleting a backup | [#759](https://github.com/duplicati/ngclient/pull/759) | PR_OPEN / 全体テスト・型・本番ビルド成功 |
| NGT-104 | Cover keyboard reopening of loaded and empty folders | [#760](https://github.com/duplicati/ngclient/pull/760) | PR_OPEN / 全体テスト・型・本番ビルド成功 |
| NGT-080 | Bind command editor inputs through Signal Forms | [#761](https://github.com/duplicati/ngclient/pull/761) | PR_OPEN / 全体テスト・型・本番ビルド成功 |
| NGT-110 | Confirm new unencrypted remote backups before saving | [#762](https://github.com/duplicati/ngclient/pull/762) | PR_OPEN / 全体テスト・型・本番ビルド成功 |
| NGT-109 | Offer existing local databases for new backup destinations | [#763](https://github.com/duplicati/ngclient/pull/763) | PR_OPEN / 全体テスト・型・本番ビルド成功 |
| NGT-071 | Use a native console connection link in destination forms | [#764](https://github.com/duplicati/ngclient/pull/764) | PR_OPEN / 全体テスト・型・本番ビルド成功 |
| NGT-082 | Exercise wizard-created encrypted backups through a real restore | [#765](https://github.com/duplicati/ngclient/pull/765) | PR_OPEN / 全体テスト・型・本番ビルド成功 |

## 未PR・調査・回答待ち

NGT-115: PR_OPEN / Codex / 2026-11-18。duplicati/duplicati#3851の旧UI側。別ポートでのテーマ上書きとテーマCookie消失でのリセットを実測。本体の独立ブランチ `codex/ngax-persistent-browser-theme` / `ff4af1dd9c23379fab103a5508d2ee2aa2813e00` をoriginへpush。localStorage優先＋Cookie移行＋保存拒否時fallback。2 E2E赤→12 E2E緑。本体PR [#7886](https://github.com/duplicati/duplicati/pull/7886)を作成（Fixes #3851、新旧画像付き）。Issueにリリース済みとは投稿していない。[証拠と未検証範囲](evidence/2026-11-18-legacy-theme/verification.md)。


NGT-104: PR_OPEN / Codex / 2026-11-18。[#760](https://github.com/duplicati/ngclient/pull/760)。現行mainの単体/DOMで疑いは再現せず、読み込み済み/空フォルダーの再展開・フォーカス・選択不変の回帰2テストを追加。本番コード変更なし。全ブラウザーで不具合を否定したわけではない。[検証記録](evidence/2026-11-18-eight-prs/verification.md)。

NGT-103: PR_OPEN / Codex / 2026-11-18。[共通修正#757](https://github.com/duplicati/ngclient/pull/757)、`codex/update-playwright-popup-fix`。#751/#752と#756の新規ページ通知欠落はブラウザー単体でも再現。Playwright 1.65.1（上流修正入りChromium159）へ更新し400/400・Linux193 E2E・元CI成果物各20回・Windows20回成功。設定とテスト本体は不変。[原因・検証・再実行権限の制約](evidence/2026-11-18-popup-ci/verification.md)。#756はマージ済み。#757はrebase後の単体・本番ビルド・ブラウザーCIが全て成功。今回のローカル全体テスト・本番ビルドも成功。

| ID      | 範囲                                  | 状態        | 依存・次の行動                                                                                                                                                                                                                                                      |
| ------- | ------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NGT-005 | Aria/CDKの適合評価                    | BLOCKED     | 先行#728/#736とマージ済みNGT-088（#751）とmainへマージ済み#740（NGT-050）のARIA・選択契約を照合して評価。一括Aria/CDK置換はしない。                                                                                                                                                                        |
| NGT-007 | Signal Forms全体 / #497               | INVESTIGATE | Signal Formsの残存実使用フォームを棚卸し。NGT-080参照。共有CVA・未使用コードを区別し、DTO/検証/キャンセル/送信の同等性を確認するまで#497をcloseしない。                                                                                                             |
| NGT-008 | SSR・画像最適化等                     | DEFERRED    | 導入根拠となる課題が未観測 性能・UX課題が観測された場合のみ再評価 2026-11-12                                                                                                                                                                                        |
| NGT-040 | #215 世代削除                         | WAITING     | Issue open。[実サーバー検証・close提案済み](https://github.com/duplicati/ngclient/issues/215#issuecomment-6779794381)。メンテナ判断待ち                                                                                                                             |
| NGT-041 | #283 再接続                           | WAITING     | Issue open。[WS/long polling復帰の公開確認済み](https://github.com/duplicati/ngclient/issues/283#issuecomment-6779880314)。報告者確認待ち。追加の寿命管理PR #733 と元症状のclose判断を分ける                                                                        |
| NGT-042 | #492 時差・DST                        | WAITING     | Issue open。[日次全曜日・DST前後6起動の公開確認済み](https://github.com/duplicati/ngclient/issues/492#issuecomment-6779919691)。報告者確認待ち。除外曜日や曖昧時刻は未検証                                                                                          |
| NGT-043 | #217 破損ファイル削除                 | WAITING     | Issue open。[データvolume欠損・旧世代復元とclose提案済み](https://github.com/duplicati/ngclient/issues/217#issuecomment-6780101822)。他の破損種類は未検証                                                                                                           |
| NGT-044 | #401 Windows宛先パス                  | WAITING     | Issue open。[実Windowsで入力・保存・再読込の公開確認済み](https://github.com/duplicati/ngclient/issues/401#issuecomment-6780391498)。報告者確認待ち                                                                                                                 |
| NGT-045 | #449 cross-OS復元                     | WAITING     | 本体#7776後のDebugで両方向の一覧・UI復元・内容一致を検証済み（追加ngclient修正なし）。[公開報告・再確認依頼済み](https://github.com/duplicati/ngclient/issues/449#issuecomment-6867298500)。Issueはopenで返信待ち。配布版への収録、fresh直接API復元等は別確認       |
| NGT-047 | #328 URL再構築 | READY | 本体[#7832](https://github.com/duplicati/duplicati/pull/7832)は2026-11-16マージ済み。修正後本体でブラウザーなしGET→PUTとUI保存を再確認する。今回の追試・配布版収録は未確認。 |
| NGT-049 | #627 editor tabs/save                 | WAITING     | main UIで5ページの直接移動・保存・再読込を確認。[コメント投稿・訂正済み](https://github.com/duplicati/ngclient/issues/627#issuecomment-6867035192)。Save changesは公式2.4.1.101 Canaryに収録確認、実画面検証はmain UI。タブ外観・ツアーの残要望と報告者の再確認待ち |
| NGT-052 | #409 suggestions                      | INVESTIGATE | #409の要望を分割し、帯域制限ボタンの名前/説明、警告・ログ・進捗・現在ファイルの残件を確認。既存の一部アイコン対応を全解決と扱わない。                                                                                                                               |
| NGT-053 | #460 secondary restore                | INVESTIGATE | secondary宛先の対象を既存APIで指定できるか確認。不足なら本体契約が先。削除では選ばなかった宛先へ影響しないことを確認。                                                                                                                                              |
| NGT-054 | #462 secondary delete                 | INVESTIGATE | secondary宛先の対象を既存APIで指定できるか確認。不足なら本体契約が先。削除では選ばなかった宛先へ影響しないことを確認。                                                                                                                                              |
| NGT-055 | #126 validation schema                | INVESTIGATE | #126の検証schema API契約・適用範囲・後方互換性を先に確認。既存クライアント検証と分ける。                                                                                                                                                                            |
| NGT-071 | ナビゲーション再監査: console link | PR_OPEN | [#764](https://github.com/duplicati/ngclient/pull/764)。Connect nowをnative RouterLink anchorへ。元ボタンで1赤→修正後緑。状態変更/disabled操作は維持。残る監査と区別。 [検証記録](evidence/2026-11-18-eight-prs/verification.md) |
| NGT-080 | #497 Commandline Signal Forms | PR_OPEN | [#761](https://github.com/duplicati/ngclient/pull/761)。public compatForm/FormField＋nullable adapterで移行。引数編集・失敗復帰・URL stateを実ブラウザー確認。Refs #497、全移行の完了ではない。 [検証記録](evidence/2026-11-18-eight-prs/verification.md) |
| NGT-081 | 実サーバーE2Eの継続実行               | READY | NGT-006 / #735 はマージ済み。単一設定とlive fixtureを再利用し、実行契機・固定サーバー版・隔離・片付け・失敗証拠を既存CIへ組み込む。CIでの実行可否は未検証                                                                                                             |
| NGT-082 | 画面作成から実サーバー復元E2E | PR_OPEN | [#765](https://github.com/duplicati/ngclient/pull/765)。既存単一設定/live fixtureを利用しウィザードAES作成を追加。6実フローでUTF-8/binary一致。Refs #273。継続CIはNGT-081。 [検証記録](evidence/2026-11-18-eight-prs/verification.md) |
| NGT-107 | 更新版の変更履歴 | PR_OPEN | [#758](https://github.com/duplicati/ngclient/pull/758)。通知からfrom-update=true、通常画面へ戻すとfalse。5赤→緑、query切替E2E成功。既存markdownの余分な文言はNGT-116へ。 [検証記録](evidence/2026-11-18-eight-prs/verification.md) |
| NGT-108 | 共有DB削除防止 / 宛先使用量は残る | PR_OPEN | [#759](https://github.com/duplicati/ngclient/pull/759)。共有/照会失敗時はローカルDBを保持。2赤→緑、削除画面5E2E、実CLI DB保持を確認。report-remote-sizeは未実装。 [検証記録](evidence/2026-11-18-eight-prs/verification.md) |
| NGT-109 | 作成時の既存CLI DB再利用 | PR_OPEN | [#763](https://github.com/duplicati/ngclient/pull/763)。宛先検証後に再利用/新規/取消を選択。existingdb=trueも送信。Sync/編集は対象外。4赤とquery1赤→全体2,533緑、実保存DBPath一致。 [検証記録](evidence/2026-11-18-eight-prs/verification.md) |
| NGT-110 | 保存時の確認: 未暗号化remote | PR_OPEN | [#762](https://github.com/duplicati/ngclient/pull/762)。新規未暗号化remote Backupのみ確認。取消/重複/古いcallbackを防ぐ。2赤→緑。弱い/自動生成passphrase、暗号化変更、source確認は残る。 [検証記録](evidence/2026-11-18-eight-prs/verification.md) |
| NGT-111 | ngax廃止前: Nightly更新チャンネル | INVESTIGATE | ngaxの設定にあり、ngclientの選択肢にない（検証済み）。サーバーはNightlyを扱える。今もNightlyが配布されているかを確かめてから追加するか決める。[証拠](evidence/2026-11-17-ngax-parity/README.md) |
| NGT-112 | ngax廃止前: バックアップなしのコマンドライン | INVESTIGATE | ngaxの`/commandline`（メニューになくURL直打ちのみ）で任意の宛先を使える。ngclientはバックアップごとの画面だけ（未追試）。NGT-080・NGT-092と同じCommandlineを触るので、その差分の後。利用が少なそうなので優先度は低い（推測）。[証拠](evidence/2026-11-17-ngax-parity/README.md) |

| NGT-116 | 変更履歴のSafeValue診断文言 | INVESTIGATE | NGT-107の本番UIで見出し末尾にAngular診断URLを観測。mainと同じ既存変換処理を維持している。純粋mainの実画面再現・原因・修正は未検証。[検証記録](evidence/2026-11-18-eight-prs/verification.md)。NGT-107と重複するファイルは先行状態を確認。 |
| NGT-117 | 削除画面へのURL直開き | INVESTIGATE | NGT-108の本番UIをcold startするとジョブ名空・DBPath未取得。Homeからの通常経路は実サーバー成功。純粋mainでの再現と原因の切分けは未検証。[検証記録](evidence/2026-11-18-eight-prs/verification.md)。 |

## Duplicati側から移管した18件（未PR5件）

2026-11-18再確認: 全5本の本体依存は未統合・PRなし。ngclient全体テスト/本番ビルドは6実装全て成功。[最新のSHA・コマンド・結果・制約](evidence/2026-11-18-full-validation/verification.md)。

18件中13件はマージ済み、残り5件は未PR。本体依存と実サーバー確認は別判定。今回のrebase後検証は下記の更新・整理記録を参照し、以前の全体テスト・本番ビルドを今回の結果と扱わない。移管時の履歴は[移管索引](2026-11-15-duplicati-ngclient-records.md)、現在SHAは今回の検証記録を参照。

| ID                                                          | 本体Issue・内容                                 | 状態    | ブランチ                                | 先行・公開前の確認                                  |
| ----------------------------------------------------------- | ----------------------------------------------- | ------- | --------------------------------------- | --------------------------------------------------- |
| [NGT-085](2026-11-15-duplicati-ngclient-records.md#ngt-085) | duplicati/duplicati#2310 グローバル設定のexport | BLOCKED | `feat/export-global-options`            | 本体feat/export-global-options先行必須。実サーバー/17単体/6E2E/ビルド済 |
| [NGT-086](2026-11-15-duplicati-ngclient-records.md#ngt-086) | duplicati/duplicati#2701 次回予定のskip         | BLOCKED | `feat/skip-next-scheduled-run`          | 本体04f2dd08a先行。42テスト/本番/実サーバー済。queued取消外、本文要作成 |
| [NGT-098](2026-11-15-duplicati-ngclient-records.md#ngt-098) | duplicati/duplicati#3397 Compact進捗            | BLOCKED | `feat/compact-progress`                 | 本体 feat/compact-progress が先。本文要作成         |
| [NGT-100](2026-11-15-duplicati-ngclient-records.md#ngt-100) | duplicati/duplicati#5239 直接復元の再開         | BLOCKED | `feat/restore-resume-drafts`            | 本体 feat/list-temporary-backups が先。本文要作成   |
| [NGT-101](2026-11-15-duplicati-ngclient-records.md#ngt-101) | duplicati/duplicati#6611 DB暗号化・preload表示  | BLOCKED | `feat/show-db-encryption-preload-paths` | 本体 feat/systeminfo-preload-paths が先。本文要作成 |
