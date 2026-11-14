# main更新・マージ済みブランチ整理（2026-11-14、後続）

検証済み: `jj git fetch --all-remotes` と `gh pr list --repo duplicati/ngclient --author JamBalaya56562 --state all --limit 30 --json number,state,headRefName,headRefOid,mergeCommit` で PR #716〜#726 の MERGED と元ブランチSHAを照合した。

- main / upstream main: `8f401edd337bf53a963fc4e80a47d3db4d52fc3d` (0.0.250)。origin mainも更新。
- 11件のマージ済みローカル・originブックマークを削除。元コミットはすべてmainの祖先だったため、mainの履歴は削除しない。不要な独立コピーはなかった。
- 実装10ブランチとtriageを `jj rebase -b <bookmark> -d main@upstream` でrebase。ライブE2Eの6コミット、フォーカス保持の2コミットはスタックを維持。競合なし。
- 公開済みPR画像のURL維持用 `codex/pr-review-screenshots` は `193398fbffcbda23945e031e16f49ece9de733a4` のまま保護（rebase対象外）。
- 別ワークスペース claude-fixes の作業中コミット `940f320e0dbf182b8d4d2b9a2241d7f75b02e069` は変更しない。未ブックマークの作業中コミットであり実装ブランチとは別。
- 今回は履歴整理のみ。テスト・ビルドの再実行は未実施／未検証。過去の実行結果は個別記録に残す。
- PR・Issueコメントは投稿しない。

取得前ブックマーク一覧とPR応答はローカルの `tmp/maintenance-20261114-next/` に保存。push後は全対象でローカル/originの一致と最新mainの祖先関係を照合する。