# 現在のタスク台帳

台帳更新: 2026-11-18。最新main `e632fdd59a5bef4c6791612918de0c53c93ced9c`。[今回の更新・整理・rebase記録](evidence/2026-11-18-maintenance/verification.md)を現在の基準とする。過去の検証件数は当時のSHAに限る。

## 現在地と次の判断

- 検証済み（GitHub API・jj ancestry）: #744と#751〜#756の7件はマージ済み。local/originの対応7ブランチを削除。コミット本体はmainの履歴として保持する。
- open PRは#757のみ。最新mainへrebase済み。前回の#757のProduction Build/browser-testsは成功、Unit Testsの2つのfixture型エラーは今回mainへ入った#756の対象と一致。rebase後のproduction-build / unit-tests / browser-testsは全てSUCCESS。
- 未PRの実装は本体依存の5本（NGT-085/086/098/100/101）。全て最新mainへrebase。本体最新master e8756fabで依存5件は全て未統合、対応PRなしと確認。全体テスト・本番ビルドは6実装全て成功（ローカルworker待機時間を一時延長）。[検証と公開保留理由](evidence/2026-11-18-full-validation/verification.md)。
- 画像3ブランチは公開PRの固定SHA画像リンク維持のためrebase・削除しない。別workspace claude-fixesも変更しない。
- 次はNGT-104の切分け、NGT-108の共有DB誤削除防止、NGT-109/110の契約確認を優先候補とする。既存の本体依存5本とは差分を照合する。
- NGT-005は#728/#736/#740/#751のマージ後のツリー契約を照合して評価。NGT-080は#753マージ後のCommandlineを再確認して範囲を決める。

## 運用

- IDは固定・再利用しない。次の新規IDは**NGT-116**。完了/廃止は[completed.md](completed.md)に残す。
- READY=既知の外部ブロッカーなし、INVESTIGATE=範囲・要件の調査、PUSHED=push報告あり/未PR（検証の充足は別）、PR_OPEN=レビュー待ち、BLOCKED=依存待ち、WAITING=返信待ち、DEFERRED=方針保留。
- 開始時にACTIVE・担当・日付・ブックマーク、終了時に証拠・残件を更新する。GitHubがIssue/PR状態の正本。依存マージだけでDONEにしない。
- 実装は最新mainから別ブランチ。既存ブランチを無断で書き換えない。stack後段は前段マージ後に公開。PR・公開コメントは依頼がある場合のみ。Issue全体を満たす場合だけFixes/Closes、部分対応はRefsと残件。
- 公開Signal/Router/DestroyRef等を必要な範囲で使い、DTO・認証・生成OpenAPI・保存値・disabled・native submit・キーボード契約を守る。単一Playwright設定を維持。新機能導入自体を目的にせず、導入時に対象Angular版の公式仕様を確認する。
- 赤→緑、関連spec・型・ビルド、必要な実サーバー確認を証拠付きで区別する。未実施と記録なしを分ける。推論は推測と明記し、原文引用中の検証表現を追試扱いしない。

## 公開済みPR

