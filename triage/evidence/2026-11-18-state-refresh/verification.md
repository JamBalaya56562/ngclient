# 現状照合とtriage更新

照合時刻: 2026-11-18 19:47:41 JST。ngclient main 0bcf31797dd07fe356899ce236447038c178627e、本体 master e8756fab2b708af7a9b287d41916799a6da451ad。

## 検証済み: GitHubとjjの状態

- open Issueは14件。全件の本文と最新コメントを読み、現在の台帳へ分類した。状態の正本はopen-issues.json/all-issues.json。過去の動作確認コメントを今回の追試とは扱っていない。
- こちらのopen PRは#758〜765の8件で、全てproduction-build/unit-tests/browser-tests SUCCESS。任意startup-measurementsはSKIPPED。レビュー・コメントは全8件0。GitHub headはlocal-heads.txtと一致。
- #757はMERGED、mainは0bcf3179。通常実装13本は前回のrebase後SHAのまま。今回はコード変更・rebase・PR作成・公開コメントを行っていない。
- 返信待ち7件はいずれも最新コメントがJamBalaya56562からで、その後の返答なし。今回コメントを再投稿していない。
- 本体5ブランチはいずれもローカルmasterへの祖先判定がno。GitHub APIの最新masterとローカルmasterは同じe8756fab。head検索は5件とも空配列で、PR未提出。本体triage 07f65f219800c9e95ab1012435862769d1f9b902 はPR枠待ち・本体先行と記録。skip-nextは856178be、temporary一覧はf090ed23へ更新されており、古い04f2dd08等の参照を現在情報から除いた。
- 本体#7832はMERGED（83560c6bdc3c432d9a28ee0697a8db2e9d8cf899）。#328は修正後の実往復検証が次の作業。今回の実サーバー追試は未実施。

## 検証済み: 重複検出とソース検索

- upstream #766はOPEN/CI成功。files APIで#761とCommandline component/specを共有することを確認。#766は旧COMPARE用URL事前入力を除き専用比較ページを加える。ファイル重複の証拠はupstream-pr766.json/pr766-commandline-diff.json。実際のmerge conflictや両方を統合した動作は未検証。
- HTML検索でngModel/formControlName/formGroup/formControlに一致するテンプレートは29件。出力はlegacy-form-templates.txt。実使用フォーム29個とは数えない。旧Schedule/Filter、CVA内部、通常UI状態を分類する必要がある。StartAllDialogはhome.component.tsからimport/openされ、afterActionだけにngModelを使用（ソース根拠）。NGT-119はその小さな範囲の候補で、実装・テストは未着手。
- production-build.ymlは通常のbun run test:e2eを実行。root configのdefault modeはe2eでliveを除外し、live fixtureはDUPLICATI_SERVER_PATHを要求する。liveのCI自動実行が現状のworkflowに無いことはsource検索の範囲で確認（live-ci-audit.txt）。CIでのlive実行成功は未検証。
- 現行liveバックアップ/復元specの後片付けはAPI deleteJob。UI削除の実E2Eが同じ範囲を検証しているとは扱わず、NGT-118を新規候補にした。既存fixtureを再利用し、#765のspecと重複しない範囲を予定。今回の実装/実行なし。
- 本体#7896はOPEN。list-changesのファイル/フォルダー件数修正。#766との必須依存は未検証（関連の可能性は推測）。

## 実行した確認

実体をglob解決したjj/ghで実行。jjはngclientのみfetch/triage更新、本体は--ignore-working-copyのreadだけ。

```text
gh issue list --repo duplicati/ngclient --state open --limit 500 --json number,title,updatedAt,url,labels,body,comments
gh issue list --repo duplicati/ngclient --state all --limit 500 --json number,title,state,updatedAt,url
gh pr list --repo duplicati/ngclient --state all --limit 80 --json number,title,state,mergedAt,headRefName,headRefOid,baseRefName,url,updatedAt
gh pr list --repo duplicati/ngclient --state open --limit 100 --json number,title,headRefName,headRefOid,url,reviewDecision,reviews,comments,statusCheckRollup
gh api repos/duplicati/ngclient/pulls/766/files --paginate
gh api repos/duplicati/duplicati/commits/master --jq .sha
gh pr list --repo duplicati/duplicati --state all --search head:<各依存ブランチ> --json number,state,mergedAt,url,headRefName
jj --ignore-working-copy log -r <本体5ブランチとmaster> -T <commit_id/bookmarks/contained_in(::master)>
rg -l 'ngModel|formControlName|\[formGroup\]|\[formControl\]' projects/ngclient/src/app -g '*.html'
rg -n 'PLAYWRIGHT_MODE|test:e2e|workflow_dispatch|DUPLICATI_SERVER_PATH|live' .github/workflows playwright.config.ts e2e/live/fixture.ts
```

