# 現在のタスク台帳

状態照合: **2026-11-19 更新**。ngclient main `5c520f1311b7805bd26cf2e4ff420127e46b1d72`。本体の状態は前回照合時点の記録（今回再取得なし）。

GitHubをIssue/PR状態の正本、このファイルを作業判断の正本とする。[今回の照合記録](evidence/2026-11-18-state-refresh/verification.md)。動作試験の件数は実施したSHAに限り、状態照合を動作の追試に置き換えない。

## 現在地

- こちらの#758〜765は8件すべてマージ済み。対応するlocal/originブランチ8本を削除した。Issue数・全open PR数は今回再集計していない。
- 最新mainは#776まで統合済み。#767（テーマ）・#768（Home操作ダイアログ）も統合済み。#766もマージ済み（現在のopen PR検索は0件）。
- 実装ブランチは7本＝公開中2本（#777・#778）＋本体待ち5本。#771〜776はマージ済みでlocal/originブランチを削除。残る実装とtriageをmain `5c520f1311b7`へ更新。固定画像/証拠参照4本と別workspaceは維持。
- upstreamの新規PR [#766](https://github.com/duplicati/ngclient/pull/766) は版比較画面。#761と`backup/commandline/commandline.component.ts`・specを共有する。ファイル重複は検証済みだが、実際のmerge conflict・機能依存は未検証。どちらかがマージされたら他方をrebase・再検証する。
- #768統合に合わせNGT-086のSkip next runを新しい操作ダイアログへ移した。NGT-118の先行マージ待ちは解除。
- 元の返信待ち5件は、回帰テストPR #772〜776のマージによりcompletedでclose済み。新たなIssueコメントは投稿していない。

## 次の候補と着手順

バグの再現・切分けを優先する。新たな不具合が確認できなければ、実サーバーE2Eを充実させる。既存PRの同じ画面・同じファイルを重ねて実装しない。

| 優先 | ID | 状態 | 範囲・完了条件 |
| --- | --- | --- | --- |
| 1 | NGT-081 / #273 | READY | 現在のlive fixtureと単一Playwright設定を使い、固定した公式サーバー版・取得検証・隔離・終了処理・失敗artifactを既存CIへ組み込む。最初はworkflow_dispatch等の実行契機を決める。#765のspecを変更せず、既存ケースでも動く構成にする。CIでliveを流した実績はまだない。 |
| 2 | NGT-118 / #273 | READY | #768はマージ済み。現在のHome操作ダイアログを使う。 **新規: 実サーバーでのUI削除E2E**。隔離ジョブをAPIで準備し、Home→削除画面→取消で変更なし→確認後にジョブと選んだローカルDBだけ削除、宛先ファイルのハッシュ保持を検証。既存live fixtureを再利用し、#765の`backup-restore.spec.ts`を編集しない。#759の共有DBガードが入っても、共有していない通常ジョブで成立すること。実装・実行は未着手。 |
| 3 | NGT-005 | READY | Aria/CDK適合評価。先行#728/#736/#740/#751はすべてマージ済みなので外部BLOCKEDを解除。現行ツリーのARIA・選択・キーボード契約を照合し、導入により解決できる観測課題があるか調べる。一括置換自体を目的にしない。 |
| 4 | NGT-119 / #497 | READY | **新規: Start-all完了後操作のSignal Forms移行**。実使用中の`home/start-all-dialog`のafter-action入力だけを対象にする。None/null、未対応アクションのNoneへの戻し、候補表示、選択順、未選択時disabled、Cancelを維持。Shutdown等の副作用はモックで送信値を確認。共有Set/checkboxを機械的にフォーム化しない。#761/#766や準備済み5本とファイル重複なし。実装・試験は未着手。 |

## 先に調査・範囲決定が必要なもの

| ID | 状態 | 次の判断・重複回避 |
| --- | --- | --- |
| NGT-116 | INVESTIGATE | 変更履歴の見出し末尾にSafeValue診断URLをNGT-107の本番UIで観測。純粋mainでの再現・原因・修正は未検証。#758と同じChangelogを編集するので、実装前に先行差分を確認（先行マージ推奨）。 |
| NGT-117 | INVESTIGATE | 削除URLのcold startで名前・DBPathが空になる現象をNGT-108の本番UIで観測。Homeからは動作済み。純粋mainの再現と一覧取得の切分けが先。#759と同じ削除コンポーネントのため実装修正は調整する。 |
| NGT-052 / #409 | INVESTIGATE | 通知、ログへの導線、進捗、ツールチップ、現在ファイル、配色/余白の要望を項目別に調べる。「機能なし」「発見しにくい」「不具合再現」「仕様相談」を分離し、一部改善で全closeにしない。ログ/比較は#766、メニューの発見性は#768で対応中の範囲を先に照合する。 |
| NGT-053 / #460 | INVESTIGATE | secondary宛先の復元。一次DBとsecondaryの内容が一致しない場合も考慮し、対象宛先のAPI契約を先に確認する。既存APIで可能か、追加本体対応が必要かは未確定。 |
| NGT-054 / #462 | INVESTIGATE | secondary宛先の削除。宛先単位の指定と、選ばなかった宛先・共有DBの保持を確認する。#759は共有ローカルDBガードで、この要望の全対応ではない。API不足なら本体側へ依頼する。 |
| NGT-055 / #126 | INVESTIGATE | 詳細オプションのMin/Max/Pattern等を配るAPI契約の合意が先。既存のenum選択・クライアント検証とは別。検証schemaの実装済みAPI/対応PRは今回確認していない。 |
| NGT-007 / #497 | INVESTIGATE | 移行残りの棚卸し。HTML検索では29テンプレートが一致したが、29個の未移行フォームという意味ではない。実使用ルート、CVA内部、通常のUI状態、未使用旧Schedule/Filterを分ける。テーマ/設定付近は新規#767とも照合。#761はマージ済み、独立した初手はNGT-119。 |
| NGT-111 | INVESTIGATE | Nightly更新チャンネル。現在の配布状況とサーバーの扱いを確認してから追加の是非を決める。今回のNightly配布状況は未検証。 |
| NGT-112 | INVESTIGATE | バックアップ設定なしのコマンド画面。利用要件とAPI契約が先。#761/#766と同じCommandlineを触るため先行マージ/差分照合後。 |
| NGT-008 | DEFERRED | SSR・画像最適化等。導入根拠となる性能/UX課題は未観測。必要性を観測してから評価する。 |

## 直近のマージ済みPR（#283もcompletedでclose済み）

| ID / Issue | PR / ブランチ | 状態・検証 |
| --- | --- | --- |
| NGT-041 / #283 | [#771](https://github.com/duplicati/ngclient/pull/771) / `codex/live-auth-reconnect` / `7251bc8806ce` | MERGED / Closes #283。実サーバーの期限切れ・一時503後のWS/長ポーリング復帰4ケースを追加。実際に見つかった一覧取得の未処理エラーも修正。live全13件、関連単体67件、app/spec/E2E型、本番ビルド成功。[証拠](evidence/2026-11-18-reconnect283-e2e/verification.md)。 |

## マージ済みの独立した回帰テストPR

| ID / Issue | PR / branch | 状態・検証 |
| --- | --- | --- |
| NGT-044 / #401 | [#772](https://github.com/duplicati/ngclient/pull/772) / `codex/live-windows-destination-path` | MERGED / Closes #401。Windows実サーバーで入力・保存・再読込。1 passed。 |
| NGT-049 / #627 | [#773](https://github.com/duplicati/ngclient/pull/773) / `codex/live-editor-page-save` | MERGED / Closes #627。既存liveテストを全5ページへ拡張。タブ外観/ガイドツアーは未追加で、既存編集の代替フローを根拠とするclose提案。 |
| NGT-043 / #217 | [#774](https://github.com/duplicati/ngclient/pull/774) / `codex/live-broken-files-purge` | MERGED / Closes #217。欠損データの一覧・確認前不変・purge後の正常旧版復元。1 passed。全破損種別の保証ではない。 |
| NGT-045 / #449 | [#775](https://github.com/duplicati/ngclient/pull/775) / `codex/live-cross-os-restore` | MERGED / Closes #449。本体#7776マージ済み。合成実バックアップでLinux↔Windowsの実UI/API復元、両方向passed。 |
| NGT-042 / #492 | [#776](https://github.com/duplicati/ngclient/pull/776) / `codex/live-schedule-timezone-roundtrip` | MERGED / Closes #492。DST境界の日付編集・保存・Homeと実LastRun保持、6 passed。今回サーバー時計をDST境界へ進めてはいない。 |

[共通の検証記録・full SHA・コマンド](evidence/2026-11-19-five-issue-regressions/verification.md)。各ブランチのE2E型・整形・本番ビルド成功。LiveのCI自動化は別NGT-081。

検証基盤の後続課題:

| ID | 状態 | 範囲 |
| --- | --- | --- |
| NGT-120 | PR_OPEN | [#777](https://github.com/duplicati/ngclient/pull/777) / `codex/live-browser-safe-ports` / `79dbfd8be5a2`。ブラウザー向けproxyを高位帯へ直接bindし、衝突/拒否を最大32回まで再選択。新規5件・mainベースlive全14件・型/本番ビルド成功。#771〜776マージ後、メンテナの解消済みツリーを保持して最新mainへrebase。CIはテスト失敗ではなく10分のjob上限で205/207成功後に中断。browser jobだけ15分へ修正。同じPRにpushし通常E2E207件・port5件・型/整形/本番ビルド成功。修正後CIのUnit Tests/Production Build/browser-testsもすべてSUCCESS（CI207件成功）。[更新証拠](evidence/2026-11-19-maintenance/verification.md)。[証拠](evidence/2026-11-19-ngt120-browser-safe-ports/verification.md)。 |

## 直近の完了PR

| ID / Issue | PR / ブランチ | 状態・検証 |
| --- | --- | --- |
| NGT-040 / #215 | [#770](https://github.com/duplicati/ngclient/pull/770) / `codex/live-delete-versions` / `2a23dab67c24` | MERGED / #215はcompletedでclose済み。Closes #215。実装済み機能の実サーバー回帰E2E追加。中間だけ削除・新旧両版復元・Compactオフ23→23/オン23→2。live全9件、関連単体11件、E2E型、本番ビルド成功。[証拠](evidence/2026-11-18-delete215-e2e/verification.md)。配布版での今回spec実行・CI live自動化は対象外。 |

## マージ済みの直近8件（実装ブランチ削除済み）

| ID / PR | ブランチ / 現在head | 状態・残件 |
| --- | --- | --- |
| NGT-107 / [#758](https://github.com/duplicati/ngclient/pull/758) 更新版の変更履歴 | `codex/update-changelog-source` / `d7c6eb752caa` | MERGED / 当時のCI3種SUCCESS。query切替を実装。既存markdown診断文言はNGT-116で別調査 |
| NGT-108 / [#759](https://github.com/duplicati/ngclient/pull/759) 共有DBの削除防止 | `codex/guard-shared-database-deletion` / `d5e305dfe468` | MERGED / 当時のCI3種SUCCESS。宛先使用量のreport-remote-size対応は残る |
| NGT-104 / [#760](https://github.com/duplicati/ngclient/pull/760) ツリー再展開の回帰テスト | `codex/file-tree-reexpansion-coverage` / `3c0bd014ef1b` | MERGED / 当時のCI3種SUCCESS。本番コード変更なし。疑いを修正済みとは扱わない |
| NGT-080 / [#761](https://github.com/duplicati/ngclient/pull/761) CommandlineのSignal Forms | `codex/command-editor-signal-fields` / `4194f31c9869` | MERGED / 当時のCI3種SUCCESS。Refs #497。全フォーム移行ではない。#766との共有ファイルに注意 |
| NGT-110 / [#762](https://github.com/duplicati/ngclient/pull/762) 未暗号化remote保存の確認 | `codex/remote-encryption-save-confirmation` / `e950991af4bd` | MERGED / 当時のCI3種SUCCESS。弱い/自動生成passphrase・暗号化変更・source確認は残る |
| NGT-109 / [#763](https://github.com/duplicati/ngclient/pull/763) 既存CLI用DB再利用 | `codex/reuse-existing-local-database` / `f1d32843cec1` | MERGED / 当時のCI3種SUCCESS。existingdb指定・Sync除外を含む。宛先設定の追加編集は差分照合 |
| NGT-071 / [#764](https://github.com/duplicati/ngclient/pull/764) console接続のnative link | `codex/native-console-connection-link` / `e4f224305d35` | MERGED / 当時のCI3種SUCCESS。監査全体の完了を意味しない |
| NGT-082 / [#765](https://github.com/duplicati/ngclient/pull/765) ウィザード作成→実復元E2E | `codex/live-backup-wizard-roundtrip` / `1f0b5c0f900f` | MERGED / 当時のCI3種SUCCESS。Refs #273。CI継続実行とUI削除はNGT-081/118 |

NGT-104は現行mainの単体/DOMで疑いを再現できず、回帰テストだけを追加した。実装バグの修正済み、または全ブラウザーで不具合なしという扱いにしない。

## 実装済み・本体待ちの5本

検証済み: 対応する本体5ブランチはいずれもmaster未統合・該当PRなし。本体triageの理由は**PR枠待ち**（open PRのマージごとに1本提出、本体を先に出す）。実装未着手待ちではない。ngclient PRは本体の提出→マージ→契約/実動作の再確認後に出す。

| ID / 本体Issue | ngclientブランチ / 現在head | 必要な本体ブランチ / 現在head | 状態 |
| --- | --- | --- | --- |
| NGT-085 / [duplicati#2310](https://github.com/duplicati/duplicati/issues/2310) | `feat/export-global-options` / `cf7e7465` | `feat/export-global-options` / `c31eb53dab64` | BLOCKED / 本体PR枠待ち→マージ待ち |
| NGT-086 / [duplicati#2701](https://github.com/duplicati/duplicati/issues/2701) | `feat/skip-next-scheduled-run` / `ee552d1d` | `feat/skip-next-scheduled-run` / `856178be72a2` | BLOCKED / 本体PR枠待ち→マージ待ち |
| NGT-098 / [duplicati#3397](https://github.com/duplicati/duplicati/issues/3397) | `feat/compact-progress` / `cfc57e5a` | `feat/compact-progress` / `64309f1d73a8` | BLOCKED / 本体PR枠待ち→マージ待ち |
| NGT-100 / [duplicati#5239](https://github.com/duplicati/duplicati/issues/5239) | `feat/restore-resume-drafts` / `8f154b80` | `feat/list-temporary-backups` / `f090ed236eb2` | BLOCKED / 本体PR枠待ち→マージ待ち |
| NGT-101 / [duplicati#6611](https://github.com/duplicati/duplicati/issues/6611) | `feat/show-db-encryption-preload-paths` / `e63fe51d` | `feat/systeminfo-preload-paths` / `fdefdd71aad0` | BLOCKED / 本体PR枠待ち→マージ待ち |

本体の最新PENDING-BRANCHESではskip-nextとtemporary一覧の以前の競合は解消した旨を記録している。今回ここでrebase・ビルドを追試したわけではない。本体の最新full SHA・祖先判定・PR検索は[照合記録](evidence/2026-11-18-state-refresh/verification.md)に保存。ngclient専用PR本文は公開時に最新SHAとwhole-Issueの範囲を再確認する。

NGT-086は#768の新ダイアログへ統合済み。対応サーバー・スケジュールあり・有効ジョブの条件を維持。関連2ファイル10テスト、app/spec型チェック、本番ビルド成功。実サーバーでの新ダイアログ操作は今回未検証。

## 返信・メンテナ判断待ち（0件）

検証済みなのはGitHubの状態とコメントの有無。下記の動作確認は各公開コメントの当時のmain・サーバー版に限り、今回再実行していない。

| ID / Issue | 状態・過去に確認した範囲 | 最終コメント |
| --- | --- | --- |

## Issueを閉じるまでの道筋

- #273: 既存の単体・通常E2Eに加え、#765の画面作成、NGT-081の継続live実行、NGT-118のUI削除を揃えて範囲を説明する。現在のlive round tripの後片付けはAPI削除なので、UI削除まで網羅したとは書かない。メンテナと完了基準を合わせてからClosesを使う。
- #497: #761と残る実使用フォームを段階的に整理する。公開APIを使い、DTO/disabled/キャンセル/送信値/URL stateを保持。ngModelを一律ゼロにすることや、通常のSignal状態までフォーム化することを完了条件にしない。
- #328: #618と本体#7832/#7860/#7898はマージ済み。NGT-047の実サーバー回帰E2EをPR #778で公開しCloses #328を付与。9種のGET→PUTとUI27回保存でURL/詳細オプション保持。配布版への修正収録・全provider接続は未検証。
- #460/#462/#126: UIの見た目を先に足さず、対象宛先/検証schemaのAPI契約を固める。
- #409: 要望を項目別に判定し、具体的な再現不具合とUX提案を分ける。新しい未検証の対処を既存改善の実績に混ぜない。
- 元の返信待ち5件は、ユーザー依頼の回帰テストPR #772〜776がマージ済み。未検証範囲と#627の代替案の範囲は本文へ明記し、メンテナのmerge判断に委ねる。

以前扱った#111/#216/#311/#349/#394/#466/#636/#637/#638は現在CLOSEDをAPIで確認。[完了・廃止ID](completed.md)を参照し再実装しない。

## 外部PRと記録の扱い

- NGT-115: 本体 [duplicati#7886](https://github.com/duplicati/duplicati/pull/7886) はOPEN。旧UIテーマ保持の独立実装で、ngclientの新しい実装候補として重ねない。
- 本体 [#7896](https://github.com/duplicati/duplicati/pull/7896) はOPENで、list-changesのファイル/フォルダー件数を修正する。#766の比較表示と関係する可能性はあるが、必須依存かどうかは未検証。新しい回避実装を重ねる前に状態確認。
- 過去の検証件数/サーバー版は[検証索引](verification.md)、移管18件は[移管時の索引](2026-11-15-duplicati-ngclient-records.md)。履歴のSHAを現在headと取り違えない。

## 運用

- IDは固定・再利用しない。次の新規IDは**NGT-121**。NGT-118/119は今回登録した未実装候補。
- READY=既知の外部ブロッカーなし、INVESTIGATE=調査/範囲決定、PR_OPEN=公開済み、BLOCKED=外部依存、WAITING=返信待ち、DEFERRED=方針保留。READYは動作検証済み/実装済みを意味しない。
- 着手時にACTIVE・担当・日付・ブックマークを記録。最新mainから別ブランチで開始し、既存差分と依存を確認。stack後段は前段マージ後に公開。画像固定参照4本・別workspaceを巻き込まない。
- 赤→緑、関連spec・型・ビルド、必要な実サーバー検証を記録。「検証済み／ドキュメント根拠／推測」を分け、実行していないことは未検証と明記する。
- PR/公開コメントは依頼時のみ。whole-Issueを満たす場合だけFixes/Closes、部分対応はRefsと残件。単一Playwright設定を維持し、通常UI状態を無理にフォーム化しない。

## #770マージ後の整理

検証済み: PR #770のheadはmainの祖先。実装ブランチcodex/live-delete-versionsをlocal/originから削除。mainは6cfac9f58d13。残る本体待ち5本とtriageをrebase・push、競合なし。固定画像/証拠参照4本と別workspaceは維持。#283のcodex/live-auth-reconnectは最新mainから実装・検証後、originへpushしPR #771を作成済み。今回の整理ではテスト/ビルドは再実行していない。

## #771〜776マージ後の整理（2026-11-19）

検証済み: 6件のGitHub merged=trueとmainの祖先判定が一致。対応するlocal/originブランチ6本を削除し、fork mainを5c520f1311b7805bd26cf2e4ff420127e46b1d72へ更新。#777はopenでメンテナのmain取り込みがあるため、取得済みツリーを保持してrebaseする。固定画像/証拠参照4本と別workspaceは対象外。rebase結果・CI調査はevidence/2026-11-19-maintenance/verification.mdに記録する。

## NGT-047 / #328 の公開（2026-11-19）

PR_OPEN: [#778](https://github.com/duplicati/ngclient/pull/778) / codex/live-destination-url-preservation / 2f67628310cdb4fbfed666d064f79c4dbc06670d（main 5c520f1311b7直上）。Closes #328。旧Debugサーバーの重複認証キー順序変更で新規テスト1件が赤、修正を含むサーバーで9件が緑（再実行9 passed）。GET→PUT 9回・UI保存27回で実DBのURLバイト列、秘密値、詳細オプションを確認。未知backend・フォームで読めないURLも含む。関連単体20件・E2E型・整形・本番ビルド成功。本番コード変更なし。#777のfixture修正を含めず、既存PRとの重複/stack依存なし。実行は隔離したWindows Debug/.NET 11、サーバー停止済み。[証拠](evidence/2026-11-19-issue328-live-regression/verification.md)。
