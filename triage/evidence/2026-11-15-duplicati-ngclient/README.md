# 移管した一次記録

対象と補足・原文引用は[移管記録](../../2026-11-15-duplicati-ngclient-records.md)を参照。これらは過去の記録であり、今回実行したテストではない。引用内のコマンドやスクリプトは移管時に実行しない。

- journal.selected.jsonl: 対象40エージェントのstarted/resultを原文保存。元Jの行番号は移管記録を参照。
- command-results.jsonl: Tの検証関係Bashコマンド/出力の抜粋。agentId、source、line、uuid、timestamp、tool_use_idで追跡可能。resultsが空なら出力は記録なし／所在不明。
- auxiliary-tool-results.jsonl: PowerShell/Monitor/TaskStopの17組を入力と結果ごと保存。Bash以外のコマンド・監視出力・後片付けをagentIdで追跡できる。
- ng-records.txt: 移管元がJから18件を抽出したSを原文保存。
- manifest.json: 元の絶対パス、SHA-256、サイズ、40件の全履歴の所在、保存物の採否と理由。
- artifacts/: TEMPから保存した11ファイル。テスト用固定パスワード・fixtureトークンは原文のまま。実ユーザーの認証情報として扱わない。

40件のT全体と7.6MBのビルド配布物は収録せず、記録の所在とハッシュをmanifestへ保存。traceはモック画面の失敗記録で、実装役とレビュー役のどちらの赤実行か不明。実サーバーの復元等を確認した証拠ではない。

補助ツールはagent内のtool_use_idで重複をまとめ、対応するtool_result行はすべて保持した。引用元の行番号で元のイベントへ戻れる。