## 未実施・範囲

この更新は状態・ソース・記録の照合。単体テスト、本番ビルド、実サーバー検証、release収録確認は今回新たに実行していない。以前の実行結果は元のSHAと記録を参照する。新規候補NGT-118/119は実装済みではない。最終照合で追加された#768によりNGT-118は先行マージ待ち、NGT-119はREADY。

## 全open Issue

| Issue | Title | 最新コメント |
| --- | --- | --- |
| [#627](https://github.com/duplicati/ngclient/issues/627) | Job editor: tabs with a Save button instead of a wizard | JamBalaya56562 / 2026-11-13T22:58:39Z |
| [#497](https://github.com/duplicati/ngclient/issues/497) | chore: migrate codebase to using signal forms over object of signals | なし / 2026-08-10T19:45:58Z |
| [#492](https://github.com/duplicati/ngclient/issues/492) | Schedule page "Next time" shows one day too early even after PR and more | JamBalaya56562 / 2026-11-10T21:37:26Z |
| [#462](https://github.com/duplicati/ngclient/issues/462) | Delete files from secondary destinations | なし / 2026-04-27T07:14:44Z |
| [#460](https://github.com/duplicati/ngclient/issues/460) | Restore from secondary destination | ts678 / 2026-04-28T00:57:23Z |
| [#449](https://github.com/duplicati/ngclient/issues/449) | Cross-OS restores can loose the directory/file distinction | JamBalaya56562 / 2026-11-13T23:14:14Z |
| [#409](https://github.com/duplicati/ngclient/issues/409) | A list of improvement suggestions: | ts678 / 2025-11-21T13:30:04Z |
| [#401](https://github.com/duplicati/ngclient/issues/401) | Destination manual path temporarily prepends drive letter with forward slash while typing | JamBalaya56562 / 2026-11-10T21:59:07Z |
| [#328](https://github.com/duplicati/ngclient/issues/328) | Resilience for broken editors | JamBalaya56562 / 2026-11-07T10:01:27Z |
| [#283](https://github.com/duplicati/ngclient/issues/283) | Improve re-connect handling | JamBalaya56562 / 2026-11-10T21:35:33Z |
| [#273](https://github.com/duplicati/ngclient/issues/273) | Add a testing suite | なし / 2025-06-03T07:26:06Z |
| [#217](https://github.com/duplicati/ngclient/issues/217) | Create a list-broken-files and purge-broken-files page | JamBalaya56562 / 2026-11-10T21:46:13Z |
| [#215](https://github.com/duplicati/ngclient/issues/215) | Add a "Delete versions" page | JamBalaya56562 / 2026-11-10T21:31:25Z |
| [#126](https://github.com/duplicati/ngclient/issues/126) | [Suggestion] Add custom validation for destination/options/advanced options | なし / 2025-02-25T10:09:40Z |

## 最終照合中のupstream追加

最終取得で新規#767（Add theme toggle）と#768（Larger context menu）を検出。body/files APIを追加取得した。#767はsystem/server defaultの選択、layout/settings/theme/localstorage-recoveryを変更する。#768はHome操作メニューを新ダイアログへ置換し、Sync DBページも修正する。NGT-118の実UI削除テストは#768先行待ちに変更し、NGT-052/086の重複・統合確認へ追記した。NGT-119のstart-all子ダイアログは両PRの変更パスに含まれない。実際のUI/統合・merge conflictは未検証。

こちらの8 PR/head・14 open Issue/updatedAt・両main SHAは直前チェックでも変化なし。外部PRはスナップショット上#766/#767/#768の3本。外部PRの集合は調査中にも増えたので、凍結したopen-prs.jsonの取得時点を状態照合時刻として記す。

文書チェックでは主要Markdown5ファイルのローカルリンク30件、重複なし35 ID、14 open Issueの掲載、既存13実装headの不変を確認。準備済み13本の非空パス一覧とNGT-119対象の非重複も確認（document-checks.json/implementation-paths.json）。変更はtriage配下のみ。今回の状態照合にアプリのテスト/ビルドの再実行は含まない。
