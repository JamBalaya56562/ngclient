# タスク台帳

更新: 2026-11-12。基準main: `d788d0c592306dffe8105ae5f4c357156f94a38c`。

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

## 今着手できる候補

NGT-001はpush済み・未PR。再実装せず、公開指示を待つ。証拠は[実装記録](2026-11-12-ngt-001-signal-helpers.md)。
2. **NGT-056**: 非同期読み取り・購読監査の残り。ServiceHub対応NGT-002を繰り返さず、別の対象と契約を確定する。
3. **NGT-059**: tabs・ホームカード・route入力の適合評価。接続ステータスNGT-058はpush済み。各部品の契約と既存移行との重複を確認して範囲を選ぶ。
4. **NGT-049〜055のINVESTIGATE行**: バグ対応優先で残件を確認。未再現・未調査を即実装しない。
5. 明確な不具合候補がない場合は**NGT-006**の実サーバーE2E整備を小さく進める。

共通の着手条件: 最新main・全ブックマーク・open PRの差分を確認し、同じ変更が準備済みでないことを確認する。READYは無条件の実装許可やPR作成許可ではない。PUSHEDの公開や既存ブランチの書き換えは指示された範囲で行う。

## 構造改善

根拠・受け入れ条件: [Angular改善計画](2026-11-12-angular-modernization.md)。以下の改善効果や不具合発生は、別記しない限り**推測・未検証**。

| ID | 内容 | 状態 | 依存・重複回避 | 次の行動 | 更新 |
| --- | --- | --- | --- | --- | --- |
| NGT-001 | 独自Signalラッパー整理 | PUSHED | codex/public-signal-helpers。main独立、本体依存なし | [検証記録](2026-11-12-ngt-001-signal-helpers.md)。公開指示待ち | 2026-11-12 |
| NGT-002 | 非同期読み取り・破棄処理（ServiceHub timer） | PUSHED | codex/service-hub-timer-lifecycle。独立main、本体依存なし | [検証記録](2026-11-12-ngt-002-async-lifecycle.md)。未PR、残る監査はNGT-056 | 2026-11-12 |
| NGT-003 | Routerとナビゲーションの意味（サイドバー） | PUSHED | codex/sidebar-router-links。独立main、本体依存なし | [検証記録](2026-11-12-ngt-003-sidebar-navigation.md)。未PR、残る監査はNGT-057 | 2026-11-12 |
| NGT-004 | 動的リストの安定したtrack | BLOCKED | NGT-026、NGT-028のマージ待ち（編集範囲重複） | 先行マージ後にIDとフォーカスを検証 | 2026-11-12 |
| NGT-005 | Aria/CDKの適合評価 | BLOCKED | NGT-030、NGT-033のマージ後にfile-treeを評価 | 現在の操作契約を基準に小範囲評価 | 2026-11-12 |
| NGT-006 | 実サーバーE2E整備 / #273 | READY | NGT-031、NGT-032と同じケースを重複追加しない | 次の未被覆フローと継続実行方法を選ぶ。全体closeは保留 | 2026-11-12 |
| NGT-007 | Signal Forms全体 / #497 | INVESTIGATE | NGT-010〜029が部分対応。単独の実装担当を意味しない親タスク | 残存フォームを再棚卸し。全完了までRefs | 2026-11-12 |
| NGT-008 | SSR・画像最適化等 | DEFERRED | 導入根拠となる課題が未観測 | 性能・UX課題が観測された場合のみ再評価 | 2026-11-12 |

## 実装済み・レビュー待ち

**検証済み（今回）**: ghで下記PRのopen状態を確認。jjでブックマークを取得。各実装のテストは今回再実行していない。SHA・既存の検証証拠は[移行一覧](2026-11-12-angular-modernization.md)を参照。共通更新日は2026-11-12。

| ID | 範囲 | 状態 | PR / ブックマーク（codex/以下） | 依存・次の行動 |
| --- | --- | --- | --- | --- |
| NGT-010 | Schedule / Options | PR_OPEN | #687 / migrate-schedule-options-signal-forms | 独立mainベース。レビュー待ち |
| NGT-011 | Source data | PR_OPEN | #688 / migrate-source-data-signal-forms | 独立mainベース。レビュー待ち |
| NGT-012 | 詳細オプション値 | PR_OPEN | #689 / migrate-option-values-signal-forms | 独立mainベース。レビュー待ち |
| NGT-013 | Import encryption | PR_OPEN | #690 / migrate-import-encryption-signal-forms | 独立mainベース。レビュー待ち |
| NGT-014 | Restore encryption | PR_OPEN | #691 / migrate-restore-encryption-signal-forms | 独立mainベース。レビュー待ち |
| NGT-015 | Restore config | PR_OPEN | #692 / migrate-restore-config-signal-forms | 独立mainベース。レビュー待ち |
| NGT-016 | Login | PR_OPEN | #693 / migrate-login-signal-forms | 独立mainベース。レビュー待ち |
| NGT-017 | Import file | PR_OPEN | #694 / migrate-import-file-signal-forms | 独立mainベース。レビュー待ち |
| NGT-020 | Export | PUSHED | migrate-export-signal-forms | 必須依存なし。公開指示待ち |
| NGT-021 | Throttle | PUSHED | migrate-throttle-signal-forms | 必須依存なし。公開指示待ち |
| NGT-022 | Database path | PUSHED | migrate-database-path-signal-forms | 必須依存なし。公開指示待ち |
| NGT-023 | Remote registration | PUSHED | migrate-remote-registration-signal-forms | 必須依存なし。公開指示待ち |
| NGT-024 | Restore URL | PUSHED | migrate-restore-url-signal-forms | 必須依存なし。公開指示待ち |
| NGT-025 | Import selection | PUSHED | migrate-import-selection-signal-forms | 必須依存なし。公開指示待ち |
| NGT-026 | Home search | PUSHED | migrate-home-search-signal-forms | 必須依存なし。公開指示待ち |
| NGT-027 | Initial passphrase | PUSHED | migrate-initial-passphrase-signal-forms | 必須依存なし。公開指示待ち |
| NGT-028 | Restore search | PUSHED | migrate-restore-search-signal-forms | 必須依存なし。公開指示待ち |
| NGT-029 | Version labels | PUSHED | migrate-version-labels-signal-forms | 必須依存なし。公開指示待ち |
| NGT-030 | locked展開防止・Access denied | PR_OPEN | #684 / prevent-locked-folder-expansion | 旧本体でも展開防止。関連: duplicati/duplicati#7772（403改善）はopen |
| NGT-031 | Pause E2E | PR_OPEN | #685 / test-server-pause | レビュー待ち |
| NGT-032 | Job deletion E2E | PR_OPEN | #686 / test-job-deletion | レビュー待ち |
| NGT-033 | リンク先表示 | BLOCKED | show-file-tree-link-target（push済み未PR） | duplicati/duplicati#7775はopen。マージ後の本体で再確認して公開判断 |
| NGT-034 | 旧folder filter候補 | DEFERRED | fix/folder-filter-separators | #663のNewFilter修正と区別し、必要性から再調査 |