| ID | 範囲 | PR | 状態 |
| --- | --- | --- | --- |
| NGT-103 | Chromium popup initialization / Playwright update | [#757](https://github.com/duplicati/ngclient/pull/757) | PR_OPEN / rebase後CI全成功・ローカル全体テストと本番ビルド成功 |

## 未PR・調査・回答待ち

NGT-115: PUSHED / Codex / 2026-11-18。duplicati/duplicati#3851の旧UI側。別ポートでのテーマ上書きとテーマCookie消失でのリセットを実測。本体の独立ブランチ `codex/ngax-persistent-browser-theme` / `ff4af1dd9c23379fab103a5508d2ee2aa2813e00` をoriginへpush。localStorage優先＋Cookie移行＋保存拒否時fallback。2 E2E赤→12 E2E緑。PR未作成、Issueに解決済みとは投稿していない。[証拠と未検証範囲](evidence/2026-11-18-legacy-theme/verification.md)。


NGT-104: 読み込み済みフォルダーのArrowRight再展開。INVESTIGATE / Codex / 2026-11-16。実UIで疑いを観測、純粋mainでの再現・原因・回帰テストは未検証。[今回の証拠と次の手順](evidence/2026-11-16-publication/verification.md#ngt-104-arrowright再展開未切分け)。未実装、ブランチなし。

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
| NGT-071 | 先行マージ後のナビゲーション再監査    | READY       | ホーム#697・接続画面#700・ルートID #711はマージ済み。マージ済みNGT-064〜070と重ならない範囲を現行mainで再監査する。disabled/状態変更付き操作は維持                                                                                                                  |
| NGT-080 | #497 CommandlineのSignal Forms移行    | INVESTIGATE | NGT-092のCommandline差分を先に照合。既存の引数・URL state・保存/送信・disabled・再試行を保つ移行範囲を確定する。重複を避けられない部分は先行マージ待ち。                                                                                                            |
| NGT-081 | 実サーバーE2Eの継続実行               | READY | NGT-006 / #735 はマージ済み。単一設定とlive fixtureを再利用し、実行契機・固定サーバー版・隔離・片付け・失敗証拠を既存CIへ組み込む。CIでの実行可否は未検証                                                                                                             |
| NGT-082 | 画面からの新規作成を含む実サーバーE2E | READY | #735 はマージ済み。現在のAPIによるジョブ準備と区別し、ウィザード入力→保存→実行→復元→削除の最小実フローを追加。内容一致と削除範囲を確認し#273の完了基準を合意する                                                                                                      |
| NGT-107 | ngax廃止前: 更新版の変更履歴 | INVESTIGATE | ngaxは`/changelog?from-update=true`で更新版の変更履歴を出す。ngclientの`about/changelog`は引数なしで、入っている版のものだけ（検証済み）。通知の「Show Update」から更新版を出すか、表示を切り替えるかを決める。[証拠](evidence/2026-11-17-ngax-parity/README.md) |
| NGT-108 | ngax廃止前: 削除時の共有DB確認と宛先使用量 | INVESTIGATE | ngaxは`isdbusedelsewhere`で共有DBなら「DBも削除」を外して警告し、`report-remote-size`で未取得の使用量を出す。ngclientはどちらも呼ばない（検証済み）。共有DBを消す誤操作を防ぐので優先。[証拠](evidence/2026-11-17-ngax-parity/README.md) |
| NGT-109 | ngax廃止前: 作成時の既存DB再利用 | INVESTIGATE | ngaxは`/remoteoperation/dbpath`で同じ宛先のDBがあれば使うか尋ねる。ngclientは呼ばない（検証済み）。ウィザードのどこで尋ねるかを決める。[証拠](evidence/2026-11-17-ngax-parity/README.md) |
| NGT-110 | ngax廃止前: 保存時の確認 | INVESTIGATE | ngaxは弱い・自動生成のパスフレーズ、パスフレーズ・暗号化の変更、暗号化なし、ソースパスの相対・不存在で確認を出す。ngclientは強度メーターと控えの表示のみ（文言検索のみ、未追試）。どれを移すかを決めてから実装。[証拠](evidence/2026-11-17-ngax-parity/README.md) |
| NGT-111 | ngax廃止前: Nightly更新チャンネル | INVESTIGATE | ngaxの設定にあり、ngclientの選択肢にない（検証済み）。サーバーはNightlyを扱える。今もNightlyが配布されているかを確かめてから追加するか決める。[証拠](evidence/2026-11-17-ngax-parity/README.md) |
| NGT-112 | ngax廃止前: バックアップなしのコマンドライン | INVESTIGATE | ngaxの`/commandline`（メニューになくURL直打ちのみ）で任意の宛先を使える。ngclientはバックアップごとの画面だけ（未追試）。NGT-080・NGT-092と同じCommandlineを触るので、その差分の後。利用が少なそうなので優先度は低い（推測）。[証拠](evidence/2026-11-17-ngax-parity/README.md) |

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
