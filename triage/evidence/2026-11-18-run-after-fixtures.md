# NGT-114: RunAfter必須フィールドのfixture補完

検証済み。PR [#756](https://github.com/duplicati/ngclient/pull/756)、ブランチ `codex/fix-backup-fixture-run-after-fields`、head `19c07ca72cccae9ad7fa177799dcdfa44845bc8a`、親は最新main `b856d9ce4dd9881291bb440650a9a2fc76685498`。origin push済み。#744の実装を含めない独立した修正。

変更は `backups.enable-disable.spec.ts` と `backups.refresh.spec.ts` のfixtureへ `RunAfterBackupID: null` と `RunAfterCondition: 'Success'` を追加する4行。通常の独立バックアップを表し、既存のserializationテストの既定値にも一致する。生成型・アプリ実装・テスト設定は変更しない。

## 実行結果

- 修正前 `tsc --noEmit -p projects/ngclient/tsconfig.spec.json`: 両fixtureでTS2739。必須のRunAfterBackupID / RunAfterConditionが不足。
- 修正後 `tsc --noEmit -p projects/ngclient/tsconfig.spec.json`: 終了コード0。
- `tsc --noEmit -p projects/ngclient/tsconfig.app.json`: 終了コード0。
- `bun run test:ci`: **Test Files 194 passed (194) / Tests 2473 passed (2473)**、除外なし。
- `bun run build:prod`: 終了コード0、Application bundle generation complete [35.835 seconds]。
- `prettier --check`（両spec）: All matched files use Prettier code style。

node/bun/jjはmiseの実体をglobで解決して直接実行。全ログはGit管理外の `tmp/fixture-run-after-20261118/`（red.log、tsc-spec.log、tsc-app.log、unit.log、build.log、prettier.log）。単体テストには既存のCSS解析警告が出るが、テストは全成功。

このPRがmainへ入ればNGT-091/#744で記録したmain側のfixture不足は解消する。#744自身の再検証・CI成功はこの修正ブランチの成功とは別に確認する。
