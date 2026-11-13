# タスク台帳

更新: 2026-11-13。基準main: `8edaeee84c0c0f4a48e75ae917195cb1047b15a5`。

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
2. **NGT-076**: StatusBarStateの進捗読取の寿命を監査する。NGT-075のsnapshotやNGT-074の操作要求を繰り返さず、既存差分・現行呼出し・Promise/Observableの契約を確認してから変更を選ぶ。未検証を不具合と断定しない。
3. **NGT-071はマージ待ち**: ホーム#697・接続画面#700・コマンドID用NGT-059と重なる既知の残件は、先行マージ後に再監査する。NGT-070のログアウト補助リンクを再実装しない。disabled付き・状態変更付き操作を無理にリンク化せず、待っている間は他のバグ候補やNGT-006を優先する。
4. **NGT-045**: 本体#7776はマージ済み。cross-OS復元の両方向の一覧と別restoreエラーを再確認する。
5. **NGT-049〜055のINVESTIGATE行**: バグ対応優先で残件を確認。未再現・未調査を即実装しない。
6. 明確な不具合候補がない場合は**NGT-006**の実サーバーE2E整備を小さく進める。

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

**検証済み（一括整理時）**: #684〜#694はマージ済み。残る20実装ブランチとtriageで全単体テスト・本番ビルドが成功し、変更したE2Eも成功した。その時点の21ブックマークのoriginとのSHA一致を確認済み。NGT-020〜029の10件をPR #695〜#704として公開した。SHA・コマンドと結果・再試行の内容は[全ブランチ検証記録](2026-11-12-rebase-validation.md)を参照。記録の追記はMarkdownのみで、検証後にアプリのソース変更はない。