## Issueの残件・回答待ち

詳細と公開コメント: [Issue対応表](2026-11-10-bug-triage.md)。**検証済み（今回）**: 下記Issueはopen。本体#7772/#7775/#7776もopen。既存の実サーバー証拠の範囲を超える解決宣言はしない。共通更新日は2026-11-12。

| ID | Issue / 内容 | 状態 | 依存・次の行動 |
| --- | --- | --- | --- |
| NGT-040 | #215 世代削除 | WAITING | 実サーバー検証とclose提案済み。メンテナ判断待ち |
| NGT-041 | #283 再接続 | WAITING | WS/long polling検証済み。現行版の報告者確認待ち |
| NGT-042 | #492 時差・DST | WAITING | 日次全曜日の検証済み。報告者確認待ち。全設定は未検証 |
| NGT-043 | #217 破損ファイル削除 | WAITING | データvolume欠損の検証とclose提案済み |
| NGT-044 | #401 Windows宛先パス | WAITING | 実サーバー保存・再読込確認済み。報告者確認待ち |
| NGT-045 | #449 cross-OS復元 | BLOCKED | duplicati/duplicati#7776マージ後、両方向の一覧と別restoreエラーを再確認 |
| NGT-046 | #636 junction | BLOCKED | NGT-030、NGT-033。本体#7772/#7775も踏まえ最終確認 |
| NGT-047 | #328 URL再構築 | BLOCKED | 本体側へ依頼済み。対応PR番号は未記録、次回取得。UIだけでは完結しない |
| NGT-048 | #466 pCloud | WAITING | 追加情報待ち。報告環境は未検証 |
| NGT-049 | #627 editor tabs/save | INVESTIGATE | 現行の残件と既存移行の重複を調査 |
| NGT-050 | #637 hidden/system設定 | INVESTIGATE | mainの属性修正との差分・再現を調査 |
| NGT-051 | #311 flat file restore | INVESTIGATE | 本体API対応と現行画面の残件を調査 |
| NGT-052 | #409 suggestions | INVESTIGATE | 要求と再現条件を確認 |
| NGT-053 | #460 secondary restore | INVESTIGATE | 本体依存の有無から確認 |
| NGT-054 | #462 secondary delete | INVESTIGATE | 本体依存の有無から確認 |
| NGT-055 | #126 validation schema | INVESTIGATE | 既存Signal Forms・検証との境界を確認 |

| NGT-056 | 非同期読み取り・購読監査の残り | INVESTIGATE | NGT-002で再現したServiceHub timerは対応済み。別の対象・所有者・古い応答の契約から確認 |

| NGT-057 | ナビゲーション監査（Add Backup入口） | PUSHED | codex/add-backup-router-links。独立main、本体依存なし。[検証記録](2026-11-12-ngt-057-add-backup-navigation.md)。未PR、残る評価はNGT-058 |

| NGT-058 | 接続ステータスのナビゲーション | PUSHED | codex/console-connection-router-links。独立main、本体依存なし。[検証記録](2026-11-12-ngt-058-connectivity-navigation.md)。未PR、残る評価はNGT-059 |

| NGT-059 | tabs・ホームカード・route入力の適合評価 | INVESTIGATE | Aboutのtabsのキーボード契約、カードのリンク役割、route input等を評価。NGT-003/057/058は再実装しない。ホーム/復元の準備済み移行と重なる実装はマージ待ち |

## 更新手順と履歴

作業開始時にIDをACTIVEへ変え、担当チャット識別子・ブックマーク・着手日を記載する。終了時は証拠への参照、次の行動、更新日も同時に更新する。PR作成・マージ後はghで実状態を確認し、対応IDの状態を変更する。依存のマージだけで自動的にDONEにはせず、統合後の検証と要求充足を確認する。

依存先が完了したらBLOCKED行を再評価し、着手可能一覧も更新する。完了行は履歴として残す。今回のIDには欠番を設けているが既存IDを詰め直さず、新規はNGT-060から付番する。

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







