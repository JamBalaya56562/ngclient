# 2026-11-18 main更新・ブランチ整理・rebase

## 検証済み: マージと削除

`jj git fetch --all-remotes`、`gh pr list --repo duplicati/ngclient --state all --limit 65 --json number,state,mergedAt,headRefName,headRefOid,title`で#744/#751/#752/#753/#754/#755/#756のMERGEDを確認。
`jj log`の`self.contained_in("::main")`で7件のhead全てがmainの祖先であることを確認した。

最新main: `e632fdd59a5bef4c6791612918de0c53c93ced9c`。
対応7ブックマークを`jj bookmark delete`、`jj git push --remote origin --deleted`でlocal/originから削除。
mainは`jj git push --remote origin -b main`で更新。
マージ済みコミットはmainの履歴として保持する。履歴破壊や物理GCはしていない。

## 検証済み: 残存ブランチ

`jj rebase -b '<実装6本とtriageのunion>' -o main --simplify-parents`で78コミットをrebase。
2本に競合が発生した。統合後swaggerから`bun run gen:openapi`でAPIクライアントを再生成。
skip-next-runのsysinfo判定は最新mainへ`hasSkipNextRun`だけ追加し、最新mainの他の判定を保持。
Playwrightブランチの不要になった空マージコミットは削除し、同じツリーの単一実装コミットに整理した。

| ブランチ | rebase・解消後SHA |
| --- | --- |
| feat/compact-progress | 05dd9fe8820057c418f70768d9e7e17b1974a49a |
| feat/export-global-options | c8dcdf753de2161675a9657a3ee90ca7b36d47c5 |
| feat/restore-resume-drafts | 62be94e7d434f665d334f9946f7c2a03af21cfe2 |
| feat/show-db-encryption-preload-paths | a39cfa68539718007b2b38f33f9f779dd189af73 |
| feat/skip-next-scheduled-run | 8de66197aec5965c865b511ab954642ed10aa5ce |
| codex/update-playwright-popup-fix | 1a5488aa7e54d4ed02ae69a0fe923737aad77bc6 |

全6実装はmain直下。triageもmainを祖先に持つ。
画像参照3ブックマークは固定SHAのURL維持のため変更しない。別workspace claude-fixesの未公開作業も変更しない。

## 検証済み: コマンドと結果

miseの実体を直接実行。各6ブランチで以下の2コマンドがexit 0:

```text
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
PASS app/spec tsc: feat/restore-resume-drafts
PASS app/spec tsc: feat/skip-next-scheduled-run
PASS app/spec tsc: feat/compact-progress
PASS app/spec tsc: feat/export-global-options
PASS app/spec tsc: feat/show-db-encryption-preload-paths
PASS app/spec tsc: codex/update-playwright-popup-fix
```

```text
bun run test:ci --include=**/restore.drafts.spec.ts --include=**/restore-from-config.component.spec.ts --include=**/restore-encryption.component.spec.ts --include=**/restore-flow.submission.spec.ts
Test Files 4 passed (4)
Tests 32 passed (32)

bun run test:ci --include=**/backups.skip-next-run.spec.ts --include=**/sysinfo.state.spec.ts
Test Files 2 passed (2)
Tests 38 passed (38)
```

生ログ・実行スクリプト（Git管理外）: `tmp/maintenance-20261118/`。
今回、全体テスト・本番ビルド・実サーバーE2Eは再実行していない（未検証）。
本体依存5件の最新マージ状態も今回未確認。新規PRや公開コメントは投稿していない。
push後の#757 CI完了は今回のローカル検証と分けて扱う。
