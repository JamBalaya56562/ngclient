# 完了・廃止したタスクID

過去台帳の完了範囲を引き継ぐ最小索引。Issue全体のcloseを意味しない。旧候補の再実装・ID再利用を避けるためIDは残す。古いブランチ一覧・作業経過は削除し、必要な場合だけ[整理前の台帳](https://github.com/JamBalaya56562/ngclient/blob/4d1ecd6972a8fde1c5f618637f09a2cb68ca1694/triage/tasks.md)を参照する。

| ID      | 完了した範囲                                 | PR・記録                 |
| ------- | -------------------------------------------- | ------------------------ |
| NGT-001 | 独自Signalラッパー整理                       | #706                     |
| NGT-002 | 非同期読み取り・破棄処理（ServiceHub timer） | #707                     |
| NGT-003 | Routerとナビゲーションの意味（サイドバー）   | #708                     |
| NGT-010 | Schedule / Options                           | #687                     |
| NGT-011 | Source data                                  | #688                     |
| NGT-012 | 詳細オプション値                             | #689                     |
| NGT-013 | Import encryption                            | #690                     |
| NGT-014 | Restore encryption                           | #691                     |
| NGT-015 | Restore config                               | #692                     |
| NGT-016 | Login                                        | #693                     |
| NGT-017 | Import file                                  | #694                     |
| NGT-020 | Export                                       | #696                     |
| NGT-021 | Throttle                                     | #703                     |
| NGT-022 | Database path                                | #695                     |
| NGT-023 | Remote registration                          | #700                     |
| NGT-024 | Restore URL                                  | #702                     |
| NGT-025 | Import selection                             | #698                     |
| NGT-026 | Home search                                  | #697                     |
| NGT-027 | Initial passphrase                           | #699                     |
| NGT-028 | Restore search                               | #701                     |
| NGT-029 | Version labels                               | #704                     |
| NGT-030 | locked展開防止・Access denied                | #684                     |
| NGT-031 | Pause E2E                                    | #685                     |
| NGT-032 | Job deletion E2E                             | #686                     |
| NGT-034 | 旧folder filter候補の取り下げ                | 旧台帳参照               |
| NGT-046 | #636 junction                                | #684、#728、#7772、#7775 |
| NGT-048 | #466 pCloud                                  | 旧台帳参照               |
| NGT-056 | 長ポーリングの購読・破棄ライフサイクル       | #723                     |
| NGT-057 | ナビゲーション監査（Add Backup入口）         | #709                     |
| NGT-058 | 接続ステータスのナビゲーション               | #710                     |
| NGT-059 | バックアップ編集のルートID入力               | #711                     |
| NGT-060 | ジョブログのルートID入力                     | #712                     |
| NGT-061 | コマンド実行結果のルート入力                 | #713                     |
| NGT-062 | ナビゲーション監査（復元進捗taskid入力）     | #714                     |
| NGT-063 | ログ画面のRouter購読の破棄                   | #715                     |
| NGT-064 | Aboutのnativeリンク・選択同期                | #716                     |
| NGT-065 | 復元オプションの戻るリンク                   | #717                     |
| NGT-066 | ジョブ削除画面のナビゲーション               | #718                     |
| NGT-067 | 復元設定・ファイル削除のホーム移動リンク     | #719                     |
| NGT-068 | 設定インポートのホーム移動リンク             | #720                     |
| NGT-069 | コマンド画面のホーム移動リンク               | #721                     |
| NGT-070 | ログアウト完了画面の移動リンク               | #722                     |
| NGT-072 | タスク完了購読・待機の破棄ライフサイクル     | #724                     |
| NGT-073 | About更新確認の非同期処理・破棄              | #725                     |

## 2026-11-16 マージ確認

| NGT-004 | 動的リストの安定したtrack | [#729](https://github.com/duplicati/ngclient/pull/729)（2026-11-16 merged） |
| NGT-006 | 実サーバーE2E整備 / #273 | [#735](https://github.com/duplicati/ngclient/pull/735)（2026-11-16 merged） |
| NGT-033 | リンク先表示 | [#728](https://github.com/duplicati/ngclient/pull/728)（2026-11-16 merged） |
| NGT-051 | #311 flat file restore | [#736](https://github.com/duplicati/ngclient/pull/736)（2026-11-16 merged） |
| NGT-074 | Status停止・中断要求の状態と破棄 | [#731](https://github.com/duplicati/ngclient/pull/731)（2026-11-16 merged） |
| NGT-075 | Status snapshot取得セッションの寿命 | [#730](https://github.com/duplicati/ngclient/pull/730)（2026-11-16 merged） |
| NGT-076 | StatusBar進捗取得の重複・応答寿命 | [#732](https://github.com/duplicati/ngclient/pull/732)（2026-11-16 merged） |
| NGT-077 | WebSocket接続・非同期認証の寿命監査 | [#733](https://github.com/duplicati/ngclient/pull/733)（2026-11-16 merged） |
| NGT-078 | 詳細オプション追加アクションの無効状態 | [#727](https://github.com/duplicati/ngclient/pull/727)（2026-11-16 merged） |
| NGT-079 | リスト並替時のフォーカス保持 | [#729](https://github.com/duplicati/ngclient/pull/729)（2026-11-16 merged） |
| NGT-083 | SSH Browse時のホストキー承認 | [#734](https://github.com/duplicati/ngclient/pull/734)（2026-11-16 merged） |
| NGT-102 | #7850 Suppress時のジョブ種別・Enabled保持 | [#738](https://github.com/duplicati/ngclient/pull/738)（2026-11-16 merged） |

## 2026-11-17 マージ・整理確認

| ID      | 範囲                                                                          | PR                                                                             | 状態                                                                |
| ------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| NGT-106 | 保持メニューの外部フォーカス時の閉じ忘れ・import loadingの広すぎるE2E locator | [#749](https://github.com/duplicati/ngclient/pull/749)                         | DONE / 2026-11-17 merged                                            |
| NGT-105 | Check restore group paths without racing listing requests                     | [#739](https://github.com/duplicati/ngclient/pull/739)                         | DONE / 2026-11-17 merged                                            |
| NGT-050 | Show source attribute exclusions and link to their settings                   | [#740](https://github.com/duplicati/ngclient/pull/740)                         | DONE / 2026-11-17 merged                                            |
| NGT-084 | Report the result when Verify files finishes                                  | [#741](https://github.com/duplicati/ngclient/pull/741)                         | DONE / 2026-11-17 merged                                            |
| NGT-087 | Format progress file counts with locale-aware separators                      | [#742](https://github.com/duplicati/ngclient/pull/742)                         | DONE / 2026-11-17 merged                                            |
| NGT-089 | Add an optional sign-out after browser inactivity                             | [#743](https://github.com/duplicati/ngclient/pull/743)                         | DONE / 2026-11-17 merged                                            |
| NGT-094 | Add a Report an issue link to the navigation                                  | [#745](https://github.com/duplicati/ngclient/pull/745)                         | DONE / 2026-11-17 merged                                            |
| NGT-099 | Show file counts in the restore version picker                                | [#746](https://github.com/duplicati/ngclient/pull/746)                         | DONE / 2026-11-17 merged                                            |
| NGT-095 | Queue all eligible backups from the home page                                 | [#747](https://github.com/duplicati/ngclient/pull/747)                         | DONE / 2026-11-17 merged                                            |
| NGT-097 | Download the loaded entries from log pages                                    | [#748](https://github.com/duplicati/ngclient/pull/748)                         | DONE / 2026-11-17 merged                                            |
| NGT-113 | サイドバー単体テストのIdleLogoutState provider不足                            | [#750](https://github.com/duplicati/ngclient/pull/750) closed / #747で同等修正 | DONE / 重複providerを追加するだけになったため取り下げ・ブランチ削除 |

## 2026-11-18 マージ確認

| ID      | 完了範囲                                  | PR   |
| ------- | ----------------------------------------- | ---- |
| NGT-091 | Browser preference / server theme default | #744 |
| NGT-088 | Partial exclusion display                 | #751 |
| NGT-090 | Resolved shortcut source                  | #752 |
| NGT-092 | Compare previous run                      | #753 |
| NGT-093 | HTTPS certificate upload                  | #754 |
| NGT-096 | Last run failed indicator                 | #755 |
| NGT-114 | Required run-after fixture fields         | #756 |

GitHubのmergedAtとmainへの祖先包含を確認。Issue全体のclose状態は今回未確認。
| NGT-103 | Chromium popup初期化 / Playwright 1.65.1 | [#757](https://github.com/duplicati/ngclient/pull/757)、main 0bcf3179へマージ済み |

## 2026-11-19 マージ確認

| ID      | 完了した範囲                                                    | PR   |
| ------- | --------------------------------------------------------------- | ---- |
| NGT-041 | #283: 実サーバーでWS/長ポーリング認証復帰、一覧取得のエラー処理 | #771 |
| NGT-044 | #401: Windows宛先入力・保存・再読込の実サーバーE2E              | #772 |
| NGT-049 | #627: 既存ジョブ全ページの直接移動・保存・再読込E2E             | #773 |
| NGT-043 | #217: 欠損volume一覧・確認前不変・purge後の旧版復元E2E          | #774 |
| NGT-045 | #449: Linux/Windows両方向の一覧・復元E2E                        | #775 |
| NGT-042 | #492: タイムゾーン/DST日付編集・保存・Home表示の実サーバーE2E   | #776 |

検証済み: 6件のPRはmerged、対応Issueはclosed/completed。証拠はevidence/2026-11-19-maintenance/issues.json。個々の検証範囲・未検証範囲は各PR本文と元記録に従う。

## 2026-11-19 完了索引の補完

| ID      | 完了した範囲                             | PR・制限                                                                |
| ------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| NGT-107 | 更新版の変更履歴                         | #758。SafeValue診断文言の疑いはNGT-116で別調査                          |
| NGT-108 | 共有ローカルDBの削除防止                 | #759。cold start表示の疑いはNGT-117、secondary削除全体はNGT-054で別扱い |
| NGT-104 | ツリー再展開の回帰テスト                 | #760。本番バグの再現・修正済みとは扱わない                              |
| NGT-080 | CommandlineのSignal Forms                | #761。#497全体の移行完了ではない                                        |
| NGT-110 | 新規remoteの未暗号化保存確認             | #762。パスフレーズ全般のUX完了ではない                                  |
| NGT-109 | 既存CLI用DBの再利用                      | #763。宛先設定の追加実装は現行差分を照合                                |
| NGT-071 | console接続のnative link                 | #764。ナビゲーション監査全体の完了ではない                              |
| NGT-082 | ウィザード作成から実バックアップ・復元   | #765。live CI/UI削除はNGT-081/118に残る                                 |
| NGT-040 | #215の世代削除・Compact実サーバー回帰E2E | #770。Issueはclose済み                                                  |
| NGT-115 | 旧UIテーマ保持                           | 本体duplicati/duplicati#7886 MERGED。ngclientで重ねない                 |

検証済み: 今回GitHub metadataを再取得。#758〜776のmerged_atはevidence/2026-11-19-triage-refresh/recent-merged-prs.json、本体#7886はbackend-prs.json。各実装の動作は元の検証記録のSHA・範囲に限り、今回再試験したという意味ではない。

2026-11-19: NGT-098 (#786)、NGT-100 (#784)、NGT-101 (#785) はマージ済み。ブランチをlocal/originから削除し、main aaccdfa0351cへ統合確認。[今回の記録](evidence/2026-11-19-global-import-and-maintenance/verification.md)。
