# 検証記録の索引

現在の判断・優先順・依存は[tasks.md](tasks.md)だけを正本とする。この索引は証拠への入口で、昔のheadを現在のものと扱わない。

| 記録                                                                                              | 確認範囲                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [2026-11-19 rebase後7本の全体検証](evidence/2026-11-19-rebased-full-validation/verification.md)   | 全体単体テスト・本番ビルド7本、worker再実行条件、本体依存3件解消・4件保留、PR公開。                                                                                                 |
| [2026-11-19 5件の実装とPR公開](evidence/2026-11-19-fix-batch/verification.md)                     | NGT-117/118/116/121/119/122、PR #779〜783。赤→緑、各本番ビルド/型、実サーバーUI、#781 CI setupとTooltip再表示の切分け。                                                             |
| [2026-11-19 現行動作の実調査](evidence/2026-11-19-current-behavior-audit/verification.md)         | main本番UIでChangelog混入・削除cold load・速度制限の無名buttonを再現。secondary APIの500、216オプションのschema、Signal Forms残存28テンプレートを棚卸し。関連単体60件、本番ビルド。 |
| [2026-11-19 現在地の再整理](evidence/2026-11-19-triage-refresh/verification.md)                   | open Issue7件・PR2件、本体5件のマージ待ち、完了PR・local/origin照合。動作の追試ではない                                                                                             |
| [2026-11-19 #328回帰E2E / #778](evidence/2026-11-19-issue328-live-regression/verification.md)     | 旧本体1件赤→修正後9件緑、API9保存/UI27保存、関連単体20件・型・本番ビルド。現在headはtasksを参照                                                                                     |
| [2026-11-19 本体PR公開待ち照合](evidence/2026-11-19-backend-publication-check/verification.md)    | 本体#7907/#7911/#7912/#7914/#7915のopen/未統合を確認                                                                                                                                |
| [2026-11-19 整理・#777 CI修正](evidence/2026-11-19-maintenance/verification.md)                   | #771〜776ブランチ削除・rebase・main更新。CI10分制限の注釈と15分修正後の成功。通常E2E207件、port5件                                                                                  |
| [2026-11-19 NGT-120](evidence/2026-11-19-ngt120-browser-safe-ports/verification.md)               | 禁止ポート再現・allocator5件、当時のmain-based live14件、#771との一時統合試験                                                                                                       |
| [2026-11-19 #401/#627/#217/#449/#492](evidence/2026-11-19-five-issue-regressions/verification.md) | #772〜776の実サーバー回帰テスト。現在はすべてMERGED                                                                                                                                 |
| [2026-11-18 #283認証復帰](evidence/2026-11-18-reconnect283-e2e/verification.md)                   | WS/長ポーリング・一時503復帰、一覧取得エラー修正。#771はMERGED                                                                                                                      |
| [2026-11-18 #215削除E2E](evidence/2026-11-18-delete215-e2e/verification.md)                       | 中間世代のみ削除・残存世代復元・Compactオンオフ。#770はMERGED                                                                                                                       |
| [2026-11-18 現状照合](evidence/2026-11-18-state-refresh/verification.md)                          | open Issue14件、公開PR8件の最新CI、本体待ち5本、#766との重複、新規候補。動作の再試験ではない                                                                                        |
| [2026-11-18 #757後の整理](evidence/2026-11-18-post757-maintenance/verification.md)                | main更新・merged枝削除・13本とtriageのrebase。main全2,526単体/本番、13本E2E型。full per-branch再試験とは区別                                                                        |
| [2026-11-18 独立8PR](evidence/2026-11-18-eight-prs/verification.md)                               | 各元headの単体/型/本番、ウィザードを含む6実復元、共有CLI DB再利用/保持。旧popup CI失敗も保存                                                                                        |
| [2026-11-18 popup根本調査](evidence/2026-11-18-popup-ci/verification.md)                          | #757のブラウザー更新の再現・検証。#757は現在マージ済み                                                                                                                              |
| [2026-11-18 本体依存と旧head全検証](evidence/2026-11-18-full-validation/verification.md)          | 当時の6実装の全単体/本番と本体待ち判定。SHAは現在の台帳と分ける                                                                                                                     |
| [2026-11-18 旧UIテーマ](evidence/2026-11-18-legacy-theme/verification.md)                         | 本体#7886の実サーバー再現と赤→緑。ngclientの未実装候補ではない                                                                                                                      |
| [2026-11-17 ngax機能差分](evidence/2026-11-17-ngax-parity/README.md)                              | NGT-107〜112の調査起点。現在の公開/残件はtasksへ集約                                                                                                                                |
| [移管18件の索引](2026-11-15-duplicati-ngclient-records.md)                                        | 元SHA、赤の種類、レビュー記録。移管時の報告と追試を区別                                                                                                                             |

それ以前の詳細は[整理前の索引](https://github.com/JamBalaya56562/ngclient/blob/776ba30e5e17fd75c928343d387f9ed5714c79d2/triage/verification.md)とGit履歴から参照できる。一次証拠ファイルは保持し、通常検索ではtriage/.ignoreに従ってevidenceを除外する。

## 2026-11-19 マージ後の整理

検証済み: GitHubでPR #777〜783がmerged=true、7件のheadすべてがmain ea43cf64bdb61b01efad47b4f808334131cd18d4の祖先であることを確認。7件のブックマークをlocal/originから削除し、fork mainを更新。残る実装7本は同mainを直接の親として競合なくrebase・push済み。triageも同mainへrebase。画像固定参照4本と別workspaceは維持。

マージコミットに必要な祖先はmainの履歴として残す。到達可能なマージ済みコミットの削除やGCは行わない。rebase前の旧版はjjの操作履歴から回復可能。

コマンド: jj git fetch --all-remotes; jj log -r '<7 heads> & ancestors(main@upstream)'; jj bookmark delete <7 branches>; jj git push --remote origin -b <branches>; jj rebase -r 'bookmarks(glob:"feat/_")' -d main; jj rebase -s 'roots(main..triage)' -d main; jj git push --remote origin -b 'glob:feat/_'。

出力: Rebased 7 commits to destination / Rebased 8 commits to destination。conflicts()照合は0件。新しい実装は行っていない。全体テスト・ビルド・本体依存の再検証は今回未実施。過去のテスト成功をrebase後の成功とは扱わない。
