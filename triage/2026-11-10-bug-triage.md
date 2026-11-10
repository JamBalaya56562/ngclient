# バグ調査とIssueを閉じるための計画

調査日 2026-11-10（JST）。ngclient upstream main は [20d6c2128e6c5166ced84784385064b7ff788157](https://github.com/duplicati/ngclient/commit/20d6c2128e6c5166ced84784385064b7ff788157)。

## 調査範囲

- **検証済み（取得結果）**。GitHub CLIで [ngclientのOpen Issue](https://github.com/duplicati/ngclient/issues?q=is%3Aissue+is%3Aopen) 18件、[Open PR](https://github.com/duplicati/ngclient/pulls) 7件（#676〜#682）、forkの作業ブランチを照合した。[Duplicati本体のOpen Issue](https://github.com/duplicati/duplicati/issues?q=is%3Aissue+is%3Aopen) は取得した150件を、UI・ブラウザー・復元・スケジュール・ngclient・ngaxで一次選別した。古い本体Issueすべての網羅調査は未実施。
- **検証済み（取得結果）**。[フォーラムの新着](https://forum.duplicati.com/latest) 30件と Discourse の `"new UI" order:latest` の取得結果50件を一次選別した。さらにSupport、UX、リリース記事を、復元・接続・設定・UIの語で検索した。検索結果から関連する報告本文と返信を読み、GitHubや既存PRと重複を整理した。
- **ドキュメント根拠**。報告版と修正を含む候補版の比較には [2.4.1.0 Stable](https://forum.duplicati.com/t/22853)、[2.4.1.100 Canary](https://forum.duplicati.com/t/22860)、[2.4.1.101 Canary](https://forum.duplicati.com/t/22902) のリリース記事を使用。リリース記載やモックテストの存在だけで、報告環境の実機再現・修正確認とは扱わない。

## バグ優先の作業順

1. **復元のフォルダー誤認識を実データで確認する（#449）**。Linuxで小さなバックアップを作り、Windowsの隔離サーバーで直接復元する。ディレクトリと同階層のファイルを用意し、初回と展開時の `POST /api/v2/backup/list-folder` の `Path`、末尾区切り、ディレクトリ属性、画面上の分類、復元結果を比較する。逆方向のWindows→Linuxも試す。応答が正しくUIだけ誤認する場合はngclientで赤→緑の修正。応答が誤っていれば本体側へ渡す。両方向が通れば、検証した版を明記してcloseを提案する。現行mainにはモック応答で異OSパスを分類・展開する `file-tree.restore-paths.spec.ts` がある（ドキュメント根拠）。今回の実データ検証は未実施。#680と同じファイルに修正が必要になった場合は差分を再照合する。[Issue](https://github.com/duplicati/ngclient/issues/449) · [元報告](https://forum.duplicati.com/t/22076) · [関連報告](https://forum.duplicati.com/t/22287)
2. **切断後に操作可能へ戻るかを実サーバーで確認する（#283／本体#6101・#6073）**。トークン期限切れ、更新の一時失敗、再認証成功を再現し、再読込なしでステータス・通知・バックアップ一覧の購読が戻るかを見る。WebSocket無効時は長ポーリングを別ケースとする。#664がマージ済みなので同じ修正を重ねない。古い本体報告は似ているが、同一原因は未検証。ログとHTTP/WSの時系列で分類し、#283の元症状が解消済みならclose提案。[#283](https://github.com/duplicati/ngclient/issues/283) · [#664](https://github.com/duplicati/ngclient/pull/664) · [本体#6101](https://github.com/duplicati/duplicati/issues/6101) · [本体#6073](https://github.com/duplicati/duplicati/issues/6073)
3. **表示と実際の起動時刻を分けて確認する（#492）**。過去のコメントには隔離サーバーでの正常な表示確認がある一方、報告者には以前の修正後も再発した履歴がある。報告の `2026-09-06T12:20:00Z` とDST境界を使い、編集画面、保存データ、ホームの次回予定、実際の起動を照合する。ブラウザーとサーバーのTZを意図的に変え、表示だけかスケジューラーかを判定する。元の症状を含む条件で通ってからclose提案。[#492](https://github.com/duplicati/ngclient/issues/492) · [DSTの関連報告](https://forum.duplicati.com/t/22860)
4. **互換ジャンクション（#636）は本体セッションの結果を待つ**。報告者が自作ジャンクションとリンク先直接指定は成功し、Windows標準の `Cookies` と `Anwendungsdaten` は一覧APIでHTTP 500になると報告。例外の原因は未検証。本体側で応答が修正された後、同じWindows環境でソース選択を再確認し、UI修正が必要か決める。[報告者の返信](https://github.com/duplicati/ngclient/issues/636#issuecomment-6753964418)

## 残るngclient Issueの完了条件

| Issue                                                                                                              | 分類と次の判断                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#401](https://github.com/duplicati/ngclient/issues/401)                                                           | 既存のChromium確認ではWindows模擬環境で `C` → `C:` → `C:\\` の入力に余分なスラッシュが付かなかった。最新の実Windowsで入力と保存を確認し、報告者の再確認と合わせてclose判断。                                                                                                           |
| [#328](https://github.com/duplicati/ngclient/issues/328)                                                           | #618で保存済みURLの保持と明示編集の反映を実装済み。既存テストの対象外でまだ壊れるプロバイダーや入力があるか切り分ける。追加症状が出なければ検証範囲を明記してclose提案。                                                                                                               |
| [#466](https://github.com/duplicati/ngclient/issues/466)                                                           | #567の既存テストはpCloudの地域・フォルダー・既存AuthID保持をカバーする。新規OAuthの401は未検証。報告者の最新版・地域・ブラウザー・伏字にした応答を待ち、トークン取得と接続テストを分離する。[フォーラム](https://forum.duplicati.com/t/21775)                                          |
| [#215](https://github.com/duplicati/ngclient/issues/215)                                                           | 世代削除の画面は既存。#679は確認のスコープ修正。隔離サーバーに複数世代を作り、選んだ世代だけの削除とCompactオン・オフを実測してからcloseを提案する。#675はファイル削除の検証なので証拠を流用しない。                                                                                   |
| [#217](https://github.com/duplicati/ngclient/issues/217)                                                           | 既存の一覧・確認・purgeフローと#673がある。捨てられるfixtureで破損対象を把握し、確認前に変更せず、対象のpurge後に残存版が復元できることを実測する。検出対象を明記し、本体側の同趣旨の [#4996](https://github.com/duplicati/duplicati/issues/4996) にも検証結果を共有できる状態にする。 |
| [#627](https://github.com/duplicati/ngclient/issues/627)                                                           | 既存ジョブで任意のステップへの移動と各ページでの保存を現行版で確認する。新規作成のウィザードと区別し、残る要求が見た目のタブ化・操作の発見しやすさか合意してからclose判断。                                                                                                            |
| [#637](https://github.com/duplicati/ngclient/issues/637)                                                           | 意図的に廃止されたソース画面のチェックボックスを戻す要望。既存の詳細オプションで値が保持されることと、ソース画面での発見性を分ける。Hidden/Systemだけの導線や説明を戻すかメンテナーと合意してから実装。                                                                                |
| [#311](https://github.com/duplicati/ngclient/issues/311)                                                           | メンテナーの説明では個別ファイルをソースに選んだときの平坦表示は現行仕様。#449とは別。仮想フォルダーでまとめる提案を機能要望として扱い、Windows・UNC・Unixの設計と対象を合意する。                                                                                                     |
| [#409](https://github.com/duplicati/ngclient/issues/409)                                                           | 複数要望。#677・#678は一部のアイコンのみ。帯域制限ボタンの名前とツールチップ、警告・ログ・進捗・現在ファイルの各項目を個別に確認し、残る要望を分割する。                                                                                                                               |
| [#497](https://github.com/duplicati/ngclient/issues/497)                                                           | #682は基本設定のみ。残りのフォームを棚卸しし、画面ごとの移行と既存DTO・保存挙動の同等性を確認後にclose。                                                                                                                                                                               |
| [#273](https://github.com/duplicati/ngclient/issues/273)                                                           | リファクタリングとE2Eがさらに進むまで保留。PR #676や準備済みの一時停止E2Eを含め、重要フローのカバレッジとCIの実行条件を一覧にしてから完了条件を再確認する。                                                                                                                            |
| [#460](https://github.com/duplicati/ngclient/issues/460)・[#462](https://github.com/duplicati/ngclient/issues/462) | secondary宛先からの復元と宛先別削除。既存APIで対象を明示できるか確認し、足りなければ本体側の契約を先に決める。削除では選ばなかった宛先に影響しないことが完了条件。                                                                                                                     |
| [#126](https://github.com/duplicati/ngclient/issues/126)                                                           | 設定項目の検証ルールを伝えるAPI契約の合意が先。既存のクライアント検証と分け、適用範囲と後方互換性を定義する。                                                                                                                                                                          |

## フォーラム・本体Issueの追加候補

| 報告                                                                                                                | 判断と再調査の条件                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [英語UIにサーバー側ロケールが混ざる](https://forum.duplicati.com/t/22855)                                           | メンテナーも英語だけヘッダーを送らない経路を指摘。#681と重複するため新規作業なし。マージ済みか、どの同梱版に入ったかを次回確認。                                            |
| [2.4.0.1の複数のUI症状](https://forum.duplicati.com/t/22782)                                                        | Syncが復元候補に出る件と、警告詳細・その他の報告を別症状として扱う。Sync除外は最新mainの回帰テスト・実画面で確認し、別の症状に同じ修正を当てない。                          |
| [警告の詳細が見えない](https://forum.duplicati.com/t/22616)                                                         | メンテナーが当時のcanaryでの修正を案内。現行版で同種の警告が再現した場合のみ、永続ログ・通知・ライブログのどれに情報が欠けるか追う。                                        |
| [SMBリポジトリの直接復元](https://github.com/duplicati/duplicati/issues/6865)                                       | 災害復旧に影響する候補。実SMBが用意できたら、Windows UNCで接続テストとlist-filesetsを分けて実行。APIが成功してUIが進めない場合にngclientの候補へ昇格する。                  |
| [remote sourceのルートと除外](https://forum.duplicati.com/t/22900)                                                  | メンテナーが一時マウントパスの契約を説明。除外は別症状。エクスポートされたフィルター、マウント実パス、CLI/APIのフィルターテストを比較し、画面の保存と本体評価を切り分ける。 |
| [Windowsの接続拒否](https://forum.duplicati.com/t/22897)・[再起動後の一時停止](https://forum.duplicati.com/t/22898) | 報告はサービス導入・接続・電源イベント周辺。ブラウザーでのHTTP応答または正しいサーバー状態に対するUI不整合が確認できるまで、ngclientバグ候補には入れない。                  |

## 次回も同じ方法で調べる

1. 前回以降の更新をGitHub両リポジトリとフォーラムのSupport・UX・Releasesから取得する。検索語は `ngclient`、`new UI`、`ngax`、`restore`、`schedule`、`destination`、`websocket`、`save` を症状別に組み合わせる。
2. 報告ごとに再現手順・UI版・本体版・OS・ブラウザー・経路・期待値・最小の伏字済み証拠を残す。同じ症状を既存Issue・PR・forkブランチ・同梱版に結び付ける。
3. 復元不能、誤った対象への削除、保存値の破損、通常操作の停止を優先する。隔離した実サーバーでHTTPまたはWSの境界を観測し、APIが正しいのに表示や送信が違う場合にngclient修正を進める。
4. 修正前の失敗、修正後の成功、関連テストとビルドを揃える。報告条件を満たす修正には `Fixes`、部分対応には `Refs` を使う。修正済みとみられる古いIssueは、検証範囲と未検証の条件を示してcloseを提案する。
