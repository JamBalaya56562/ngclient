# 検証記録の索引

2026-11-15にGitHubの状態・head SHAを照合。以下は過去の試験結果への入口で、整理時の追試ではない。現在の状態は[tasks.md](tasks.md)。

## 公開済み・公開待ちの記録

| PR / ID                                                | 現在のhead SHA                             | 証拠                                                                                                                                                                                                              |
| ------------------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#727](https://github.com/duplicati/ngclient/pull/727) | `4d50af9684de8c8d5b2f61a3097e06551ecbcba0` | [過去の実行詳細](evidence/previous-runs/2026-11-14-advanced-option-actions.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照              |
| [#728](https://github.com/duplicati/ngclient/pull/728) | `d4f715de88e3fa6c435f852c249e18d52a75e2c6` | [過去の実行詳細](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照                 |
| [#729](https://github.com/duplicati/ngclient/pull/729) | `03c222dc86eb038ca0648e8c4d607cd6c2f7d00a` | [過去の実行詳細](evidence/previous-runs/2026-11-14-ngt-079-reorder-focus.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照                |
| [#730](https://github.com/duplicati/ngclient/pull/730) | `6cafe57c78820bcbc3d0b56ff04e06917725e4eb` | [過去の実行詳細](evidence/previous-runs/2026-11-13-ngt-075-status-snapshot-lifecycle.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照    |
| [#731](https://github.com/duplicati/ngclient/pull/731) | `18803f296cc8b77a79850623659fffc57e012ed4` | [過去の実行詳細](evidence/previous-runs/2026-11-13-ngt-074-status-task-actions.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照          |
| [#732](https://github.com/duplicati/ngclient/pull/732) | `9e3e5cce3243b6aefbc0df3370d3811d52dc73f2` | [過去の実行詳細](evidence/previous-runs/2026-11-13-ngt-076-statusbar-progress-lifecycle.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照 |
| [#733](https://github.com/duplicati/ngclient/pull/733) | `1393c45e3e3f59ab7a67787ac0f4163aaac2c723` | [過去の実行詳細](evidence/previous-runs/2026-11-14-ngt-077-websocket-lifecycle.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照          |
| [#734](https://github.com/duplicati/ngclient/pull/734) | `a08f89f2c810aeb0a5d3423c296b50967020e9de` | [過去の実行詳細](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照                 |
| [#735](https://github.com/duplicati/ngclient/pull/735) | `74257b98e08f483b4963f9f35331870276a69a57` | [過去の実行詳細](evidence/previous-runs/2026-11-14-ngt-006-live-editor-e2e.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照              |
| [#736](https://github.com/duplicati/ngclient/pull/736) | `3e98d5b9b0dbbe65492ca7d526eeb192524b8e8c` | [過去の実行詳細](evidence/previous-runs/2026-11-14-ngt-051-individual-file-restore.md)。現在SHAでの結果はPR本文と[rebase後の検証表](evidence/previous-runs/2026-11-14-rebased-branches-prs.md)を区別して参照      |
| NGT-050 / #637（未PR）                                 | `68c088a6e6bb2c1d2e07a03a338ead45b348950e` | [赤→緑・実サーバー6条件・画像](evidence/previous-runs/2026-11-14-ngt-050-source-attributes.md)。公開は#727後                                                                                                      |

## NGT-084 実サーバー追試（2026-11-15）

検証済み: `879857e496eafadda45a1704a24ab3af1ba5892d`。通知プレビューの表示漏れを修正。正常・破損・宛先不在・復旧の4条件、関連47テスト、tsc/app+spec、Prettier、本番ビルドが成功。[証拠・コマンド・画像](evidence/2026-11-15-ngt-084/verification.md)。PRは未作成。

## NGT-085 実サーバー追試（2026-11-15）

検証済み: `f082e4d89932ad9393faa678953c9fee4fd25a51`。Space操作を修正。17単体・6E2E・tsc・Prettier・本番ビルド成功。Canaryは指定を無視、対応本体は全5項目成功。[証拠・コマンド・画像](evidence/2026-11-15-ngt-085/verification.md)。**本体`feat/export-global-options`の先行マージが必要**。PR未作成。

## 報告者への確認待ち

- #215/#283/#492/#217/#401は台帳の公開コメントが一次の検証範囲・SHA・サーバー版の参照先。同じコメントを重複投稿しない。
- #449: [cross-OS実サーバー記録](evidence/previous-runs/2026-11-14-ngt-045-cross-os-restore.md)。配布版ではなく修正後Debugで確認した範囲を守る。
- #627: [保存・再読込と配布版の区別](evidence/previous-runs/2026-11-14-ngt-049-editor-save.md)。UIはmain、報告者が試せる版は2.4.1.101 Canaryとして投稿済み。

## 移管された18件

[移管索引](2026-11-15-duplicati-ngclient-records.md) → agentId / J・T / manifest。元の試験、レビューの再実行、未実施と記録なしを区別する。

## 完了済み作業・削除した旧文書

[completed.md](completed.md)から固定IDを確認する。必要な原文は[整理前revision](https://github.com/JamBalaya56562/ngclient/blob/4d1ecd6972a8fde1c5f618637f09a2cb68ca1694/triage/README.md)のtriage配下へ戻る。Git履歴を削除していない。古い文書を現在の未着手候補として復活させない。