| ID | 範囲 | 状態 | PR / ブックマーク（codex/以下） | 依存・次の行動 |
| --- | --- | --- | --- | --- |
| NGT-010 | Schedule / Options | DONE | #687 / migrate-schedule-options-signal-forms | mainへマージ済み。ブックマーク削除済み |
| NGT-011 | Source data | DONE | #688 / migrate-source-data-signal-forms | mainへマージ済み。ブックマーク削除済み |
| NGT-012 | 詳細オプション値 | DONE | #689 / migrate-option-values-signal-forms | mainへマージ済み。ブックマーク削除済み |
| NGT-013 | Import encryption | DONE | #690 / migrate-import-encryption-signal-forms | mainへマージ済み。ブックマーク削除済み |
| NGT-014 | Restore encryption | DONE | #691 / migrate-restore-encryption-signal-forms | mainへマージ済み。ブックマーク削除済み |
| NGT-015 | Restore config | DONE | #692 / migrate-restore-config-signal-forms | mainへマージ済み。ブックマーク削除済み |
| NGT-016 | Login | DONE | #693 / migrate-login-signal-forms | mainへマージ済み。ブックマーク削除済み |
| NGT-017 | Import file | DONE | #694 / migrate-import-file-signal-forms | mainへマージ済み。ブックマーク削除済み |
| NGT-020 | Export | PR_OPEN | [#696](https://github.com/duplicati/ngclient/pull/696) / migrate-export-signal-forms | 独立main。本体依存なし。レビュー待ち |
| NGT-021 | Throttle | PR_OPEN | [#703](https://github.com/duplicati/ngclient/pull/703) / migrate-throttle-signal-forms | 独立main。本体依存なし。レビュー待ち |
| NGT-022 | Database path | PR_OPEN | [#695](https://github.com/duplicati/ngclient/pull/695) / migrate-database-path-signal-forms | 独立main。本体依存なし。レビュー待ち |
| NGT-023 | Remote registration | PR_OPEN | [#700](https://github.com/duplicati/ngclient/pull/700) / migrate-remote-registration-signal-forms | 独立main。本体依存なし。レビュー待ち |
| NGT-024 | Restore URL | PR_OPEN | [#702](https://github.com/duplicati/ngclient/pull/702) / migrate-restore-url-signal-forms | 独立main。本体依存なし。レビュー待ち |
| NGT-025 | Import selection | PR_OPEN | [#698](https://github.com/duplicati/ngclient/pull/698) / migrate-import-selection-signal-forms | 独立main。本体依存なし。レビュー待ち |
| NGT-026 | Home search | PR_OPEN | [#697](https://github.com/duplicati/ngclient/pull/697) / migrate-home-search-signal-forms | 独立main。本体依存なし。レビュー待ち |
| NGT-027 | Initial passphrase | PR_OPEN | [#699](https://github.com/duplicati/ngclient/pull/699) / migrate-initial-passphrase-signal-forms | 独立main。本体依存なし。レビュー待ち |
| NGT-028 | Restore search | PR_OPEN | [#701](https://github.com/duplicati/ngclient/pull/701) / migrate-restore-search-signal-forms | 独立main。本体依存なし。レビュー待ち |
| NGT-029 | Version labels | PR_OPEN | [#704](https://github.com/duplicati/ngclient/pull/704) / migrate-version-labels-signal-forms | 独立main。本体依存なし。レビュー待ち |
| NGT-030 | locked展開防止・Access denied | DONE | #684 / prevent-locked-folder-expansion | mainへマージ済み。ブックマーク削除済み |
| NGT-031 | Pause E2E | DONE | #685 / test-server-pause | mainへマージ済み。ブックマーク削除済み |
| NGT-032 | Job deletion E2E | DONE | #686 / test-job-deletion | mainへマージ済み。ブックマーク削除済み |
| NGT-033 | リンク先表示 | PUSHED | show-file-tree-link-target | duplicati/duplicati#7775はマージ済み。rebase後の全単体テスト・ビルド成功。本体との実サーバー統合再確認は未実施 |
| NGT-034 | 旧folder filter候補 | DEFERRED | fix/folder-filter-separators | #663のNewFilter修正と区別し、必要性から再調査 |

## Issueの残件・回答待ち

詳細と公開コメント: [Issue対応表](2026-11-10-bug-triage.md)。**検証済み（今回）**: Issueの状態は前回調査時のスナップショット。本体#7772/#7775/#7776は今回ghでMERGEDを確認。既存の実サーバー証拠の範囲を超える解決宣言はしない。共通更新日は2026-11-12。

| ID | Issue / 内容 | 状態 | 依存・次の行動 |
| --- | --- | --- | --- |
| NGT-040 | #215 世代削除 | WAITING | 実サーバー検証とclose提案済み。メンテナ判断待ち |
| NGT-041 | #283 再接続 | WAITING | WS/long polling検証済み。現行版の報告者確認待ち |
| NGT-042 | #492 時差・DST | WAITING | 日次全曜日の検証済み。報告者確認待ち。全設定は未検証 |
| NGT-043 | #217 破損ファイル削除 | WAITING | データvolume欠損の検証とclose提案済み |
| NGT-044 | #401 Windows宛先パス | WAITING | 実サーバー保存・再読込確認済み。報告者確認待ち |
| NGT-045 | #449 cross-OS復元 | READY | duplicati/duplicati#7776はマージ済み。両方向の一覧と別restoreエラーを再確認（今回は未実施） |
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

| NGT-056 | 長ポーリングの購読・破棄ライフサイクル | PUSHED | codex/longpoll-service-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルドの記録](2026-11-13-ngt-056-longpoll-lifecycle.md)。未PR。非同期監査全体の残りはNGT-072 |

| NGT-057 | ナビゲーション監査（Add Backup入口） | PUSHED | codex/add-backup-router-links。独立main、本体依存なし。[検証記録](2026-11-12-ngt-057-add-backup-navigation.md)。未PR、残る評価はNGT-058 |

| NGT-058 | 接続ステータスのナビゲーション | PUSHED | codex/console-connection-router-links。独立main、本体依存なし。[検証記録](2026-11-12-ngt-058-connectivity-navigation.md)。未PR、残る評価はNGT-059 |

| NGT-059 | バックアップ編集のルートID入力 | PUSHED | codex/backup-route-input-binding。独立main、本体依存なし。[検証記録](2026-11-12-ngt-059-backup-route-input.md)。未PR、残る評価はNGT-060 |

| NGT-060 | ジョブログのルートID入力 | PUSHED | codex/job-log-route-input-binding。独立main、本体依存なし。[検証記録](2026-11-12-ngt-060-job-log-route-input.md)。未PR、残る評価はNGT-061 |

| NGT-061 | コマンド実行結果のルート入力 | PUSHED | codex/command-result-route-input-binding。独立main、本体依存なし。[検証記録](2026-11-12-ngt-061-command-result-input.md)。未PR、残る評価はNGT-062 |

| NGT-062 | ナビゲーション監査（復元進捗taskid入力） | PUSHED | codex/restore-progress-route-input。main独立、本体依存なし。[変更前後の契約テスト・ビルド・E2E](2026-11-12-ngt-062-restore-progress-input.md)。未PR。残る評価はNGT-064 |

| NGT-063 | ログ画面のRouter購読の破棄 | PUSHED | codex/logs-router-subscription-lifecycle。main独立、本体依存なし。未PR。[赤→緑・ビルド・E2Eの記録](2026-11-12-ngt-063-logs-router-lifecycle.md) |

| NGT-064 | Aboutのnativeリンク・選択同期 | PUSHED | codex/about-navigation-links。main独立、本体依存なし。[赤→緑・実画面・ビルドの記録](2026-11-12-ngt-064-about-navigation.md)。未PR。ホーム・route入力の残りはNGT-065 |

| NGT-065 | 復元オプションの戻るリンク | PUSHED | codex/restore-options-back-link。main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-065-restore-options-back.md)。未PR。ホーム・Router使用箇所の残りはNGT-066 |

| NGT-066 | ジョブ削除画面のナビゲーション | PUSHED | codex/delete-backup-navigation-links。main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-066-delete-navigation.md)。未PR。残る評価はNGT-067 |

| NGT-067 | 復元設定・ファイル削除のホーム移動リンク | PUSHED | codex/wizard-home-navigation-links。main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-067-wizard-home-links.md)。未PR。残りはNGT-068 |

| NGT-068 | 設定インポートのホーム移動リンク | PUSHED | codex/import-home-navigation-link。main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-068-import-home-link.md)。未PR。残る監査はNGT-069 |
| NGT-069 | コマンド画面のホーム移動リンク | PUSHED | codex/commandline-home-link。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-069-commandline-home-link.md)。未PR。残る監査はNGT-070 |
| NGT-070 | ログアウト完了画面の移動リンク | PUSHED | codex/logout-navigation-link。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-070-logout-link.md)。未PR。既知の残件はNGT-071へ集約 |
| NGT-071 | 先行マージ後のナビゲーション再監査 | BLOCKED | ホーム#697・接続画面#700と編集ファイル重複、コマンドIDの型はNGT-059待ち。先行マージ後に現行mainを再確認。disabled/状態変更を持つ操作は維持し、準備済みNGT-057〜070を再実装しない。待機中は他領域のバグ/E2Eを優先 |
| NGT-072 | タスク完了購読・待機の破棄ライフサイクル | PUSHED | codex/task-waiter-service-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルドの記録](2026-11-13-ngt-072-task-waiter-lifecycle.md)。未PR。残る非同期監査はNGT-073 |
| NGT-073 | About更新確認の非同期処理・破棄 | PUSHED | codex/update-check-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-073-update-check-lifecycle.md)。未PR。Promise APIの通信自体は中断せずUI購読を終了。残る監査はNGT-074 |
| NGT-074 | Status停止・中断要求の状態と破棄 | PUSHED | codex/status-task-action-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-074-status-task-actions.md)。未PR。Stop待ち中のAbortを維持。残る監査はNGT-075 |
| NGT-075 | Status snapshot取得セッションの寿命 | PUSHED | codex/status-snapshot-lifecycle。最新main独立、本体依存なし。[赤→緑・ビルド・E2Eの記録](2026-11-13-ngt-075-status-snapshot-lifecycle.md)。未PR。旧応答と追加ループを分離。残る監査はNGT-076 |
| NGT-076 | StatusBar進捗読取の非同期寿命監査 | INVESTIGATE | StatusBarStateの進捗取得・タスク情報取得・timer等の現行呼出しと破棄契約を検証。NGT-074/075と別候補だが既存PR/ブランチを着手時に照合する。StatusPageStateの追加変更はNGT-075のマージ待ち。未検証を不具合と断定しない |

## 更新手順と履歴

作業開始時にIDをACTIVEへ変え、担当チャット識別子・ブックマーク・着手日を記載する。終了時は証拠への参照、次の行動、更新日も同時に更新する。PR作成・マージ後はghで実状態を確認し、対応IDの状態を変更する。依存のマージだけで自動的にDONEにはせず、統合後の検証と要求充足を確認する。

依存先が完了したらBLOCKED行を再評価し、着手可能一覧も更新する。完了行は履歴として残す。今回のIDには欠番を設けているが既存IDを詰め直さず、新規はNGT-077から付番する。

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










