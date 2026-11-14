# NGT-034: 旧FilterComponent修正候補の取り下げ

2026-11-14。利用者指示により不要な候補を取り下げ、ブランチを整理した。

- ブックマーク: `fix/folder-filter-separators`
- 削除前のSHA: `edd1c01ec5771c6d525a57589bef20c178fe29b2`
- 理由: 現行画面はNewFilterComponentを使用しており、旧FilterComponentの修正を公開する必要がない。[調査・検証記録](2026-11-14-rebased-branches-prs.md)を参照。

## 検証済みの作業

1. `jj git fetch --all-remotes`: `Nothing changed.`
2. `jj bookmark list fix/folder-filter-separators --all-remotes`: ローカルとoriginが上記SHAで一致。
3. `jj log -r 'descendants(fix/folder-filter-separators)' --no-graph`: 対象コミット1件のみ。他ブランチやワークスペースにつながる子コミットなし。
4. `jj bookmark delete fix/folder-filter-separators`: `Deleted 1 bookmarks.`
5. `jj git push --remote origin -b fix/folder-filter-separators`: originの同名ブランチを削除。
6. `jj abandon edd1c01ec5771c6d525a57589bef20c178fe29b2`: `Abandoned 1 commits.`

NGT-034のDONEは候補取り下げと整理の完了を表す。Issue対応や製品の機能修正が完了したという意味ではない。旧コンポーネントのソース自体は削除していない。過去の検証記録は履歴として保持する。

今回の変更はブックマーク整理とtriage文書のみ。アプリのテスト・ビルドは再実行していない。ほかの実装ブランチ・既存PR・画像保存ブランチ・別ワークスペースは変更しない。
