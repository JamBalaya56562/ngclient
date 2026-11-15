# Duplicatiから移管した18件の検証索引

2026-11-15。最終SHA・元の試験結果・レビューは移管記録であり、この整理で試験を再実行していない。現在の状態・優先順は[tasks.md](tasks.md)。原文の大量引用は削除し、一次記録へ一本化した。

## 一次記録の参照先

- [J: started/result 80行・40エージェント](evidence/2026-11-15-duplicati-ngclient/journal.selected.jsonl): keyとagentIdで実装・初回レビュー・修正・再レビューを追える。
- [T: Bashコマンド/出力220組](evidence/2026-11-15-duplicati-ngclient/command-results.jsonl)、[補助ツール17組](evidence/2026-11-15-duplicati-ngclient/auxiliary-tool-results.jsonl)。元ファイル・行・UUID付き。
- [S: 移管元の抽出原文](evidence/2026-11-15-duplicati-ngclient/ng-records.txt)、[manifest](evidence/2026-11-15-duplicati-ngclient/manifest.json)、[保存物の案内](evidence/2026-11-15-duplicati-ngclient/README.md)。

元の全引用版は[移管時の固定revision](https://github.com/JamBalaya56562/ngclient/blob/4d1ecd6972a8fde1c5f618637f09a2cb68ca1694/triage/2026-11-15-duplicati-ngclient-records.md)から復元できる。一次記録と保存物11点は現行triageにも残す。通常検索は索引・台帳・PR本文を対象とし、一次記録の検索は`rg --no-ignore -n <語句> triage/evidence/2026-11-15-duplicati-ngclient`で明示する。

## 共通の判定

- 原文中の「検証済み」「承認」は元エージェントの報告。移管担当による追試ではない。読んだだけの判断を実行検証へ格上げしない。
- 全件でCI・eslint・xlf更新は未実施との報告。extract-i18n出力と翻訳カタログ更新は別。CRLF差のprettier警告も原文どおり扱う。
- 記録なし／所在不明と未実施を区別する。実行時assertの赤とcompileだけの赤を区別する。
- #2701・#3246の初回不承認と再レビューを保存。#3694の最終specの赤は**1失敗・1合格**（実装役の2失敗という記載は訂正対象）。
- 本体と対になる5件のngclient専用PR本文は要作成。残る13本は原文保存で、公開承認ではない。#3041はitem 1のみ、#2764は警告表示を含まない、#3246はGUIのみ。Fixesの範囲は公開前に確認する。
- 保存物は計2,003,624 bytes。trace約1MB、実サーバー用スクリプト/ログ、xlf抽出を保全。7,602,572 bytes/280ファイルの再生成可能なビルド配布物は収録せず、ハッシュと元パスをmanifestに残した。

## NGT-084

`fix/verify-completion-alert` / duplicati/duplicati#1510
移管時SHA: `86510cc5ef09b8c36a38417bab6824310c61eb82`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

追試後head: `879857e496eafadda45a1704a24ab3af1ba5892d`。実サーバーで通知の表示漏れを修正し4条件を確認。[追試記録](evidence/2026-11-15-ngt-084/verification.md)。以下は移管時の履歴。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
1. fix/verify-completion-alert 86510cc5ef09b8c36a38417bab6824310c61eb82 ／ a3ad6abe3c83d7365 → aa817f6a7951495fe 承認。
   - 赤は assert で 4 失敗、緑 8 件。レビュー役が赤と緑を再実行。ng build・tsc・ブラウザーは未実施。
```

J/T検索用agentId:

- `impl:n1:#1510` / `a3ad6abe3c83d7365` / implemented
- `review:#1510` / `aa817f6a7951495fe` / 承認

## NGT-085

`feat/export-global-options` / duplicati/duplicati#2310
移管時SHA: `088dba4c01d6127b50ff26a5045190b743a668a2`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

追試後head: `f082e4d89932ad9393faa678953c9fee4fd25a51`。Space操作を修正し実サーバー検証済み。**本体`feat/export-global-options` / `0c242a335e6af90788f7c98a11b349d593d14a4b`の先行マージが必要**。[追試記録](evidence/2026-11-15-ngt-085/verification.md)。以下は移管時の履歴。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
2. feat/export-global-options 088dba4c01d6127b50ff26a5045190b743a668a2 ／ a99806cfe12ff9d7f → addf53d58b7ff8c0c 承認。
   - 実装役の赤は compile のみ（TS2339）。レビュー役が変異を加えて assert の赤（1 失敗）を作った。緑 17 件。ブラウザーは未実施。
```

J/T検索用agentId:

- `impl:n1:#2310` / `a99806cfe12ff9d7f` / implemented
- `review:#2310` / `addf53d58b7ff8c0c` / 承認

## NGT-086

`feat/skip-next-scheduled-run` / duplicati/duplicati#2701
移管時SHA: `28be8c2be254e859f2fcadc0639afafa24980555`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

追試（同じhead、追加修正なし）: 42テスト・tsc・本番ビルド成功。実サーバーで元の回の未実行→次の回の自動実行まで確認。queued回は取消さない。本体04f2dd08aの先行マージが必要。[追試記録](evidence/2026-11-15-ngt-086/verification.md)。以下は移管時の履歴。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
3. feat/skip-next-scheduled-run 28be8c2be254e859f2fcadc0639afafa24980555 ／ af40a01351a4968c1 → ade56d0da67b67c90（不承認。指摘はすべてサーバー側）→ 修正役 a3d35e1e99355dfdf（duplicati 側だけ 04f2dd08a に修正し、ngclient は変更なし）→ a857e376a2e5e0219 承認。
   - ngclient の赤は compile のみ（TS2339）。緑 38 件。ng build（dev）は成功。
   - 再レビューで ngclient は緑だけ再実行し、赤は再実行していない。
   - 保存物: scratchpad\skipprobe.ps1（レビュー役の WebSocket 調査）、scratchpad\wt\red.py（修正役が赤を確かめたスクリプト）
```

J/T検索用agentId:

- `impl:n1:#2701` / `af40a01351a4968c1` / implemented
- `review:#2701` / `ade56d0da67b67c90` / 不承認
- `fix:n1:#2701` / `a3d35e1e99355dfdf` / implemented
- `review2:#2701` / `a857e376a2e5e0219` / 承認

## NGT-087

`fix/status-bar-file-count-separators` / duplicati/duplicati#3041
移管時SHA: `eb506d7c5c715320cb30e236cc84f63bb86df61e`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

追試（同じhead、追加修正なし）: 23テスト・tsc・本番ビルド成功。実バックアップ中にen-USの1,800 / deの1.800を確認。項目1だけの範囲を維持。[追試記録](evidence/2026-11-15-ngt-087/verification.md)。以下は移管時の履歴。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
4. fix/status-bar-file-count-separators eb506d7c5c715320cb30e236cc84f63bb86df61e ／ aa2fb0cfe967392e2 → a220e3ae160129497 承認。
   - 赤は assert で 5 失敗、緑 23 件。レビュー役が赤と緑を再実行。
   - レビュー役の指摘: 直したのは issue の item 1 だけなので、PR 本文にそう書く。
```

J/T検索用agentId:

- `impl:n1:#3041` / `aa2fb0cfe967392e2` / implemented
- `review:#3041` / `a220e3ae160129497` / 承認

## NGT-088

`feat/file-tree-partial-exclusion` / duplicati/duplicati#3191
最終SHA: `0426e04e0f4c65e57c834c67c06a2c8bddbf0b2a`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
5. feat/file-tree-partial-exclusion 0426e04e0f4c65e57c834c67c06a2c8bddbf0b2a ／ af948d130caa2096e → a9462d09dcabdfec0 承認。
   - 赤は assert で 1 失敗、緑 3 件。file-tree の spec 全体（186 件）と tsc（app）も緑。レビュー役が全部を再実行。
```

J/T検索用agentId:

- `impl:n1:#3191` / `af948d130caa2096e` / implemented
- `review:#3191` / `a9462d09dcabdfec0` / 承認

## NGT-089

`feat/idle-sign-out` / duplicati/duplicati#3369
最終SHA: `77c6303395e176e0efbf9e4ece3797528905a535`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
6. feat/idle-sign-out 77c6303395e176e0efbf9e4ece3797528905a535 ／ adf1145963d8ce780 → ae2f580ddb1a4bf9d 承認。
   - 赤は変異で作った assert（9 失敗と 2 失敗）、緑 38 件。ng build（dev）は成功。
   - 実サーバー（ポート 8304）＋ ng serve ＋ Playwright の page.clock で E2E を実施。記録は scratchpad\e2e3369\（idle.mjs、msg.txt、serve.log、server.log）。
   - 最後の単体テストは prettier で整形する前に流した。レビュー役は 77c63033 で緑を再実行したが、赤は再実行していない。
```

J/T検索用agentId:

- `impl:n1:#3369` / `adf1145963d8ce780` / implemented
- `review:#3369` / `ae2f580ddb1a4bf9d` / 承認

## NGT-090

`feat/show-resolved-source-shortcut` / duplicati/duplicati#3519
最終SHA: `1d82b60093c78b741d8833bd34169bf15b8f0bdf`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
7. feat/show-resolved-source-shortcut 1d82b60093c78b741d8833bd34169bf15b8f0bdf ／ a71e1b62a08b1d1ce → a00923c6959cef043 承認。
   - 赤は assert で 1 失敗、緑 7 件。レビュー役が赤と緑を再実行。ng build は未実施。
```

J/T検索用agentId:

- `impl:n1:#3519` / `a71e1b62a08b1d1ce` / implemented
- `review:#3519` / `a00923c6959cef043` / 承認

## NGT-091

`feat/server-stored-theme` / duplicati/duplicati#3851
最終SHA: `fc6d25f8ff799b8a2f75b4b5e67b2d87f88ea27d`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
8. feat/server-stored-theme fc6d25f8ff799b8a2f75b4b5e67b2d87f88ea27d ／ abe136e7c81d3957a → ab110b6cd5a78cfc8 承認。
   - 赤は assert で 2 失敗（空の stub を足した状態。何も入れない状態だと compile 失敗）、緑 14 件。tsc は通る。レビュー役が赤・緑・tsc を再実行。
```

J/T検索用agentId:

- `impl:n1:#3851` / `abe136e7c81d3957a` / implemented
- `review:#3851` / `ab110b6cd5a78cfc8` / 承認

## NGT-092

`feat/log-compare-previous-version` / duplicati/duplicati#4678
最終SHA: `b806e2ee2d9296914a8a7e8e885a27052d5eb491`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
9. feat/log-compare-previous-version b806e2ee2d9296914a8a7e8e885a27052d5eb491 ／ a15bd764caadb99bd → ad92b47c6e3547ed4 承認。
   - 赤は assert で 4 失敗、緑 19 件。eslint・ng build・実サーバーは未実施（レビュー役は手動での確認を勧めている）。
```

J/T検索用agentId:

- `impl:n1:#4678` / `a15bd764caadb99bd` / implemented
- `review:#4678` / `ad92b47c6e3547ed4` / 承認

## NGT-093

`feat/ssl-certificate-upload` / duplicati/duplicati#1843
最終SHA: `6fbcc1a2140d0b839db18dca839c879a28b82157`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
10. feat/ssl-certificate-upload 6fbcc1a2140d0b839db18dca839c879a28b82157 ／ ae115b3be82345290 → aefc1e66677034ee8 承認。
    - 赤は変異で作った assert（1 失敗）、緑 9 件。ng build は成功。実際のアップロードは未実施。
    - 保存物: scratchpad\ngbuild-review-1843\（レビュー役のビルド出力）
```

J/T検索用agentId:

- `impl:n2:#1843` / `ae115b3be82345290` / implemented
- `review:#1843` / `aefc1e66677034ee8` / 承認

## NGT-094

`feat/report-issue-link` / duplicati/duplicati#2259
最終SHA: `d8a9d4702d9f7be9a79967360e0fa5a66f828b31`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
11. feat/report-issue-link d8a9d4702d9f7be9a79967360e0fa5a66f828b31 ／ a89963ba9900dbe54 → a907bbcb48708bf3e 承認。
    - 赤は assert で 1 失敗、緑 2 件。ng build は未実施。
```

J/T検索用agentId:

- `impl:n2:#2259` / `a89963ba9900dbe54` / implemented
- `review:#2259` / `a907bbcb48708bf3e` / 承認

## NGT-095

`feat/run-all-backups` / duplicati/duplicati#2330
最終SHA: `ac3ce63c131b4c9e1190d05f281f5dea4b607a7c`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
12. feat/run-all-backups ac3ce63c131b4c9e1190d05f281f5dea4b607a7c ／ af11bd29541a099a0 → a8f009b1fddf947a5 承認。
    - 実装役の赤は compile のみ（TS2551）。レビュー役が変異を加えて assert の赤（3 失敗と 1 失敗）を作った。緑 10 件。ngc --noEmit は通る。
```

J/T検索用agentId:

- `impl:n2:#2330` / `af11bd29541a099a0` / implemented
- `review:#2330` / `a8f009b1fddf947a5` / 承認

## NGT-096

`feat/last-run-failed-indicator` / duplicati/duplicati#2764
最終SHA: `1d0fa3bf2393330aa97815c914b83319c92b2433`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
13. feat/last-run-failed-indicator 1d0fa3bf2393330aa97815c914b83319c92b2433 ／ a3b555c2a78ab7df1 → a7e3d89b953051c28 承認。
    - 単体 29 件と Playwright の e2e/home-backup-state.spec.ts 4 件が緑。e2e の赤は assert で 1 失敗。メタデータはモックで、失敗させた実サーバーでは試していない。
    - 保存物: scratchpad\wt\n2\test-results\home-backup-state-home-las-741e3-st-run-failed-in-both-views-chromium\（error-context.md、test-failed-1.png、trace.zip、11-14 23:11）。実装役とレビュー役のどちらの赤の実行かは不明。
```

J/T検索用agentId:

- `impl:n2:#2764` / `a3b555c2a78ab7df1` / implemented
- `review:#2764` / `a7e3d89b953051c28` / 承認

## NGT-097

`feat/log-download` / duplicati/duplicati#3246
最終SHA: `1355c2643a6a628eabbd42f5ce59054336942a4c`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
14. feat/log-download 1355c2643a6a628eabbd42f5ce59054336942a4c ／ a72789f6ca8dcb106（c0a8cc4c で実施。この SHA は今のブランチには無い）→ af2ba383f6dea9cb2（不承認。ShipButton の import 漏れ）→ 修正役 a1afc631005b417f2（1355c264。赤は assert で 1 失敗、緑 24 件）→ a9db97528b43bd939 承認。
    - 再レビューは緑・prettier・ngc を再実行し、赤は再実行していない。
    - 本文は「Part of」にする（CLI 部分は範囲外）。
```

J/T検索用agentId:

- `impl:n2:#3246` / `a72789f6ca8dcb106` / implemented
- `review:#3246` / `af2ba383f6dea9cb2` / 不承認
- `fix:n2:#3246` / `a1afc631005b417f2` / implemented
- `review2:#3246` / `a9db97528b43bd939` / 承認

## NGT-098

`feat/compact-progress` / duplicati/duplicati#3397
最終SHA: `792c2ba895634c5934ead901745f5829d139cccd`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
15. feat/compact-progress 792c2ba895634c5934ead901745f5829d139cccd ／ a8faaf5b597c805d8 → ac4018c6250ce18df 承認。
    - 赤は assert で 4 失敗、緑 28 件。ng build は未実施。レビュー役は緑だけ再実行。
```

J/T検索用agentId:

- `impl:n2:#3397` / `a8faaf5b597c805d8` / implemented
- `review:#3397` / `ac4018c6250ce18df` / 承認

## NGT-099

`feat/restore-version-file-count` / duplicati/duplicati#3694
最終SHA: `026d135944cf3c1bb6107b936adb2d6d8c7d9b86`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
16. feat/restore-version-file-count 026d135944cf3c1bb6107b936adb2d6d8c7d9b86 ／ a59c5aa45f6b75661 → a0656a2392a87bbaf 承認。
    - 実装役の「赤 2 失敗」は誤り。最終版の spec では 1 失敗・1 合格（レビュー役が訂正）。
    - extract-i18n の結果: scratchpad\xlf3694\
```

J/T検索用agentId:

- `impl:n2:#3694` / `a59c5aa45f6b75661` / implemented
- `review:#3694` / `a0656a2392a87bbaf` / 承認

## NGT-100

`feat/restore-resume-drafts` / duplicati/duplicati#5239
最終SHA: `a27d25e3eb60aa2710f7f5265914c9547d7e2a07`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
17. feat/restore-resume-drafts a27d25e3eb60aa2710f7f5265914c9547d7e2a07 ／ afb2bd62d7082cd90 → aabec9e9f6d0c0477 承認。
    - 赤は assert で 6 失敗、緑 94 件。レビュー役が再実行した緑は 41 件だけで、赤は再実行していない。ng build・tsc は未実施。
```

J/T検索用agentId:

- `impl:n2:#5239` / `afb2bd62d7082cd90` / implemented
- `review:#5239` / `aabec9e9f6d0c0477` / 承認

## NGT-101

`feat/show-db-encryption-preload-paths` / duplicati/duplicati#6611
最終SHA: `224fab317da03845d285caf8b272f696220a2335`。土台: main `8f401edd337bf53a963fc4e80a47d3db4d52fc3d`。

移管元補足（原文。試験内容・未実施・訂正を含む）:

```text
18. feat/show-db-encryption-preload-paths 224fab317da03845d285caf8b272f696220a2335 ／ aa50f608c8a2c26db → a9260e3059ce61e6d 承認。
    - 赤は assert で 2 失敗、緑 10 件。tsc（spec）は通る。ng build は未実施と明記されている。レビュー役は赤を再実行していない。
```

J/T検索用agentId:

- `impl:n2:#6611` / `aa50f608c8a2c26db` / implemented
- `review:#6611` / `a9260e3059ce61e6d` / 承認
