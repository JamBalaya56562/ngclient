# 2026-11-16 全ブランチ検証・PR10件

**検証済み**: 既存19本と追加のテスト修正1本、計20本でapp/spec型チェック・全単体テスト・本番ビルドが成功。公開10件は検証済みSHAとoriginを照合し、APIでPRのheadと本文を再確認した。本家mainは`ae54d73bf1e5e98fb65dd8060c006f1defc90d01`、Node v26.13.1 / Bun 1.4.4。

| Branch                                       | SHA                                        | Unit tests |    E2E | PR                                                     |
| -------------------------------------------- | ------------------------------------------ | ---------: | -----: | ------------------------------------------------------ |
| `codex/source-attribute-exclusion-feedback`  | `ed6b24f2bac9b9fe2cce3b9a1ae926591ca9385d` |       2381 |      4 | [#740](https://github.com/duplicati/ngclient/pull/740) |
| `feat/compact-progress`                      | `d7af281a5636ba839717886290fe65eb733036bc` |       2384 | 未実施 | 未PR                                                   |
| `feat/export-global-options`                 | `30e36ff5edf6409569421e7aa5cd8762510d41b4` |       2376 | 未実施 | 未PR                                                   |
| `feat/file-tree-partial-exclusion`           | `1fd27e8ef139591473896558aa62afb338aaf1f5` |       2378 | 未実施 | 未PR                                                   |
| `feat/idle-sign-out`                         | `97ae286bfa432bb2001b0d66ca3a4e86375fad65` |       2399 |     10 | [#743](https://github.com/duplicati/ngclient/pull/743) |
| `feat/last-run-failed-indicator`             | `8ba12635a17127d4e3320c90755e2167fdb16af5` |       2388 | 未実施 | 未PR                                                   |
| `feat/log-compare-previous-version`          | `22f5d3070066b3d55756a5fe89a72a821706ae99` |       2386 | 未実施 | 未PR                                                   |
| `feat/log-download`                          | `d620ef7f233505c2a4381ca077091d34214159ee` |       2383 |      3 | [#748](https://github.com/duplicati/ngclient/pull/748) |
| `feat/report-issue-link`                     | `3d47a88359a8016af20233e99453e5cfd411b541` |       2376 |      5 | [#745](https://github.com/duplicati/ngclient/pull/745) |
| `feat/restore-resume-drafts`                 | `7e8122179c2b97945fbba87e7ccfa23a93fb81d8` |       2381 | 未実施 | 未PR                                                   |
| `feat/restore-version-file-count`            | `22dcf2c3a50d5c127bb69c9cf36dc33b1bca134c` |       2376 |      6 | [#746](https://github.com/duplicati/ngclient/pull/746) |
| `feat/run-all-backups`                       | `7dc730fee41ee774935a564146adac824322be8b` |       2380 |      8 | [#747](https://github.com/duplicati/ngclient/pull/747) |
| `feat/server-stored-theme`                   | `fab37158bba905a991840010f34578a2a356f6f0` |       2381 |    194 | [#744](https://github.com/duplicati/ngclient/pull/744) |
| `feat/show-db-encryption-preload-paths`      | `3c1fc8834ef51ddf57566553b05003b809d7ecc7` |       2377 | 未実施 | 未PR                                                   |
| `feat/show-resolved-source-shortcut`         | `0aa04f4eceb5681e894e97058feb6049e41928ca` |       2375 | 未実施 | 未PR                                                   |
| `feat/skip-next-scheduled-run`               | `34cb1512b49f3807b29dc092afa42614cba17c18` |       2379 | 未実施 | 未PR                                                   |
| `feat/ssl-certificate-upload`                | `96f572b348ece9119e659a35bb241e6604c5f103` |       2383 | 未実施 | 未PR                                                   |
| `fix/status-bar-file-count-separators`       | `d2b6007344741ca7c80205171b275bd449cac464` |       2379 |      3 | [#742](https://github.com/duplicati/ngclient/pull/742) |
| `fix/verify-completion-alert`                | `e80484104552ed9857712a68bc15aa472e25cced` |       2381 |     10 | [#741](https://github.com/duplicati/ngclient/pull/741) |
| `codex/stabilize-restore-group-listing-test` | `8e3bbc612a42134c71c6d7bdf809845fd72e1457` |       2374 |     40 | [#739](https://github.com/duplicati/ngclient/pull/739) |

全件で実行したコマンド:

```text
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.app.json
node node_modules/typescript/bin/tsc --noEmit -p projects/ngclient/tsconfig.spec.json
VITEST_MAX_WORKERS=1 bun run test:ci
bun run build:prod
```

上表は各コマンドの終了コード0と実出力の件数。完全SHAと結果は[validation.json](validation.json)。rawログと実行スクリプトは`C:\Users\Jam\Documents\ngclient\tmp\publication-20261116\`、全ブランチの実行本体は`tmp/maintenance-20261116/test-all-for-publication.ps1`。未変更の共通CI契約は`bun run check:locales`・`bun run test:locales`・`bun run test:build`も成功。既存のjsdom CSS解析メッセージは継続して出る。

## 修正とブラウザー検証

- NGT-091 / #744: 既存E2E2件が未登録のGET/PATCH `/api/v1/uisettings/ngclient`で失敗。fixtureを更新し、保存値を使う新しい2ケースも追加。単体2381件と全E2E194件成功。製品コードは変更していない。
- NGT-095 / #747: Start allの文字がh2の名前へ混ざり、既存E2E4件が失敗。操作をnative h2の外へ分離し、レスポンシブCSSと見出しの回帰テストを追加。単体2380件・関連E2E8件成功。全E2E実行は192成功・1失敗で、失敗は下記NGT-105のmain既存テスト。
- NGT-105 / #739: 最新mainだけで旧テストを各10回実行し8失敗・12成功。すべて`Expected length: 3 / Received length: 4`で、追加は`Paths:["/data/old-one.txt"]`。request受信後に残る通常の取得を全件数で拒否していた。取得パスが実在ソースだけであることを復元payload確認後に検証し、各20回・計40件が成功。retry/待ち時間延長/製品コード変更なし。
- NGT-050 / #740: APIモックE2E4件と、隔離Windows Duplicati 2.4.1.101 Canaryで既存6条件・新規追加2条件（mouse/keyboard）が成功。ツリー・保存/再読込・バックアップ結果を照合。ReadOnly保持、明示的ソースの例外も確認。ジョブ0件に戻しプロセス停止。

ブラウザー実行は`node node_modules/@playwright/test/cli.js test <browserSpecs>`（validation.jsonのspecs、NGT-105は`--repeat-each=20`）。全E2Eはspec指定なし。E2Eのtscも成功。

Windowsの予約2969〜3068が3000を含み、bindがEACCESになることをnetshとNodeで確認。sirvはPORT環境変数をCLIより優先して別ポートへ退避するため、Playwrightの待ち先と一致しなかった。検証中だけURL・CLI・PORTを空きポートへ揃え、finallyで元の設定をバイト単位に復元。Playwright設定の恒久変更・OS予約の変更はなし。実サーバーの最初の失敗にはモック文言と実ラベルの相違、展開アイコンのセレクター相違もあり、プローブだけを修正した。

実サーバー原本: `source-attributes-live-six-cases.log`（6条件成功後の別操作で停止）と`source-attributes-new-options.log`（2条件成功）。詳細は同フォルダー内のrunごとのevents.json、最後はrun-VsRBpc。画像は[images.json](images.json)。旧before画像と今回のafter画像を#740本文へ追加した。

## 依存・公開範囲

公開前open PRは0件。10件すべてmainの直接の子で、stack後段はなし。[公開一覧](created-prs.json)。7件がFixes、#742/#748はPart of、#739はテスト修正でclose指定なし。

[本体依存5件のcompare API結果](server-dependencies.json)はいずれも対応コミットがmasterの祖先でないため未公開。残る部分除外/実パス表示は#740とツリー・Source Dataが重なるため次便。COMPAREは実ログ日時との対応、証明書は実uploadの確認が未実施。失敗インジケーターは警告表示を含まず、次便の部分対応。下書きの誤ったFixesをPart ofへ訂正した。

本体#7832は2026-11-16マージ済みとAPIで確認し、NGT-047を再検証待ちのREADYへ更新。修正後本体でのUI保存は今回未実施。

公開直後のCIはすべてqueued。[取得結果](ci-at-publication.json)。これはCI成功の記録ではなく、ローカル成功と区別する。

## NGT-104: ArrowRight再展開（未切分け）

**検証済み**: source属性ブランチed6b24f2の実UIで、ドライブを閉じた後に読み込み済みのソースノードをArrowRightで展開しても子が出ず、プローブのordinary.txt可視性確認が失敗した（run-Cf8qkV/failure.txt、source-attributes-live-six-cases.log）。属性オプション追加の検証ではツリー展開を専用div.iconクリックへ変え、オプション追加自体はmouse/keyboardで確認した。

**推測**: [mainのArrowRight分岐](https://github.com/duplicati/ngclient/blob/ae54d73bf1e5e98fb65dd8060c006f1defc90d01/projects/ngclient/src/app/core/components/file-tree/file-tree.component.ts#L1164)が、閉じたノードでも既読firstChildへのfocusを優先することが関連する可能性。**未検証**: 純粋mainでの再現、原因確定、回帰テスト。次は読み込み済み→閉じる→ArrowRightを単体と実UIで切り分ける。今回の機能PRへ修正は混ぜていない。
