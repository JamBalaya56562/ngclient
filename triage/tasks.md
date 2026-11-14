# タスク台帳

更新: 2026-11-14。基準main: `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

このファイルが**現在の状態の正本**。日付付き調査文書は根拠・検証範囲・履歴として参照する。Beadsや別のDBは導入しない。GitHubのIssue/PRの状態はGitHubが正本で、この台帳は作業判断用スナップショット。

## 固定IDと状態のルール

- IDは`NGT-001`形式。付番後は名称が変わっても変更・再利用しない。新規は末尾の番号に続ける。統合した行も消さず統合先IDを残す。
- `READY`: 既知の外部ブロッカーがなく、次に調査・実装へ着手できる。修正が必要と確認済みという意味ではない。
- `INVESTIGATE`: 情報不足・重複未確認。調査から着手可能だが実装範囲は未決定。
- `ACTIVE`: 実施中。担当チャット・ブックマーク・着手日を記載し、別セッションは重複着手しない。
- `PUSHED`: 実装・検証・originへのpush済み、未PR。公開指示と最新mainでの再検証待ち。
- `PR_OPEN`: PRレビュー・マージ待ち。`BLOCKED`: 明示した依存待ち。`WAITING`: 報告者・メンテナ回答待ち。
- `DEFERRED`: 方針として保留。`DONE`: 定義した作業範囲が完了。Issue全体のcloseとは区別する。
- 依存列の`NGT-xxx`は前提タスク、外部PRは`duplicati/duplicati#番号`。単なる関連は「関連」と明記し、必須依存と混同しない。
- 表の更新日は状態・判断を最後に確認した日。各作業の証拠に書かれた実行日・main SHAとは別。

## 今後の実装方針・作業順

**検証済み（2026-11-14の取得）**: mainは上記SHA、open PRは#727〜#736の10件。準備済み実装ブランチもこの10件だけで、未PRの実装候補は0件。triageと画像URL保存用ブランチは実装数に含めない。旧FilterComponent候補NGT-034は削除・取り下げ済み。[照合記録](2026-11-14-triage-reconciliation.md)。

基本方針は、**再現できる不具合の修正 → 回帰を防ぐ検証 → 動作を保った構造改善**。機能/APIの導入や移行件数自体を目標にしない。以下の順序は実装候補を選ぶ方針であり、未検証の問題が存在するという宣言や、全候補への一括実装・公開の許可ではない。

### 今から独立して進められる候補

| 優先 | ID                    | 次の作業と終了条件                                                                                                                                                                                                          |
| ---- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | NGT-080 / #497        | 実際のルートから使われるCommandlineComponentの残存Reactive Formsを監査・移行。コマンド切替時の引数の保持/復元、URL state、既存オプション、送信payload、エラー・再試行を既存テストで固定。#727〜#735とは変更ファイルを分ける |
| 2    | NGT-071               | mainに残るログ・DB・Export等のナビゲーションを小さく再監査。単純な移動と操作/disabled付きボタンを区別し、修正が必要なものだけ扱う。#729のhome/restore、#734の宛先、#735の設定を重複変更しない                               |
| 3    | NGT-055、NGT-052〜054 | validation schema、改善要望、secondary restore/deleteの要求とAPI可否を調査。特に削除対象・Sync・保持データを確認し、破壊操作の推測実装や本体機能のUI側回避を避ける                                                          |

バグ候補が新たに再現すればこの順序より優先する。NGT-051 / #311は初回切り分け後、利用者の依頼で表示専用のFile groupを実装しPR #736を公開。レビュー待ちであり重複実装しない。独立作業はNGT-080などへ進む。#497ではCommandlineの次にSettingsなどの実使用フォームを棚卸しし、別IDで小さく分割する。FormsModuleの検索ヒットだけで、共有CVA・既移行画面・未使用コードをすべて未移行と数えない。

### 先行マージ後に進めるもの

