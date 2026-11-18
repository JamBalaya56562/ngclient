# 検証記録の索引

現在の判断・優先順・依存は[tasks.md](tasks.md)だけを正本とする。この索引は証拠への入口で、昔のheadを現在のものと扱わない。

| 記録 | 確認範囲 |
| --- | --- |
| [2026-11-18 現状照合](evidence/2026-11-18-state-refresh/verification.md) | open Issue14件、公開PR8件の最新CI、本体待ち5本、#766との重複、新規候補。動作の再試験ではない |
| [2026-11-18 #757後の整理](evidence/2026-11-18-post757-maintenance/verification.md) | main更新・merged枝削除・13本とtriageのrebase。main全2,526単体/本番、13本E2E型。full per-branch再試験とは区別 |
| [2026-11-18 独立8PR](evidence/2026-11-18-eight-prs/verification.md) | 各元headの単体/型/本番、ウィザードを含む6実復元、共有CLI DB再利用/保持。旧popup CI失敗も保存 |
| [2026-11-18 popup根本調査](evidence/2026-11-18-popup-ci/verification.md) | #757のブラウザー更新の再現・検証。#757は現在マージ済み |
| [2026-11-18 本体依存と旧head全検証](evidence/2026-11-18-full-validation/verification.md) | 当時の6実装の全単体/本番と本体待ち判定。SHAは現在の台帳と分ける |
| [2026-11-18 旧UIテーマ](evidence/2026-11-18-legacy-theme/verification.md) | 本体#7886の実サーバー再現と赤→緑。ngclientの未実装候補ではない |
| [2026-11-17 ngax機能差分](evidence/2026-11-17-ngax-parity/README.md) | NGT-107〜112の調査起点。現在の公開/残件はtasksへ集約 |
| [移管18件の索引](2026-11-15-duplicati-ngclient-records.md) | 元SHA、赤の種類、レビュー記録。移管時の報告と追試を区別 |

それ以前の詳細は[整理前の索引](https://github.com/JamBalaya56562/ngclient/blob/776ba30e5e17fd75c928343d387f9ed5714c79d2/triage/verification.md)とGit履歴から参照できる。一次証拠ファイルは保持し、通常検索ではtriage/.ignoreに従ってevidenceを除外する。
