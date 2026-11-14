# triageと実際の状態の照合（2026-11-14）

この記録はGitHub・jj・現行ソースの読み取りによる照合。アプリの新しい実装・動作検証ではない。現在の状態と実装順序の正本は[タスク台帳](tasks.md)。

## 確認した現在地

**検証済み（取得・履歴・ソース）**:

- upstream/main、fork main、ローカルmainは `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`（0.0.250）。`jj git fetch --all-remotes` は `Nothing changed.`。
- ngclientのopen Issueは16件、open PRは9件（#727〜#735）。9実装ブックマークはすべてこの9PRに対応。未PRの準備済み実装は0件。
- `fix/folder-filter-separators`は削除済みでNGT-034は候補取り下げ完了。旧FilterComponentのソース自体を削除したという意味ではない。
- triageは記録用、`codex/pr-review-screenshots`は画像URL保持用で、実装候補数に含めない。別ワークスペースclaude-fixesの未ブックマーク作業中コミットは変更しない。
- `jj log` のmain祖先にGeneral #682とSignal Forms #687〜#704のマージ記録がある。これらを「8PR open / 10ブランチ未PR」とした11/12文書は現在の状況ではない。

| 現在のPR                                               | 対応タスク   | head                                 |
| ------------------------------------------------------ | ------------ | ------------------------------------ |
| [#727](https://github.com/duplicati/ngclient/pull/727) | NGT-078      | codex/advanced-options-actions       |
| [#728](https://github.com/duplicati/ngclient/pull/728) | NGT-033      | codex/show-file-tree-link-target     |
| [#729](https://github.com/duplicati/ngclient/pull/729) | NGT-004・079 | codex/stable-backup-list-tracking    |
| [#730](https://github.com/duplicati/ngclient/pull/730) | NGT-075      | codex/status-snapshot-lifecycle      |
| [#731](https://github.com/duplicati/ngclient/pull/731) | NGT-074      | codex/status-task-action-lifecycle   |
| [#732](https://github.com/duplicati/ngclient/pull/732) | NGT-076      | codex/statusbar-progress-lifecycle   |
| [#733](https://github.com/duplicati/ngclient/pull/733) | NGT-077      | codex/websocket-connection-lifecycle |
| [#734](https://github.com/duplicati/ngclient/pull/734) | NGT-083      | fix/browse-approve-host-key          |
| [#735](https://github.com/duplicati/ngclient/pull/735) | NGT-006      | codex/live-editor-persistence-e2e    |

各PRをGitHub APIで読み返し、base=main、headが当該ブックマークであることを確認。検証済みのSHA・コマンド・結果は[直前の全ブランチ検証記録](2026-11-14-rebased-branches-prs.md)と各PR本文を参照。過去のテストを今回再実行した結果とはしない。

## 修正した食い違い

| 古い記載                                                  | 今回確認した根拠と訂正                                                                                                                                                                                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #449は公開報告未実施                                      | [6867298500](https://github.com/duplicati/ngclient/issues/449#issuecomment-6867298500)にmain f217ce91・本体6cae627aの修正後Debug、両方向の一覧・通常UI復元・内容一致を投稿済み。Issueはopenで再確認待ち。配布版や全復元経路を確認済みとはしない         |
| #627はコメント未投稿                                      | [6867035192](https://github.com/duplicati/ngclient/issues/627#issuecomment-6867035192)を投稿・訂正済み。公式2.4.1.101 CanaryのSave changes収録と、実画面検証に使ったmain UIの違いを明記済み。残る外観・ツアー要望は返信待ち                             |
| #636はBLOCKED                                             | GitHub APIのstate=closed、state_reason=completed。本体#7772/#7775とngclient #684はマージ済み。#728のリンク先表示は追加機能でありIssueを再び未解決と扱う理由ではない。元の独語Windows環境の今回の再現は未検証                                            |
| #466は追加情報待ち                                        | GitHub APIはclosed/completed。[報告者の返信](https://github.com/duplicati/ngclient/issues/466#issuecomment-6830293591)では2.4.0.1で元の手順が正常。こちらで全OAuth環境を再検証したという意味ではない                                                    |
| #328の本体PR番号が未記録                                  | [duplicati/duplicati#7832](https://github.com/duplicati/duplicati/pull/7832)がopen。head `fix/keep-target-url-when-masking`、SHA `b2c9a39810e2d620e0f1a6d8cf65f5a46f1249f3`。URLのmask/unmaskで保護値以外を書き換えない変更。マージ後のAPI/UI再検証待ち |
| Angular移行・ナビゲーションの古い優先順位をそのまま使える | 完了済み範囲を台帳へ反映。日付付き文書には履歴であることを明記し、現在の作業順はtasks.mdへ集約                                                                                                                                                          |

本体#7772・#7775・#7776はそれぞれGitHub APIでmerged=trueを確認。#7832はmerged=falseで、テスト用merge commitの存在をマージ済みと誤認しない。

#215、#283、#492、#217、#401、#449、#627、#637の公開コメントを取得して照合。自分が投稿した確認・提案を、報告者からの新しい再確認と混同しない。今回取得した範囲では、それらの提案後に要求されていた再確認の返信はない。

## 次候補の根拠と限界

- **検証済み（静的）**: app.routes.tsの `backup/:id/commandline` はCommandlineComponentを使い、実テンプレートは `formGroup` / `formControlName`、クラスは `baseCmdForm` / `standardFields` とFormBuilderを使用。コマンド切替で引数を退避・復元する処理もある。#497の次の小さな移行候補NGT-080とした。バグがあることや移行の性能効果は**未検証**。
- **検証済み（ソース）**: #735のlive specsは `/api/v1/backups` へのPOSTでジョブを準備する。実行・復元や既存ジョブ保存は画面で検査するが、初回ウィザードの全入力を通した実サーバーテストではない。継続実行はNGT-081、画面からの新規作成フローはNGT-082として#735マージ後に進める。
- **検証済み（CI定義）**: production-build.ymlにはPlaywrightの導入・`bun run test:e2e`・失敗診断artifactの保存が既にある。NGT-081はこれを重複実装する作業ではなく、隔離した実サーバーの準備を伴うliveモードの継続実行を整える作業。今回、CI上の実行そのものは**未検証**。
- **ドキュメント根拠（Issue本文）**: #311は個別ファイルの復元表示を階層化したい要望。データ喪失や誤復元が現行版で起きると確認したものではない。まず実データのAPI/DOMを比較し、修正の必要性・本体依存を判断する。
- NGT-071の残存RouterLink付きbuttonは静的検索で見つかるが、disabled・タブ・状態変更付きのものを機械的にリンクへ変えない。不具合や改善効果は、対象ごとのテスト前には**未検証**。

## 再現可能な照合手順

jj/Nodeはmise管理下の実体を直接呼ぶ。GitHubは接続ツールの `search_issues`、`search_prs`、`fetch_issue`、`fetch_issue_comments`、`fetch_pr` で実際に取得した。同じ確認はghの下記コマンドでも行えるが、今回それらのghコマンドを実行したとはしない。

```text
jj git fetch --all-remotes
jj bookmark list
jj workspace list
jj log -r main --no-graph -T commit_id
jj log -r 'ancestors(main) & description(regex:"Merge pull request #(682|68[7-9]|69[0-9]|70[0-4])")' --no-graph
rg -l 'FormsModule|ReactiveFormsModule|FormGroup|FormBuilder' projects/ngclient/src/app --glob '*.ts' --glob '!*.spec.ts'
rg -n 'commandline' projects/ngclient/src/app/app.routes.ts
jj file show -r codex/live-editor-persistence-e2e e2e/live/backup-restore.spec.ts

# GitHub状態の再取得に使える同等のCLI操作
gh issue list --repo duplicati/ngclient --state open --limit 100
gh pr list --repo duplicati/ngclient --state open --limit 100
gh issue view <number> --repo duplicati/ngclient --comments
gh pr view 7832 --repo duplicati/duplicati --json state,mergedAt,headRefName,headRefOid
```

**検証済み（文書整合性）**: Git管理外の `node tmp/verify-triage-reconciliation-20261114.mjs` はexit 0。75個のIDに重複がなく、元の71個をすべて保持、open Issue 16件とopen PR 9件を台帳に記載、更新文書のローカルMarkdownリンクが解決することを確認した。NGT-080〜082は今後の候補、NGT-083は既存SSH PR #734の台帳登録。新規実装したという意味ではない。

`node node_modules/prettier/bin/prettier.cjs --check triage/tasks.md triage/README.md triage/2026-11-14-triage-reconciliation.md` はexit 0、`All matched files use Prettier code style!`。

今回は文書の更新と静的照合のみ。実サーバー再実行、アプリのテスト・ビルド、Angular公式資料の再調査、フォーラム全体の再巡回、新しいPR・Issueコメントの投稿は行っていない。