| 待機対象                   | 次の作業                                                                                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 本体#7832 → NGT-047 / #328 | 本体マージ後、ブラウザーなしの無変更GET→PUTでURL表記を保持することを再確認。その後ngclientで保存・再読込し、UIが値を変えないことも確認する。公開版への収録は別に確認し、修正済みDebugだけで報告者の配布版でも直ったとは言わない      |
| #735 → NGT-081             | 既存の単一playwright.config.ts/live fixtureを再利用し、実サーバーE2Eを継続実行できる手順/CIへつなぐ。既存workflowへ組み込み、OS・実行契機・サーバー版固定・片付け・失敗証拠を決める。設定ファイルを増やさない                        |
| #735 → NGT-082             | 画面での新規ジョブ作成から実行・復元・削除までを実サーバーで確認する最小フローを追加。現在のliveテストはジョブ準備にAPIを使うので、全ウィザード入力は未カバー。まず通常ローカルバックアップ1件から。#273の終了条件をメンテナと揃える |
| #728・#736 → NGT-005       | locked/リンク先表示とFile groupを統合してからfile-treeのキーボード・フォーカス・ARIA契約を評価。Angular Aria/CDKは既存部品より利点を示せる範囲でのみ採用し、一括置換しない                                                           |
| #730〜#733                 | Status/WSの同じファイルへの追加修正は先行マージを待つ。別ファイルの独立調査まで止める依存ではない                                                                                                                                    |

### Angular・APIの実装原則

既存のSignal Forms、RouterLink、DestroyRef等の公開APIを適合する範囲で使い、外部との副作用・状態・破棄の責任を明確にする。生成OpenAPIクライアントの型、認証interceptor、relayの経路を維持し、公式機能を使うためだけに生HTTPへ置き換えない。性能改善は同条件の実測で判断する。SSRや新しい設定ファイル・依存の導入は、具体的な必要性と利点が確認できた場合に限る。

### 返信・判断待ちと公開ルール

#215/#283/#492/#217/#401/#449/#627は既に検証範囲付きの公開コメントがある。#637も方針確認済みで返信待ち。同じコメント・検証を未実施として繰り返さず、新しい再現条件や返信があれば再開する。#636/#466はclose済みで、追加機能のPR待ちとIssue未解決を混同しない。

実装は最新mainから独立ブランチを作り、triageを親にしない。既存PR・準備済み差分・本体依存を先に照合する。修正では赤→緑、関連spec・型・本番ビルドと、必要な実サーバー確認を残す。PR作成は明示の指示がある場合だけ。先行PRに積む場合はそのマージまで後段PRを出さない。Issue全体の受け入れ条件を満たす場合のみFixes/Closes、部分対応はRefsと残件を明記する。

## 構造改善

根拠・受け入れ条件: [Angular改善計画](2026-11-12-angular-modernization.md)。以下の改善効果や不具合発生は、別記しない限り**推測・未検証**。

