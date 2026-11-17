# 検証記録の索引

2026-11-18: NGT-091/#744を個別ブラウザー設定優先の任意既定値案へ変更。関連22単体・2ファイル除外2,478単体・6 E2E・隔離実サーバー3コンテキスト成功。main自身のfixture型エラーによりフルスイートは未達。[検証記録と返信](evidence/2026-11-18-theme-default-proposal/verification.md)。

2026-11-17: 残存実装11本の全単体テスト・本番ビルド成功。本番UI 24 E2E・証明書upload/HTTPS・実ログ比較を確認し、独立した5件を新規公開。本体依存5件は保留、#744は重複しない。[検証・公開記録](evidence/2026-11-17-publication/verification.md)。

## main更新・10本削除・残存11本のrebase（2026-11-17）

[今回の記録](evidence/2026-11-17-maintenance/verification.md)が現在SHAの正本。途中のrun-after追加と#747マージを取り込み直した。全11本の型、競合解消4本の関連単体・本番ビルド確認。#750は同等修正がmainへ入りclose。画像3参照の固定SHAと別workspaceは維持。

## NGT-106 保持メニューとimport loadingのCI失敗（2026-11-17）

保持メニューが外部フォーカス後も残る実UI状態と、通知・読み込み表示が同じstatusを持つテスト競合を再現。赤2E2E/1単体→緑2,375単体/40E2E、型・本番成功。#741の通知変更と一時統合した8E2Eも成功。独立した[#749](https://github.com/duplicati/ngclient/pull/749)を公開、既存PRは変更なし。元の高速Tabのタイミング自体はローカル未再現。[検証・限界・コマンド](evidence/2026-11-17-ci-option-import/verification.md)。

## 全ブランチ検証・10件公開（2026-11-16）

既存19本＋flaky修正1本で単体・型・本番ビルド成功。#739〜#748を公開し、#740には新旧画像を追加。現在SHA・E2E・依存・未公開理由は[今回の記録](evidence/2026-11-16-publication/verification.md)。NGT-104は未切分け。CIは公開直後queued。

2026-11-16のmain更新・11本削除・残存19本のrebase結果と現在SHAは[更新記録](evidence/2026-11-16-maintenance/verification.md)。以下は過去のSHA・実行結果の参照先であり、今回の全ブランチ追試を意味しない。

## NGT-103 別タブE2EのCI失敗（2026-11-16）

#727・#733の失敗ログ/traceを調査。コード差分なしでコミットを再作成してpushしCIを再実行。新headはそれぞれ`018692b3aab5f2c5a88a387b78f73c6963d81147`・`780c2e31a2baaef344966bd15b231fc1b691ef67`。以下の過去SHAでの試験結果は引き続き同一ソースを対象とする。[今回の検証・CI結果](evidence/2026-11-16-ci-navigation/verification.md)。根本原因を特定するまで修正PRは出さない。

2026-11-15にGitHubの状態・head SHAを照合。以下は過去の試験結果への入口で、整理時の追試ではない。現在の状態は[tasks.md](tasks.md)。

## 公開済み・公開待ちの記録

