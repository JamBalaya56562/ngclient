# マージ後の整理（2026-11-12）

検証済み: upstream/main と origin/main は 8edaeee84c0c0f4a48e75ae917195cb1047b15a5。PR #684〜#694のマージと先端SHA一致を確認し、対応する11ブックマークをローカル・originから削除した。mainのコミット履歴は維持した。

検証済み: 残る20実装ブランチとtriageを最新mainへローカルrebase。全21件のmain祖先関係を確認。ブックマーク上の競合はゼロ。今回はrebase後のブランチをpushしていない。PUSHED行のoriginは旧SHAのまま。triageも未push。

リンク先表示の競合2ファイルは、Access deniedとリンク先表示の双方を保持して解消した。
- bun run test:ci --include '**/file-tree.keyboard.spec.ts': 1 file passed / 22 tests passed
- node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json: exit 0
- node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json: exit 0
- bun run build:prod: exit 0 / Application bundle generation complete (47.022 seconds)
- 競合解消ファイルはPrettierで整形。

未検証: 他の19実装ブランチのrebase後のテスト・ビルド、実サーバーUI。過去の検証記録は新mainでの再検証を意味しない。

画像用codex/pr-review-screenshotsはPR #675の固定SHAリンクを保持するため、193398fbffcbda23945e031e16f49ece9de733a4のまま維持し、rebase対象外。別セッションのclaude-fixesワークスペースは変更していない。

検証済み: 本体#7775は2026-11-12T09:25:24Zにマージ済み。NGT-033の外部依存は解消した。統合再確認は未実施。

削除ブックマーク一覧・rebase前後のSHA・ビルド出力はローカルtmp/maintenance-20261112に保存した。