| ID      | 内容                                         | 状態        | 依存・重複回避                                                                                    | 次の行動                                                                                                                                                                                                                                                                                                           | 更新       |
| ------- | -------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| NGT-001 | 独自Signalラッパー整理                       | DONE        | codex/public-signal-helpers。main独立、本体依存なし                                               | [検証記録](2026-11-12-ngt-001-signal-helpers.md)。PR #706 マージ済み。ブックマーク削除済み                                                                                                                                                                                                                         | 2026-11-14 |
| NGT-002 | 非同期読み取り・破棄処理（ServiceHub timer） | DONE        | codex/service-hub-timer-lifecycle。独立main、本体依存なし                                         | [検証記録](2026-11-12-ngt-002-async-lifecycle.md)。PR #707 マージ済み（ブックマーク削除済み）、残る監査はNGT-056                                                                                                                                                                                                   | 2026-11-14 |
| NGT-003 | Routerとナビゲーションの意味（サイドバー）   | DONE        | codex/sidebar-router-links。独立main、本体依存なし                                                | [検証記録](2026-11-12-ngt-003-sidebar-navigation.md)。PR #708 マージ済み（ブックマーク削除済み）、残る監査はNGT-057                                                                                                                                                                                                | 2026-11-14 |
| NGT-004 | 動的リストの安定したtrack                    | PR_OPEN     | codex/stable-backup-list-tracking。最新main独立、本体依存なし                                     | [赤3件→緑・E2E9件・単体28件・ビルド](2026-11-14-ngt-004-stable-tracking.md)。PR #729 公開済み。NGT-079も同じブランチで対応済み                                                                                                                                                                                     | 2026-11-14 |
| NGT-005 | Aria/CDKの適合評価                           | BLOCKED     | NGT-030はmain反映済み。NGT-033 / PR #728 とNGT-051 / PR #736 のマージ待ち                         | 統合後にfile-treeの既存契約と採用効果を小範囲評価。NGT-046 / #636 の再オープンは前提でない                                                                                                                                                                                                                         | 2026-11-14 |
| NGT-006 | 実サーバーE2E整備 / #273                     | PR_OPEN     | codex/live-editor-persistence-e2e。最新main独立。設定は既存playwright.config.tsのliveモードへ統合 | [実サーバー6件（保存・通常/AES・直接復元・誤入力/空欄回復）・ビルド](2026-11-14-ngt-006-live-editor-e2e.md)。PR #735 公開済み。全体closeは保留。同じブランチへ非暗号化/AESのローカルbackup/restoreと、設定なし・画面パスフレーズ入力の直接復元と誤入力・空欄からの回復を追加済み。runnerマージ後に次のフローを追加 | 2026-11-14 |
| NGT-007 | Signal Forms全体 / #497                      | INVESTIGATE | General #682とNGT-010〜029の移行PR #687〜#704はmain反映済み                                       | 残る実使用フォームを監査。次候補NGT-080はCommandline。共有CVA・未使用旧コードを区別し、全完了を確認するまでRefs                                                                                                                                                                                                    | 2026-11-14 |
| NGT-008 | SSR・画像最適化等                            | DEFERRED    | 導入根拠となる課題が未観測                                                                        | 性能・UX課題が観測された場合のみ再評価                                                                                                                                                                                                                                                                             | 2026-11-12 |

## 個別実装の履歴とレビュー状態

**過去の検証記録（2026-11-12、現在の件数ではない）**: #684〜#694はマージ済み。残る20実装ブランチとtriageで全単体テスト・本番ビルドが成功し、変更したE2Eも成功した。その時点の21ブックマークのoriginとのSHA一致を確認済み。NGT-020〜029の10件をPR #695〜#704として公開した。SHA・コマンドと結果・再試行の内容は[全ブランチ検証記録](2026-11-12-rebase-validation.md)を参照。記録の追記はMarkdownのみで、検証後にアプリのソース変更はない。