| PR / ID                                                | 現在のhead SHA                             | 証拠                                                                                                                                                                                                              |
| ------------------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#727](https://github.com/duplicati/ngclient/pull/727) | `018692b3aab5f2c5a88a387b78f73c6963d81147` | [過去の実行詳細](evidence/previous-runs/2026-11-14-advanced-option-actions.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照              |
| [#728](https://github.com/duplicati/ngclient/pull/728) | `d4f715de88e3fa6c435f852c249e18d52a75e2c6` | [過去の実行詳細](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照                 |
| [#729](https://github.com/duplicati/ngclient/pull/729) | `03c222dc86eb038ca0648e8c4d607cd6c2f7d00a` | [過去の実行詳細](evidence/previous-runs/2026-11-14-ngt-079-reorder-focus.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照                |
| [#730](https://github.com/duplicati/ngclient/pull/730) | `6cafe57c78820bcbc3d0b56ff04e06917725e4eb` | [過去の実行詳細](evidence/previous-runs/2026-11-13-ngt-075-status-snapshot-lifecycle.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照    |
| [#731](https://github.com/duplicati/ngclient/pull/731) | `18803f296cc8b77a79850623659fffc57e012ed4` | [過去の実行詳細](evidence/previous-runs/2026-11-13-ngt-074-status-task-actions.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照          |
| [#732](https://github.com/duplicati/ngclient/pull/732) | `9e3e5cce3243b6aefbc0df3370d3811d52dc73f2` | [過去の実行詳細](evidence/previous-runs/2026-11-13-ngt-076-statusbar-progress-lifecycle.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照 |
| [#733](https://github.com/duplicati/ngclient/pull/733) | `780c2e31a2baaef344966bd15b231fc1b691ef67` | [過去の実行詳細](evidence/previous-runs/2026-11-14-ngt-077-websocket-lifecycle.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照          |
| [#734](https://github.com/duplicati/ngclient/pull/734) | `a08f89f2c810aeb0a5d3423c296b50967020e9de` | [過去の実行詳細](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照                 |
| [#735](https://github.com/duplicati/ngclient/pull/735) | `74257b98e08f483b4963f9f35331870276a69a57` | [過去の実行詳細](evidence/previous-runs/2026-11-14-ngt-006-live-editor-e2e.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照              |
| [#736](https://github.com/duplicati/ngclient/pull/736) | `3e98d5b9b0dbbe65492ca7d526eeb192524b8e8c` | [過去の実行詳細](evidence/previous-runs/2026-11-14-ngt-051-individual-file-restore.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照      |
| NGT-050 / #637（未PR）                                 | `68c088a6e6bb2c1d2e07a03a338ead45b348950e` | [赤→緑・実サーバー6条件・画像](evidence/previous-runs/2026-11-14-ngt-050-source-attributes.md)。公開は#727後                                                                                                      |

## NGT-084 実サーバー追試（2026-11-15）

検証済み: `879857e496eafadda45a1704a24ab3af1ba5892d`。通知プレビューの表示漏れを修正。正常・破損・宛先不在・復旧の4条件、関連47テスト、tsc/app+spec、Prettier、本番ビルドが成功。[証拠・コマンド・画像](evidence/2026-11-15-ngt-084/verification.md)。PRは未作成。

## NGT-085 実サーバー追試（2026-11-15）

検証済み: `f082e4d89932ad9393faa678953c9fee4fd25a51`。Space操作を修正。17単体・6E2E・tsc・Prettier・本番ビルド成功。Canaryは指定を無視、対応本体は全5項目成功。[証拠・コマンド・画像](evidence/2026-11-15-ngt-085/verification.md)。**本体`feat/export-global-options`の先行マージが必要**。PR未作成。

## NGT-086 実サーバー追試（2026-11-15）

検証済み: `28be8c2be254e859f2fcadc0639afafa24980555`。追加修正なし。42テスト・tsc・手書きPrettier・本番ビルド成功。未対応サーバーでは非表示、対応本体では再読込なしの更新・再起動保持・元の回の未実行・次の回の自動実行を確認。queued回は取消さず、完了後もskip先を保持。[証拠・コマンド・画像](evidence/2026-11-15-ngt-086/verification.md)。本体04f2dd08a先行、PR未作成。

## NGT-087 実サーバー追試（2026-11-15）

検証済み: `eb506d7c5c715320cb30e236cc84f63bb86df61e`、追加修正なし。23テスト・tsc・Prettier・本番ビルド成功。12,000ファイルの実バックアップ中、同じ受信件数がen-USで1,800・deで1.800と表示され、バックアップも正常終了。[証拠・コマンド・画像](evidence/2026-11-15-ngt-087/verification.md)。#3041の項目1のみ。項目2/3は未検証で、Issue全体のFixesにはしない。PR未作成。

## NGT-102 Suppress時のジョブ種別保持（2026-11-15）

検証済み: [#738](https://github.com/duplicati/ngclient/pull/738)、`c78e32be2f4615c80164d6ddaff688a4f9237b32`。赤8件→関連31件成功、tsc・Prettier・本番ビルド成功。未修正Canaryで省略PUTのSync→Backupを再現し、修正版UIでSuppress/解除がSyncと無効状態を保持、再実行で通常ファイル更新を確認。[証拠・コマンド・本文](evidence/2026-11-15-ngt-102/verification.md)。Part of duplicati/duplicati#7850であり単独のFixesではない。

## 報告者への確認待ち

- #215/#283/#492/#217/#401は台帳の公開コメントが一次の検証範囲・SHA・サーバー版の参照先。同じコメントを重複投稿しない。
- #449: [cross-OS実サーバー記録](evidence/previous-runs/2026-11-14-ngt-045-cross-os-restore.md)。配布版ではなく修正後Debugで確認した範囲を守る。
- #627: [保存・再読込と配布版の区別](evidence/previous-runs/2026-11-14-ngt-049-editor-save.md)。UIはmain、報告者が試せる版は2.4.1.101 Canaryとして投稿済み。

## 移管された18件

[移管索引](2026-11-15-duplicati-ngclient-records.md) → agentId / J・T / manifest。元の試験、レビューの再実行、未実施と記録なしを区別する。

## 完了済み作業・削除した旧文書

[completed.md](completed.md)から固定IDを確認する。必要な原文は[整理前revision](https://github.com/JamBalaya56562/ngclient/blob/4d1ecd6972a8fde1c5f618637f09a2cb68ca1694/triage/README.md)のtriage配下へ戻る。Git履歴を削除していない。古い文書を現在の未着手候補として復活させない。
