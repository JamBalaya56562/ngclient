# 2026-11-16 main更新・ブランチ整理

## 検証済み

- GitHub API `GET /repos/duplicati/ngclient/pulls?state=all&sort=updated&direction=desc&per_page=60` とopen一覧を取得。#727〜#738はすべてmerged、open PRは0件。当方の実装11本をローカル・originから削除。本家の#737は当方のforkブランチではない。
- `jj git fetch --all-remotes`後のupstream/mainとfork/mainは`ae54d73bf1e5e98fb65dd8060c006f1defc90d01`。削除前に各PRのheadとmerge SHAがmainの祖先であることをrevsetで確認。mainの履歴を構成するコミットは削除しない。
- 残る実装19本とtriageを`jj rebase -b <各ブランチ> -d main@upstream --skip-emptied`でrebase。originだけにあった14本も追跡した。新旧SHAは[対応表](rebased.json)。triageの最終SHAはこの記録を含むpush結果を参照。
- 画像URL保持のため`codex/pr-311-screenshots`、`codex/pr-637-screenshots`、`codex/pr-review-screenshots`の3参照は変更しない。別workspace `claude-fixes`の未ブックマーク作業も変更しない。本家の作業ブランチは操作しない。

## 競合解消とテスト

3本で競合。main側の新機能と各ブランチの目的を保持して解消した。

| ブランチ                                    | 解消した範囲                                                           | 関連テスト                             |
| ------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------- |
| `feat/file-tree-partial-exclusion`          | 復元グループ構築と部分除外判定を両方保持。ARIA説明の二重バインドも統合 | file-tree配下16 spec、207 passed       |
| `codex/source-attribute-exclusion-feedback` | 復元グループのヘルプ・ラベルと属性除外表示を両方保持                   | file-tree配下とsource-data、216 passed |
| `fix/status-bar-file-count-separators`      | DestroyRefとlocale/formatNumberのimportを両方保持                      | status-bar.state.spec.ts、23 passed    |

部分除外ブランチでは最初の追試が205 passed / 1 failed。`shows a junction target without using it as the selected path`で`aria-description`がnullになった。リンク先表示と部分除外説明の二重バインドを1つにし、両説明を併せ持つ回帰テストを追加。修正後207件成功。[失敗ログ](partial-exclusion-tests-before-fix.log)。

実行したコマンド（Node/Bunはmiseの実体を直接指定、PATHに実体のディレクトリを追加、VITEST_MAX_WORKERS=1）:

```text
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
bun run test:ci --include "projects/ngclient/src/app/core/components/file-tree/**/*.spec.ts"
bun run test:ci --include "projects/ngclient/src/app/core/components/file-tree/**/*.spec.ts" --include projects/ngclient/src/app/backup/source-data/source-data.component.spec.ts
bun run test:ci --include projects/ngclient/src/app/core/components/status-bar/status-bar.state.spec.ts
bun run build:prod
```

上記のapp/spec型チェック・本番ビルドは競合した3本でそれぞれ成功。テストコマンドは表の該当ブランチで実行。変更した競合ファイルのPrettier checkも成功。属性除外の単体テストではjsdomの`Could not parse CSS stylesheet`メッセージが出るが、テストは成功。ログの原本と実行スクリプトは`tmp/maintenance-20261116/`。今回は残り16本のテスト・ビルド全件追試と実サーバーE2Eは未実施で、過去の検証を今回の結果として扱わない。

## pushと整合性

検証済み: main・実装19本・triageをoriginへpush後、`jj git fetch --all-remotes`はNothing changed。全21参照のローカル/origin SHA一致、削除11本の不在、画像3参照のSHA不変を確認。実装19本とtriageがmainの子孫で競合なしであることもrevsetで確認。原本は`tmp/maintenance-20261116/bookmarks-verified.txt`。

## 前回のCI再実行

NGT-103の#727/#733は、同じソースの再実行run [43735256382](https://github.com/duplicati/ngclient/actions/runs/43735256382) / [43735257089](https://github.com/duplicati/ngclient/actions/runs/43735257089)がcompleted/successであることをGitHub APIで確認。両PRとも今回マージ済み。新規ページ通知が止まる内部原因は未特定で、修正PRは作成していない。