| ID      | 範囲                          | 状態    | PR / ブックマーク（codex/以下）                                                                   | 依存・次の行動                                                                                                                                                                            |
| ------- | ----------------------------- | ------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NGT-010 | Schedule / Options            | DONE    | #687 / migrate-schedule-options-signal-forms                                                      | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-011 | Source data                   | DONE    | #688 / migrate-source-data-signal-forms                                                           | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-012 | 詳細オプション値              | DONE    | #689 / migrate-option-values-signal-forms                                                         | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-013 | Import encryption             | DONE    | #690 / migrate-import-encryption-signal-forms                                                     | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-014 | Restore encryption            | DONE    | #691 / migrate-restore-encryption-signal-forms                                                    | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-015 | Restore config                | DONE    | #692 / migrate-restore-config-signal-forms                                                        | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-016 | Login                         | DONE    | #693 / migrate-login-signal-forms                                                                 | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-017 | Import file                   | DONE    | #694 / migrate-import-file-signal-forms                                                           | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-020 | Export                        | DONE    | [#696](https://github.com/duplicati/ngclient/pull/696) / migrate-export-signal-forms              | mainへマージ済み。ローカル・originのブックマーク削除済み                                                                                                                                  |
| NGT-021 | Throttle                      | DONE    | [#703](https://github.com/duplicati/ngclient/pull/703) / migrate-throttle-signal-forms            | mainへマージ済み。ローカル・originのブックマーク削除済み                                                                                                                                  |
| NGT-022 | Database path                 | DONE    | [#695](https://github.com/duplicati/ngclient/pull/695) / migrate-database-path-signal-forms       | mainへマージ済み。ローカル・originのブックマーク削除済み                                                                                                                                  |
| NGT-023 | Remote registration           | DONE    | [#700](https://github.com/duplicati/ngclient/pull/700) / migrate-remote-registration-signal-forms | mainへマージ済み。ローカル・originのブックマーク削除済み                                                                                                                                  |
| NGT-024 | Restore URL                   | DONE    | [#702](https://github.com/duplicati/ngclient/pull/702) / migrate-restore-url-signal-forms         | mainへマージ済み。ローカル・originのブックマーク削除済み                                                                                                                                  |
| NGT-025 | Import selection              | DONE    | [#698](https://github.com/duplicati/ngclient/pull/698) / migrate-import-selection-signal-forms    | mainへマージ済み。ローカル・originのブックマーク削除済み                                                                                                                                  |
| NGT-026 | Home search                   | DONE    | [#697](https://github.com/duplicati/ngclient/pull/697) / migrate-home-search-signal-forms         | mainへマージ済み。ローカル・originのブックマーク削除済み                                                                                                                                  |
| NGT-027 | Initial passphrase            | DONE    | [#699](https://github.com/duplicati/ngclient/pull/699) / migrate-initial-passphrase-signal-forms  | mainへマージ済み。ローカル・originのブックマーク削除済み                                                                                                                                  |
| NGT-028 | Restore search                | DONE    | [#701](https://github.com/duplicati/ngclient/pull/701) / migrate-restore-search-signal-forms      | mainへマージ済み。ローカル・originのブックマーク削除済み                                                                                                                                  |
| NGT-029 | Version labels                | DONE    | [#704](https://github.com/duplicati/ngclient/pull/704) / migrate-version-labels-signal-forms      | mainへマージ済み。ローカル・originのブックマーク削除済み                                                                                                                                  |
| NGT-030 | locked展開防止・Access denied | DONE    | #684 / prevent-locked-folder-expansion                                                            | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-031 | Pause E2E                     | DONE    | #685 / test-server-pause                                                                          | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-032 | Job deletion E2E              | DONE    | #686 / test-job-deletion                                                                          | mainへマージ済み。ブックマーク削除済み                                                                                                                                                    |
| NGT-033 | リンク先表示                  | PR_OPEN | [#728](https://github.com/duplicati/ngclient/pull/728) / show-file-tree-link-target               | 本体#7775はマージ済み。最新main上の関連spec・ビルド成功。旧サーバーのnull/未定義をテスト。今回の実サーバー統合は未再確認。#636は既にclose済みでこの追加表示とは別                         |
| NGT-034 | 旧folder filter候補の取り下げ | DONE    | fix/folder-filter-separatorsはローカル・originから削除済み                                        | 旧FilterComponentは現行画面で未使用のため利用者指示で候補を取り下げ。専用コミットもabandon。機能修正の完了やIssue解決を意味しない。[整理記録](2026-11-14-drop-unused-filter-candidate.md) |

## Issueの残件・回答待ち

状態は2026-11-14にGitHub APIで再取得。下表が現在の判断。過去の動作検証を今回のmainで再実行したという意味ではない。[照合記録](2026-11-14-triage-reconciliation.md)。

| ID      | Issue / 内容           | 状態        | 依存・次の行動                                                                                                                                                                                                                                                                                                                                                             |
| ------- | ---------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NGT-040 | #215 世代削除          | WAITING     | Issue open。[実サーバー検証・close提案済み](https://github.com/duplicati/ngclient/issues/215#issuecomment-6779794381)。メンテナ判断待ち                                                                                                                                                                                                                                    |
| NGT-041 | #283 再接続            | WAITING     | Issue open。[WS/long polling復帰の公開確認済み](https://github.com/duplicati/ngclient/issues/283#issuecomment-6779880314)。報告者確認待ち。追加の寿命管理PR #733 と元症状のclose判断を分ける                                                                                                                                                                               |
| NGT-042 | #492 時差・DST         | WAITING     | Issue open。[日次全曜日・DST前後6起動の公開確認済み](https://github.com/duplicati/ngclient/issues/492#issuecomment-6779919691)。報告者確認待ち。除外曜日や曖昧時刻は未検証                                                                                                                                                                                                 |
| NGT-043 | #217 破損ファイル削除  | WAITING     | Issue open。[データvolume欠損・旧世代復元とclose提案済み](https://github.com/duplicati/ngclient/issues/217#issuecomment-6780101822)。他の破損種類は未検証                                                                                                                                                                                                                  |
| NGT-044 | #401 Windows宛先パス   | WAITING     | Issue open。[実Windowsで入力・保存・再読込の公開確認済み](https://github.com/duplicati/ngclient/issues/401#issuecomment-6780391498)。報告者確認待ち                                                                                                                                                                                                                        |
| NGT-045 | #449 cross-OS復元      | WAITING     | 本体#7776後のDebugで両方向の一覧・UI復元・内容一致を検証済み（追加ngclient修正なし）。[公開報告・再確認依頼済み](https://github.com/duplicati/ngclient/issues/449#issuecomment-6867298500)。Issueはopenで返信待ち。配布版への収録、fresh直接API復元等は別確認                                                                                                              |
| NGT-046 | #636 junction          | DONE        | GitHubはclosed/completed。本体#7772/#7775はマージ済み、locked展開防止#684もmain反映済み。報告者の独語Windows環境は今回未検証。追加リンク先表示はNGT-033 / #728 で、IssueをBLOCKEDにする依存ではない                                                                                                                                                                        |
| NGT-047 | #328 URL再構築         | BLOCKED     | 本体[PR #7832](https://github.com/duplicati/duplicati/pull/7832)（fix/keep-target-url-when-masking）がopen。マージ後にブラウザーなしGET→PUTとUI保存を再確認。#618のUI対策を繰り返さず、Issue全体を先にcloseしない                                                                                                                                                          |
| NGT-048 | #466 pCloud            | DONE        | GitHubはclosed/completed。[報告者が2.4.0.1で正常動作と返信](https://github.com/duplicati/ngclient/issues/466#issuecomment-6830293591)。ローカルで全OAuth環境を再検証したという意味ではない                                                                                                                                                                                 |
| NGT-049 | #627 editor tabs/save  | WAITING     | main UIで5ページの直接移動・保存・再読込を確認。[コメント投稿・訂正済み](https://github.com/duplicati/ngclient/issues/627#issuecomment-6867035192)。Save changesは公式2.4.1.101 Canaryに収録確認、実画面検証はmain UI。タブ外観・ツアーの残要望と報告者の再確認待ち                                                                                                        |
| NGT-050 | #637 hidden/system設定 | WAITING     | 意図的な削除を確認。[方針確認コメント](https://github.com/duplicati/ngclient/issues/637#issuecomment-6866136054)への返信なし。先に旧チェックボックスを戻さない。追加操作の不具合はNGT-078 / #727 の別範囲                                                                                                                                                                  |
| NGT-051 | #311 flat file restore | PR_OPEN     | [PR #736](https://github.com/duplicati/ngclient/pull/736) / codex/restore-individual-file-groups。main独立、本体依存なし。表示専用File groupで保存済みの個別ファイルだけを選択し、実フォルダーと区別。赤5→緑6、全2317件、本番E2E12件、実サーバー3ケース成功。新旧4画像を本文へ掲載。Fixes #311はマージ時のclose指定。[記録](2026-11-14-ngt-051-individual-file-restore.md) |
| NGT-052 | #409 suggestions       | INVESTIGATE | 要求と再現条件を確認                                                                                                                                                                                                                                                                                                                                                       |
| NGT-053 | #460 secondary restore | INVESTIGATE | 本体依存の有無から確認                                                                                                                                                                                                                                                                                                                                                     |
| NGT-054 | #462 secondary delete  | INVESTIGATE | 本体依存の有無から確認                                                                                                                                                                                                                                                                                                                                                     |
| NGT-055 | #126 validation schema | INVESTIGATE | 既存Signal Forms・検証との境界を確認                                                                                                                                                                                                                                                                                                                                       |

## 監査タスクの進捗

| ID      | 内容                                     | 状態    | 依存・次の行動                                                                                                                                                                                                                                                                 |
| ------- | ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NGT-056 | 長ポーリングの購読・破棄ライフサイクル   | DONE    | codex/longpoll-service-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルドの記録](2026-11-13-ngt-056-longpoll-lifecycle.md)。PR #723 マージ済み（ブックマーク削除済み）。非同期監査全体の残りはNGT-072                                                                       |
| NGT-057 | ナビゲーション監査（Add Backup入口）     | DONE    | codex/add-backup-router-links。独立main、本体依存なし。[検証記録](2026-11-12-ngt-057-add-backup-navigation.md)。PR #709 マージ済み（ブックマーク削除済み）、残る評価はNGT-058                                                                                                  |
| NGT-058 | 接続ステータスのナビゲーション           | DONE    | codex/console-connection-router-links。独立main、本体依存なし。[検証記録](2026-11-12-ngt-058-connectivity-navigation.md)。PR #710 マージ済み（ブックマーク削除済み）、残る評価はNGT-059                                                                                        |
| NGT-059 | バックアップ編集のルートID入力           | DONE    | codex/backup-route-input-binding。独立main、本体依存なし。[検証記録](2026-11-12-ngt-059-backup-route-input.md)。PR #711 マージ済み（ブックマーク削除済み）、残る評価はNGT-060                                                                                                  |
| NGT-060 | ジョブログのルートID入力                 | DONE    | codex/job-log-route-input-binding。独立main、本体依存なし。[検証記録](2026-11-12-ngt-060-job-log-route-input.md)。PR #712 マージ済み（ブックマーク削除済み）、残る評価はNGT-061                                                                                                |
| NGT-061 | コマンド実行結果のルート入力             | DONE    | codex/command-result-route-input-binding。独立main、本体依存なし。[検証記録](2026-11-12-ngt-061-command-result-input.md)。PR #713 マージ済み（ブックマーク削除済み）、残る評価はNGT-062                                                                                        |
| NGT-062 | ナビゲーション監査（復元進捗taskid入力） | DONE    | codex/restore-progress-route-input。main独立、本体依存なし。[変更前後の契約テスト・ビルド・E2E](2026-11-12-ngt-062-restore-progress-input.md)。PR #714 マージ済み（ブックマーク削除済み）。残る評価はNGT-064                                                                   |
| NGT-063 | ログ画面のRouter購読の破棄               | DONE    | codex/logs-router-subscription-lifecycle。main独立、本体依存なし。PR #715 マージ済み（ブックマーク削除済み）。[赤→緑・ビルド・E2Eの記録](2026-11-12-ngt-063-logs-router-lifecycle.md)                                                                                          |
| NGT-064 | Aboutのnativeリンク・選択同期            | DONE    | codex/about-navigation-links。main独立、本体依存なし。[赤→緑・実画面・ビルドの記録](2026-11-12-ngt-064-about-navigation.md)。PR #716 マージ済み（ブックマーク削除済み）。ホーム・route入力の残りはNGT-065                                                                      |
| NGT-065 | 復元オプションの戻るリンク               | DONE    | codex/restore-options-back-link。main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-065-restore-options-back.md)。PR #717 マージ済み（ブックマーク削除済み）。ホーム・Router使用箇所の残りはNGT-066                                                             |
| NGT-066 | ジョブ削除画面のナビゲーション           | DONE    | codex/delete-backup-navigation-links。main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-066-delete-navigation.md)。PR #718 マージ済み（ブックマーク削除済み）。残る評価はNGT-067                                                                               |
| NGT-067 | 復元設定・ファイル削除のホーム移動リンク | DONE    | codex/wizard-home-navigation-links。main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-067-wizard-home-links.md)。PR #719 マージ済み（ブックマーク削除済み）。残りはNGT-068                                                                                     |
| NGT-068 | 設定インポートのホーム移動リンク         | DONE    | codex/import-home-navigation-link。main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-068-import-home-link.md)。PR #720 マージ済み（ブックマーク削除済み）。残る監査はNGT-069                                                                                   |
| NGT-069 | コマンド画面のホーム移動リンク           | DONE    | codex/commandline-home-link。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-069-commandline-home-link.md)。PR #721 マージ済み（ブックマーク削除済み）。残る監査はNGT-070                                                                                |
| NGT-070 | ログアウト完了画面の移動リンク           | DONE    | codex/logout-navigation-link。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-070-logout-link.md)。PR #722 マージ済み（ブックマーク削除済み）。既知の残件はNGT-071へ集約                                                                                 |
| NGT-071 | 先行マージ後のナビゲーション再監査       | READY   | ホーム#697・接続画面#700・ルートID #711はマージ済み。マージ済みNGT-064〜070と重ならない範囲を現行mainで再監査する。disabled/状態変更付き操作は維持                                                                                                                             |
| NGT-072 | タスク完了購読・待機の破棄ライフサイクル | DONE    | codex/task-waiter-service-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルドの記録](2026-11-13-ngt-072-task-waiter-lifecycle.md)。PR #724 マージ済み（ブックマーク削除済み）。残る非同期監査はNGT-073                                                                       |
| NGT-073 | About更新確認の非同期処理・破棄          | DONE    | codex/update-check-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-073-update-check-lifecycle.md)。PR #725 マージ済み（ブックマーク削除済み）。Promise APIの通信自体は中断せずUI購読を終了。残る監査はNGT-074                                 |
| NGT-074 | Status停止・中断要求の状態と破棄         | PR_OPEN | codex/status-task-action-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-074-status-task-actions.md)。PR #731 公開済み。Stop待ち中のAbortを維持。残る監査はNGT-075                                                                            |
| NGT-075 | Status snapshot取得セッションの寿命      | PR_OPEN | codex/status-snapshot-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-075-status-snapshot-lifecycle.md)。PR #730 公開済み。旧応答と追加ループを分離。残る監査はNGT-076                                                                        |
| NGT-076 | StatusBar進捗取得の重複・応答寿命        | PR_OPEN | codex/statusbar-progress-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-076-statusbar-progress-lifecycle.md)。PR #732 公開済み。二段階取得の重複と旧応答を分離。残る監査はNGT-077                                                            |
| NGT-077 | WebSocket接続・非同期認証の寿命監査      | PR_OPEN | codex/websocket-connection-lifecycle。最新main独立、本体依存なし。[赤8件→緑・型チェック・ビルド・E2E](2026-11-14-ngt-077-websocket-lifecycle.md)。PR #733 公開済み。隔離Canaryで実JWT期限切れ・更新503→200後のWS購読復帰を確認（再読込0）。StatusBar等の準備済み変更を含まない |
| NGT-078 | 詳細オプション追加アクションの無効状態   | PR_OPEN | codex/advanced-options-actions。main独立、本体依存なし。[赤→緑・実サーバー記録](2026-11-14-advanced-option-actions.md)。PR #727 公開済み                                                                                                                                       |
| NGT-079 | リスト並替時のフォーカス保持             | PR_OPEN | 利用者指示でNGT-004と同じcodex/stable-backup-list-trackingに追加。並替後の同一ジョブfocus、明示blur・削除・検索をChromiumで確認。隔離実Canaryの追加・削除・名前順更新も3表示で成功。[赤3件→緑・ビルドの記録](2026-11-14-ngt-079-reorder-focus.md)。PR #729 公開済み            |
| NGT-080 | #497 CommandlineのSignal Forms移行       | READY   | app.routes.tsの実使用ルートとbaseCmdForm/standardFieldsのReactive Formsを静的確認。バグ再現は未実施。既存の引数切替・URL state・送信を固定し、CommandlineComponentに範囲を限定。新しい依存/重複は着手時に再照合                                                                |
| NGT-081 | 実サーバーE2Eの継続実行                  | BLOCKED | NGT-006 / #735 マージ待ち。単一設定とlive fixtureを再利用し、実行契機・固定サーバー版・隔離・片付け・失敗証拠を既存CIへ組み込む。CIでの実行可否は未検証                                                                                                                        |
| NGT-082 | 画面からの新規作成を含む実サーバーE2E    | BLOCKED | #735 マージ待ち。現在のAPIによるジョブ準備と区別し、ウィザード入力→保存→実行→復元→削除の最小実フローを追加。内容一致と削除範囲を確認し#273の完了基準を合意する                                                                                                                 |
| NGT-083 | SSH Browse時のホストキー承認             | PR_OPEN | PR #734 / fix/browse-approve-host-key。main独立、本体の新規API依存なし。既存ブランチと関連spec・ビルドを検証済み。Issue #373は既にclose済みで別のBrowse経路を補完                                                                                                              |

## 更新手順と履歴

作業開始時にIDをACTIVEへ変え、担当チャット識別子・ブックマーク・着手日を記載する。終了時は証拠への参照、次の行動、更新日も同時に更新する。PR作成・マージ後はGitHub APIまたはghで実状態を確認し、対応IDの状態を変更する。依存のマージだけで自動的にDONEにはせず、統合後の検証と要求充足を確認する。

依存先が完了したらBLOCKED行を再評価し、着手可能一覧も更新する。完了行は履歴として残す。今回のIDには欠番を設けているが既存IDを詰め直さず、新規はNGT-084から付番する（NGT-080〜083は本更新で割り当て済み）。

- 2026-11-12: 初回台帳を追加。固定ID、状態、依存、着手候補を既存の調査記録から整理。新しいバグ再現・コード変更・テスト実行はしていない。

確認コマンド（実際はmise管理下のjj/gh実体を直接使用）:

```text
jj git fetch --all-remotes
jj bookmark list --all-remotes
gh pr list --repo duplicati/ngclient --state open --limit 100 --json number,title,headRefName
gh issue list --repo duplicati/ngclient --state open --limit 100 --json number
gh pr view 7772 --repo duplicati/duplicati --json number,state,mergedAt
gh pr view 7775 --repo duplicati/duplicati --json number,state,mergedAt
gh pr view 7776 --repo duplicati/duplicati --json number,state,mergedAt
```

- 2026-11-13: #695〜#705のマージを照合し、11ブランチを整理。残存26実装とtriageをmainへrebaseし、関連テスト・全本番ビルド・変更E2Eを検証。10件をPR公開。[証拠とSHA一覧](2026-11-13-maintenance-validation.md)。

- 2026-11-14: #706〜#715のMERGED/headを照合し10ブランチを整理。16実装とtriageを最新mainへrebase・pushし、関連テスト・本番ビルド・変更E2Eを検証。10件を公開。[記録](2026-11-14-maintenance-validation.md)。

- 2026-11-14（現状照合）: open 9PRと9実装ブランチ、未PR 0件を照合。#449/#627の未投稿表記、#636/#466の状態、本体#7832の依存を訂正。作業順を更新しNGT-080〜083を付番（083は既存SSH PR #734の台帳登録）。[根拠](2026-11-14-triage-reconciliation.md)。

- 2026-11-14（NGT-051）: #311を最新mainの本番UIと隔離Windows Canaryで確認。個別/混在/フォルダーの3ケースでAPIとDOMが一致、選択復元も成功。意図的な平坦表示は変更せず、仮想グループの仕様判断を残した。関連38 specと本番ビルド成功。[記録](2026-11-14-ngt-051-individual-file-restore.md)。

- 2026-11-14（NGT-051実装）: 利用者の公開指示により表示専用グループを実装しPR #736を公開。open 10件・未PR実装0件。画像専用codex/pr-311-screenshotsは実装候補に数えず保持。[証拠](2026-11-14-ngt-051-individual-file-restore.md)。
